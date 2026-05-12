import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

import { TRAIL_SCENARIOS } from "@/constants/gameData";
import { useGame } from "@/context/GameContext";

type Phase = "intro" | "scenario" | "feedback" | "results";

export default function TrailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [phase, setPhase] = useState<Phase>("intro");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [choices, setChoices] = useState<number[]>([]);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const current = TRAIL_SCENARIOS[scenarioIdx];

  const startGame = () => {
    setPhase("scenario");
    setScenarioIdx(0);
    setScore(0);
    setChoices([]);
    animateIn();
  };

  const animateIn = () => {
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  };

  const choose = (choiceIdx: number) => {
    const chosen = current.choices[choiceIdx];
    setSelectedChoice(choiceIdx);
    setScore((s) => Math.max(0, s + chosen.points));
    setChoices((c) => [...c, choiceIdx]);
    setPhase("feedback");

    if (Platform.OS !== "web") {
      if (chosen.isGood) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    feedbackAnim.setValue(0);
    Animated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }).start();
  };

  const next = () => {
    if (scenarioIdx >= TRAIL_SCENARIOS.length - 1) {
      setPhase("results");
      setScore((s) => {
        updateScore("trail", s);
        markCompleted("trail");
        return s;
      });
    } else {
      setScenarioIdx((i) => i + 1);
      setSelectedChoice(null);
      setPhase("scenario");
      animateIn();
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const maxScore = TRAIL_SCENARIOS.reduce(
    (acc, s) => acc + Math.max(...s.choices.map((c) => c.points)),
    0
  );

  const getEnding = () => {
    const pct = score / maxScore;
    if (pct >= 0.85) return { title: "Model Citizen!", color: "#10B981", icon: "award" as const, body: "Outstanding choices! You understand that paying taxes fairly is not just a legal obligation — it's what makes society work for everyone. You're an inspiration!" };
    if (pct >= 0.55) return { title: "On the Right Track", color: "#F59E0B", icon: "trending-up" as const, body: "Mostly good decisions! A few risky choices, but you avoided the worst outcomes. Keep learning — understanding taxes is a lifelong skill." };
    return { title: "Consequences Incoming...", color: "#EF4444", icon: "alert-triangle" as const, body: "Several poor choices could lead to audits, fines, or prosecution. The good news? You're learning now — before it's too late! Read the Learn section to understand your rights and responsibilities." };
  };

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: "#1A1040", paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.centerContent}>
          <View style={[styles.bigIcon, { backgroundColor: "#F9731622" }]}>
            <Feather name="map" size={52} color="#F97316" />
          </View>
          <Text style={styles.introTitle}>Tax Trail</Text>
          <Text style={styles.introSub}>
            Navigate real-life tax scenarios. Every decision has consequences — just like in real life!
          </Text>

          <View style={styles.storySetup}>
            <Text style={styles.storySetupTitle}>Your Story Begins...</Text>
            <Text style={styles.storySetupText}>
              You're 18 and just starting your financial journey. The choices you make now about taxes will shape your future. Make wise decisions!
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={18} color="#F97316" />
              <Text style={styles.infoText}>{TRAIL_SCENARIOS.length} Scenarios</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="star" size={18} color="#F59E0B" />
              <Text style={styles.infoText}>Up to {maxScore} pts</Text>
            </View>
          </View>

          {scores.trail > 0 && (
            <Text style={styles.highScore}>Best: {scores.trail} pts</Text>
          )}

          <Pressable onPress={startGame} style={styles.startBtn}>
            <Feather name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Begin Journey</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "results") {
    const ending = getEnding();
    return (
      <View style={[styles.container, { backgroundColor: "#1A1040", paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <View style={[styles.endingIcon, { backgroundColor: ending.color + "22" }]}>
            <Feather name={ending.icon} size={52} color={ending.color} />
          </View>
          <Text style={[styles.endingTitle, { color: ending.color }]}>{ending.title}</Text>
          <Text style={styles.finalScore}>{score}/{maxScore}</Text>
          <Text style={styles.finalLabel}>points</Text>

          <Text style={styles.endingBody}>{ending.body}</Text>

          <Text style={styles.reviewTitle}>Your Decisions:</Text>
          {TRAIL_SCENARIOS.map((scenario, i) => {
            const choice = scenario.choices[choices[i]];
            if (!choice) return null;
            return (
              <View key={scenario.id} style={[styles.decisionRow, { borderColor: choice.isGood ? "#10B98144" : "#EF444444" }]}>
                <Feather
                  name={choice.isGood ? "check-circle" : "x-circle"}
                  size={18}
                  color={choice.isGood ? "#10B981" : "#EF4444"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionScene}>{scenario.scene}</Text>
                  <Text style={styles.decisionChoice}>{choice.text}</Text>
                  <Text style={[styles.decisionPts, { color: choice.points > 0 ? "#10B981" : "#EF4444" }]}>
                    {choice.points > 0 ? `+${choice.points}` : choice.points} pts
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.resultBtns}>
            <Pressable onPress={startGame} style={[styles.btn, { backgroundColor: "#F97316" }]}>
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

  if (phase === "scenario") {
    return (
      <View style={[styles.container, { backgroundColor: "#1A1040", paddingTop: topPad }]}>
        <View style={styles.gameHeader}>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={22} color="#6B7280" />
          </Pressable>
          <Text style={styles.progress}>
            {scenarioIdx + 1} / {TRAIL_SCENARIOS.length}
          </Text>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreChipText}>{score} pts</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          {TRAIL_SCENARIOS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i < scenarioIdx ? "#F97316" : i === scenarioIdx ? "#F59E0B" : "#374151" },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.scenarioCard,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.sceneTag, { backgroundColor: "#F9731622" }]}>
            <Feather name="map-pin" size={12} color="#F97316" />
            <Text style={styles.sceneTagText}>{current.scene}</Text>
          </View>
          <Text style={styles.situation}>{current.situation}</Text>
        </Animated.View>

        <Text style={styles.chooseLabel}>What do you do?</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {current.choices.map((choice, idx) => (
            <Pressable
              key={idx}
              onPress={() => choose(idx)}
              style={styles.choiceBtn}
            >
              <View style={styles.choiceLetter}>
                <Text style={styles.choiceLetterText}>{String.fromCharCode(65 + idx)}</Text>
              </View>
              <Text style={styles.choiceText}>{choice.text}</Text>
              <Feather name="chevron-right" size={16} color="#6B7280" />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // feedback phase
  const chosen = current.choices[selectedChoice!];
  return (
    <View style={[styles.container, { backgroundColor: "#1A1040", paddingTop: topPad }]}>
      <View style={styles.gameHeader}>
        <View />
        <Text style={styles.progress}>
          {scenarioIdx + 1} / {TRAIL_SCENARIOS.length}
        </Text>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{score} pts</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.feedbackContainer,
          {
            opacity: feedbackAnim,
            transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          },
        ]}
      >
        <View
          style={[
            styles.feedbackCard,
            { backgroundColor: chosen.isGood ? "#065F46" : "#7F1D1D" },
          ]}
        >
          <Feather
            name={chosen.isGood ? "check-circle" : "x-circle"}
            size={40}
            color={chosen.isGood ? "#6EE7B7" : "#FCA5A5"}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.feedbackTitle, { color: chosen.isGood ? "#6EE7B7" : "#FCA5A5" }]}>
            {chosen.isGood ? "Good Choice!" : "Risky Choice!"}
          </Text>
          <Text style={styles.feedbackPts}>
            {chosen.points > 0 ? `+${chosen.points}` : chosen.points} points
          </Text>
          <Text style={styles.feedbackText}>{chosen.feedback}</Text>
        </View>

        <Pressable onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>
            {scenarioIdx >= TRAIL_SCENARIOS.length - 1 ? "See My Result" : "Next Scenario"}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginBottom: 24 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  bigIcon: { width: 110, height: 110, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  introTitle: { color: "#fff", fontSize: 30, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  introSub: { color: "#9CA3AF", fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22 },
  storySetup: { backgroundColor: "#1F2937", borderRadius: 16, padding: 16, marginBottom: 20, width: "100%" },
  storySetupTitle: { color: "#F97316", fontWeight: "700", fontSize: 14, marginBottom: 8 },
  storySetupText: { color: "#D1D5DB", fontSize: 14, lineHeight: 21 },
  infoRow: { flexDirection: "row", gap: 20, marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { color: "#D1D5DB", fontWeight: "600", fontSize: 14 },
  highScore: { color: "#F59E0B", fontWeight: "700", marginBottom: 16, fontSize: 15 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F97316",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 18,
  },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  progress: { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },
  scoreChip: { backgroundColor: "#F9731622", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreChipText: { color: "#F97316", fontWeight: "700", fontSize: 14 },
  progressTrack: { flexDirection: "row", gap: 8, marginBottom: 20 },
  progressDot: { flex: 1, height: 6, borderRadius: 3 },
  scenarioCard: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  sceneTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  sceneTagText: { color: "#F97316", fontWeight: "700", fontSize: 12 },
  situation: { color: "#F9FAFB", fontSize: 16, fontWeight: "600", lineHeight: 24 },
  chooseLabel: { color: "#9CA3AF", fontSize: 13, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceLetterText: { color: "#9CA3AF", fontWeight: "800", fontSize: 14 },
  choiceText: { flex: 1, color: "#D1D5DB", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  feedbackContainer: { flex: 1, justifyContent: "center" },
  feedbackCard: { borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 20 },
  feedbackTitle: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  feedbackPts: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14, opacity: 0.7 },
  feedbackText: { color: "#E5E7EB", fontSize: 15, lineHeight: 22, textAlign: "center" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F97316",
    borderRadius: 16,
    paddingVertical: 16,
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  resultsScroll: { flexGrow: 1, padding: 20, alignItems: "center" },
  endingIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  endingTitle: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  finalScore: { color: "#fff", fontSize: 56, fontWeight: "800" },
  finalLabel: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },
  endingBody: { color: "#D1D5DB", fontSize: 15, lineHeight: 22, textAlign: "center", marginBottom: 24 },
  reviewTitle: { color: "#fff", fontWeight: "700", fontSize: 18, marginBottom: 12, alignSelf: "flex-start" },
  decisionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    width: "100%",
  },
  decisionScene: { color: "#F97316", fontWeight: "700", fontSize: 12, marginBottom: 2 },
  decisionChoice: { color: "#D1D5DB", fontSize: 13, lineHeight: 18, marginBottom: 4 },
  decisionPts: { fontWeight: "700", fontSize: 13 },
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
