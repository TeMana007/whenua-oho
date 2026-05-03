"use client";

import { useState } from "react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { NameStep } from "./steps/NameStep";
import { LevelStep } from "./steps/LevelStep";
import { ClassCodeStep } from "./steps/ClassCodeStep";
import { VoiceStep } from "./steps/VoiceStep";
import { completeOnboarding } from "./actions";

export type Level = "beginner" | "intermediate" | "advanced";

export interface OnboardingData {
  name: string;
  level: Level | null;
  classCode: string | null;
}

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    level: null,
    classCode: null,
  });

  const advance = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setStep((s) => s + 1);
  };

  const finish = async (patch: Partial<OnboardingData>) => {
    const final = { ...data, ...patch };
    await completeOnboarding({
      name: final.name,
      level: final.level ?? "beginner",
      classCode: final.classCode,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Progress dots — hidden on welcome screen */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? "w-6 bg-accent" : i === step ? "w-4 bg-accent/60" : "w-4 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}

      {step === 0 && <WelcomeStep onNext={() => advance({})} />}
      {step === 1 && <NameStep onNext={(name) => advance({ name })} />}
      {step === 2 && (
        <LevelStep onNext={(level) => advance({ level })} />
      )}
      {step === 3 && (
        <ClassCodeStep
          onNext={(classCode) => advance({ classCode })}
          onSkip={() => advance({ classCode: null })}
        />
      )}
      {step === 4 && (
        <VoiceStep
          name={data.name}
          level={data.level ?? "beginner"}
          onFinish={() => finish({})}
        />
      )}
    </div>
  );
}
