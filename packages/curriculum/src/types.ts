export type Level = "beginner" | "intermediate" | "advanced";

export interface VocabItem {
  maori: string;
  english: string;
  pronunciation?: string;
  example?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleMaori: string;
  level: Level;
  topic: string;
  vocabulary: VocabItem[];
  phrases: VocabItem[];
  culturalNote?: string;
  order: number;
}
