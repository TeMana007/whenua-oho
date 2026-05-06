"use server";

import { cookies }      from "next/headers";
import { redirect }     from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function kaiakologin(formData: FormData): Promise<void> {
  const email     = formData.get("email")     as string;
  const classCode = formData.get("classCode") as string;

  if (!classCode) {
    redirect("/kaiako?error=" + encodeURIComponent("Class code is required."));
  }

  const supabase = createClient();

  // Sign in via Supabase auth (optional — email/password may be blank)
  if (email) {
    await supabase.auth.signInWithPassword({
      email,
      password: formData.get("password") as string,
    });
  }

  // Verify the class code exists
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, class_code")
    .eq("class_code", classCode.toUpperCase())
    .single();

  if (!cls) {
    redirect("/kaiako?error=" + encodeURIComponent("Class code not found. Check with your administrator."));
  }

  const { id, name, class_code } = cls as { id: string; name: string; class_code: string };

  // Store class access in cookie
  const cookieStore = await cookies();
  cookieStore.set("kaiako_class_id",   id,         { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  cookieStore.set("kaiako_class_name",  name,       { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  cookieStore.set("kaiako_class_code",  class_code, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });

  redirect("/kaiako/dashboard");
}

export async function kaiakologout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("kaiako_class_id");
  cookieStore.delete("kaiako_class_name");
  cookieStore.delete("kaiako_class_code");
  redirect("/kaiako");
}
