import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface GameCardProps {
  title: string;
  description: string;
  route: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  highScore: number;
  maxScore: number;
  completed: boolean;
  badge?: string;
}

export function GameCard({
  title,
  description,
  route,
  color,
  icon,
  highScore,
  maxScore,
  completed,
  badge,
}: GameCardProps) {
  const router = useRouter();
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const progress = Math.min(highScore / maxScore, 1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const onPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as never);
  };

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <View style={[styles.iconBg, { backgroundColor: color + "22" }]}>
          <Feather name={icon} size={28} color={color} />
        </View>

        {completed && (
          <View style={[styles.completedBadge, { backgroundColor: color }]}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        )}

        {badge && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            Best: {highScore}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: color, width: `${progress * 100}%` as `${number}%` },
              ]}
            />
          </View>
        </View>

        <View style={[styles.playBtn, { backgroundColor: color }]}>
          <Feather name="play" size={14} color="#fff" />
          <Text style={styles.playText}>{completed ? "Play Again" : "Play"}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: "47%",
    margin: "1.5%",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 200,
    position: "relative",
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  completedBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
    flex: 1,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "500",
    minWidth: 55,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
  },
  playText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
