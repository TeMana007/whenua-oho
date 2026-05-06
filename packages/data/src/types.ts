// ============================================================
// Kōrero Companion — Database types (mirrors actual Supabase schema)
// ============================================================

export type Level = "beginner" | "intermediate" | "advanced";

// ---- Row types (match actual column names) ----

export interface Learner {
  id: string;
  user_id: string;
  name: string;
  level: Level;
  class_id: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  class_code: string;
  teacher_name: string | null;
  created_at: string;
}

export interface SentencePattern {
  id: string;
  pattern: string;
  english: string;
  level: string;
  order_num: number;
  created_at: string;
}

export interface Phrase {
  id: string;
  maori: string;
  english: string;
  pronunciation: string | null;
  pattern_number: number | null;
  created_at: string | null;
}

export interface LearnerProgress {
  id: string;
  learner_id: string;
  phrase_id: string;
  confidence_score: number;
  last_reviewed: string | null;
  next_review: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface SpeakingAttempt {
  id: string;
  learner_id: string;
  phrase_id: string;
  confidence_score: number;
  whisper_transcript: string | null;
  ai_feedback: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  class_id: string;
  phrase: string;
  description: string | null;
  due_date: string | null;
  created_at: string | null;
}

export interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  learner_id: string;
  audio_url: string | null;
  completed_at: string;
}

// ---- Supplemental types (used by non-exported utility modules) ----

/** Stub for users.ts — mirrors a `profiles` table if added later. */
export interface UserProfile {
  id:         string;
  name:       string | null;
  avatar_url: string | null;
  created_at: string;
}

/** Stub for sessions.ts — mirrors a `sessions` table if added later. */
export interface LearningSession {
  id:               string;
  user_id:          string;
  learner_id:       string;
  phrase_count:     number;
  duration_seconds: number | null;
  created_at:       string;
}

// ---- Insert types (omit server-generated fields) ----

export type LearnerInsert        = Omit<Learner, "id" | "created_at">;
export type ClassInsert          = Omit<Class, "id" | "created_at">;
export type SentencePatternInsert = Omit<SentencePattern, "id" | "created_at">;
export type PhraseInsert         = Omit<Phrase, "id" | "created_at">;
export type LearnerProgressInsert = Omit<LearnerProgress, "id" | "created_at">;
export type SpeakingAttemptInsert = Omit<SpeakingAttempt, "id" | "created_at">;
export type ChallengeInsert      = Omit<Challenge, "id" | "created_at">;
export type ChallengeCompletionInsert = Omit<ChallengeCompletion, "id" | "completed_at">;

// ---- Supabase Database type (used for typed client generic) ----
// Each table MUST include Relationships: [] to satisfy GenericTable constraint.

export type Database = {
  public: {
    Tables: {
      learners: {
        Row:           Learner;
        Insert:        LearnerInsert;
        Update:        Partial<LearnerInsert>;
        Relationships: [];
      };
      classes: {
        Row:           Class;
        Insert:        ClassInsert;
        Update:        Partial<ClassInsert>;
        Relationships: [];
      };
      sentence_patterns: {
        Row:           SentencePattern;
        Insert:        SentencePatternInsert;
        Update:        Partial<SentencePatternInsert>;
        Relationships: [];
      };
      phrases: {
        Row:           Phrase;
        Insert:        PhraseInsert;
        Update:        Partial<PhraseInsert>;
        Relationships: [];
      };
      learner_progress: {
        Row:           LearnerProgress;
        Insert:        LearnerProgressInsert;
        Update:        Partial<LearnerProgressInsert>;
        Relationships: [];
      };
      speaking_attempts: {
        Row:           SpeakingAttempt;
        Insert:        SpeakingAttemptInsert;
        Update:        Partial<SpeakingAttemptInsert>;
        Relationships: [];
      };
      challenges: {
        Row:           Challenge;
        Insert:        ChallengeInsert;
        Update:        Partial<ChallengeInsert>;
        Relationships: [];
      };
      challenge_completions: {
        Row:           ChallengeCompletion;
        Insert:        ChallengeCompletionInsert;
        Update:        Partial<ChallengeCompletionInsert>;
        Relationships: [];
      };
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
