"use client";

import { useState } from "react";
import { useSpeech } from "@/app/(protected)/practice/hooks/useSpeech";

interface Round {
  phrase:   string;          // te reo phrase to hear
  english:  string;          // what it means
  correct:  number;          // index of correct option
  options:  { emoji: string; label: string; description: string }[];
}

const ROUNDS: Round[] = [
  {
    phrase:  "Kia ora!",
    english: "Hello!",
    correct: 0,
    options: [
      { emoji: "🤝", label: "Greeting",    description: "Someone saying hello" },
      { emoji: "🍽️", label: "Eating",      description: "Someone having a meal" },
      { emoji: "😴", label: "Sleeping",    description: "Someone going to sleep" },
    ],
  },
  {
    phrase:  "Ko wai tōu ingoa?",
    english: "What is your name?",
    correct: 1,
    options: [
      { emoji: "🌄", label: "Mountain",    description: "A mountain landscape" },
      { emoji: "💬", label: "Asking name", description: "Two people introducing themselves" },
      { emoji: "🏠", label: "Home",        description: "A family home" },
    ],
  },
  {
    phrase:  "Nō hea koe?",
    english: "Where are you from?",
    correct: 2,
    options: [
      { emoji: "🍎", label: "Food",        description: "Buying food at a market" },
      { emoji: "📚", label: "Learning",    description: "Reading in a library" },
      { emoji: "🗺️", label: "Place",       description: "Pointing to a location on a map" },
    ],
  },
  {
    phrase:  "Kei te pēhea koe?",
    english: "How are you?",
    correct: 0,
    options: [
      { emoji: "😊", label: "Well-being",  description: "Someone checking in on a friend" },
      { emoji: "🎵", label: "Music",       description: "Playing music at a concert" },
      { emoji: "🏃", label: "Running",     description: "Someone jogging in the park" },
    ],
  },
  {
    phrase:  "Tēnā koutou katoa",
    english: "Greetings to you all",
    correct: 1,
    options: [
      { emoji: "🤸", label: "Exercise",    description: "A fitness class" },
      { emoji: "👥", label: "Group",       description: "Addressing a gathering of people" },
      { emoji: "🌊", label: "Ocean",       description: "Waves at the beach" },
    ],
  },
];

export default function ListenAndChoose() {
  const [round,    setRound]    = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);
  const { speak, speaking }     = useSpeech();

  const current = ROUNDS[round];

  const handlePlay = () => speak(current.phrase);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === current.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      speak("Ka pai!");
    }
  };

  const next = () => {
    if (round + 1 >= ROUNDS.length) { setDone(true); return; }
    setRound((r) => r + 1);
    setSelected(null);
  };

  if (done) {
    const perfect = score === ROUNDS.length;
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <span className="text-6xl">{perfect ? "🏆" : "⭐"}</span>
        <h3 className="font-heading text-2xl text-primary">
          {perfect ? "Ka pai rawa atu!" : "Ka pai!"}
        </h3>
        <p className="font-body text-ink/60">
          You got {score} out of {ROUNDS.length} correct.
        </p>
        <div className="flex gap-1">
          {ROUNDS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < score ? "bg-success" : "bg-gray-200"}`} />
          ))}
        </div>
        <button onClick={() => { setRound(0); setScore(0); setSelected(null); setDone(false); }} className="btn-primary">
          Play again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round counter */}
      <div className="flex justify-between items-center">
        <p className="font-body text-xs text-ink/40 uppercase tracking-widest">
          Round {round + 1} of {ROUNDS.length}
        </p>
        <div className="flex gap-1">
          {ROUNDS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < round ? "bg-success" : i === round ? "bg-accent scale-125" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Audio player */}
      <div className="bg-primary rounded-2xl p-6 flex flex-col items-center gap-4">
        <p className="font-body text-secondary/60 text-xs uppercase tracking-widest">Listen and choose</p>
        <button
          onClick={handlePlay}
          disabled={speaking}
          className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg hover:opacity-90 transition active:scale-95"
          aria-label="Play phrase"
        >
          {speaking
            ? <div className="flex gap-0.5 items-end h-5">
                {[0.05, 0.1, 0.15, 0.1, 0.05].map((d, i) => (
                  <span key={i} className="w-1 bg-ink/80 rounded-full animate-waveform" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            : <svg className="w-7 h-7 text-ink" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          }
        </button>
        <p className="font-body text-secondary/40 text-xs">Tap to hear the phrase</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-3">
        {current.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect  = idx === current.correct;
          let borderClass  = "border-gray-100 hover:border-primary/30 hover:shadow-sm";
          if (selected !== null) {
            if (isCorrect)                         borderClass = "border-success bg-success/10 shadow-md";
            else if (isSelected && !isCorrect)     borderClass = "border-warning bg-warning/10";
            else                                   borderClass = "border-gray-100 opacity-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${borderClass}`}
            >
              <span className="text-4xl">{opt.emoji}</span>
              <span className="font-body text-xs text-ink/70 text-center leading-tight">{opt.description}</span>
              {selected !== null && isCorrect && (
                <span className="text-success text-xs font-bold">✓ Correct</span>
              )}
              {selected !== null && isSelected && !isCorrect && (
                <span className="text-warning text-xs font-bold">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {selected !== null && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className={`rounded-xl p-3 text-center text-sm font-body ${selected === current.correct ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            {selected === current.correct
              ? `✓ Ka pai! "${current.phrase}" means "${current.english}"`
              : `The phrase "${current.phrase}" means "${current.english}"`
            }
          </div>
          <button onClick={next} className="w-full btn-primary">
            {round + 1 >= ROUNDS.length ? "See results →" : "Next round →"}
          </button>
        </div>
      )}
    </div>
  );
}
