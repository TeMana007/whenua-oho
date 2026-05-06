"use client";

import type { LessonData } from "../LessonFlow";

interface Props {
  lesson: LessonData;
  onNext: () => void;
}

/** Cultural context map — topic keyword → decorative colour accent */
const TOPIC_ACCENT: Record<string, string> = {
  greetings: "#C8A951",
  family:    "#2D7A4F",
  food:      "#E07B39",
  default:   "#04342C",
};

export default function UnderstandStep({ lesson, onNext }: Props) {
  const topicKey  = lesson.topic ?? "default";
  const accentHex = TOPIC_ACCENT[topicKey] ?? TOPIC_ACCENT.default;

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Scenario image placeholder */}
      <div
        className="w-full aspect-video rounded-3xl flex flex-col items-center justify-center gap-4 overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${accentHex}20, ${accentHex}40)` }}
        aria-label="Scenario illustration"
      >
        {/* Abstract koru pattern overlay */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full opacity-10"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="80" fill="none" stroke={accentHex} strokeWidth="24" />
          <circle cx="100" cy="60"  r="36" fill="none" stroke={accentHex} strokeWidth="16" />
          <circle cx="100" cy="36"  r="16" fill="none" stroke={accentHex} strokeWidth="8"  />
        </svg>

        {/* Topic icon */}
        <span className="text-7xl z-10" aria-hidden="true">
          {topicKey === "greetings" ? "🤝" :
           topicKey === "family"    ? "👨‍👩‍👧‍👦" :
           topicKey === "food"      ? "🍽️"  : "📖"}
        </span>

        <p
          className="font-heading text-2xl z-10"
          style={{ color: accentHex }}
          lang="mi"
        >
          {lesson.titleMaori}
        </p>
      </div>

      {/* Cultural note card */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🌿</span>
          <h3 className="font-heading text-lg text-primary">He kōrero ahurea</h3>
          <span className="text-xs text-ink/40 font-body">(Cultural note)</span>
        </div>
        <p className="font-body text-ink/80 leading-relaxed text-sm sm:text-base">
          {lesson.culturalNote}
        </p>
      </div>

      {/* Phrase reminder */}
      <div className="w-full bg-primary/5 rounded-2xl p-4 text-center">
        <p className="font-body text-xs text-primary/60 uppercase tracking-wider mb-1">
          Today&apos;s phrase
        </p>
        <p className="font-heading text-xl text-primary" lang="mi">
          {lesson.phrase.maori}
        </p>
      </div>

      <button onClick={onNext} className="w-full btn-primary">
        Ready to practise →
      </button>
    </div>
  );
}
