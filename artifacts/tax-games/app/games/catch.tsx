import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";

const GRID_COLS = 3;
const GRID_ROWS = 3;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const GAME_DURATION = 45;

type CellType = "empty" | "coin" | "evader" | "bomb";

interface Cell {
  type: CellType;
  anim: Animated.Value;
}

const CELL_COLORS: Record<CellType, string> = {
  empty: "#1F2937",
  coin: "#F59E0B",
  evader: "#EF4444",
  bomb: "#6B7280",
};

const CELL_ICONS: Record<CellType, keyof typeof Feather.glyphMap> = {
  empty: "circle",
  coin: "dollar-sign",
  evader: "user-x",
  bomb: "x-octagon",
};

const CELL_POINTS: Record<CellType, number> = {
  empty: 0,
  coin: 10,
  evader: 15,
  bomb: -20,
};

type Phase = "intro" | "playing" | "results";

export default function CatchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [cells, setCells] = useState<CellType[]>(Array(TOTAL_CELLS).fill("empty"));
  const [feedbacks, setFeedbacks] = useState<(string | null)[]>(Array(TOTAL_CELLS).fill(null));
  const [lastAction, setLastAction] = useState<{ text: string; color: string } | null>(null);
  const [missedEvaders, setMissedEvaders] = useState(0);

  const cellAnims = useRef(
    Array.from({ length: TOTAL_CELLS }, () => new Animated.Value(0))
  ).current;

  const cellsRef = useRef<CellType[]>(Array(TOTAL_CELLS).fill("empty"));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cellTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array(TOTAL_CELLS).fill(null)
  );

  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    cellTimers.current.forEach((t) => { if (t) clearTimeout(t); });
  };

  const popCell = useCallback((idx: number, type: CellType) => {
    setCells((prev) => {
      const updated = [...prev];
      updated[idx] = type;
      return updated;
    });
    Animated.spring(cellAnims[idx], {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();

    const hideAfter = type === "evader" ? 1800 : 2200;
    cellTimers.current[idx] = setTimeout(() => {
      setCells((prev) => {
        if (prev[idx] === type) {
          if (type === "evader") {
            setMissedEvaders((m) => m + 1);
            setScore((s) => Math.max(0, s - 5));
            setLastAction({ text: "Evader escaped! -5", color: "#EF4444" });
          }
          const updated = [...prev];
          updated[idx] = "empty";
          return updated;
        }
        return prev;
      });
      Animated.timing(cellAnims[idx], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, hideAfter);
  }, []);

  const spawnItem = useCallback(() => {
    const emptyCells = Array.from({ length: TOTAL_CELLS }, (_, i) => i).filter(
      (i) => cellsRef.current[i] === "empty"
    );
    if (emptyCells.length === 0) return;
    const idx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const rand = Math.random();
    let type: CellType = "coin";
    if (rand < 0.3) type = "evader";
    else if (rand < 0.4) type = "bomb";
    popCell(idx, type);
  }, [popCell]);

  const startGame = () => {
    setCells(Array(TOTAL_CELLS).fill("empty"));
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setMissedEvaders(0);
    setLastAction(null);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopAll();
          setPhase("results");
          setScore((s) => {
            updateScore("catch", s);
            markCompleted("catch");
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      spawnItem();
    }, 900);
  };

  const tapCell = (idx: number) => {
    const type = cells[idx];
    if (type === "empty") return;

    if (cellTimers.current[idx]) {
      clearTimeout(cellTimers.current[idx]!);
      cellTimers.current[idx] = null;
    }

    const pts = CELL_POINTS[type];
    setScore((s) => Math.max(0, s + pts));

    let msg = "";
    let color = "#10B981";
    if (type === "coin") { msg = `+${pts} Tax collected!`; color = "#F59E0B"; }
    else if (type === "evader") { msg = `+${pts} Evader caught!`; color = "#10B981"; }
    else if (type === "bomb") { msg = `${pts} Oops! Bomb!`; color = "#EF4444"; }

    setLastAction({ text: msg, color });
    if (Platform.OS !== "web") {
      if (pts > 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.sequence([
      Animated.spring(cellAnims[idx], { toValue: 1.3, useNativeDriver: true, tension: 400 }),
      Animated.timing(cellAnims[idx], { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setCells((prev) => {
        const updated = [...prev];
        updated[idx] = "empty";
        return updated;
      });
    });
  };

  useEffect(() => () => stopAll(), []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: "#111827", paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.centerContent}>
          <View style={[styles.bigIcon, { backgroundColor: "#EF444422" }]}>
            <Feather name="crosshair" size={56} color="#EF4444" />
          </View>
          <Text style={styles.introTitle}>Evader Chase</Text>
          <Text style={styles.introSub}>
            Tap to collect tax coins and catch tax evaders before they escape!
          </Text>
          <View style={styles.rulesBox}>
            {[
              ["dollar-sign", "#F59E0B", "+10pts — Collect tax coins"],
              ["user-x", "#10B981", "+15pts — Catch evaders"],
              ["x-octagon", "#EF4444", "-20pts — Avoid bombs!"],
              ["alert-circle", "#9CA3AF", "-5pts — Evader escaped!"],
            ].map(([icon, color, label]) => (
              <View key={label} style={styles.ruleRow}>
                <View style={[styles.ruleIcon, { backgroundColor: (color as string) + "22" }]}>
                  <Feather name={icon as keyof typeof Feather.glyphMap} size={18} color={color as string} />
                </View>
                <Text style={styles.ruleText}>{label}</Text>
              </View>
            ))}
          </View>
          {scores.catch > 0 && (
            <Text style={styles.highScore}>Best: {scores.catch} pts</Text>
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
    return (
      <View style={[styles.container, { backgroundColor: "#111827", paddingTop: topPad }]}>
        <View style={styles.centerContent}>
          <Feather name="flag" size={60} color="#F59E0B" style={{ marginBottom: 16 }} />
          <Text style={styles.introTitle}>Time's Up!</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.finalLabel}>points scored</Text>
          <Text style={[styles.introSub, { marginTop: 8 }]}>
            {missedEvaders} evader{missedEvaders !== 1 ? "s" : ""} escaped!
          </Text>

          <View style={[styles.funFact, { borderColor: "#374151" }]}>
            <Feather name="info" size={16} color="#F59E0B" />
            <Text style={styles.funFactText}>
              In real life, tax evaders who escape can cost the government billions. Investigators like HMRC hunt them for years!
            </Text>
          </View>

          <View style={styles.resultBtns}>
            <Pressable onPress={startGame} style={[styles.startBtn, { flex: 1 }]}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.startBtnText}>Play Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={[styles.homeBtn, { flex: 1 }]}>
              <Feather name="home" size={16} color="#fff" />
              <Text style={styles.startBtnText}>Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#111827", paddingTop: topPad }]}>
      <View style={styles.gameHeader}>
        <Pressable onPress={() => { stopAll(); router.back(); }}>
          <Feather name="x" size={22} color="#6B7280" />
        </Pressable>
        <View style={styles.gameScoreChip}>
          <Feather name="dollar-sign" size={14} color="#F59E0B" />
          <Text style={styles.gameScore}>{score}</Text>
        </View>
        <View style={styles.timerChip}>
          <Feather name="clock" size={14} color={timeLeft <= 10 ? "#EF4444" : "#9CA3AF"} />
          <Text style={[styles.timerText, { color: timeLeft <= 10 ? "#EF4444" : "#fff" }]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {lastAction && (
        <Text style={[styles.actionFeedback, { color: lastAction.color }]}>
          {lastAction.text}
        </Text>
      )}

      <View style={styles.grid}>
        {cells.map((type, idx) => (
          <Pressable key={idx} onPress={() => tapCell(idx)} style={styles.cellWrapper}>
            <Animated.View
              style={[
                styles.cell,
                {
                  backgroundColor: type === "empty" ? "#1F2937" : CELL_COLORS[type] + "33",
                  borderColor: type === "empty" ? "#374151" : CELL_COLORS[type],
                  transform: [{ scale: cellAnims[idx] }],
                },
              ]}
            >
              {type !== "empty" && (
                <Feather
                  name={CELL_ICONS[type]}
                  size={36}
                  color={CELL_COLORS[type]}
                />
              )}
              {type === "empty" && (
                <View style={styles.emptyDot} />
              )}
            </Animated.View>
          </Pressable>
        ))}
      </View>

      <View style={styles.instructionRow}>
        <Feather name="dollar-sign" size={12} color="#F59E0B" />
        <Text style={styles.instruction}>Tap coins & evaders — avoid bombs!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginBottom: 32 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  bigIcon: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  introTitle: { color: "#fff", fontSize: 30, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  introSub: { color: "#9CA3AF", fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22, paddingHorizontal: 10 },
  rulesBox: { gap: 12, marginBottom: 24, width: "100%" },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ruleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleText: { color: "#D1D5DB", fontSize: 14, fontWeight: "500" },
  highScore: { color: "#F59E0B", fontWeight: "700", marginBottom: 20, fontSize: 15 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 8,
  },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gameScoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gameScore: { color: "#F59E0B", fontWeight: "800", fontSize: 18 },
  timerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: { fontWeight: "700", fontSize: 16 },
  actionFeedback: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
    minHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  cellWrapper: {
    width: "30%",
    aspectRatio: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#374151",
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    marginBottom: 20,
  },
  instruction: { color: "#6B7280", fontSize: 13 },
  finalScore: { color: "#F59E0B", fontSize: 72, fontWeight: "800" },
  finalLabel: { color: "#9CA3AF", fontSize: 16, marginBottom: 12 },
  funFact: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 20,
    width: "100%",
  },
  funFactText: { flex: 1, color: "#9CA3AF", fontSize: 13, lineHeight: 19 },
  resultBtns: { flexDirection: "row", gap: 12, width: "100%" },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#374151",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 8,
  },
});
