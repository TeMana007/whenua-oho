"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function lookupClassCode(code: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("classes")
    .select("class_code, kaiako_name, week_number, current_theme")
    .eq("class_code", code.trim().toUpperCase())
    .single();
  return data ?? null;
}

export async function completeOnboarding(payload: {
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  classCode: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("learners")
    .update({
      name: payload.name.trim(),
      level: payload.level,
      class_code: payload.classCode ?? null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  redirect("/dashboard");
}
