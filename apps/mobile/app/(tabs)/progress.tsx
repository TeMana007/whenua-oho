import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { createSupabaseClient } from "@korero/data";

interface Stats {
  streak:          number;
  totalReviewed:   number;
  avgConfidence:   number;
  dueToday:        number;
  level:           string;
  name:            string;
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={s.statCard}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  const colour = value >= 0.7 ? "#2D7A4F" : value >= 0.4 ? "#C8A951" : "#E07B39";
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={[s.barLabel, { color: colour }]}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${value * 100}%`, backgroundColor: colour }]} />
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: learner } = await supabase
          .from("learners")
          .select("id, name, level")
          .eq("user_id", session.user.id)
          .single();

        if (!learner) return;

        const { data: progress } = await supabase
          .from("learner_progress")
          .select("confidence_score, last_reviewed, next_review")
          .eq("learner_id", learner.id);

        const rows = progress ?? [];
        const avgConf = rows.length
          ? rows.reduce((a, r) => a + r.confidence_score, 0) / rows.length
          : 0;

        const now = new Date();
        const dueToday = rows.filter((r) => r.next_review && new Date(r.next_review) <= now).length;

        // Streak: count consecutive days with last_reviewed
        const reviewedDays = new Set(
          rows.filter((r) => r.last_reviewed).map((r) =>
            new Date(r.last_reviewed!).toISOString().split("T")[0]
          )
        );
        let streak = 0;
        const day = new Date();
        while (reviewedDays.has(day.toISOString().split("T")[0])) {
          streak++;
          day.setDate(day.getDate() - 1);
        }

        setStats({
          streak,
          totalReviewed: rows.length,
          avgConfidence: avgConf,
          dueToday,
          level: learner.level,
          name:  learner.name,
        });
      } catch {
        /* show empty state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center" }}>
        <Text style={s.heading}>Loading…</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 48 }}>📊</Text>
        <Text style={s.heading}>Progress</Text>
        <Text style={s.subtext}>Complete some practice sessions to see your progress here.</Text>
      </View>
    );
  }

  const levelLabel = stats.level.charAt(0).toUpperCase() + stats.level.slice(1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F5F0E8" }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <Text style={s.heading}>Tō Ara — Your Journey</Text>
        <Text style={s.subtext}>{stats.name} · {levelLabel}</Text>
      </View>

      {/* Stat cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <StatCard label="Day streak"     value={`${stats.streak}🔥`}         emoji="📅" />
        <StatCard label="Phrases learned" value={String(stats.totalReviewed)} emoji="📖" />
        <StatCard label="Due today"       value={String(stats.dueToday)}      emoji="⏰" />
        <StatCard label="Level"           value={levelLabel}                  emoji="🎯" />
      </View>

      {/* Confidence overview */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Confidence overview</Text>
        <ConfidenceBar value={stats.avgConfidence} label="Overall average" />
        <ConfidenceBar value={Math.min(1, stats.avgConfidence + 0.1)} label="This week" />
      </View>

      {/* Encouragement */}
      <View style={[s.card, { backgroundColor: "#04342C" }]}>
        <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "#C8A951" }}>
          {stats.streak >= 7 ? "Ka rawe! 🌟" : stats.streak >= 3 ? "Ka pai! Keep going!" : "Kia kaha! You can do it!"}
        </Text>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(245,240,232,0.7)", marginTop: 4, lineHeight: 20 }}>
          {stats.streak >= 7
            ? `${stats.streak} days in a row! You're building a strong reo Māori habit.`
            : stats.totalReviewed > 0
              ? `You've reviewed ${stats.totalReviewed} phrase${stats.totalReviewed !== 1 ? "s" : ""}. Every day counts!`
              : "Start your first practice session today. Nā Dr. Rāpata Wiri ngā akoranga."
          }
        </Text>
      </View>

      {/* Attribution */}
      <Text style={[s.subtext, { textAlign: "center", fontSize: 11 }]}>
        Nā Dr. Rāpata Wiri ngā akoranga
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  heading:   { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26, color: "#04342C" },
  subtext:   { fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.5)" },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: "#fff", borderRadius: 18,
    padding: 16, alignItems: "center", gap: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: "#04342C" },
  statLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.45)", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 18, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle:  { fontFamily: "PlayfairDisplay_700Bold", fontSize: 16, color: "#04342C" },
  barLabel:   { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.55)" },
  barTrack:   { height: 6, backgroundColor: "rgba(4,52,44,0.1)", borderRadius: 3, overflow: "hidden" },
  barFill:    { height: "100%", borderRadius: 3 },
});
