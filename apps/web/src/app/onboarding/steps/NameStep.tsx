"use client";

import { useState } from "react";

export function NameStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-4xl font-bold text-secondary leading-tight">
            Ko wai tōu ingoa?
          </h2>
          <p className="mt-2 font-body text-secondary/60 text-base">
            What is your name?
          </p>
        </div>

        {/* Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && trimmed && onNext(trimmed)}
          placeholder="Type your name…"
          autoFocus
          className="w-full bg-transparent border-b-2 border-secondary/40 focus:border-accent
                     text-secondary text-2xl font-heading text-center placeholder:text-secondary/30
                     py-3 outline-none transition-colors duration-200"
        />

        {/* Dynamic button */}
        <button
          onClick={() => trimmed && onNext(trimmed)}
          disabled={!trimmed}
          className="btn-accent w-full text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {trimmed
            ? `Tōku ingoa ko ${trimmed}`
            : "Tōku ingoa ko ___"}
        </button>
      </div>
    </div>
  );
}
