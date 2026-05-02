import { createSupabaseClient } from "./supabase";
import type { UserProfile } from "./types";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function upsertUserProfile(
  profile: Partial<UserProfile> & { id: string }
): Promise<UserProfile | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();
  return data;
}
