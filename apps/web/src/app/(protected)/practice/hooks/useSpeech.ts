"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Thin wrapper around the Web Speech API (speechSynthesis).
 * Provides speak() and cancel() with a `speaking` status flag.
 *
 * speak(text)                  — plays at 0.82× in te reo Māori
 * speak(text, 0.55)            — plays at custom rate (number)
 * speak(text, "en-NZ")         — plays with a different language tag
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, langOrRate?: string | number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    // Cancel any in-progress speech first
    window.speechSynthesis.cancel();

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = typeof langOrRate === "string" ? langOrRate : "mi";
    utterance.rate   = typeof langOrRate === "number"  ? langOrRate : 0.82;
    utterance.pitch  = 1;
    utterance.volume = 1;

    utterance.onstart  = () => setSpeaking(true);
    utterance.onend    = () => setSpeaking(false);
    utterance.onerror  = () => setSpeaking(false);
    utterance.onpause  = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, speaking, cancel };
}
