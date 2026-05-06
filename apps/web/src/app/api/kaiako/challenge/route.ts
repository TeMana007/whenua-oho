import { cookies }      from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // ── Auth guard: only authenticated kaiako may create challenges ──────────
  const cookieStore = await cookies();
  const kaiakoClassId = cookieStore.get("kaiako_class_id")?.value;
  if (!kaiakoClassId) {
    return Response.json({ error: "Unauthorised — kaiako login required" }, { status: 401 });
  }

  const supabase = createClient();
  const body = (await request.json()) as {
    classId:     string;
    phrase:      string;
    description: string;
    dueDate:     string;
  };

  if (!body.classId || !body.phrase) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Guard: kaiako can only create challenges for their own class
  if (body.classId !== kaiakoClassId) {
    return Response.json({ error: "Forbidden — class mismatch" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("challenges")
    .insert({
      class_id:    body.classId,
      phrase:      body.phrase,
      description: body.description ?? "",
      due_date:    body.dueDate || null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ...data, submissions: 0 });
}
