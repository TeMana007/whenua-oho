import { createSupabaseClient } from "./supabase";
import type { Learner, LearnerInsert } from "./types";

export async function getLearner(id: string): Promise<Learner | null> {
  const { data, error } = await createSupabaseClient()
    .from("learners")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getLearnerByUserId(userId: string): Promise<Learner | null> {
  const { data, error } = await createSupabaseClient()
    .from("learners")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getLearnersByClass(classId: string): Promise<Learner[]> {
  const { data, error } = await createSupabaseClient()
    .from("learners")
    .select("*")
    .eq("class_id", classId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function upsertLearner(
  learner: LearnerInsert & { id?: string }
): Promise<Learner> {
  const { data, error } = await createSupabaseClient()
    .from("learners")
    .upsert(learner)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLearnerLevel(
  id: string,
  level: Learner["level"]
): Promise<void> {
  const { error } = await createSupabaseClient()
    .from("learners")
    .update({ level })
    .eq("id", id);
  if (error) throw error;
}
