import { createSupabaseClient } from "./supabase";
import type {
  Challenge,
  ChallengeInsert,
  ChallengeCompletion,
  ChallengeCompletionInsert,
} from "./types";

export async function getChallengesForClass(classId: string): Promise<Challenge[]> {
  const { data, error } = await createSupabaseClient()
    .from("challenges")
    .select("*")
    .eq("class_id", classId)
    .order("due_date", { nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createChallenge(challenge: ChallengeInsert): Promise<Challenge> {
  const { data, error } = await createSupabaseClient()
    .from("challenges")
    .insert(challenge)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCompletionsForChallenge(
  challengeId: string
): Promise<ChallengeCompletion[]> {
  const { data, error } = await createSupabaseClient()
    .from("challenge_completions")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function completeChallenge(
  completion: ChallengeCompletionInsert
): Promise<ChallengeCompletion> {
  const { data, error } = await createSupabaseClient()
    .from("challenge_completions")
    .upsert(completion, { onConflict: "challenge_id,learner_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLearnerCompletions(
  learnerId: string
): Promise<ChallengeCompletion[]> {
  const { data, error } = await createSupabaseClient()
    .from("challenge_completions")
    .select("*")
    .eq("learner_id", learnerId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
