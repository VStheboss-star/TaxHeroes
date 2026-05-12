import { Feather } from "@expo/vector-icons";
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

import { LEARN_FACTS } from "@/constants/gameData";
import { useColors } from "@/hooks/useColors";

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const switchCategory = (idx: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    setActiveCategory(idx);
  };

  const category = LEARN_FACTS[activeCategory];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad,
            backgroundColor: "#1E1B4B",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Learning Hub</Text>
            <Text style={styles.headerSub}>Everything you need to know about taxes</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {LEARN_FACTS.map((cat, idx) => (
            <Pressable
              key={idx}
              onPress={() => switchCategory(idx)}
              style={[
                styles.tab,
                {
                  backgroundColor: idx === activeCategory ? cat.color : "#FFFFFF22",
                },
              ]}
            >
              <Feather
                name={cat.icon as keyof typeof Feather.glyphMap}
                size={14}
                color={idx === activeCategory ? "#fff" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: idx === activeCategory ? "#fff" : "#9CA3AF" },
                ]}
              >
                {cat.category.split("?")[0].split(" ").slice(0, 2).join(" ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: slideAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }),
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
            <Feather
              name={category.icon as keyof typeof Feather.glyphMap}
              size={36}
              color="#fff"
            />
            <Text style={styles.categoryTitle}>{category.category}</Text>
            <Text style={styles.categoryCount}>
              {category.facts.length} facts to discover
            </Text>
          </View>

          {category.facts.map((fact, idx) => (
            <FactCard key={idx} fact={fact} index={idx} color={category.color} />
          ))}

          <View style={[styles.quizPrompt, { backgroundColor: "#1E1B4B" }]}>
            <View>
              <Text style={styles.quizPromptTitle}>Ready to test yourself?</Text>
              <Text style={styles.quizPromptSub}>Try the Tax Quiz Battle!</Text>
            </View>
            <Pressable
              onPress={() => router.replace("/games/quiz")}
              style={[styles.quizPromptBtn, { backgroundColor: "#4F46E5" }]}
            >
              <Feather name="zap" size={16} color="#fff" />
              <Text style={styles.quizPromptBtnText}>Quiz</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function FactCard({ fact, index, color }: { fact: string; index: number; color: string }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(slideAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start();
    setExpanded((e) => !e);
  };

  return (
    <Animated.View
      style={[
        styles.factCard,
        {
          backgroundColor: colors.card,
          opacity: 1,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.factCardHeader}>
        <View style={[styles.factNumber, { backgroundColor: color + "22" }]}>
          <Text style={[styles.factNumberText, { color }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.factText, { color: colors.foreground }]}>{fact}</Text>
      </View>
      <View style={[styles.factAccent, { backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  tabsScroll: { paddingHorizontal: 16, gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tabText: { fontSize: 12, fontWeight: "600" },
  content: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  categoryHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  categoryTitle: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "center" },
  categoryCount: { color: "#ffffff99", fontSize: 13 },
  factCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
  },
  factCardHeader: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  factNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  factNumberText: { fontWeight: "800", fontSize: 14 },
  factText: { flex: 1, fontSize: 14, lineHeight: 21, fontWeight: "400" },
  factAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  quizPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
  },
  quizPromptTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  quizPromptSub: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  quizPromptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quizPromptBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
