import { createSupabaseClient } from "./supabase";
import type { SpeakingAttempt, SpeakingAttemptInsert } from "./types";

export async function saveAttempt(
  attempt: SpeakingAttemptInsert
): Promise<SpeakingAttempt> {
  const { data, error } = await createSupabaseClient()
    .from("speaking_attempts")
    .insert(attempt)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAttemptHistory(
  learnerId: string,
  phraseId?: string,
  limit = 20
): Promise<SpeakingAttempt[]> {
  let query = createSupabaseClient()
    .from("speaking_attempts")
    .select("*")
    .eq("learner_id", learnerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (phraseId) {
    query = query.eq("phrase_id", phraseId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getRecentAttempts(
  learnerId: string,
  since: Date
): Promise<SpeakingAttempt[]> {
  const { data, error } = await createSupabaseClient()
    .from("speaking_attempts")
    .select("*")
    .eq("learner_id", learnerId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAverageConfidence(
  learnerId: string,
  phraseId: string
): Promise<number> {
  const { data, error } = await createSupabaseClient()
    .from("speaking_attempts")
    .select("confidence_score")
    .eq("learner_id", learnerId)
    .eq("phrase_id", phraseId);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + Number(row.confidence_score), 0);
  return sum / data.length;
}
