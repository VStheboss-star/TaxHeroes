import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { MEMORY_PAIRS } from "@/constants/gameData";
import { useGame } from "@/context/GameContext";

interface Card {
  id: string;
  pairId: string;
  label: string;
  type: "term" | "definition";
  flipped: boolean;
  matched: boolean;
  anim: Animated.Value;
}

function buildCards(): Card[] {
  const cards: Card[] = [];
  MEMORY_PAIRS.forEach((pair) => {
    cards.push({
      id: `${pair.id}-term`,
      pairId: pair.id,
      label: pair.term,
      type: "term",
      flipped: false,
      matched: false,
      anim: new Animated.Value(0),
    });
    cards.push({
      id: `${pair.id}-def`,
      pairId: pair.id,
      label: pair.definition,
      type: "definition",
      flipped: false,
      matched: false,
      anim: new Animated.Value(0),
    });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

type Phase = "intro" | "playing" | "results";

export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [phase, setPhase] = useState<Phase>("intro");
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startGame = () => {
    stopTimer();
    const newCards = buildCards();
    setCards(newCards);
    setSelected([]);
    setMoves(0);
    setMatched(0);
    setElapsed(0);
    setIsChecking(false);
    setPhase("playing");

    headerAnim.setValue(0);
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  };

  const calcScore = useCallback((movesCount: number, time: number) => {
    const base = 500;
    const movePenalty = Math.max(0, (movesCount - MEMORY_PAIRS.length) * 10);
    const timePenalty = Math.floor(time / 5) * 5;
    return Math.max(50, base - movePenalty - timePenalty);
  }, []);

  const flipCard = (cardId: string) => {
    if (isChecking) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(cardId)) return;

    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(card.anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, flipped: true } : c));

    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [id1, id2] = newSelected;
      const c1 = cards.find((c) => c.id === id1)!;
      const c2 = cards.find((c) => c.id === cardId)!;
      const isMatch = c1.pairId === c2.pairId && c1.id !== c2.id;

      setTimeout(() => {
        if (isMatch) {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === c1.pairId ? { ...c, matched: true } : c
            )
          );
          const newMatched = matched + 1;
          setMatched(newMatched);
          if (newMatched >= MEMORY_PAIRS.length) {
            stopTimer();
            const finalScore = calcScore(moves + 1, elapsed);
            setPhase("results");
            updateScore("memory", finalScore);
            markCompleted("memory");
          }
        } else {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.parallel(
            newSelected.map((id) => {
              const c = cards.find((x) => x.id === id)!;
              return Animated.timing(c.anim, { toValue: 0, duration: 250, useNativeDriver: true });
            })
          ).start();
          setCards((prev) =>
            prev.map((c) => newSelected.includes(c.id) ? { ...c, flipped: false } : c)
          );
        }
        setSelected([]);
        setIsChecking(false);
      }, 900);
    }
  };

  useEffect(() => () => stopTimer(), []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: "#2D1B69", paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.centerContent}>
          <View style={[styles.bigIcon, { backgroundColor: "#8B5CF622" }]}>
            <Feather name="grid" size={52} color="#8B5CF6" />
          </View>
          <Text style={styles.introTitle}>Memory Match</Text>
          <Text style={styles.introSub}>
            Match each tax term with its correct definition. Fewer moves = higher score!
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="layers" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>{MEMORY_PAIRS.length * 2} cards</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="target" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>{MEMORY_PAIRS.length} pairs</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="star" size={16} color="#F59E0B" />
              <Text style={styles.infoText}>Up to 500 pts</Text>
            </View>
          </View>
          {scores.memory > 0 && (
            <Text style={styles.highScore}>Best: {scores.memory} pts</Text>
          )}
          <Pressable onPress={startGame} style={styles.startBtn}>
            <Feather name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Start Game</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "results") {
    const finalScore = calcScore(moves, elapsed);
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    return (
      <View style={[styles.container, { backgroundColor: "#2D1B69", paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Feather name="check-circle" size={60} color="#8B5CF6" style={{ marginBottom: 16 }} />
          <Text style={styles.introTitle}>Matched!</Text>
          <Text style={styles.finalScore}>{finalScore}</Text>
          <Text style={styles.finalLabel}>points</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="repeat" size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{moves}</Text>
              <Text style={styles.statLab}>moves</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="clock" size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{formatTime(elapsed)}</Text>
              <Text style={styles.statLab}>time</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="layers" size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{MEMORY_PAIRS.length}</Text>
              <Text style={styles.statLab}>pairs</Text>
            </View>
          </View>
          <Text style={styles.learnedTitle}>What you learned:</Text>
          {MEMORY_PAIRS.map((pair) => (
            <View key={pair.id} style={styles.pairCard}>
              <Text style={styles.pairTerm}>{pair.term}</Text>
              <Text style={styles.pairDef}>{pair.definition}</Text>
            </View>
          ))}
          <View style={styles.resultBtns}>
            <Pressable onPress={startGame} style={[styles.btn, { backgroundColor: "#8B5CF6" }]}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.btnText}>Play Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: "#374151" }]}>
              <Feather name="home" size={16} color="#fff" />
              <Text style={styles.btnText}>Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <View style={[styles.container, { backgroundColor: "#2D1B69", paddingTop: topPad }]}>
      <Animated.View
        style={[
          styles.gameHeader,
          { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] },
        ]}
      >
        <Pressable onPress={() => { stopTimer(); router.back(); }}>
          <Feather name="x" size={22} color="#9CA3AF" />
        </Pressable>
        <View style={styles.statsChips}>
          <View style={styles.chip}>
            <Feather name="repeat" size={12} color="#8B5CF6" />
            <Text style={styles.chipText}>{moves}</Text>
          </View>
          <View style={styles.chip}>
            <Feather name="clock" size={12} color="#8B5CF6" />
            <Text style={styles.chipText}>{formatTime(elapsed)}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: "#8B5CF622" }]}>
            <Feather name="layers" size={12} color="#8B5CF6" />
            <Text style={[styles.chipText, { color: "#8B5CF6" }]}>{matched}/{MEMORY_PAIRS.length}</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {cards.map((card) => {
            const rotate = card.anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "180deg"],
            });
            const isFlipped = card.flipped || card.matched;
            return (
              <Pressable
                key={card.id}
                onPress={() => flipCard(card.id)}
                style={styles.cardWrapper}
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      backgroundColor: card.matched
                        ? "#4C1D9588"
                        : isFlipped
                        ? card.type === "term"
                          ? "#4F46E5"
                          : "#7C3AED"
                        : "#1F2937",
                      borderColor: card.matched ? "#8B5CF6" : isFlipped ? "#A78BFA" : "#374151",
                      transform: [{ scale: card.matched ? 0.95 : 1 }],
                    },
                  ]}
                >
                  {isFlipped || card.matched ? (
                    <View style={styles.cardFront}>
                      <Text style={[styles.cardType, { color: card.type === "term" ? "#C4B5FD" : "#DDD6FE" }]}>
                        {card.type === "term" ? "TERM" : "DEFINITION"}
                      </Text>
                      <Text style={styles.cardLabel} numberOfLines={4}>
                        {card.label}
                      </Text>
                      {card.matched && (
                        <Feather name="check-circle" size={16} color="#8B5CF6" style={{ marginTop: 4 }} />
                      )}
                    </View>
                  ) : (
                    <View style={styles.cardBack}>
                      <Feather name="help-circle" size={28} color="#374151" />
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  backBtn: { marginBottom: 24 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  bigIcon: { width: 110, height: 110, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  introTitle: { color: "#fff", fontSize: 30, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  introSub: { color: "#9CA3AF", fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22, paddingHorizontal: 10 },
  infoRow: { flexDirection: "row", gap: 20, marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { color: "#D1D5DB", fontWeight: "600", fontSize: 14 },
  highScore: { color: "#F59E0B", fontWeight: "700", marginBottom: 16, fontSize: 15 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 18,
  },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  statsChips: { flexDirection: "row", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  chipText: { color: "#D1D5DB", fontWeight: "600", fontSize: 13 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    paddingBottom: 20,
  },
  cardWrapper: { width: "23.5%", aspectRatio: 0.75 },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  cardFront: { alignItems: "center", justifyContent: "center", flex: 1 },
  cardType: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  cardLabel: { color: "#fff", fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 },
  cardBack: { alignItems: "center", justifyContent: "center" },
  resultsScroll: { flexGrow: 1, padding: 20, alignItems: "center" },
  finalScore: { color: "#8B5CF6", fontSize: 56, fontWeight: "800" },
  finalLabel: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 20, marginBottom: 24 },
  statItem: { alignItems: "center", gap: 4 },
  statVal: { color: "#fff", fontWeight: "800", fontSize: 22 },
  statLab: { color: "#9CA3AF", fontSize: 12 },
  learnedTitle: { color: "#fff", fontWeight: "700", fontSize: 18, marginBottom: 12, alignSelf: "flex-start" },
  pairCard: {
    backgroundColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    width: "100%",
    borderLeftWidth: 3,
    borderLeftColor: "#8B5CF6",
  },
  pairTerm: { color: "#C4B5FD", fontWeight: "800", fontSize: 14, marginBottom: 4 },
  pairDef: { color: "#9CA3AF", fontSize: 13, lineHeight: 18 },
  resultBtns: { flexDirection: "row", gap: 12, marginTop: 20, width: "100%" },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
