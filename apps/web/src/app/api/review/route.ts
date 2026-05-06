import { createClient } from "@/lib/supabase/server";

type Rating = "again" | "hard" | "got_it" | "easy";

const RATING_DAYS: Record<Rating, number> = {
  again:  1,
  hard:   3,
  got_it: 7,
  easy:   30,
};

const RATING_SCORE: Record<Rating, number> = {
  again:  0.15,
  hard:   0.45,
  got_it: 0.75,
  easy:   0.95,
};

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { phraseId, rating } = (await request.json()) as {
      phraseId: string;
      rating:   Rating;
    };

    if (!phraseId || !rating) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: learner } = await supabase
      .from("learners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!learner) return Response.json({ error: "Learner not found" }, { status: 404 });

    const days    = RATING_DAYS[rating] ?? 1;
    const score   = RATING_SCORE[rating] ?? 0.5;
    const nextRev = new Date();
    nextRev.setDate(nextRev.getDate() + days);

    await supabase.from("learner_progress").upsert(
      {
        learner_id:       learner.id,
        phrase_id:        phraseId,
        confidence_score: score,
        next_review:      nextRev.toISOString(),
        last_reviewed:    new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      },
      { onConflict: "learner_id,phrase_id" }
    );

    return Response.json({ ok: true, days, nextReview: nextRev.toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review update failed";
    console.error("[/api/review]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
