import OpenAI from "openai";
import type { TranscriptionResult } from "./types";

export async function transcribeAudio(
  audioFile: File | Blob,
  language = "mi" // Māori language code
): Promise<TranscriptionResult> {
  // Lazy-init so missing key doesn't crash at module load time
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const transcription = await openai.audio.transcriptions.create({
    file:            audioFile as File,
    model:           "whisper-1",
    language,
    response_format: "json",
  });

  return {
    text: transcription.text,
    language,
  };
}
