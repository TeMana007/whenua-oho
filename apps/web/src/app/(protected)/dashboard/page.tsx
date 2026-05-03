import { createClient } from "@/lib/supabase/server";
import { getLearner } from "@korero/data";

export const metadata = { title: "Dashboard — Kōrero Companion" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the learner profile from our learners table
  const learner = user ? await getLearner(user.id).catch(() => null) : null;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-tangaroa-800">
          Tēnā koe
          {learner?.name ? `, ${learner.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Welcome to your te reo Māori dashboard.
        </p>
        {learner?.class_code && (
          <span className="mt-3 inline-block text-xs font-medium bg-kowhai-100 text-kowhai-600 rounded-full px-3 py-1">
            Class: {learner.class_code}
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          href="/practice"
          emoji="🎙️"
          title="Practice speaking"
          description="Record yourself and get instant AI feedback"
        />
        <ActionCard
          href="/progress"
          emoji="📈"
          title="My progress"
          description="Review your confidence scores and streak"
        />
        <ActionCard
          href="/challenges"
          emoji="🏆"
          title="Challenges"
          description="Complete your kaiako's weekly challenges"
        />
      </div>

      {/* Level badge */}
      {learner && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="text-3xl">
            {learner.level === "beginner" ? "🌱" : learner.level === "intermediate" ? "🌿" : "🌳"}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current level</p>
            <p className="text-lg font-semibold text-tangaroa-800 capitalize">{learner.level}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({
  href,
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-tangaroa-200 transition-all group"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h2 className="font-semibold text-gray-900 group-hover:text-tangaroa-800 transition">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </a>
  );
}
