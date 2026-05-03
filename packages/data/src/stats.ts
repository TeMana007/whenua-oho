import { createSupabaseClient } from "./supabase";

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Calculate how many consecutive days the learner has reviewed at least one phrase.
 * A streak is still "live" if the learner reviewed yesterday but not yet today.
 */
export async function getStreak(learnerId: string): Promise<number> {
  const since = new Date(Date.now() - 32 * 86_400_000).toISOString();

  const { data } = await createSupabaseClient()
    .from("learner_progress")
    .select("last_reviewed")
    .eq("learner_id", learnerId)
    .not("last_reviewed", "is", null)
    .gte("last_reviewed", since);

  if (!data?.length) return 0;

  const dates = new Set(
    data.map((r) => r.last_reviewed!.substring(0, 10))
  );
  return streakFromDates(dates);
}

function streakFromDates(dates: Set<string>): number {
  const toStr = (d: Date) => d.toISOString().substring(0, 10);
  const today     = toStr(new Date());
  const yesterday = toStr(new Date(Date.now() - 86_400_000));

  // No recent activity → streak is dead
  if (!dates.has(today) && !dates.has(yesterday)) return 0;

  const anchor = dates.has(today) ? new Date() : new Date(Date.now() - 86_400_000);
  let streak = 0;

  for (let i = 0; i <= 31; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    if (dates.has(toStr(d))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Due count ────────────────────────────────────────────────────────────────

/** Number of phrases where spaced-repetition says it's time to review. */
export async function getDueCount(learnerId: string): Promise<number> {
  const { count } = await createSupabaseClient()
    .from("learner_progress")
    .select("*", { count: "exact", head: true })
    .eq("learner_id", learnerId)
    .lte("next_review", new Date().toISOString());

  return count ?? 0;
}

// ─── Combined summary (one round-trip for mobile) ────────────────────────────

export interface LearnerStats {
  streak:   number;
  dueCount: number;
}

export async function getLearnerStats(learnerId: string): Promise<LearnerStats> {
  const since = new Date(Date.now() - 32 * 86_400_000).toISOString();
  const now   = new Date().toISOString();

  const { data } = await createSupabaseClient()
    .from("learner_progress")
    .select("last_reviewed, next_review")
    .eq("learner_id", learnerId);

  if (!data?.length) return { streak: 0, dueCount: 0 };

  const dates = new Set(
    data
      .filter((r) => r.last_reviewed && r.last_reviewed >= since)
      .map((r) => r.last_reviewed!.substring(0, 10))
  );

  const dueCount = data.filter(
    (r) => r.next_review && r.next_review <= now
  ).length;

  return { streak: streakFromDates(dates), dueCount };
}
