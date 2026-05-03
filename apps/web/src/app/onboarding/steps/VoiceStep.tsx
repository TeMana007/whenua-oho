"use client";

import { useEffect, useRef, useState } from "react";
import type { Level } from "../OnboardingFlow";

const TOMORROW_TASKS: Record<Level, { te_reo: string; english: string; topic: string }> = {
  beginner:     { te_reo: "Ko wai tōu ingoa?",         english: "What is your name?",       topic: "Ngā mihi — Greetings" },
  intermediate: { te_reo: "E haere ana koe ki hea?",   english: "Where are you going?",     topic: "Te haere — Getting around" },
  advanced:     { te_reo: "He aha tāu mahi i tērā rā?", english: "What did you do yesterday?", topic: "Te wā — Talking about time" },
};

function MicIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
    </svg>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function Waveform({ isActive }: { isActive: boolean }) {
  const BARS = 9;
  return (
    <div className="flex items-center justify-center gap-1 h-14" aria-hidden>
      {Array.from({ length: BARS }).map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-full bg-accent transition-all ${
            isActive ? "animate-waveform" : "h-1.5 opacity-30"
          }`}
          style={
            isActive
              ? { animationDelay: `${(i * 0.09).toFixed(2)}s`, animationDuration: `${0.55 + (i % 3) * 0.12}s` }
              : {}
          }
        />
      ))}
    </div>
  );
}

type Phase = "idle" | "recording" | "recorded" | "done";

export function VoiceStep({
  name,
  level,
  onFinish,
}: {
  name: string;
  level: Level;
  onFinish: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const phrase = `Kia ora! Ko ${name || "ahau"} tōku ingoa.`;
  const task = TOMORROW_TASKS[level];

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setPhase("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setPhase("recording");
    } catch {
      setError("Microphone access is needed to record your voice. Please allow access and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const playback = () => {
    if (!audioUrl) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    await onFinish();
  };

  // Clean up object URL on unmount
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">

        {/* Heading */}
        <div>
          <div className="text-5xl mb-4">🎙️</div>
          <h2 className="font-heading text-4xl font-bold text-secondary">
            Me rongo tāua<br />i tō reo!
          </h2>
          <p className="mt-2 font-body text-secondary/60">
            Let's hear your voice!
          </p>
        </div>

        {/* Phrase to say */}
        <div className="bg-white/10 rounded-3xl px-6 py-5 border border-white/20">
          <p className="font-body text-secondary/60 text-xs uppercase tracking-widest mb-2">
            Say this phrase
          </p>
          <p className="font-heading text-2xl text-accent italic">
            "{phrase}"
          </p>
          <p className="font-body text-sm text-secondary/50 mt-1">
            Hello! My name is {name || "…"}.
          </p>
        </div>

        {/* Waveform */}
        <Waveform isActive={phase === "recording"} />

        {/* Mic button */}
        {phase !== "recorded" && phase !== "done" && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={phase === "idle" ? startRecording : stopRecording}
              className={`
                w-24 h-24 rounded-full flex items-center justify-center
                transition-all duration-200 active:scale-95 shadow-lg
                ${phase === "recording"
                  ? "bg-red-500 animate-pulse shadow-red-500/40"
                  : "bg-accent hover:bg-accent/90 shadow-accent/30"}
              `}
              aria-label={phase === "recording" ? "Stop recording" : "Start recording"}
            >
              <MicIcon size={36} />
            </button>
            <p className="font-body text-xs text-secondary/50">
              {phase === "idle" ? "Tap to record" : "Tap to stop"}
            </p>
          </div>
        )}

        {/* Post-recording */}
        {phase === "recorded" && (
          <div className="space-y-5">
            {/* Positive feedback */}
            <div className="bg-success/20 border border-success/40 rounded-2xl px-5 py-4 text-center">
              <p className="font-heading text-xl text-secondary">Ka rawe! 🎉</p>
              <p className="font-body text-sm text-secondary/70 mt-1">
                Excellent! Ka pai tō kōrero — great speaking!
              </p>
            </div>

            {/* Playback */}
            <button
              onClick={playback}
              className="flex items-center gap-2 mx-auto font-body text-sm text-secondary/60 hover:text-secondary transition"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <PlayIcon size={16} />
              </div>
              Play back my recording
            </button>

            {/* Tomorrow's task card */}
            <div className="bg-white/10 border border-white/20 rounded-3xl p-5 text-left">
              <p className="font-body text-xs text-secondary/50 uppercase tracking-widest mb-2">
                📅 Tomorrow's first task
              </p>
              <p className="font-body text-xs text-accent/80 font-medium mb-1">{task.topic}</p>
              <p className="font-heading text-lg text-secondary italic">"{task.te_reo}"</p>
              <p className="font-body text-xs text-secondary/50 mt-0.5">{task.english}</p>
            </div>

            {/* Finish */}
            <button
              onClick={handleFinish}
              disabled={isFinishing}
              className="btn-accent w-full disabled:opacity-60"
            >
              {isFinishing ? "Setting up your space…" : "Haere tonu — Let's go! →"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-warning/20 border border-warning/40 px-4 py-3 text-sm font-body text-secondary/80">
            {error}
          </div>
        )}

        {/* Skip voice */}
        {phase === "idle" && (
          <button
            onClick={handleFinish}
            className="font-body text-xs text-secondary/30 hover:text-secondary/60 transition"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
