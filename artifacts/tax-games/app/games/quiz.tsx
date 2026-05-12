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

import { useGame } from "@/context/GameContext";
import { QUIZ_QUESTIONS } from "@/constants/gameData";
import { useColors } from "@/hooks/useColors";

const TIME_PER_QUESTION = 15;
const POINTS_PER_CORRECT = 10;
const BONUS_THRESHOLD = 8;

type Phase = "intro" | "playing" | "feedback" | "results";

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const scorePopAnim = useRef(new Animated.Value(0)).current;

  const currentQ = QUIZ_QUESTIONS[questionIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startQuestion = useCallback(() => {
    setSelected(null);
    setTimeLeft(TIME_PER_QUESTION);
    setPhase("playing");

    progressAnim.setValue(1);
    questionAnim.setValue(0);
    Animated.timing(questionAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: TIME_PER_QUESTION * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [questionIdx]);

  const handleTimeUp = () => {
    setSelected(-1);
    setStreak(0);
    setPhase("feedback");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => moveNext(), 2500);
  };

  const handleAnswer = (idx: number) => {
    if (phase !== "playing") return;
    stopTimer();
    setSelected(idx);
    setPhase("feedback");

    const isCorrect = idx === currentQ.correct;
    const bonus = timeLeft >= BONUS_THRESHOLD ? 5 : 0;
    const points = isCorrect ? POINTS_PER_CORRECT + bonus : 0;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((c) => c + 1);
      const streakBonus = newStreak >= 3 ? 5 : 0;
      setScore((s) => s + points + streakBonus);

      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(scorePopAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 8 }),
        Animated.timing(scorePopAnim, { toValue: 0, duration: 600, delay: 600, useNativeDriver: true }),
      ]).start();
    } else {
      setStreak(0);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
    setTimeout(() => {
      feedbackAnim.setValue(0);
      moveNext();
    }, 2800);
  };

  const moveNext = useCallback(() => {
    if (questionIdx >= QUIZ_QUESTIONS.length - 1) {
      setPhase("results");
      setScore((s) => {
        updateScore("quiz", s);
        markCompleted("quiz");
        return s;
      });
    } else {
      setQuestionIdx((i) => i + 1);
    }
  }, [questionIdx]);

  useEffect(() => {
    if (phase === "playing") return;
    if (questionIdx > 0 && phase !== "results") {
      startQuestion();
    }
  }, [questionIdx]);

  useEffect(() => () => stopTimer(), []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const getStars = () => {
    const pct = correctCount / QUIZ_QUESTIONS.length;
    if (pct >= 0.9) return 3;
    if (pct >= 0.6) return 2;
    return 1;
  };

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: "#1E1B4B", paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.introContent}>
          <View style={styles.introIcon}>
            <Feather name="zap" size={52} color="#F59E0B" />
          </View>
          <Text style={styles.introTitle}>Tax Quiz Battle</Text>
          <Text style={styles.introSub}>
            {QUIZ_QUESTIONS.length} questions about taxes and tax evasion
          </Text>

          <View style={styles.introRules}>
            {[
              ["clock", "15 seconds per question"],
              ["star", "+10 points for correct answers"],
              ["trending-up", "Bonus points for speed & streaks"],
              ["alert-triangle", "No points for wrong answers"],
            ].map(([icon, text]) => (
              <View key={text} style={styles.ruleRow}>
                <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color="#F59E0B" />
                <Text style={styles.ruleText}>{text}</Text>
              </View>
            ))}
          </View>

          {scores.quiz > 0 && (
            <Text style={styles.highScore}>Personal Best: {scores.quiz} pts</Text>
          )}

          <Pressable onPress={startQuestion} style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Quiz</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "results") {
    const stars = getStars();
    return (
      <View style={[styles.container, { backgroundColor: "#1E1B4B", paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Feather key={s} name="star" size={40} color={s <= stars ? "#F59E0B" : "#374151"} />
            ))}
          </View>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.finalScoreLabel}>points</Text>
          <Text style={styles.correctCount}>
            {correctCount} / {QUIZ_QUESTIONS.length} correct
          </Text>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsCardTitle}>
              {stars === 3 ? "Outstanding! Tax Expert!" : stars === 2 ? "Great job! Keep learning!" : "Good start! Study up!"}
            </Text>
            <Text style={styles.resultsCardBody}>
              {stars === 3
                ? "You clearly understand how taxes work and why they matter. You're ready to be a responsible citizen!"
                : stars === 2
                ? "You know the basics! Review the Learn section to sharpen your knowledge even further."
                : "Taxes are complex — but so important. Head to the Learn section to discover more fascinating facts!"}
            </Text>
          </View>

          <View style={styles.resultsButtons}>
            <Pressable onPress={() => { setQuestionIdx(0); setScore(0); setCorrectCount(0); setStreak(0); startQuestion(); }} style={[styles.retryBtn, { backgroundColor: "#4F46E5" }]}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.retryBtnText}>Play Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: "#374151" }]}>
              <Feather name="home" size={16} color="#fff" />
              <Text style={styles.retryBtnText}>Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#1E1B4B", paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => { stopTimer(); router.back(); }} style={styles.backBtnSmall}>
          <Feather name="x" size={20} color="#9CA3AF" />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.questionCounter}>
            {questionIdx + 1} / {QUIZ_QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.scoreChip}>
          <Feather name="star" size={12} color="#F59E0B" />
          <Text style={styles.scoreChipText}>{score}</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <View style={[styles.timerTrack, { backgroundColor: "#374151" }]}>
          <Animated.View
            style={[
              styles.timerFill,
              {
                backgroundColor: timeLeft > 8 ? "#10B981" : timeLeft > 4 ? "#F59E0B" : "#EF4444",
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>

      {streak >= 3 && (
        <View style={styles.streakBanner}>
          <Feather name="zap" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{streak} streak! +5 bonus!</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: questionAnim,
            transform: [
              {
                translateX: questionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.questionText}>{currentQ.question}</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQ.options.map((opt, idx) => {
          let bg = "#1F2937";
          let border = "#374151";
          let textColor = "#F9FAFB";
          if (phase === "feedback" || selected !== null) {
            if (idx === currentQ.correct) {
              bg = "#065F46";
              border = "#10B981";
              textColor = "#6EE7B7";
            } else if (idx === selected && idx !== currentQ.correct) {
              bg = "#7F1D1D";
              border = "#EF4444";
              textColor = "#FCA5A5";
            }
          }
          return (
            <Pressable
              key={idx}
              onPress={() => handleAnswer(idx)}
              disabled={phase === "feedback" || selected !== null}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
            >
              <View style={[styles.optionLetter, { borderColor: border }]}>
                <Text style={[styles.optionLetterText, { color: border }]}>
                  {["A", "B", "C", "D"][idx]}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
              {phase === "feedback" && idx === currentQ.correct && (
                <Feather name="check-circle" size={18} color="#10B981" />
              )}
              {phase === "feedback" && idx === selected && idx !== currentQ.correct && (
                <Feather name="x-circle" size={18} color="#EF4444" />
              )}
            </Pressable>
          );
        })}
      </View>

      {phase === "feedback" && (
        <Animated.View
          style={[
            styles.explanationBox,
            {
              opacity: feedbackAnim,
              transform: [{ translateY: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              backgroundColor: selected === currentQ.correct ? "#065F46" : "#7F1D1D",
            },
          ]}
        >
          <Feather
            name={selected === currentQ.correct ? "check-circle" : "alert-circle"}
            size={18}
            color={selected === currentQ.correct ? "#6EE7B7" : "#FCA5A5"}
          />
          <Text
            style={[
              styles.explanationText,
              { color: selected === currentQ.correct ? "#6EE7B7" : "#FCA5A5" },
            ]}
          >
            {currentQ.explanation}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginBottom: 24 },
  introContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  introIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#F59E0B22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  introTitle: { color: "#fff", fontSize: 30, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  introSub: { color: "#9CA3AF", fontSize: 15, textAlign: "center", marginBottom: 32 },
  introRules: { gap: 12, marginBottom: 32, width: "100%" },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ruleText: { color: "#D1D5DB", fontSize: 14 },
  highScore: { color: "#F59E0B", fontWeight: "700", marginBottom: 20, fontSize: 15 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 18,
  },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtnSmall: { padding: 4 },
  topBarCenter: { flex: 1, alignItems: "center" },
  questionCounter: { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreChipText: { color: "#F59E0B", fontWeight: "700", fontSize: 14 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  timerTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 4 },
  timerText: { color: "#fff", fontWeight: "700", fontSize: 14, minWidth: 28, textAlign: "right" },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F59E0B22",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: "center",
  },
  streakText: { color: "#F59E0B", fontWeight: "700", fontSize: 13 },
  questionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  questionText: { color: "#F9FAFB", fontSize: 18, fontWeight: "700", lineHeight: 26 },
  optionsContainer: { gap: 10, flex: 1 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: { fontWeight: "700", fontSize: 13 },
  optionText: { flex: 1, fontSize: 14, fontWeight: "500", lineHeight: 20 },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    marginBottom: 10,
  },
  explanationText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "500" },
  resultsScroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  resultsTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  finalScore: { color: "#F59E0B", fontSize: 72, fontWeight: "800" },
  finalScoreLabel: { color: "#9CA3AF", fontSize: 16, marginBottom: 8 },
  correctCount: { color: "#D1D5DB", fontSize: 18, fontWeight: "600", marginBottom: 28 },
  resultsCard: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    width: "100%",
  },
  resultsCardTitle: { color: "#F9FAFB", fontSize: 18, fontWeight: "800", marginBottom: 10 },
  resultsCardBody: { color: "#9CA3AF", fontSize: 14, lineHeight: 21 },
  resultsButtons: { flexDirection: "row", gap: 12 },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
