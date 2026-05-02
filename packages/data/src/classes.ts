import { createSupabaseClient } from "./supabase";
import type { Class, ClassInsert } from "./types";

export async function getClassByCode(classCode: string): Promise<Class | null> {
  const { data, error } = await createSupabaseClient()
    .from("classes")
    .select("*")
    .eq("class_code", classCode)
    .single();
  if (error) throw error;
  return data;
}

export async function createClass(cls: ClassInsert): Promise<Class> {
  const { data, error } = await createSupabaseClient()
    .from("classes")
    .insert(cls)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClassWeek(
  classCode: string,
  weekNumber: number,
  currentTheme?: string
): Promise<void> {
  const { error } = await createSupabaseClient()
    .from("classes")
    .update({ week_number: weekNumber, current_theme: currentTheme ?? null })
    .eq("class_code", classCode);
  if (error) throw error;
}
