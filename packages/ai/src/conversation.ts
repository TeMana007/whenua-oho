import { createAnthropicClient, SYSTEM_PROMPT } from "./anthropic";
import type { ConversationMessage } from "./types";

export async function streamConversation(
  messages: ConversationMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const client = createAnthropicClient();

  let fullResponse = "";

  const stream = await client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      fullResponse += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullResponse;
}
