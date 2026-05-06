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

export async function getClassById(id: string): Promise<Class | null> {
  const { data, error } = await createSupabaseClient()
    .from("classes")
    .select("*")
    .eq("id", id)
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

export async function updateClassName(
  classCode: string,
  name: string
): Promise<void> {
  const { error } = await createSupabaseClient()
    .from("classes")
    .update({ name })
    .eq("class_code", classCode);
  if (error) throw error;
}
