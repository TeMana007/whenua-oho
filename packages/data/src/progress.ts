import { createSupabaseClient } from "./supabase";
import type { LearnerProgress, LearnerProgressInsert } from "./types";

/** Get all progress rows for a learner, sorted by next review date. */
export async function getLearnerProgress(learnerId: string): Promise<LearnerProgress[]> {
  const { data, error } = await createSupabaseClient()
    .from("learner_progress")
    .select("*")
    .eq("learner_id", learnerId)
    .order("next_review", { nullsFirst: true });
  if (error) throw error;
  return data ?? [];
}

/** Get phrases due for review right now. */
export async function getDueForReview(
  learnerId: string,
  limit = 10
): Promise<LearnerProgress[]> {
  const { data, error } = await createSupabaseClient()
    .from("learner_progress")
    .select("*")
    .eq("learner_id", learnerId)
    .lte("next_review", new Date().toISOString())
    .order("next_review")
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Upsert progress after a speaking attempt.
 * Uses confidence_score to schedule the next spaced-repetition review.
 */
export async function upsertProgress(
  progress: LearnerProgressInsert
): Promise<LearnerProgress> {
  const nextReview = calculateNextReview(progress.confidence_score);

  const { data, error } = await createSupabaseClient()
    .from("learner_progress")
    .upsert(
      {
        ...progress,
        next_review: nextReview.toISOString(),
        last_reviewed: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "learner_id,phrase_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Simple SM-2-inspired interval calculation.
 * confidence 0.0–0.4 → review again in 1 day
 * confidence 0.4–0.7 → review in 3 days
 * confidence 0.7–1.0 → review in 7 days
 */
function calculateNextReview(confidence: number): Date {
  const now = new Date();
  const days = confidence < 0.4 ? 1 : confidence < 0.7 ? 3 : 7;
  now.setDate(now.getDate() + days);
  return now;
}
