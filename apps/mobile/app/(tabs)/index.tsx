import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { KoruSpinner } from "@korero/ui";
import {
  createSupabaseClient,
  getLearner,
  getClassByCode,
  getChallengesForClass,
  getPatternsByWeek,
  getLearnerStats,
} from "@korero/data";
import type { Learner, SentencePattern, Challenge, Class, LearnerStats } from "@korero/data";

// ─── Māori date util ─────────────────────────────────────────────────────────

const DAYS   = ["Rātapu","Rāhina","Rātū","Rāapa","Rāpare","Rāmere","Rāhoroi"];
const MONTHS = ["Kohi-kōkā","Hui-tanguru","Poutū-te-rangi","Paenga-whāwhā","Haratua","Pipiri","Hōngongoi","Here-turi-kōkā","Mahuru","Whiringa-ā-nuku","Whiringa-ā-rangi","Hakihea"];

function maoriDate(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface HomeData {
  learner:    Learner;
  stats:      LearnerStats;
  pattern:    SentencePattern | null;
  classInfo:  Class | null;
  challenge:  Challenge | null;
  weekNumber: number;
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [data, setData]       = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/"); return; }

      // Stage 1: learner profile
      const learner = await getLearner(user.id);
      if (!learner) { router.replace("/onboarding"); return; }

      // Stage 2: parallel
      const [stats, classInfo] = await Promise.all([
        getLearnerStats(user.id),
        learner.class_code ? getClassByCode(learner.class_code).catch(() => null) : null,
      ]);

      const weekNumber = classInfo?.week_number ?? 1;

      // Stage 3: patterns + challenges
      const [patterns, challenges] = await Promise.all([
        getPatternsByWeek(learner.level, weekNumber).catch(() => []),
        classInfo ? getChallengesForClass(classInfo.id).catch(() => []) : [],
      ]);

      setData({
        learner,
        stats,
        pattern:    patterns[0] ?? null,
        classInfo:  classInfo ?? null,
        challenge:  challenges[0] ?? null,
        weekNumber,
      });
    } catch (e) {
      setError("Could not load your data. Pull down to retry.");
    } finally {
      setLoading(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <KoruSpinner size={56} color="#04342C" />
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.4)" }}>
          E tukua ana…
        </Text>
      </View>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: "#04342C", textAlign: "center" }}>
          {error ?? "Something went wrong."}
        </Text>
        <Pressable onPress={loadData} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#04342C", borderRadius: 12 }}>
          <Text style={{ fontFamily: "DMSans_700Bold", color: "#F5F0E8" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const { learner, stats, pattern, classInfo, challenge, weekNumber } = data;
  const firstName = learner.name?.split(" ")[0] ?? "e hoa";
  const durationMap: Record<string, number> = { beginner: 8, intermediate: 12, advanced: 15 };
  const duration = durationMap[learner.level] ?? 8;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F0E8" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 30, color: "#04342C", lineHeight: 36 }}>
            Kia ora, {firstName}!
          </Text>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(26,26,26,0.45)", marginTop: 3 }}>
            {maoriDate()}
          </Text>
        </View>

        {/* Streak badge */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 6,
          backgroundColor: "rgba(224,123,57,0.12)",
          borderWidth: 1, borderColor: "rgba(224,123,57,0.3)",
          borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8,
          marginLeft: 12,
        }}>
          <Text style={{ fontSize: 22 }}>🔥</Text>
          <View>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: "#E07B39", lineHeight: 24 }}>
              {stats.streak}
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 9, color: "rgba(224,123,57,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>
              {stats.streak === 1 ? "day" : "days"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Today's Practice ───────────────────────────────────────── */}
      <View style={{
        backgroundColor: "#04342C",
        borderRadius: 24,
        padding: 24,
        overflow: "hidden",
      }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.45)", textTransform: "uppercase", letterSpacing: 2 }}>
            Today's Practice
          </Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.6)" }}>
                Week {weekNumber}
              </Text>
            </View>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.4)" }}>
              ⏱ ~{duration} min
            </Text>
          </View>
        </View>

        {/* Pattern */}
        {pattern ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: "#F5F0E8", lineHeight: 30 }}>
              {pattern.pattern_te_reo}
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(245,240,232,0.55)", fontStyle: "italic" }}>
              {pattern.pattern_english}
            </Text>
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 10, color: "rgba(200,169,81,0.7)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                Example
              </Text>
              <Text style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 16, color: "#C8A951", fontStyle: "italic" }}>
                "{pattern.example_te_reo}"
              </Text>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.4)", marginTop: 2 }}>
                {pattern.example_english}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: "#F5F0E8" }}>
              Ngā Mihi — Greetings
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(245,240,232,0.55)" }}>
              Learn to greet and introduce yourself in te reo Māori
            </Text>
          </View>
        )}

        {/* Start button */}
        <Pressable
          onPress={() => router.push("/(tabs)/korero")}
          style={{
            marginTop: 20,
            backgroundColor: "#2D7A4F",
            borderRadius: 16,
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>▶</Text>
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: "#F5F0E8" }}>
            Tīmata — Start
          </Text>
        </Pressable>
      </View>

      {/* ── Review Card ────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(26,26,26,0.07)",
      }}>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.35)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          Review
        </Text>
        {stats.dueCount > 0 ? (
          <View style={{ gap: 4, marginBottom: 16 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 40, color: "#04342C", lineHeight: 44 }}>
              {stats.dueCount}
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.5)" }}>
              {stats.dueCount === 1 ? "phrase" : "phrases"} due for review
            </Text>
          </View>
        ) : (
          <View style={{ gap: 4, marginBottom: 16 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 26, color: "#2D7A4F" }}>Ka pai! ✓</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.5)" }}>All caught up</Text>
          </View>
        )}
        <Pressable
          onPress={() => stats.dueCount > 0 && router.push("/(tabs)/review")}
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: stats.dueCount > 0 ? "#04342C" : "rgba(26,26,26,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{
            fontFamily: "DMSans_700Bold",
            fontSize: 14,
            color: stats.dueCount > 0 ? "#F5F0E8" : "rgba(26,26,26,0.3)",
          }}>
            {stats.dueCount > 0 ? "Review Now →" : "Nothing due"}
          </Text>
        </Pressable>
      </View>

      {/* ── Class Card ─────────────────────────────────────────────── */}
      {classInfo ? (
        <View style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(26,26,26,0.07)",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.35)", textTransform: "uppercase", letterSpacing: 2 }}>
              Class Group
            </Text>
            <View style={{ backgroundColor: "rgba(200,169,81,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: "#C8A951" }}>{classInfo.class_code}</Text>
            </View>
          </View>

          {challenge ? (
            <View style={{ gap: 3, marginBottom: 14 }}>
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: "#04342C", textTransform: "uppercase", letterSpacing: 1.5 }}>
                🏆 Challenge
              </Text>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: "#1A1A1A", lineHeight: 26 }}>
                {challenge.title}
              </Text>
              {challenge.due_date && (
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.4)" }}>
                  Due {new Date(challenge.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ gap: 3, marginBottom: 14 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: "#1A1A1A" }}>
                {classInfo.kaiako_name}
              </Text>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(26,26,26,0.5)" }}>
                Week {classInfo.week_number}{classInfo.current_theme ? ` · ${classInfo.current_theme}` : ""}
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push("/(tabs)/group")}
            style={{
              height: 48, borderRadius: 12,
              backgroundColor: "rgba(4,52,44,0.07)",
              borderWidth: 1, borderColor: "rgba(4,52,44,0.12)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" }}>
              View Group →
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{
          borderRadius: 20, padding: 20,
          borderWidth: 2, borderColor: "rgba(26,26,26,0.1)",
          borderStyle: "dashed", alignItems: "center", gap: 8,
        }}>
          <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "rgba(26,26,26,0.3)", textAlign: "center" }}>
            No class yet
          </Text>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(26,26,26,0.35)", textAlign: "center" }}>
            Ask your kaiako for a class code to join a group.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/group")}
            style={{ marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(26,26,26,0.05)" }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: "rgba(26,26,26,0.4)" }}>
              Join a class
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
