"use client";

import { useEffect, useState } from "react";
import { useSpeech }   from "../hooks/useSpeech";
import { useRecorder } from "../hooks/useRecorder";
import type { LessonData } from "../LessonFlow";

interface Props {
  lesson: LessonData;
  onNext: () => void;
}

function Waveform() {
  return (
    <div className="flex items-end gap-1 h-12" aria-hidden="true">
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

export default function RepeatStep({ lesson, onNext }: Props) {
  const { phrase } = lesson;
  const { speak, speaking }                            = useSpeech();
  const { recording, audioUrl, startRecording, stopRecording } = useRecorder();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => speak(phrase.maori), 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track when a recording completes
  useEffect(() => {
    if (audioUrl && !recording) setHasRecorded(true);
  }, [audioUrl, recording]);

  const handleRecord = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Capture the model voice as a data URL so users can compare
  // (Web Speech API doesn't produce a blob; we use the phrase text as a model reference)
  const playModel = () => speak(phrase.maori);

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      {/* Phrase to repeat */}
      <div className="w-full bg-primary rounded-3xl p-8 text-center space-y-3 shadow-lg">
        <p className="font-body text-secondary/60 text-xs uppercase tracking-widest">
          Repeat after me
        </p>
        <p className="font-heading text-4xl leading-tight text-secondary" lang="mi">
          {phrase.maori}
        </p>
        <p className="font-body text-secondary/70 text-lg">
          {phrase.english}
        </p>
      </div>

      {/* Model audio */}
      <button
        onClick={playModel}
        disabled={speaking}
        className="flex items-center gap-2 btn-secondary w-full justify-center"
      >
        {speaking ? (
          <Waveform />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            Hear model pronunciation
          </>
        )}
      </button>

      {/* Record button */}
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="font-body text-ink/60 text-sm">
          {recording ? "Recording… tap to stop" : hasRecorded ? "Record again?" : "Now you try"}
        </p>

        <button
          onClick={handleRecord}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            shadow-lg transition-all active:scale-95
            ${recording
              ? "bg-warning ring-4 ring-warning/30 animate-pulse"
              : "bg-primary hover:bg-primary/90"
            }
          `}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? (
            <span className="w-6 h-6 rounded bg-secondary block" />
          ) : (
            <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        {recording && <Waveform />}
      </div>

      {/* Side-by-side comparison after recording */}
      {hasRecorded && audioUrl && (
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <p className="font-body text-xs text-ink/50 uppercase tracking-wider text-center">
            Compare your recording
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Model */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-body text-ink/40 uppercase tracking-wide">Model</span>
              <button
                onClick={playModel}
                disabled={speaking}
                className="w-full btn-secondary text-sm py-2 h-auto min-h-0 px-3"
              >
                {speaking ? "▶ Playing…" : "▶ Model"}
              </button>
            </div>
            {/* You */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-body text-ink/40 uppercase tracking-wide">You</span>
              <audio
                controls
                src={audioUrl}
                className="w-full h-8"
                style={{ height: "38px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Continue */}
      <button
        onClick={onNext}
        disabled={!hasRecorded}
        className="w-full btn-primary disabled:opacity-40"
      >
        {hasRecorded ? "Continue →" : "Record to continue"}
      </button>
    </div>
  );
}
