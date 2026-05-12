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

import { SCRAMBLE_WORDS } from "@/constants/gameData";
import { useGame } from "@/context/GameContext";

function scrambleWord(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.join("") === word) return scrambleWord(word);
  return arr.join("");
}

type Phase = "intro" | "playing" | "fact" | "results";

export default function ScrambleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [phase, setPhase] = useState<Phase>("intro");
  const [wordIdx, setWordIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [typed, setTyped] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [correct, setCorrect] = useState(false);
  const [shake, setShake] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const wordAnim = useRef(new Animated.Value(0)).current;

  const currentWord = SCRAMBLE_WORDS[wordIdx];

  const loadWord = useCallback((idx: number) => {
    const word = SCRAMBLE_WORDS[idx];
    const sc = scrambleWord(word.word).split("");
    setScrambled(sc);
    setTyped([]);
    setUsedIndices([]);
    setHintUsed(false);
    setCorrect(false);

    wordAnim.setValue(0);
    Animated.spring(wordAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }).start();
  }, []);

  const startGame = () => {
    setWordIdx(0);
    setScore(0);
    setHintsLeft(5);
    setPhase("playing");
    loadWord(0);
  };

  const tapLetter = (idx: number) => {
    if (usedIndices.includes(idx)) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTyped = [...typed, scrambled[idx]];
    const newUsed = [...usedIndices, idx];
    setTyped(newTyped);
    setUsedIndices(newUsed);

    if (newTyped.length === currentWord.word.length) {
      const attempt = newTyped.join("");
      if (attempt === currentWord.word) {
        const pts = hintUsed ? 75 : 100;
        setScore((s) => s + pts);
        setCorrect(true);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        successAnim.setValue(0);
        Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
        setTimeout(() => setPhase("fact"), 1200);
      } else {
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
        setTimeout(() => {
          setTyped([]);
          setUsedIndices([]);
        }, 500);
      }
    }
  };

  const removeLetter = () => {
    if (typed.length === 0) return;
    setTyped((t) => t.slice(0, -1));
    setUsedIndices((u) => u.slice(0, -1));
  };

  const useHint = () => {
    if (hintsLeft <= 0) return;
    const correctLetter = currentWord.word[typed.length];
    const letterIdx = scrambled.findIndex((l, i) => l === correctLetter && !usedIndices.includes(i));
    if (letterIdx >= 0) {
      tapLetter(letterIdx);
      setHintUsed(true);
      setHintsLeft((h) => h - 1);
    }
  };

  const nextWord = () => {
    if (wordIdx >= SCRAMBLE_WORDS.length - 1) {
      setPhase("results");
      updateScore("scramble", score);
      markCompleted("scramble");
    } else {
      setWordIdx((i) => i + 1);
      loadWord(wordIdx + 1);
      setPhase("playing");
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: "#500724", paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.centerContent}>
          <View style={[styles.bigIcon, { backgroundColor: "#EC489922" }]}>
            <Feather name="shuffle" size={52} color="#EC4899" />
          </View>
          <Text style={styles.introTitle}>Word Scramble</Text>
          <Text style={styles.introSub}>
            Unscramble {SCRAMBLE_WORDS.length} tax-related words and discover fascinating facts!
          </Text>
          <View style={styles.infoRow}>
            {[["target", `${SCRAMBLE_WORDS.length} Words`], ["star", "100pts/word"], ["help-circle", "5 Hints"]].map(([icon, label]) => (
              <View key={label} style={styles.infoItem}>
                <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color="#EC4899" />
                <Text style={styles.infoText}>{label}</Text>
              </View>
            ))}
          </View>
          {scores.scramble > 0 && (
            <Text style={styles.highScore}>Best: {scores.scramble} pts</Text>
          )}
          <Pressable onPress={startGame} style={styles.startBtn}>
            <Feather name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Start Scramble</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "results") {
    const perfect = score >= SCRAMBLE_WORDS.length * 100;
    return (
      <View style={[styles.container, { backgroundColor: "#500724", paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Feather name="award" size={64} color={perfect ? "#F59E0B" : "#EC4899"} style={{ marginBottom: 16 }} />
          <Text style={styles.introTitle}>{perfect ? "Perfect Score!" : "Word Master!"}</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.finalLabel}>out of {SCRAMBLE_WORDS.length * 100} pts</Text>
          <View style={[styles.funFactBox, { backgroundColor: "#1F2937" }]}>
            <Feather name="info" size={16} color="#EC4899" />
            <Text style={styles.funFactText}>
              You just learned {SCRAMBLE_WORDS.length} key tax vocabulary words. Understanding these terms is the first step to becoming a financially responsible adult!
            </Text>
          </View>
          <View style={styles.resultBtns}>
            <Pressable onPress={startGame} style={[styles.btn, { backgroundColor: "#EC4899" }]}>
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

  if (phase === "fact") {
    return (
      <View style={[styles.container, { backgroundColor: "#500724", paddingTop: topPad }]}>
        <View style={styles.centerContent}>
          <Animated.View style={{ transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }], opacity: successAnim }}>
            <View style={styles.successWord}>
              {currentWord.word.split("").map((letter, i) => (
                <View key={i} style={[styles.letterTile, { backgroundColor: "#10B981" }]}>
                  <Text style={styles.letterText}>{letter}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={[styles.scorePopup, { backgroundColor: "#10B98122", borderColor: "#10B981" }]}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={[styles.scorePopupText, { color: "#10B981" }]}>
              +{hintUsed ? 75 : 100} points!
            </Text>
          </View>

          <View style={styles.factCard}>
            <Feather name="zap" size={20} color="#EC4899" />
            <Text style={styles.factTitle}>Did You Know?</Text>
            <Text style={styles.factBody}>{currentWord.fact}</Text>
          </View>

          <Text style={styles.progressText}>
            {wordIdx + 1} of {SCRAMBLE_WORDS.length} complete
          </Text>

          <Pressable onPress={nextWord} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {wordIdx >= SCRAMBLE_WORDS.length - 1 ? "See Results" : "Next Word"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#500724", paddingTop: topPad }]}>
      <View style={styles.gameHeader}>
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={22} color="#9CA3AF" />
        </Pressable>
        <View style={styles.progressTrack}>
          {SCRAMBLE_WORDS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i < wordIdx ? "#EC4899" : i === wordIdx ? "#F59E0B" : "#374151" },
              ]}
            />
          ))}
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{score}</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.wordCard,
          {
            opacity: wordAnim,
            transform: [
              { translateY: wordAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <Text style={styles.hintLabel}>Hint: {currentWord.hint}</Text>
        <View style={styles.typedRow}>
          {Array.from({ length: currentWord.word.length }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.typedSlot,
                {
                  backgroundColor: typed[i] ? (correct ? "#10B98133" : "#7C3AED33") : "#1F2937",
                  borderColor: typed[i] ? (correct ? "#10B981" : "#8B5CF6") : "#374151",
                },
              ]}
            >
              <Text style={[styles.typedLetter, { color: correct ? "#10B981" : "#fff" }]}>
                {typed[i] || ""}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.scrambledRow}>
        {scrambled.map((letter, idx) => (
          <Pressable
            key={idx}
            onPress={() => tapLetter(idx)}
            disabled={usedIndices.includes(idx)}
            style={[
              styles.scrambledTile,
              { opacity: usedIndices.includes(idx) ? 0.2 : 1 },
            ]}
          >
            <Text style={styles.scrambledLetter}>{letter}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={removeLetter} style={styles.actionBtn} disabled={typed.length === 0}>
          <Feather name="delete" size={20} color="#9CA3AF" />
          <Text style={styles.actionBtnText}>Undo</Text>
        </Pressable>
        <Pressable
          onPress={useHint}
          style={[styles.actionBtn, { backgroundColor: hintsLeft > 0 ? "#EC489922" : "#1F2937" }]}
          disabled={hintsLeft <= 0 || correct}
        >
          <Feather name="help-circle" size={20} color={hintsLeft > 0 ? "#EC4899" : "#6B7280"} />
          <Text style={[styles.actionBtnText, { color: hintsLeft > 0 ? "#EC4899" : "#6B7280" }]}>
            Hint ({hintsLeft})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setTyped([]); setUsedIndices([]); }}
          style={styles.actionBtn}
          disabled={typed.length === 0}
        >
          <Feather name="refresh-cw" size={20} color="#9CA3AF" />
          <Text style={styles.actionBtnText}>Clear</Text>
        </Pressable>
      </View>
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
  infoRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { color: "#D1D5DB", fontWeight: "600", fontSize: 14 },
  highScore: { color: "#F59E0B", fontWeight: "700", marginBottom: 16, fontSize: 15 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EC4899",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 18,
  },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  progressTrack: { flexDirection: "row", gap: 6, flex: 1, marginHorizontal: 12 },
  progressDot: { flex: 1, height: 6, borderRadius: 3 },
  scoreChip: { backgroundColor: "#EC489922", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreChipText: { color: "#EC4899", fontWeight: "700", fontSize: 14 },
  wordCard: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    alignItems: "center",
  },
  hintLabel: { color: "#9CA3AF", fontSize: 13, fontWeight: "500", marginBottom: 16, fontStyle: "italic" },
  typedRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  typedSlot: {
    width: 38,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  typedLetter: { fontSize: 18, fontWeight: "800" },
  scrambledRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
  },
  scrambledTile: {
    width: 48,
    height: 56,
    backgroundColor: "#EC489933",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#EC4899",
    alignItems: "center",
    justifyContent: "center",
  },
  scrambledLetter: { color: "#fff", fontSize: 22, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1F2937",
    borderRadius: 14,
    paddingVertical: 12,
  },
  actionBtnText: { color: "#9CA3AF", fontWeight: "600", fontSize: 14 },
  successWord: { flexDirection: "row", gap: 6, marginBottom: 16 },
  letterTile: {
    width: 40,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  scorePopup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 24,
  },
  scorePopupText: { fontWeight: "800", fontSize: 18 },
  factCard: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  factTitle: { color: "#EC4899", fontWeight: "800", fontSize: 16 },
  factBody: { color: "#D1D5DB", fontSize: 14, lineHeight: 21, textAlign: "center" },
  progressText: { color: "#6B7280", fontSize: 13, marginBottom: 20 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EC4899",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 16,
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  resultsScroll: { flexGrow: 1, padding: 20, alignItems: "center" },
  finalScore: { color: "#EC4899", fontSize: 64, fontWeight: "800" },
  finalLabel: { color: "#9CA3AF", fontSize: 15, marginBottom: 20 },
  funFactBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    width: "100%",
  },
  funFactText: { flex: 1, color: "#D1D5DB", fontSize: 13, lineHeight: 19 },
  resultBtns: { flexDirection: "row", gap: 12, width: "100%" },
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
