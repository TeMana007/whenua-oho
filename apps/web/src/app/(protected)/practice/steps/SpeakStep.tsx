"use client";

import { useEffect, useState } from "react";
import { useRecorder } from "../hooks/useRecorder";
import type { LessonData } from "../LessonFlow";
import type { FeedbackResult } from "@korero/ai";

interface Props {
  lesson: LessonData;
  onNext: () => void;
}

type Status = "idle" | "recording" | "processing" | "done" | "error";

function Waveform() {
  return (
    <div className="flex items-end gap-1 h-12" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="w-2 bg-warning rounded-full animate-waveform"
          style={{ animationDelay: `${i * 0.07}s` }}
        />
      ))}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct    = Math.round(score * 100);
  const colour = score >= 0.7 ? "#2D7A4F" : score >= 0.4 ? "#C8A951" : "#E07B39";
  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score * circ).toFixed(1);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <span
        className="font-heading text-2xl -mt-16 mb-8"
        style={{ color: colour }}
      >
        {pct}%
      </span>
    </div>
  );
}

export default function SpeakStep({ lesson, onNext }: Props) {
  const { phrase } = lesson;
  const { recording, audioBlob, startRecording, stopRecording } = useRecorder();
  const [status,   setStatus]   = useState<Status>("idle");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRecord = async () => {
    if (recording) {
      stopRecording();
      return;
    }
    setStatus("recording");
    setFeedback(null);
    await startRecording();
  };

  // When recording stops (blob appears) → transcribe → feedback
  const handleAnalyse = async () => {
    if (!audioBlob) return;
    setStatus("processing");
    try {
      // 1. Transcribe
      const file     = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio",  file);
      formData.append("prompt", phrase.maori);

      const txRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!txRes.ok) throw new Error("Transcription failed");
      const { transcript } = await txRes.json() as { transcript: string };

      // 2. Get feedback
      const fbRes = await fetch("/api/feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          targetPhrase:  phrase.maori,
          targetEnglish: phrase.english,
          level:         lesson.level,
        }),
      });
      if (!fbRes.ok) throw new Error("Feedback failed");
      const result = await fbRes.json() as FeedbackResult;

      setFeedback(result);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  // When recording stops (blob appears) and status is still "recording" → trigger analysis
  // Must be in useEffect, not in the render body, to avoid React side-effect violations
  useEffect(() => {
    if (!recording && audioBlob && status === "recording") {
      handleAnalyse();
    }
    // handleAnalyse is defined inline — intentionally excluded from deps to avoid re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, recording]);

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="font-heading text-2xl text-primary">Say it from memory</p>
        <p className="font-body text-ink/60 text-sm">
          The phrase is hidden. Record yourself saying it in te reo Māori.
        </p>
      </div>

      {/* Hidden phrase hint */}
      <div className="w-full bg-primary/5 rounded-2xl p-6 text-center border-2 border-dashed border-primary/20">
        <p className="font-body text-ink/30 text-sm uppercase tracking-widest mb-1">
          Phrase hidden
        </p>
        <div className="flex items-center justify-center gap-1">
          {phrase.maori.split("").map((c, i) => (
            <span
              key={i}
              className="text-xl"
              style={{ color: "transparent", textShadow: "0 0 12px rgba(4,52,44,0.35)" }}
            >
              {c === " " ? "  " : "▪"}
            </span>
          ))}
        </div>
        <p className="font-body text-ink/50 text-sm mt-2 italic">
          &ldquo;{phrase.english}&rdquo;
        </p>
      </div>

      {/* Record button */}
      {status !== "done" && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleRecord}
            disabled={status === "processing"}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center
              shadow-lg transition-all active:scale-95
              ${recording
                ? "bg-warning ring-4 ring-warning/30 animate-pulse"
                : status === "processing"
                  ? "bg-gray-300 cursor-wait"
                  : "bg-primary hover:bg-primary/90"
              }
            `}
            aria-label={recording ? "Stop recording" : "Start recording"}
          >
            {status === "processing" ? (
              <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
            ) : recording ? (
              <span className="w-6 h-6 rounded bg-secondary block" />
            ) : (
              <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>

          {recording    && <Waveform />}
          {status === "processing" && (
            <p className="font-body text-ink/60 text-sm animate-pulse">
              Analysing your pronunciation…
            </p>
          )}
        </div>
      )}

      {/* Feedback panel */}
      {status === "done" && feedback && (
        <div className="w-full space-y-5 animate-in fade-in duration-500">
          <div className="flex justify-center">
            <ScoreRing score={feedback.score} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="font-body text-ink/80 leading-relaxed">{feedback.feedback}</p>

            {feedback.corrections.length > 0 && (
              <div className="space-y-2">
                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                  Suggestions
                </p>
                <ul className="space-y-1">
                  {feedback.corrections.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-ink/70">
                      <span className="text-warning mt-0.5">→</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button onClick={onNext} className="w-full btn-primary">
            Continue →
          </button>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="w-full space-y-4">
          <div className="bg-warning/10 rounded-2xl p-4 text-center">
            <p className="font-body text-warning text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={() => setStatus("idle")}
            className="w-full btn-secondary"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
