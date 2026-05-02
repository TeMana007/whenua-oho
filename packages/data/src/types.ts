export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  level: "beginner" | "intermediate" | "advanced";
  streak_days: number;
  total_sessions: number;
  created_at: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  duration_seconds: number;
  topic: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: UserProfile };
      sessions: { Row: LearningSession };
    };
  };
};
