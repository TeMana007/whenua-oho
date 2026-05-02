import { createSupabaseClient } from "./supabase";
import type { LearningSession } from "./types";

export async function saveSession(
  session: Omit<LearningSession, "id" | "created_at">
): Promise<LearningSession | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();
  return data;
}

export async function getSessionHistory(
  userId: string,
  limit = 20
): Promise<LearningSession[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
