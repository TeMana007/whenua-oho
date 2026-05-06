"use client";

import { useCallback, useEffect, useState } from "react";
import { useSpeech }   from "../hooks/useSpeech";
import { useRecorder } from "../hooks/useRecorder";
import type { LessonData } from "../LessonFlow";
import type { FeedbackResult } from "@korero/ai";
import { useRouter } from "next/navigation";

interface Props {
  lesson: LessonData;
}

type Status = "idle" | "recording" | "processing" | "done" | "error";

function Waveform() {
  return (
    <div className="flex items-end gap-1 h-10" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="w-2 bg-accent rounded-full animate-waveform"
          style={{ animationDelay: `${i * 0.07}s` }}
        />
      ))}
    </div>
  );
}

export default function RecallStep({ lesson }: Props) {
  const router = useRouter();
  const { phrase } = lesson;
  const { speak, speaking }                            = useSpeech();
  const { recording, audioBlob, startRecording, stopRecording } = useRecorder();
  const [status,   setStatus]   = useState<Status>("idle");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved,    setSaved]    = useState(false);

  const handleRecord = async () => {
    if (recording) {
      stopRecording();
      return;
    }
    setStatus("recording");
    setFeedback(null);
    await startRecording();
  };

  const saveProgress = useCallback(async (score: number) => {
    if (!lesson.phraseId || !lesson.learnerId || saved) return;
    try {
      await fetch("/api/progress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phraseId:        lesson.phraseId,
          confidenceScore: score,
        }),
      });
      setSaved(true);
    } catch {
      // Non-blocking — progress save failure doesn't break the flow
    }
  }, [lesson.phraseId, lesson.learnerId, saved]);

  const analyse = useCallback(async (blob: Blob) => {
    setStatus("processing");
    try {
      const file     = new File([blob], "recall.webm", { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio",  file);
      formData.append("prompt", phrase.maori);

      const txRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!txRes.ok) throw new Error("Transcription failed");
      const { transcript } = await txRes.json() as { transcript: string };

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
      await saveProgress(result.score);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [phrase, lesson.level, saveProgress]);

  // When recording stops (blob appears) → trigger analysis
  // Must be in useEffect to avoid React render-phase side-effect violations
  useEffect(() => {
    if (!recording && audioBlob && status === "recording") {
      analyse(audioBlob);
    }
  }, [audioBlob, recording, analyse]);

  const scoreColour = !feedback ? "#04342C"
    : feedback.score >= 0.7 ? "#2D7A4F"
    : feedback.score >= 0.4 ? "#C8A951"
    : "#E07B39";

  const scoreLabel = !feedback ? ""
    : feedback.score >= 0.7 ? "Ka pai rawa atu! Excellent!"
    : feedback.score >= 0.4 ? "Ka pai! Good effort!"
    : "Kia kaha! Keep trying!";

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="font-heading text-2xl text-primary">Recall Challenge</p>
        <p className="font-body text-ink/60 text-sm">
          Look at the scene and say the phrase in te reo Māori.
        </p>
      </div>

      {/* Scenario image — English audio cue */}
      <div className="w-full aspect-video rounded-3xl bg-primary flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Decorative pattern */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#C8A951" strokeWidth="24" />
          <circle cx="100" cy="60"  r="36" fill="none" stroke="#C8A951" strokeWidth="16" />
          <circle cx="100" cy="36"  r="16" fill="none" stroke="#C8A951" strokeWidth="8"  />
        </svg>

        <span className="text-7xl z-10" aria-hidden="true">
          {(lesson.topic ?? "") === "greetings" ? "🤝" :
           (lesson.topic ?? "") === "family"    ? "👨‍👩‍👧‍👦" : "📖"}
        </span>

        <p className="font-body text-secondary/70 text-lg italic z-10">
          &ldquo;{phrase.english}&rdquo;
        </p>

        <button
          onClick={() => speak(phrase.english, "en")}
          disabled={speaking}
          className="z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-secondary text-sm font-body rounded-full px-4 py-2 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          {speaking ? "Playing…" : "Hear in English"}
        </button>
      </div>

      {/* Record button */}
      {status !== "done" && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleRecord}
            disabled={status === "processing"}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95
              ${recording
                ? "bg-warning ring-4 ring-warning/30 animate-pulse"
                : status === "processing"
                  ? "bg-gray-300 cursor-wait"
                  : "bg-accent hover:opacity-90"
              }
            `}
            aria-label={recording ? "Stop recording" : "Say it in te reo"}
          >
            {status === "processing" ? (
              <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
            ) : recording ? (
              <span className="w-6 h-6 rounded bg-ink block" />
            ) : (
              <svg className="w-8 h-8 text-ink" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>

          <p className="font-body text-ink/60 text-sm">
            {recording   ? "Recording… tap to stop"
             : status === "processing" ? "Analysing…"
             : "Tap to say it in te reo"}
          </p>
          {recording && <Waveform />}
        </div>
      )}

      {/* Results */}
      {status === "done" && feedback && (
        <div className="w-full space-y-5 animate-in fade-in duration-500">
          {/* Score banner */}
          <div
            className="w-full rounded-3xl p-6 text-center space-y-2"
            style={{ background: `${scoreColour}15`, border: `2px solid ${scoreColour}40` }}
          >
            <p className="font-heading text-5xl" style={{ color: scoreColour }}>
              {Math.round(feedback.score * 100)}%
            </p>
            <p className="font-heading text-xl" style={{ color: scoreColour }}>
              {scoreLabel}
            </p>
            <p className="font-body text-ink/70 text-sm leading-relaxed">
              {feedback.feedback}
            </p>
          </div>

          {/* Corrections */}
          {feedback.corrections.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                To improve
              </p>
              {feedback.corrections.map((c, i) => (
                <p key={i} className="flex items-start gap-2 text-sm font-body text-ink/70">
                  <span className="text-accent">→</span> {c}
                </p>
              ))}
            </div>
          )}

          {/* Phrase reveal */}
          <div className="w-full bg-primary/5 rounded-2xl p-5 text-center space-y-1">
            <p className="font-body text-xs text-primary/50 uppercase tracking-wider">
              The phrase was
            </p>
            <p className="font-heading text-2xl text-primary" lang="mi">
              {phrase.maori}
            </p>
            <p className="font-body text-ink/60 text-sm">{phrase.english}</p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full btn-accent"
          >
            Finish lesson 🎉
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="w-full btn-secondary"
          >
            Practice another phrase →
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
