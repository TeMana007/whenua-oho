import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Auth guard
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData  = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const prompt    = (formData.get("prompt") as string | null) ?? "";

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Lazy-init client so missing key doesn't crash at module load
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file:            audioFile,
      model:           "whisper-1",
      response_format: "json",
      // Prompt helps Whisper recognise Māori words with macrons
      prompt: prompt || "Ko wai tōu ingoa? Kia ora! Nau mai haere mai. Āe, kāo, tēnā koe.",
    });

    return Response.json({ transcript: transcription.text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Transcription failed";
    console.error("[/api/transcribe]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
