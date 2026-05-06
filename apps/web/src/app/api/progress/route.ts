import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Auth guard
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      phraseId:        string;
      confidenceScore: number;
    };

    if (!body.phraseId || typeof body.confidenceScore !== "number") {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve learner id
    const { data: learner, error: learnerErr } = await supabase
      .from("learners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (learnerErr || !learner) {
      return Response.json({ error: "Learner not found" }, { status: 404 });
    }

    // SM-2-inspired next review date (1→3→7→14→30 days)
    const confidence = Math.max(0, Math.min(1, body.confidenceScore));
    const days       = confidence < 0.4  ? 1
                     : confidence < 0.6  ? 3
                     : confidence < 0.75 ? 7
                     : confidence < 0.9  ? 14
                     : 30;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);

    const { data, error } = await supabase
      .from("learner_progress")
      .upsert(
        {
          learner_id:       learner.id,
          phrase_id:        body.phraseId,
          confidence_score: confidence,
          next_review:      nextReview.toISOString(),
          last_reviewed:    new Date().toISOString(),
          updated_at:       new Date().toISOString(),
        },
        { onConflict: "learner_id,phrase_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Progress save failed";
    console.error("[/api/progress]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
