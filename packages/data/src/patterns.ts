import { createSupabaseClient } from "./supabase";
import type { SentencePattern, Phrase } from "./types";

export async function getPatternsByLevel(level: string): Promise<SentencePattern[]> {
  const { data, error } = await createSupabaseClient()
    .from("sentence_patterns")
    .select("*")
    .eq("level", level)
    .order("order_num");
  if (error) throw error;
  return data ?? [];
}

export async function getPatternsByWeek(
  level: string,
  orderNum: number
): Promise<SentencePattern[]> {
  const { data, error } = await createSupabaseClient()
    .from("sentence_patterns")
    .select("*")
    .eq("level", level)
    .lte("order_num", orderNum)
    .order("order_num");
  if (error) throw error;
  return data ?? [];
}

export async function getPhrasesForPattern(patternNumber: number): Promise<Phrase[]> {
  const { data, error } = await createSupabaseClient()
    .from("phrases")
    .select("*")
    .eq("pattern_number", patternNumber);
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
