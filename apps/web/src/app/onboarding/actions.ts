"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function lookupClassCode(code: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("classes")
    .select("id, name, class_code")
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

  // Look up class_id from class_code if provided
  let classId: string | null = null;
  if (payload.classCode) {
    const { data: cls } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", payload.classCode.toUpperCase())
      .single();
    classId = cls?.id ?? null;
  }

  // Upsert learner row (may already exist from auth trigger)
  const { error } = await supabase
    .from("learners")
    .upsert(
      {
        user_id:  user.id,
        name:     payload.name.trim(),
        level:    payload.level,
        class_id: classId,
      },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);

  redirect("/dashboard");
}
