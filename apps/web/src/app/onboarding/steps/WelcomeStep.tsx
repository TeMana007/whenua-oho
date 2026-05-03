"use client";

import { useEffect, useState } from "react";
import { KoruSpinner } from "@korero/ui";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const [koruVisible, setKoruVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setKoruVisible(true), 120);
    const t2 = setTimeout(() => setTextVisible(true), 900);
    const t3 = setTimeout(() => setBtnVisible(true), 1600);
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
