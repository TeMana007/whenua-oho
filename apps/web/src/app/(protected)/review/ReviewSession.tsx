"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeech }   from "@/app/(protected)/practice/hooks/useSpeech";
import { useRecorder } from "@/app/(protected)/practice/hooks/useRecorder";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface ReviewCard {
  phraseId:      string;
  maori:         string;
  english:       string;
  pronunciation: string;
  currentScore:  number;
}

type Rating    = "again" | "hard" | "got_it" | "easy";
type CardPhase = "prompt" | "listening" | "recording" | "reveal" | "rated";

const RATING_META: { key: Rating; label: string; sub: string; colour: string }[] = [
  { key: "again",  label: "Again",  sub: "1 day",   colour: "#E07B39" },
  { key: "hard",   label: "Hard",   sub: "3 days",  colour: "#C8A951" },
  { key: "got_it", label: "Got it", sub: "7 days",  colour: "#2D7A4F" },
  { key: "easy",   label: "Easy",   sub: "30 days", colour: "#04342C" },
];

/* ── Waveform ───────────────────────────────────────────────────────── */

function Waveform() {
  return (
    <div className="flex items-end gap-0.5 h-8" aria-hidden="true">
      {[0, 0.07, 0.14, 0.07, 0, 0.07, 0.14, 0.07, 0].map((d, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-warning animate-waveform"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}

/* ── End screen ─────────────────────────────────────────────────────── */

function EndScreen({ count, ratings }: { count: number; ratings: Rating[] }) {
  const easy   = ratings.filter((r) => r === "easy").length;
  const got_it = ratings.filter((r) => r === "got_it").length;
  const hard   = ratings.filter((r) => r === "hard").length;
  const again  = ratings.filter((r) => r === "again").length;

  return (
    <div className="flex flex-col items-center gap-8 py-12 animate-in fade-in duration-700">
      <span className="text-6xl">✅</span>
      <div className="text-center space-y-2">
        <h2 className="font-heading text-4xl text-primary">Kua mutu!</h2>
        <p className="font-body text-ink/60">Session complete — you reviewed {count} phrase{count !== 1 ? "s" : ""}.</p>
      </div>

      {/* Rating breakdown */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="font-body text-xs text-ink/40 uppercase tracking-wider">This session</p>
        {[
          { label: "Easy",   count: easy,   colour: "#04342C" },
          { label: "Got it", count: got_it, colour: "#2D7A4F" },
          { label: "Hard",   count: hard,   colour: "#C8A951" },
          { label: "Again",  count: again,  colour: "#E07B39" },
        ].map(({ label, count: c, colour }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="font-body text-sm text-ink/70 w-16">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${count ? (c / count) * 100 : 0}%`, backgroundColor: colour }}
              />
            </div>
            <span className="font-body text-sm text-ink/50 w-4 text-right">{c}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <a href="/review" className="block w-full btn-primary text-center leading-[56px]">
          Review more →
        </a>
        <a href="/dashboard" className="block w-full btn-secondary text-center leading-[54px]">
          Back to home
        </a>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function ReviewSession({ cards, level }: { cards: ReviewCard[]; level: string }) {
  const [index,   setIndex]   = useState(0);
  const [phase,   setPhase]   = useState<CardPhase>("prompt");
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [done,    setDone]    = useState(false);

  const { speak, speaking } = useSpeech();
  const { recording, startRecording, stopRecording, audioUrl } = useRecorder();

  const card = cards[index];

  // Auto-play English on each new card
  useEffect(() => {
    setPhase("prompt");
    setFlipped(false);
    const t = setTimeout(() => {
      speak(card.english, "en");
      setPhase("listening");
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleRecord = async () => {
    if (recording) {
      stopRecording();
      setPhase("reveal");
      setTimeout(() => setFlipped(true), 300);
    } else {
      setPhase("recording");
      await startRecording();
    }
  };

  const handleReveal = () => {
    setPhase("reveal");
    setFlipped(true);
    // Play the correct te reo phrase
    setTimeout(() => speak(card.maori), 700);
  };

  const rate = async (rating: Rating) => {
    setPhase("rated");
    setRatings((r) => [...r, rating]);

    // Update Supabase
    await fetch("/api/review", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phraseId: card.phraseId, rating }),
    });

    // Next card
    setTimeout(() => {
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 350);
  };

  if (done) {
    return <EndScreen count={cards.length} ratings={ratings} />;
  }

  const progress = ((index) / cards.length) * 100;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between font-body text-xs text-ink/40">
          <span>Card {index + 1} of {cards.length}</span>
          <span>{cards.length - index - 1} remaining</span>
        </div>
        <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 3D flip card */}
      <div style={{ perspective: "1200px" }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "340px",
          }}
        >
          {/* ── FRONT: English prompt ── */}
          <div
            className="absolute inset-0 rounded-3xl bg-primary shadow-xl flex flex-col items-center justify-center gap-5 p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Scenario icon */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-5xl">
              🗣️
            </div>
            <div className="text-center space-y-2">
              <p className="font-body text-secondary/50 text-xs uppercase tracking-widest">
                How do you say this in te reo?
              </p>
              <p className="font-heading text-3xl text-secondary leading-tight">
                {card.english}
              </p>
            </div>
            <button
              onClick={() => speak(card.english, "en")}
              disabled={speaking}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-secondary text-sm font-body rounded-full px-4 py-2 transition"
            >
              {speaking ? <Waveform /> : "🔊 Play again"}
            </button>
          </div>

          {/* ── BACK: Te reo answer ── */}
          <div
            className="absolute inset-0 rounded-3xl bg-secondary border-2 border-primary/20 shadow-xl flex flex-col items-center justify-center gap-5 p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="font-body text-primary/50 text-xs uppercase tracking-widest">
              The answer
            </p>
            <p className="font-heading text-4xl text-primary text-center leading-tight" lang="mi">
              {card.maori}
            </p>
            <p className="font-body text-ink/50 italic text-sm">{card.pronunciation}</p>
            <button
              onClick={() => speak(card.maori)}
              disabled={speaking}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-body rounded-full px-4 py-2 transition"
            >
              {speaking ? <Waveform /> : "🔊 Hear pronunciation"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      {!flipped && (
        <div className="space-y-3">
          {/* Record button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleRecord}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95
                ${recording ? "bg-warning ring-4 ring-warning/30 animate-pulse" : "bg-primary hover:bg-primary/90"}
              `}
              aria-label={recording ? "Stop" : "Record your answer"}
            >
              {recording
                ? <span className="w-5 h-5 rounded bg-secondary block" />
                : <svg className="w-7 h-7 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
              }
            </button>
            {recording && <Waveform />}
            <p className="font-body text-xs text-ink/40">
              {recording ? "Recording… tap to stop & reveal" : "Speak your answer, then reveal"}
            </p>
          </div>

          <button onClick={handleReveal} className="w-full btn-secondary text-sm">
            Reveal answer without recording
          </button>
        </div>
      )}

      {/* ── Rating buttons (after flip) ── */}
      {flipped && phase !== "rated" && (
        <div className="space-y-3 animate-in fade-in duration-500">
          <p className="font-body text-xs text-ink/40 text-center uppercase tracking-widest">
            How did you do?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {RATING_META.map(({ key, label, sub, colour }) => (
              <button
                key={key}
                onClick={() => rate(key)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all active:scale-95 hover:shadow-md"
                style={{ borderColor: colour + "60", backgroundColor: colour + "10" }}
              >
                <span className="font-body font-bold text-sm" style={{ color: colour }}>
                  {label}
                </span>
                <span className="font-body text-[10px]" style={{ color: colour + "AA" }}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
