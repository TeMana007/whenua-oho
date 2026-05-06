import { cookies }       from "next/headers";
import { redirect }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { kaiakologout }  from "../actions";
import ClassOverview     from "./ClassOverview";
import StrugglingPhrases from "./StrugglingPhrases";
import ChallengeSetter   from "./ChallengeSetter";
import ContentUpload     from "./ContentUpload";
import type { StrugglePhrase } from "./StrugglingPhrases";

export const metadata = { title: "Kaiako Dashboard — Kōrero Companion" };

export default async function KaiakoDashboard() {
  const cookieStore = await cookies();
  const classId     = cookieStore.get("kaiako_class_id")?.value;
  const className   = cookieStore.get("kaiako_class_name")?.value ?? "Your class";
  const classCode   = cookieStore.get("kaiako_class_code")?.value ?? "";

  if (!classId) redirect("/kaiako");

  const supabase = createClient();

  /* ── 1. Learners in this class ── */
  const { data: rawLearners } = await supabase
    .from("learners")
    .select("id, name, level")
    .eq("class_id", classId);

  const learnerIds = (rawLearners ?? []).map((l) => l.id);

  /* ── 2. Aggregate progress per learner ── */
  const { data: progressRows } = learnerIds.length
    ? await supabase
        .from("learner_progress")
        .select("learner_id, confidence_score, last_reviewed")
        .in("learner_id", learnerIds)
    : { data: [] };

  // Build learner stats map
  const statsMap: Record<string, { scores: number[]; lastReviewed: string | null }> = {};
  for (const row of progressRows ?? []) {
    if (!statsMap[row.learner_id]) statsMap[row.learner_id] = { scores: [], lastReviewed: null };
    statsMap[row.learner_id].scores.push(row.confidence_score);
    const lr = row.last_reviewed;
    if (lr && (!statsMap[row.learner_id].lastReviewed || lr > statsMap[row.learner_id].lastReviewed!)) {
      statsMap[row.learner_id].lastReviewed = lr;
    }
  }

  const learners = (rawLearners ?? []).map((l) => {
    const stats  = statsMap[l.id] ?? { scores: [], lastReviewed: null };
    const avg    = stats.scores.length
      ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
      : 0;
    const lastDate = stats.lastReviewed ? new Date(stats.lastReviewed) : null;
    const daysSince = lastDate ? (Date.now() - lastDate.getTime()) / 86_400_000 : Infinity;
    // Simple streak: 1 if reviewed today, else 0 (full streak calc would need daily data)
    const streak = daysSince < 1 ? 1 : 0;
    return { id: l.id, name: l.name, level: l.level, last_reviewed: stats.lastReviewed, confidence_avg: avg, streak };
  });

  /* ── 3. Struggling phrases (lowest avg confidence across class) ── */
  let strugglingPhrases: StrugglePhrase[] = [];
  if (learnerIds.length > 0) {
    const { data: phraseProgress } = await supabase
      .from("learner_progress")
      .select("phrase_id, confidence_score, phrases(id, maori, english)")
      .in("learner_id", learnerIds)
      .lt("confidence_score", 0.6);

    const phraseMap: Record<string, { maori: string; english: string; scores: number[] }> = {};
    for (const row of phraseProgress ?? []) {
      const ph = (Array.isArray(row.phrases) ? row.phrases[0] : row.phrases) as
        | { id: string; maori: string; english: string }
        | null;
      if (!ph) continue;
      if (!phraseMap[ph.id]) phraseMap[ph.id] = { maori: ph.maori, english: ph.english, scores: [] };
      phraseMap[ph.id].scores.push(row.confidence_score);
    }

    strugglingPhrases = Object.entries(phraseMap)
      .map(([id, { maori, english, scores }]) => ({
        phraseId: id,
        maori,
        english,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        attempts: scores.length,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  }

  /* ── 4. Existing challenges ── */
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, phrase, description, due_date")
    .eq("class_id", classId)
    .order("created_at", { ascending: false })
    .limit(5);

  const challengeList = (challenges ?? []).map((c) => ({
    ...c,
    submissions: 0, // TODO: count from challenge_completions
  }));

  /* ── 5. Recently uploaded phrases ── */
  const { data: recentPhrases } = await supabase
    .from("phrases")
    .select("id, maori, english, pattern_number, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top nav */}
      <nav className="bg-primary sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg text-secondary">Kōrero Companion</span>
            <span className="text-secondary/30">·</span>
            <span className="font-body text-sm text-secondary/70">Kaiako</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-body text-xs text-secondary/50">{today}</p>
              <p className="font-body font-bold text-sm text-secondary">{className}</p>
            </div>
            <span className="font-body text-xs text-secondary/40 bg-white/10 px-2 py-1 rounded-lg">
              {classCode}
            </span>
            <form action={kaiakologout}>
              <button type="submit" className="font-body text-xs text-secondary/40 hover:text-secondary/80 transition">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-heading text-3xl text-primary">Tēnā koe, kaiako</h1>
          <p className="font-body text-ink/50 text-sm mt-1">
            {className} · {learners.length} ākonga enrolled
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-8">
            <ClassOverview learners={learners} />
            <StrugglingPhrases phrases={strugglingPhrases} />
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <ChallengeSetter classId={classId} existing={challengeList} />
            <ContentUpload
              classId={classId}
              recentPhrases={(recentPhrases ?? []).map((p) => ({
                id:             p.id,
                maori:          p.maori,
                english:        p.english,
                pattern_number: (p as { pattern_number?: number }).pattern_number ?? 0,
                created_at:     p.created_at ?? new Date().toISOString(),
              }))}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-4 border-t border-gray-100">
          <p className="font-body text-xs text-ink/25">Nā Dr. Rāpata Wiri ngā akoranga</p>
        </footer>
      </div>
    </div>
  );
}
