import { createSupabaseClient } from "./supabase";
import type { SentencePattern, Phrase, Level } from "./types";

export async function getPatternsByLevel(level: Level): Promise<SentencePattern[]> {
  const { data, error } = await createSupabaseClient()
    .from("sentence_patterns")
    .select("*")
    .eq("level", level)
    .order("week_number")
    .order("pattern_number");
  if (error) throw error;
  return data ?? [];
}

export async function getPatternsByWeek(
  level: Level,
  weekNumber: number
): Promise<SentencePattern[]> {
  const { data, error } = await createSupabaseClient()
    .from("sentence_patterns")
    .select("*")
    .eq("level", level)
    .eq("week_number", weekNumber)
    .order("pattern_number");
  if (error) throw error;
  return data ?? [];
}

export async function getPhrasesForPattern(patternId: string): Promise<Phrase[]> {
  const { data, error } = await createSupabaseClient()
    .from("phrases")
    .select("*")
    .eq("pattern_id", patternId)
    .order("difficulty");
  if (error) throw error;
  return data ?? [];
}

export async function getPhraseById(id: string): Promise<Phrase | null> {
  const { data, error } = await createSupabaseClient()
    .from("phrases")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
