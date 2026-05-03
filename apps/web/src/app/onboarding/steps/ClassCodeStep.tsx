"use client";

import { useState, useTransition } from "react";
import { lookupClassCode } from "../actions";

interface ClassMeta {
  class_code: string;
  kaiako_name: string;
  week_number: number;
  current_theme: string | null;
}

export function ClassCodeStep({
  onNext,
  onSkip,
}: {
  onNext: (classCode: string) => void;
  onSkip: () => void;
}) {
  const [code, setCode] = useState("");
  const [classMeta, setClassMeta] = useState<ClassMeta | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lookup = () => {
    if (!code.trim()) return;
    setNotFound(false);
    setClassMeta(null);
    startTransition(async () => {
      const result = await lookupClassCode(code);
      if (result) {
        setClassMeta(result);
      } else {
        setNotFound(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Heading */}
        <div className="text-center">
          <div className="text-5xl mb-4">🏫</div>
          <h2 className="font-heading text-4xl font-bold text-primary">
            He akomanga tōu?
          </h2>
          <p className="mt-2 font-body text-ink/60">
            Do you have a class? Enter the code your kaiako gave you.
          </p>
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setClassMeta(null);
              setNotFound(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="e.g. MAORI101"
            maxLength={20}
            className="input-field flex-1 text-center uppercase tracking-widest text-lg font-body-bold"
          />
          <button
            onClick={lookup}
            disabled={!code.trim() || isPending}
            className="btn-primary px-5 h-14 disabled:opacity-40 flex-shrink-0"
          >
            {isPending ? "…" : "Find"}
          </button>
        </div>

        {/* Error */}
        {notFound && (
          <div className="rounded-2xl bg-warning/10 border border-warning/30 px-4 py-3 text-sm font-body text-warning text-center">
            Kāo — that code wasn't found. Check with your kaiako.
          </div>
        )}

        {/* Class found */}
        {classMeta && (
          <div className="rounded-3xl bg-primary/5 border-2 border-primary p-5 space-y-1">
            <p className="font-body text-xs text-ink/40 uppercase tracking-wide">Class found!</p>
            <p className="font-heading text-xl font-bold text-primary">
              {classMeta.class_code}
            </p>
            <p className="font-body text-sm text-ink/70">
              Kaiako: <span className="font-medium text-ink">{classMeta.kaiako_name}</span>
            </p>
            <p className="font-body text-sm text-ink/70">
              Week {classMeta.week_number}
              {classMeta.current_theme ? ` · ${classMeta.current_theme}` : ""}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => classMeta && onNext(classMeta.class_code)}
            disabled={!classMeta}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Āe, tōku akomanga tēnei — Join class
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 font-body text-sm text-ink/50 hover:text-ink/80 transition text-center"
          >
            Tāpui — Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
