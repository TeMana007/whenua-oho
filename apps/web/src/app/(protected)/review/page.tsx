import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewSession    from "./ReviewSession";
import type { ReviewCard } from "./ReviewSession";
import { LESSONS } from "@korero/curriculum";

export const metadata = { title: "Review — Kōrero Companion" };

export default async function ReviewPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: learner } = await supabase
    .from("learners")
    .select("id, level")
    .eq("user_id", user.id)
    .single();

  if (!learner) redirect("/dashboard");

  /* ── Fetch due phrases (max 10) ── */
  const { data: due } = await supabase
    .from("learner_progress")
    .select(`
      confidence_score,
      phrase_id,
      phrases (
        id,
        maori,
        english,
        pronunciation
      )
    `)
    .eq("learner_id", learner.id)
    .lte("next_review", new Date().toISOString())
    .order("next_review")
    .limit(10);

  /* ── Build card list ── */
  const dbCards: ReviewCard[] = (due ?? [])
    .filter((d) => d.phrases)
    .map((d) => {
      // Supabase joined query returns the foreign row (or array for 1:many)
      // Here it's always a single phrases row since phrase_id is FK
      const ph = (Array.isArray(d.phrases) ? d.phrases[0] : d.phrases) as
        | { id: string; maori: string; english: string; pronunciation: string | null }
        | null;
      return {
        phraseId:      ph?.id ?? "",
        maori:         ph?.maori ?? "",
        english:       ph?.english ?? "",
        pronunciation: ph?.pronunciation ?? "",
        currentScore:  d.confidence_score,
      };
    });

  /* ── Fallback to curriculum phrases ── */
  const cards: ReviewCard[] =
    dbCards.length > 0
      ? dbCards
      : LESSONS.flatMap((l) =>
          l.phrases.map((p) => ({
            phraseId:      `curriculum-${p.maori}`,
            maori:         p.maori,
            english:       p.english,
            pronunciation: p.pronunciation ?? "",
            currentScore:  0,
          }))
        ).slice(0, 10);

  /* ── Nothing due ── */
  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 flex flex-col items-center gap-6 text-center">
        <span className="text-6xl">🎉</span>
        <h2 className="font-heading text-3xl text-primary">Ka pai!</h2>
        <p className="font-body text-ink/60">
          No phrases are due for review right now. Come back later or practise something new.
        </p>
        <a href="/practice" className="btn-primary">Go to Practice →</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-primary">Review</h1>
          <p className="font-body text-ink/60 text-sm mt-1">
            {cards.length} phrase{cards.length !== 1 ? "s" : ""} due today
          </p>
        </div>
        <ReviewSession cards={cards} level={learner.level} />
      </div>
    </div>
  );
}
