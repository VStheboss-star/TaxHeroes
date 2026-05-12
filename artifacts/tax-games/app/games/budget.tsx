import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "@/context/GameContext";

const TOTAL_BUDGET = 500;
const STEP = 10;

interface Category {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  minRecommended: number;
  description: string;
  underfundedWarning: string;
}

const CATEGORIES: Category[] = [
  {
    key: "education",
    label: "Education",
    icon: "book",
    color: "#4F46E5",
    minRecommended: 100,
    description: "Schools, universities, teachers, and learning resources",
    underfundedWarning: "Schools can't afford teachers! Class sizes double and students fall behind.",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    icon: "heart",
    color: "#EF4444",
    minRecommended: 130,
    description: "Hospitals, NHS, doctors, ambulances, and medicines",
    underfundedWarning: "Hospitals are overwhelmed! Wait times grow to 12+ hours in A&E.",
  },
  {
    key: "infrastructure",
    label: "Roads & Transport",
    icon: "truck",
    color: "#F59E0B",
    minRecommended: 100,
    description: "Roads, bridges, railways, and public transport",
    underfundedWarning: "Roads crumble! Potholes cause accidents and journey times double.",
  },
  {
    key: "emergency",
    label: "Emergency Services",
    icon: "shield",
    color: "#10B981",
    minRecommended: 100,
    description: "Police, fire service, and coastguard",
    underfundedWarning: "Response times triple! Crimes go unsolved and fires cause more damage.",
  },
  {
    key: "environment",
    label: "Environment",
    icon: "wind",
    color: "#8B5CF6",
    minRecommended: 70,
    description: "Clean energy, parks, recycling, and pollution control",
    underfundedWarning: "Air quality worsens! Parks close and recycling stops. Climate goals missed.",
  },
];

type Phase = "playing" | "results";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateScore, markCompleted, scores } = useGame();

  const [allocations, setAllocations] = useState<Record<string, number>>({
    education: 100,
    healthcare: 130,
    infrastructure: 100,
    emergency: 100,
    environment: 70,
  });
  const [phase, setPhase] = useState<Phase>("playing");
  const [gameScore, setGameScore] = useState(0);

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_BUDGET - totalAllocated;

  const adjust = (key: string, delta: number) => {
    setAllocations((prev) => {
      const current = prev[key];
      const newVal = Math.max(0, current + delta);
      const newTotal = totalAllocated - current + newVal;
      if (newTotal > TOTAL_BUDGET) return prev;
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { ...prev, [key]: newVal };
    });
  };

  const submit = () => {
    let score = 0;
    CATEGORIES.forEach((cat) => {
      const alloc = allocations[cat.key];
      if (alloc >= cat.minRecommended) {
        score += 20;
      } else if (alloc >= cat.minRecommended * 0.7) {
        score += 10;
      }
    });
    if (remaining === 0) score += 0;
    setGameScore(score);
    setPhase("results");
    updateScore("budget", score);
    markCompleted("budget");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (phase === "results") {
    const stars = gameScore === 100 ? 3 : gameScore >= 60 ? 2 : 1;
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Feather name="bar-chart-2" size={56} color="#10B981" style={{ marginBottom: 16 }} />
          <Text style={styles.resultsTitle}>Budget Review</Text>
          <Text style={styles.finalScore}>{gameScore}/100</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Feather key={s} name="star" size={36} color={s <= stars ? "#F59E0B" : "#374151"} />
            ))}
          </View>

          {CATEGORIES.map((cat) => {
            const alloc = allocations[cat.key];
            const ok = alloc >= cat.minRecommended;
            return (
              <View key={cat.key} style={[styles.reviewRow, { borderColor: ok ? cat.color + "44" : "#EF444444" }]}>
                <View style={[styles.reviewIcon, { backgroundColor: ok ? cat.color + "22" : "#EF444422" }]}>
                  <Feather name={cat.icon} size={18} color={ok ? cat.color : "#EF4444"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewLabel}>{cat.label}: £{alloc}B</Text>
                  <Text style={styles.reviewSub}>
                    {ok ? `Recommended: £${cat.minRecommended}B` : cat.underfundedWarning}
                  </Text>
                </View>
                <Feather name={ok ? "check-circle" : "alert-circle"} size={20} color={ok ? "#10B981" : "#EF4444"} />
              </View>
            );
          })}

          <View style={styles.factBox}>
            <Feather name="info" size={16} color="#F59E0B" />
            <Text style={styles.factText}>
              When people evade taxes, governments must cut budgets — exactly like you just experienced! Every pound of tax evaded reduces public services.
            </Text>
          </View>

          <View style={styles.resultBtns}>
            <Pressable onPress={() => { setAllocations({ education: 100, healthcare: 130, infrastructure: 100, emergency: 100, environment: 70 }); setPhase("playing"); }} style={[styles.btn, { backgroundColor: "#10B981" }]}>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={styles.btnText}>Try Again</Text>
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

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1A1040" />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Budget Builder</Text>
          <Text style={styles.subtitle}>Allocate the national budget wisely</Text>
        </View>
      </View>

      <View style={styles.budgetBar}>
        <View style={styles.budgetBarTop}>
          <Text style={styles.budgetLabel}>Total Budget: £{TOTAL_BUDGET}B</Text>
          <Text style={[styles.budgetRemaining, { color: remaining === 0 ? "#10B981" : remaining < 0 ? "#EF4444" : "#F59E0B" }]}>
            {remaining === 0 ? "Fully allocated!" : `£${remaining}B remaining`}
          </Text>
        </View>
        <View style={styles.budgetTrack}>
          {CATEGORIES.map((cat) => (
            <View
              key={cat.key}
              style={[
                styles.budgetSegment,
                {
                  flex: allocations[cat.key],
                  backgroundColor: cat.color,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => {
          const alloc = allocations[cat.key];
          const pct = Math.round((alloc / TOTAL_BUDGET) * 100);
          const isUnderfunded = alloc < cat.minRecommended;
          return (
            <View key={cat.key} style={styles.categoryCard}>
              <View style={styles.catHeader}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + "22" }]}>
                  <Feather name={cat.icon} size={22} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catDesc}>{cat.description}</Text>
                </View>
                <View style={[styles.catBadge, { backgroundColor: cat.color + "22" }]}>
                  <Text style={[styles.catPct, { color: cat.color }]}>{pct}%</Text>
                </View>
              </View>

              {isUnderfunded && (
                <View style={styles.warningRow}>
                  <Feather name="alert-triangle" size={13} color="#F59E0B" />
                  <Text style={styles.warningText}>{cat.underfundedWarning}</Text>
                </View>
              )}

              <View style={styles.sliderRow}>
                <Pressable onPress={() => adjust(cat.key, -STEP)} style={[styles.adjustBtn, { backgroundColor: "#EF444422", borderColor: "#EF4444" }]}>
                  <Feather name="minus" size={18} color="#EF4444" />
                </Pressable>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={[styles.allocTrack, { backgroundColor: "#E5E7EB" }]}>
                    <View style={[styles.allocFill, { width: `${pct}%` as `${number}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={styles.allocLabel}>£{alloc}B (min £{cat.minRecommended}B)</Text>
                </View>
                <Pressable onPress={() => adjust(cat.key, STEP)} style={[styles.adjustBtn, { backgroundColor: cat.color + "22", borderColor: cat.color }]}>
                  <Feather name="plus" size={18} color={cat.color} />
                </Pressable>
              </View>
            </View>
          );
        })}

        <Pressable
          onPress={submit}
          style={[styles.submitBtn, { opacity: remaining !== 0 ? 0.5 : 1 }]}
          disabled={remaining !== 0}
        >
          <Feather name="check-circle" size={18} color="#fff" />
          <Text style={styles.submitText}>
            {remaining !== 0 ? `Allocate £${Math.abs(remaining)}B more` : "Submit Budget"}
          </Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFFE", paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1A1040" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  budgetBar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetBarTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  budgetLabel: { fontWeight: "700", color: "#1A1040", fontSize: 14 },
  budgetRemaining: { fontWeight: "700", fontSize: 14 },
  budgetTrack: { height: 14, borderRadius: 7, flexDirection: "row", overflow: "hidden", backgroundColor: "#E5E7EB" },
  budgetSegment: { height: "100%" },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  catHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: { fontSize: 16, fontWeight: "700", color: "#1A1040", marginBottom: 2 },
  catDesc: { fontSize: 12, color: "#6B7280" },
  catBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  catPct: { fontWeight: "800", fontSize: 15 },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  warningText: { flex: 1, color: "#92400E", fontSize: 12, lineHeight: 17 },
  sliderRow: { flexDirection: "row", alignItems: "center" },
  adjustBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  allocTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  allocFill: { height: "100%", borderRadius: 4 },
  allocLabel: { fontSize: 11, color: "#6B7280", textAlign: "center" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  resultsScroll: { flexGrow: 1, padding: 20, alignItems: "center" },
  resultsTitle: { color: "#1A1040", fontSize: 26, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  finalScore: { color: "#10B981", fontSize: 56, fontWeight: "800" },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 24, marginTop: 8 },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    width: "100%",
  },
  reviewIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reviewLabel: { fontWeight: "700", color: "#1A1040", fontSize: 14, marginBottom: 3 },
  reviewSub: { color: "#6B7280", fontSize: 12, lineHeight: 17 },
  factBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#1E1B4B",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
    width: "100%",
  },
  factText: { flex: 1, color: "#D1D5DB", fontSize: 13, lineHeight: 19 },
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
