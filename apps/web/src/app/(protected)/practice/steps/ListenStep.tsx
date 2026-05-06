"use client";

import { useEffect, useState } from "react";
import { useSpeech } from "../hooks/useSpeech";
import type { LessonData } from "../LessonFlow";

interface Props {
  lesson:  LessonData;
  onNext:  () => void;
}

export default function ListenStep({ lesson, onNext }: Props) {
  const { phrase } = lesson;
  const { speak, speaking } = useSpeech();
  const [understood, setUnderstood] = useState(false);

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => speak(phrase.maori), 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Lesson label */}
      <div className="text-center">
        <span className="inline-block bg-primary/10 text-primary text-xs font-body font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {lesson.titleMaori}
        </span>
      </div>

      {/* Main phrase card */}
      <div className="w-full bg-primary rounded-3xl p-8 text-center space-y-4 shadow-lg">
        <p className="font-heading text-4xl leading-tight text-secondary" lang="mi">
          {phrase.maori}
        </p>
        <p className="font-body text-secondary/70 text-lg">
          {phrase.english}
        </p>
        <p className="font-body text-secondary/50 text-sm italic">
          {phrase.pronunciation}
        </p>
      </div>

      {/* Play / Replay button */}
      <button
        onClick={() => speak(phrase.maori)}
        disabled={speaking}
        className="flex items-center gap-3 btn-secondary"
        aria-label={speaking ? "Playing audio…" : "Play pronunciation"}
      >
        {speaking ? (
          <>
            <span className="flex gap-0.5 items-end h-5">
              {[0.1, 0.2, 0.3, 0.2, 0.1].map((delay, i) => (
                <span
                  key={i}
                  className="w-1 bg-primary rounded-full animate-waveform"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>
            Playing…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {understood ? "Play again" : "Play pronunciation"}
          </>
        )}
      </button>

      {/* Comprehension prompt */}
      {!understood ? (
        <div className="w-full space-y-3 pt-2">
          <p className="text-center font-body text-ink/60 text-sm">
            Did you understand?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setUnderstood(true)}
              className="flex-1 btn-primary"
            >
              Āe — Yes
            </button>
            <button
              onClick={() => speak(phrase.maori)}
              disabled={speaking}
              className="flex-1 btn-secondary"
            >
              Play again
            </button>
          </div>
        </div>
      ) : (
        <button onClick={onNext} className="w-full btn-accent">
          Continue →
        </button>
      )}
    </div>
  );
}
