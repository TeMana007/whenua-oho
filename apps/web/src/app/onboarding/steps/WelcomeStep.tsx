"use client";

import { useEffect, useState } from "react";

/** Inline web-only koru spinner — avoids importing React Native UI package. */
function KoruSpinner({ size = 48, color = "#04342C" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Loading…"
      role="status"
      style={{ animation: "koru-spin 1.5s linear infinite", display: "inline-block" }}
    >
      <path
        d="M 50 8 C 74 8 92 28 92 52 C 92 76 74 92 50 92 C 28 92 10 76 10 58 C 10 42 24 30 42 30"
        stroke={color} strokeWidth="5" strokeLinecap="round" fill="none"
      />
      <path
        d="M 42 30 C 54 30 64 40 64 52 C 64 62 56 68 47 65"
        stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75"
      />
      <path
        d="M 47 65 C 39 62 34 54 37 47 C 39 42 46 40 51 44"
        stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"
      />
      <style>{`
        @keyframes koru-spin {
          from { transform: rotate(0deg);   transform-origin: 50px 50px; }
          to   { transform: rotate(360deg); transform-origin: 50px 50px; }
        }
      `}</style>
    </svg>
  );
}

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const [koruVisible, setKoruVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [btnVisible,  setBtnVisible]  = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setKoruVisible(true), 120);
    const t2 = setTimeout(() => setTextVisible(true), 900);
    const t3 = setTimeout(() => setBtnVisible(true),  1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 gap-10">
      {/* Koru */}
      <div
        className="transition-opacity duration-1000"
        style={{ opacity: koruVisible ? 1 : 0 }}
      >
        <KoruSpinner size={120} color="#C8A951" />
      </div>

      {/* Text */}
      <div
        className="text-center transition-opacity duration-700"
        style={{ opacity: textVisible ? 1 : 0 }}
      >
        <h1 className="font-heading text-5xl font-bold text-secondary leading-tight tracking-tight">
          Nau mai,<br />haere mai
        </h1>
        <p className="mt-4 font-body text-secondary/70 text-lg">
          Ko tō ao ako tēnei
        </p>
        <p className="mt-1 font-body text-secondary/40 text-sm">
          This is your learning world
        </p>
      </div>

      {/* Button */}
      <div
        className="transition-opacity duration-500 w-full max-w-xs"
        style={{ opacity: btnVisible ? 1 : 0 }}
      >
        <button
          onClick={onNext}
          className="btn-accent w-full text-lg tracking-wide"
        >
          Tīmata — Begin
        </button>
      </div>
    </div>
  );
}
