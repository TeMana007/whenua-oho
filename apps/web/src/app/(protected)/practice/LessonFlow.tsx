"use client";

import { useState } from "react";
import ListenStep     from "./steps/ListenStep";
import UnderstandStep from "./steps/UnderstandStep";
import RepeatStep     from "./steps/RepeatStep";
import SpeakStep      from "./steps/SpeakStep";
import RecallStep     from "./steps/RecallStep";

/* ── Shared types ─────────────────────────────────────────────────── */

export interface LessonPhrase {
  id?:           string;   // DB UUID — undefined for curriculum-only phrases
  maori:         string;
  english:       string;
  pronunciation: string;
}

export interface LessonData {
  lessonId:    string;
  title:       string;
  titleMaori:  string;
  topic?:      string;
  culturalNote: string;
  phrase:      LessonPhrase;
  phraseId?:   string;     // alias for phrase.id — passed explicitly for DB ops
  level:       string;
  learnerId:   string;
}

/* ── Step metadata ────────────────────────────────────────────────── */

const STEPS = [
  { label: "Listen",     emoji: "👂" },
  { label: "Understand", emoji: "🌿" },
  { label: "Repeat",     emoji: "🔁" },
  { label: "Speak",      emoji: "🎙️" },
  { label: "Recall",     emoji: "🧠" },
] as const;

/* ── Component ────────────────────────────────────────────────────── */

export default function LessonFlow({ lesson }: { lesson: LessonData }) {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── Top progress bar ── */}
      <div className="sticky top-0 z-20 bg-secondary/95 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Step pills */}
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-1 text-xs font-body font-bold transition-all
                  ${i < step  ? "text-success"    : ""}
                  ${i === step ? "text-primary"   : ""}
                  ${i > step  ? "text-ink/25"     : ""}
                `}
              >
                <span>{s.emoji}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress track */}
          <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step label */}
        <p className="text-xs font-body text-primary/50 uppercase tracking-widest text-center mb-6">
          Step {step + 1} of {STEPS.length} — {STEPS[step].label}
        </p>

        {step === 0 && <ListenStep     lesson={lesson} onNext={next} />}
        {step === 1 && <UnderstandStep lesson={lesson} onNext={next} />}
        {step === 2 && <RepeatStep     lesson={lesson} onNext={next} />}
        {step === 3 && <SpeakStep      lesson={lesson} onNext={next} />}
        {step === 4 && <RecallStep     lesson={lesson} />}
      </div>
    </div>
  );
}
