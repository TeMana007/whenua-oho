"use client";

import { useState } from "react";
import SentenceBuilder  from "./SentenceBuilder";
import ListenAndChoose  from "./ListenAndChoose";
import RebuildMihimihi  from "./RebuildMihimihi";

type GameId = "sentence" | "listen" | "mihimihi";

const GAMES: { id: GameId; label: string; maori: string; emoji: string; description: string; colour: string }[] = [
  {
    id:          "sentence",
    label:       "Sentence Builder",
    maori:       "Hanga Kōrero",
    emoji:       "🧩",
    description: "Drag scrambled words into the correct sentence order.",
    colour:      "#04342C",
  },
  {
    id:          "listen",
    label:       "Listen & Choose",
    maori:       "Whakarongo",
    emoji:       "👂",
    description: "Hear a phrase and tap the matching scene — five rounds.",
    colour:      "#2D7A4F",
  },
  {
    id:          "mihimihi",
    label:       "Rebuild the Pepeha",
    maori:       "Hanga Pepeha",
    emoji:       "🌿",
    description: "Drag the six mihimihi sections into correct cultural order, then record it.",
    colour:      "#C8A951",
  },
];

export default function GamesPage() {
  const [active, setActive] = useState<GameId | null>(null);
  const game = GAMES.find((g) => g.id === active);

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8 space-y-1">
        <h1 className="font-heading text-3xl text-primary">Ngā Kēmu</h1>
        <p className="font-body text-ink/50 text-sm">Language games to sharpen your te reo</p>
      </div>

      {/* Game selector */}
      {!active && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: g.colour + "18" }}
              >
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg text-primary">{g.label}</p>
                <p className="font-body text-xs text-ink/40 mb-1" lang="mi">{g.maori}</p>
                <p className="font-body text-sm text-ink/60">{g.description}</p>
              </div>
              <svg className="w-5 h-5 text-ink/20 group-hover:text-primary/40 transition flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Active game */}
      {active && game && (
        <div className="animate-in fade-in duration-300">
          {/* Game header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActive(null)}
              className="text-ink/40 hover:text-primary transition p-1"
              aria-label="Back to games"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{game.emoji}</span>
              <div>
                <p className="font-heading text-lg text-primary leading-none">{game.label}</p>
                <p className="font-body text-xs text-ink/40" lang="mi">{game.maori}</p>
              </div>
            </div>
          </div>

          {/* Cultural safety note */}
          <div className="bg-primary/5 rounded-xl px-4 py-2 mb-5 flex items-start gap-2">
            <span className="text-sm flex-shrink-0 mt-0.5">🌿</span>
            <p className="font-body text-xs text-primary/70">
              Nā Dr. Rāpata Wiri ngā akoranga — content validated by the kaiako.
            </p>
          </div>

          {active === "sentence"  && <SentenceBuilder />}
          {active === "listen"    && <ListenAndChoose />}
          {active === "mihimihi"  && <RebuildMihimihi />}
        </div>
      )}
    </div>
  );
}
