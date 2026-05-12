import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

const GAMES = [
  {
    key: "quiz" as const,
    title: "Tax Quiz Battle",
    description: "20 questions. 15 seconds each. Test your tax knowledge!",
    route: "/games/quiz",
    color: "#4F46E5",
    icon: "zap" as const,
    maxScore: 200,
    badge: "Popular",
  },
  {
    key: "catch" as const,
    title: "Evader Chase",
    description: "Catch tax evaders before they escape! Tap fast!",
    route: "/games/catch",
    color: "#EF4444",
    icon: "crosshair" as const,
    maxScore: 300,
    badge: undefined,
  },
  {
    key: "budget" as const,
    title: "Budget Builder",
    description: "Allocate the national budget to public services wisely.",
    route: "/games/budget",
    color: "#10B981",
    icon: "bar-chart-2" as const,
    maxScore: 100,
    badge: undefined,
  },
  {
    key: "trail" as const,
    title: "Tax Trail",
    description: "Make choices about taxes. See how your decisions play out!",
    route: "/games/trail",
    color: "#F97316",
    icon: "map" as const,
    maxScore: 175,
    badge: "Story",
  },
  {
    key: "memory" as const,
    title: "Memory Match",
    description: "Match tax terms to their definitions. How fast can you go?",
    route: "/games/memory",
    color: "#8B5CF6",
    icon: "grid" as const,
    maxScore: 500,
    badge: undefined,
  },
  {
    key: "scramble" as const,
    title: "Word Scramble",
    description: "Unscramble tax words and unlock fascinating facts!",
    route: "/games/scramble",
    color: "#EC4899",
    icon: "shuffle" as const,
    maxScore: 1000,
    badge: undefined,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { scores, totalScore, gamesCompleted, completedGames } = useGame();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(statsAnim, { toValue: 1, duration: 600, delay: 150, useNativeDriver: false }),
      Animated.timing(cardsAnim, { toValue: 1, duration: 700, delay: 250, useNativeDriver: false }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPadding + 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.appName, { color: colors.primary }]}>Tax Quest</Text>
              <Text style={[styles.appSub, { color: colors.mutedForeground }]}>
                Learn. Play. Understand.
              </Text>
            </View>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/learn");
                }}
                style={[styles.learnBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="book-open" size={16} color="#fff" />
                <Text style={styles.learnBtnText}>Learn</Text>
              </Pressable>
            </Animated.View>
          </View>

          <View style={[styles.heroBanner, { backgroundColor: colors.primary + "15", borderColor: colors.border }]}>
            <View style={styles.heroBannerLeft}>
              <Text style={[styles.heroBannerTitle, { color: colors.primary }]}>
                Why Pay Your Taxes?
              </Text>
              <Text style={[styles.heroBannerBody, { color: colors.foreground }]}>
                Tax evasion is a crime with serious consequences. Play our games to find out why paying taxes matters — and what happens if you don't!
              </Text>
            </View>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
              <Feather name="shield" size={32} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <StatCard
            label="Total Score"
            value={totalScore.toString()}
            icon="star"
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
          <StatCard
            label="Games Played"
            value={`${gamesCompleted} / ${GAMES.length}`}
            icon="award"
            color="#10B981"
            bgColor="#D1FAE5"
          />
          <StatCard
            label="Level"
            value={gamesCompleted >= 6 ? "Expert" : gamesCompleted >= 3 ? "Pro" : "Rookie"}
            icon="trending-up"
            color="#4F46E5"
            bgColor="#EDE9FE"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardsAnim,
            transform: [
              {
                translateY: cardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choose a Game
          </Text>
          <View style={styles.grid}>
            {GAMES.map((game) => (
              <GameCard
                key={game.key}
                title={game.title}
                description={game.description}
                route={game.route}
                color={game.color}
                icon={game.icon}
                highScore={scores[game.key]}
                maxScore={game.maxScore}
                completed={completedGames.has(game.key)}
                badge={game.badge}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: cardsAnim }}>
          <FactBanner />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const ROTATING_FACTS = [
  "Al Capone was jailed for TAX EVASION — not murder!",
  "Tax evasion costs governments $427 BILLION every year globally.",
  "You can get up to 5 years in prison for tax evasion in the USA.",
  "HMRC recovered £36 billion in unpaid taxes in 2022/23!",
  "The Panama Papers exposed thousands of secret offshore accounts.",
];

function FactBanner() {
  const colors = useColors();
  const [idx, setIdx] = React.useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setIdx((i) => (i + 1) % ROTATING_FACTS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.factBanner, { backgroundColor: "#1E1B4B" }]}>
      <Feather name="info" size={18} color="#F59E0B" />
      <Animated.Text
        style={[styles.factText, { color: "#fff", opacity: fadeAnim }]}
        numberOfLines={2}
      >
        {ROTATING_FACTS[idx]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { marginBottom: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  appSub: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  learnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  learnBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  heroBannerLeft: { flex: 1 },
  heroBannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroBannerBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 24,
  },
  factBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  factText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});
