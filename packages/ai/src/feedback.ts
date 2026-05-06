import Anthropic from "@anthropic-ai/sdk";

export interface FeedbackResult {
  feedback: string;
  score: number;      // 0.00–1.00
  corrections: string[];
}

/**
 * Ask Claude to evaluate a learner's spoken te reo Māori attempt.
 * Returns structured feedback + a confidence score.
 */
export async function getPhraseFeedback({
  transcript,
  targetPhrase,
  targetEnglish,
  level,
}: {
  transcript: string;
  targetPhrase: string;
  targetEnglish: string;
  level: string;
}): Promise<FeedbackResult> {
  const prompt = `You are Aroha, a warm te reo Māori pronunciation coach. Evaluate this learner attempt.

Target phrase (te reo): "${targetPhrase}"
English meaning: "${targetEnglish}"
What the learner said: "${transcript}"
Learner level: ${level}

Score their accuracy from 0.00 (completely wrong) to 1.00 (perfect).
Give brief, warm feedback under 70 words. Include at least one te reo phrase.
List up to 2 specific corrections (empty array if perfect).

Respond with ONLY valid JSON — no markdown, no extra text:
{"score":0.85,"feedback":"...","corrections":["..."]}`;

  // Lazy-init so missing key doesn't crash at module load time
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  try {
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
    const parsed = JSON.parse(jsonStr);
    return {
      feedback:    String(parsed.feedback ?? "Ka pai! Keep practising."),
      score:       Math.max(0, Math.min(1, Number(parsed.score) || 0.5)),
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
    };
  } catch {
    return { feedback: raw || "Ka pai! Keep practising.", score: 0.5, corrections: [] };
  }
}
