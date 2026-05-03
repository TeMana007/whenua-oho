"use client";

import { useState } from "react";
import type { Level } from "../OnboardingFlow";

const LEVELS = [
  {
    key: "beginner" as Level,
    maori: "KĀKANO",
    english: "Beginner",
    meaning: "Seed — just beginning",
    emoji: "🌱",
    example: { te_reo: "Kia ora! He aha tō ingoa?", english: "Hello! What is your name?" },
    bg: "hover:bg-primary/5 data-[selected]:bg-primary data-[selected]:border-primary",
    textSelected: "data-[selected]:text-secondary",
  },
  {
    key: "intermediate" as Level,
    maori: "TIPU",
    english: "Emerging",
    meaning: "Growing — finding your voice",
    emoji: "🌿",
    example: { te_reo: "E haere ana ahau ki te kura.", english: "I am going to school." },
    bg: "hover:bg-accent/5 data-[selected]:bg-accent data-[selected]:border-accent",
    textSelected: "data-[selected]:text-ink",
  },
  {
    key: "advanced" as Level,
    maori: "PUĀWAI",
    english: "Intermediate",
    meaning: "Blooming — confident speaker",
    emoji: "🌺",
    example: { te_reo: "Nō reira, tēnā koutou katoa.", english: "And so, greetings to all of you." },
    bg: "hover:bg-success/5 data-[selected]:bg-success data-[selected]:border-success",
    textSelected: "data-[selected]:text-secondary",
  },
];

export function LevelStep({ onNext }: { onNext: (level: Level) => void }) {
  const [selected, setSelected] = useState<Level | null>(null);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-4xl font-bold text-primary leading-tight">
            Kei hea tō mōhio?
          </h2>
          <p className="mt-2 font-body text-ink/60">
            Where is your level? Choose the one that feels right.
          </p>
        </div>

        {/* Level cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.key}
              data-selected={selected === lvl.key ? "" : undefined}
              onClick={() => setSelected(lvl.key)}
              className={`
                group text-left rounded-3xl border-2 border-ink/10 bg-white p-6
                transition-all duration-200 active:scale-[0.98]
                ${lvl.bg}
              `}
            >
              <div className="text-4xl mb-3">{lvl.emoji}</div>
              <div className={`font-heading text-2xl font-bold text-primary ${lvl.textSelected}`}>
                {lvl.maori}
              </div>
              <div className={`font-body text-sm font-medium text-ink/60 mt-0.5 ${lvl.textSelected} opacity-80`}>
                {lvl.english}
              </div>
              <div className={`font-body text-xs text-ink/40 mt-1 ${lvl.textSelected} opacity-60`}>
                {lvl.meaning}
              </div>

              {/* Example phrase */}
              <div className={`mt-4 pt-4 border-t border-ink/10 space-y-0.5`}>
                <p className={`font-heading text-sm italic text-primary ${lvl.textSelected}`}>
                  "{lvl.example.te_reo}"
                </p>
                <p className={`font-body text-xs text-ink/50 ${lvl.textSelected} opacity-70`}>
                  {lvl.example.english}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selected
            ? `Āe, ko ${LEVELS.find((l) => l.key === selected)?.maori} ahau`
            : "Choose your level"}
        </button>
      </div>
    </div>
  );
}
