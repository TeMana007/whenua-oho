import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMaoriDate } from "@/lib/maori-date";
import {
  getLearnerByUserId,
  getClassById,
  getChallengesForClass,
  getPatternsByLevel,
  getStreak,
  getDueCount,
} from "@korero/data";
import type { SentencePattern, Challenge, Class } from "@korero/data";

export const metadata = { title: "Kāinga — Kōrero Companion" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 1. Learner profile (by auth user_id)
  const learner = await getLearnerByUserId(user.id).catch(() => null);
  if (!learner) redirect("/onboarding");

  // 2. Parallel: streak, due count, class info
  const [streak, dueCount, classInfo] = await Promise.all([
    getStreak(learner.id),
    getDueCount(learner.id),
    learner.class_id ? getClassById(learner.class_id).catch(() => null) : null,
  ]);

  // 3. Patterns + challenges (depend on class info)
  const [patterns, challenges] = await Promise.all([
    getPatternsByLevel(learner.level).catch(() => []),
    classInfo ? getChallengesForClass(classInfo.id).catch(() => []) : [],
  ]);

  const todayPattern    = patterns[0] ?? null;
  const latestChallenge = challenges[0] ?? null;
  const firstName       = learner.name?.split(" ")[0] ?? "e hoa";

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {/* ── Greeting ──────────────────────────────────────────────────── */}
      <Greeting name={firstName} streak={streak} />

      {/* ── Today's Practice ──────────────────────────────────────────── */}
      <PracticeCard pattern={todayPattern} level={learner.level} />

      {/* ── Review + Class row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ReviewCard dueCount={dueCount} />
        <ClassCard classInfo={classInfo} challenge={latestChallenge} />
      </div>
    </div>
  );
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

function Greeting({ name, streak }: { name: string; streak: number }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary leading-tight">
          Kia ora, {name}!
        </h1>
        <p className="font-body text-sm text-ink/50 mt-0.5">
          {formatMaoriDate()}
        </p>
      </div>

      {/* Streak badge */}
      <div className="flex-shrink-0 flex items-center gap-1.5 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-2">
        <span className="text-xl leading-none">🔥</span>
        <div className="text-right">
          <p className="font-heading text-xl font-bold text-warning leading-none">
            {streak}
          </p>
          <p className="font-body text-[10px] text-warning/70 uppercase tracking-wide leading-none mt-0.5">
            {streak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Today's Practice Card ────────────────────────────────────────────────────

function PracticeCard({
  pattern,
  level,
}: {
  pattern: SentencePattern | null;
  level: string;
}) {
  const durationMap: Record<string, number> = { beginner: 8, intermediate: 12, advanced: 15 };
  const duration = durationMap[level] ?? 8;

  return (
    <div className="rounded-3xl bg-primary overflow-hidden relative">
      {/* Decorative koru watermark */}
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border-[20px] border-white/5 pointer-events-none" />
      <div className="absolute -right-4 top-8 w-32 h-32 rounded-full border-[12px] border-white/5 pointer-events-none" />

      <div className="relative p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-secondary/50 uppercase tracking-widest">
            Today's Practice
          </span>
          <span className="font-body text-xs text-secondary/50">⏱ ~{duration} min</span>
        </div>

        {/* Pattern */}
        {pattern ? (
          <div className="space-y-1">
            <p className="font-heading text-2xl font-bold text-secondary leading-snug" lang="mi">
              {pattern.pattern}
            </p>
            <p className="font-body text-sm text-secondary/60 italic">
              {pattern.english}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-heading text-2xl font-bold text-secondary">
              Ngā Mihi — Greetings
            </p>
            <p className="font-body text-sm text-secondary/60">
              Learn to greet and introduce yourself in te reo Māori
            </p>
          </div>
        )}

        {/* Start button */}
        <Link
          href="/practice"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-success h-14 min-h-[56px]
                     font-body font-bold text-base text-secondary
                     hover:bg-success/90 active:scale-[0.98] transition-all mt-2"
        >
          <span className="text-lg">▶</span>
          Tīmata — Start
        </Link>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ dueCount }: { dueCount: number }) {
  return (
    <div className="card flex flex-col justify-between gap-4 min-h-[160px]">
      <div>
        <p className="font-body text-xs text-ink/40 uppercase tracking-widest mb-2">
          Review
        </p>
        {dueCount > 0 ? (
          <>
            <p className="font-heading text-4xl font-bold text-primary">{dueCount}</p>
            <p className="font-body text-sm text-ink/60 mt-1">
              {dueCount === 1 ? "phrase" : "phrases"} due for review
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-2xl font-bold text-success">Ka pai! ✓</p>
            <p className="font-body text-sm text-ink/60 mt-1">All caught up</p>
          </>
        )}
      </div>

      <Link
        href="/review"
        className={`flex items-center justify-center h-12 rounded-xl font-body font-bold text-sm transition-all
          ${dueCount > 0
            ? "bg-primary text-secondary hover:bg-primary/90"
            : "bg-gray-100 text-ink/40 cursor-default pointer-events-none"
          }`}
      >
        {dueCount > 0 ? "Review Now →" : "Nothing due"}
      </Link>
    </div>
  );
}

// ─── Class Card ───────────────────────────────────────────────────────────────

function ClassCard({
  classInfo,
  challenge,
}: {
  classInfo: Class | null;
  challenge: Challenge | null;
}) {
  if (!classInfo) {
    return (
      <div className="card flex flex-col justify-between gap-4 min-h-[160px] border-dashed border-2 border-ink/10 bg-transparent">
        <div>
          <p className="font-body text-xs text-ink/40 uppercase tracking-widest mb-2">
            Class Group
          </p>
          <p className="font-heading text-xl font-bold text-ink/40">
            No class yet
          </p>
          <p className="font-body text-sm text-ink/40 mt-1">
            Join a class to see challenges and messages from your kaiako.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="flex items-center justify-center h-12 rounded-xl bg-secondary border border-ink/10 font-body font-bold text-sm text-ink/60 hover:border-primary/30 transition"
        >
          Join a class →
        </Link>
      </div>
    );
  }

  return (
    <div className="card flex flex-col justify-between gap-4 min-h-[160px]">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-body text-xs text-ink/40 uppercase tracking-widest">
            Class Group
          </p>
          <span className="font-body text-xs font-medium bg-accent/15 text-accent rounded-full px-2 py-0.5">
            {classInfo.class_code}
          </span>
        </div>

        {challenge ? (
          <>
            <p className="font-body text-xs text-primary/70 font-medium uppercase tracking-wide mb-1">
              🏆 Challenge
            </p>
            <p className="font-heading text-lg font-bold text-ink leading-snug line-clamp-2" lang="mi">
              {challenge.phrase}
            </p>
            {challenge.due_date && (
              <p className="font-body text-xs text-ink/40 mt-1">
                Due {new Date(challenge.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-heading text-xl font-bold text-ink">
              {classInfo.name}
            </p>
            {classInfo.teacher_name && (
              <p className="font-body text-sm text-ink/60 mt-1">
                {classInfo.teacher_name}
              </p>
            )}
          </>
        )}
      </div>

      <Link
        href="/games"
        className="flex items-center justify-center h-12 rounded-xl bg-primary/8 border border-primary/15 font-body font-bold text-sm text-primary hover:bg-primary/12 transition"
      >
        View Group →
      </Link>
    </div>
  );
}
