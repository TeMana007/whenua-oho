import { createClient } from "@/lib/supabase/server";
import { getLearner } from "@korero/data";

export const metadata = { title: "Dashboard — Kōrero Companion" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const learner = user ? await getLearner(user.id).catch(() => null) : null;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Tēnā koe{learner?.name ? `, ${learner.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 font-body text-sm text-ink/60">
          Welcome to your te reo Māori dashboard.
        </p>
        {learner?.class_code && (
          <span className="mt-3 inline-block text-xs font-body font-medium bg-accent/20 text-accent rounded-full px-3 py-1">
            Class: {learner.class_code}
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard href="/practice"   emoji="🎙️" title="Practice speaking"
          description="Record yourself and get instant AI feedback" />
        <ActionCard href="/progress"   emoji="📈" title="My progress"
          description="Review your confidence scores and streak" />
        <ActionCard href="/challenges" emoji="🏆" title="Challenges"
          description="Complete your kaiako's weekly challenges" />
      </div>

      {/* Level */}
      {learner && (
        <div className="card flex items-center gap-4">
          <div className="text-3xl">
            {learner.level === "beginner" ? "🌱" : learner.level === "intermediate" ? "🌿" : "🌳"}
          </div>
          <div>
            <p className="font-body text-xs text-ink/40 uppercase tracking-wide font-medium">
              Current level
            </p>
            <p className="font-heading text-lg font-semibold text-primary capitalize">
              {learner.level}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ href, emoji, title, description }: {
  href: string; emoji: string; title: string; description: string;
}) {
  return (
    <a href={href} className="card hover:shadow-md hover:border-primary/20 border border-transparent transition-all group">
      <div className="text-3xl mb-3">{emoji}</div>
      <h2 className="font-heading text-base font-semibold text-ink group-hover:text-primary transition">
        {title}
      </h2>
      <p className="mt-1 font-body text-sm text-ink/60">{description}</p>
    </a>
  );
}
