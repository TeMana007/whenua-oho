// ============================================================
// Kōrero Companion — Database types (mirrors Supabase schema)
// ============================================================

export type Level = "beginner" | "intermediate" | "advanced";

// ---- Row types ----

export interface Learner {
  id: string;
  name: string;
  email: string;
  level: Level;
  class_code: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  class_code: string;
  kaiako_name: string;
  kaiako_email: string;
  week_number: number;
  current_theme: string | null;
  created_at: string;
}

export interface SentencePattern {
  id: string;
  pattern_number: number;
  level: Level;
  pattern_te_reo: string;
  pattern_english: string;
  example_te_reo: string;
  example_english: string;
  audio_url: string | null;
  week_number: number;
  created_at: string;
}

export interface Phrase {
  id: string;
  pattern_id: string;
  te_reo: string;
  english: string;
  scenario: string | null;
  audio_url: string | null;
  difficulty: number; // 1–5
  created_at: string;
}

export interface LearnerProgress {
  id: string;
  learner_id: string;
  phrase_id: string;
  confidence_score: number; // 0.00–1.00
  attempts: number;
  last_reviewed: string | null;
  next_review: string | null;
  pronunciation_notes: string | null;
  updated_at: string;
}

export interface SpeakingAttempt {
  id: string;
  learner_id: string;
  phrase_id: string;
  confidence_score: number; // 0.00–1.00
  whisper_transcript: string | null;
  ai_feedback: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  pattern_id: string | null;
  created_at: string;
}

export interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  learner_id: string;
  audio_url: string | null;
  completed_at: string;
}

// ---- Insert types (omit server-generated fields) ----

export type LearnerInsert = Omit<Learner, "id" | "created_at">;
export type ClassInsert = Omit<Class, "id" | "created_at">;
export type SentencePatternInsert = Omit<SentencePattern, "id" | "created_at">;
export type PhraseInsert = Omit<Phrase, "id" | "created_at">;
export type LearnerProgressInsert = Omit<LearnerProgress, "id" | "updated_at">;
export type SpeakingAttemptInsert = Omit<SpeakingAttempt, "id" | "created_at">;
export type ChallengeInsert = Omit<Challenge, "id" | "created_at">;
export type ChallengeCompletionInsert = Omit<ChallengeCompletion, "id" | "completed_at">;

// ---- Supabase Database type (used for typed client) ----

export type Database = {
  public: {
    Tables: {
      learners: {
        Row: Learner;
        Insert: LearnerInsert;
        Update: Partial<LearnerInsert>;
      };
      classes: {
        Row: Class;
        Insert: ClassInsert;
        Update: Partial<ClassInsert>;
      };
      sentence_patterns: {
        Row: SentencePattern;
        Insert: SentencePatternInsert;
        Update: Partial<SentencePatternInsert>;
      };
      phrases: {
        Row: Phrase;
        Insert: PhraseInsert;
        Update: Partial<PhraseInsert>;
      };
      learner_progress: {
        Row: LearnerProgress;
        Insert: LearnerProgressInsert;
        Update: Partial<LearnerProgressInsert>;
      };
      speaking_attempts: {
        Row: SpeakingAttempt;
        Insert: SpeakingAttemptInsert;
        Update: Partial<SpeakingAttemptInsert>;
      };
      challenges: {
        Row: Challenge;
        Insert: ChallengeInsert;
        Update: Partial<ChallengeInsert>;
      };
      challenge_completions: {
        Row: ChallengeCompletion;
        Insert: ChallengeCompletionInsert;
        Update: Partial<ChallengeCompletionInsert>;
      };
    };
  };
};
