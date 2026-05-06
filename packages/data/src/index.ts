// Client factories
export { createSupabaseClient, createSupabaseAdminClient } from "./supabase";
export type { TypedSupabaseClient } from "./supabase";

// Learners
export {
  getLearner,
  getLearnerByUserId,
  getLearnersByClass,
  upsertLearner,
  updateLearnerLevel,
} from "./learners";

// Sentence patterns & phrases
export {
  getPatternsByLevel,
  getPatternsByWeek,
  getPhrasesForPattern,
  getPhraseById,
} from "./patterns";

// Learner progress (spaced repetition)
export {
  getLearnerProgress,
  getDueForReview,
  upsertProgress,
} from "./progress";

// Speaking attempts
export {
  saveAttempt,
  getAttemptHistory,
  getRecentAttempts,
  getAverageConfidence,
} from "./attempts";

// Classes
export {
  getClassByCode,
  getClassById,
  createClass,
  updateClassName,
} from "./classes";

// Stats — streak + due count
export { getStreak, getDueCount, getLearnerStats } from "./stats";
export type { LearnerStats } from "./stats";

// Challenges & completions
export {
  getChallengesForClass,
  createChallenge,
  getCompletionsForChallenge,
  completeChallenge,
  getLearnerCompletions,
} from "./challenges";

// Types
export type {
  Level,
  Learner,
  LearnerInsert,
  Class,
  ClassInsert,
  SentencePattern,
  SentencePatternInsert,
  Phrase,
  PhraseInsert,
  LearnerProgress,
  LearnerProgressInsert,
  SpeakingAttempt,
  SpeakingAttemptInsert,
  Challenge,
  ChallengeInsert,
  ChallengeCompletion,
  ChallengeCompletionInsert,
  Database,
} from "./types";
