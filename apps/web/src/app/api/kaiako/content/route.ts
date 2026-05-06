import { cookies }      from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // ── Auth guard: only authenticated kaiako may add phrases ────────────────
  const cookieStore = await cookies();
  const kaiakoClassId = cookieStore.get("kaiako_class_id")?.value;
  if (!kaiakoClassId) {
    return Response.json({ error: "Unauthorised — kaiako login required" }, { status: 401 });
  }

  const supabase = createClient();
  const body = (await request.json()) as {
    classId?:      string;
    maori:         string;
    english:       string;
    pronunciation: string;
    patternNumber: number;
  };

  if (!body.maori || !body.english) {
    return Response.json({ error: "Maori and English are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("phrases")
    .insert({
      maori:          body.maori,
      english:        body.english,
      pronunciation:  body.pronunciation ?? "",
      pattern_number: body.patternNumber ?? 1,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    id:             data.id,
    maori:          data.maori,
    english:        data.english,
    pattern_number: body.patternNumber,
    created_at:     data.created_at ?? new Date().toISOString(),
  });
}
