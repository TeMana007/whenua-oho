import { createClient } from "@/lib/supabase/server";
import { getPhraseFeedback } from "@korero/ai";

export async function POST(request: Request) {
  // Auth guard
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      transcript:    string;
      targetPhrase:  string;
      targetEnglish: string;
      level:         string;
    };

    if (!body.transcript || !body.targetPhrase) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await getPhraseFeedback(body);
    return Response.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Feedback failed";
    console.error("[/api/feedback]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
