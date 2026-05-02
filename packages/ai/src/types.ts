export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
}
