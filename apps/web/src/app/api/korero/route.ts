import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_TEMPLATE = `You are a gentle, patient, culturally safe te reo Māori conversation partner named Aroha. You only use sentence patterns that the learner has already studied at their level. Never introduce new structures beyond their level. Respond only in te reo Māori. Keep responses to 1-2 sentences. If the learner makes an error, respond naturally using the correct form without explicitly correcting them. If they seem stuck, offer a gentle English hint wrapped in [Hint: ...]. Never shame, rush, or confuse the learner. The current scenario is: {scenario}. Begin the conversation.`;

export async function POST(request: Request) {
  // Auth guard
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      scenario: string;
      messages: { role: "user" | "assistant"; content: string }[];
      level:    string;
    };

    if (!body.scenario) {
      return Response.json({ error: "Missing scenario" }, { status: 400 });
    }

    const system = SYSTEM_TEMPLATE.replace("{scenario}", body.scenario);

    // If no prior messages, send an empty user turn so Claude knows to open first
    const apiMessages =
      body.messages.length === 0
        ? [{ role: "user" as const, content: "Tīmata" }]
        : body.messages;

    // Lazy-init client so missing key doesn't crash at module load
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 256,
      system,
      messages:   apiMessages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    return Response.json({ message: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Kōrero failed";
    console.error("[/api/korero]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
