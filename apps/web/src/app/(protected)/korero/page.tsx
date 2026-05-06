import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KoreroPartner    from "./KoreroPartner";

export const metadata = { title: "Kōrero Partner — Kōrero Companion" };

export default async function KoreroPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: learner } = await supabase
    .from("learners")
    .select("level")
    .eq("user_id", user.id)
    .single();

  return (
    <KoreroPartner level={learner?.level ?? "beginner"} />
  );
}
