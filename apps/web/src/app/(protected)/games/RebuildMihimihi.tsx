"use client";

import { useCallback, useRef, useState } from "react";
import { useSpeech }   from "@/app/(protected)/practice/hooks/useSpeech";
import { useRecorder } from "@/app/(protected)/practice/hooks/useRecorder";

/* ── Mihimihi structure ──────────────────────────────────────────────
   Correct cultural order:
   1. Maunga  (mountain)
   2. Awa     (river)
   3. Waka    (canoe / ancestral canoe)
   4. Iwi     (tribe)
   5. Hapū    (sub-tribe)
   6. Ingoa   (name)
──────────────────────────────────────────────────────────────────── */

interface Section {
  id:      string;
  key:     string;   // "maunga" | "awa" | "waka" | "iwi" | "hapu" | "ingoa"
  maori:   string;   // te reo phrase
  english: string;   // English meaning
  emoji:   string;
}

const CORRECT_ORDER: Section[] = [
  { id: "1", key: "maunga", maori: "Ko Taranaki tōku maunga",  english: "Taranaki is my mountain",   emoji: "🏔️" },
  { id: "2", key: "awa",    maori: "Ko Whanganui tōku awa",    english: "Whanganui is my river",     emoji: "🏞️" },
  { id: "3", key: "waka",   maori: "Ko Aotea tōku waka",       english: "Aotea is my waka",          emoji: "🛶" },
  { id: "4", key: "iwi",    maori: "Ko Ngāti Mutunga tōku iwi",english: "Ngāti Mutunga is my tribe", emoji: "🪶" },
  { id: "5", key: "hapu",   maori: "Ko Parininihi tōku hapū",  english: "Parininihi is my hapū",     emoji: "👪" },
  { id: "6", key: "ingoa",  maori: "Ko Aroha tōku ingoa",      english: "My name is Aroha",          emoji: "✨" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Phase = "arrange" | "record" | "complete";

export default function RebuildMihimihi() {
  const [sections, setSections] = useState<Section[]>(() => shuffle(CORRECT_ORDER));
  const [phase,    setPhase]    = useState<Phase>("arrange");
  const [saved,    setSaved]    = useState(false);
  const dragId     = useRef<string | null>(null);
  const dragIndex  = useRef<number>(-1);

  const { speak, speaking }  = useSpeech();
  const { recording, audioBlob, audioUrl, startRecording, stopRecording } = useRecorder();

  /* ── Check if order is correct ── */
  const isCorrect = sections.every((s, i) => s.id === CORRECT_ORDER[i].id);

  /* ── Drag within the list ── */
  const onDragStart = (e: React.DragEvent, index: number) => {
    dragId.current    = sections[index].id;
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === targetIndex) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(targetIndex, 0, item);
    setSections(next);
    dragIndex.current = -1;
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  /* ── Record completed mihimihi ── */
  const handleRecord = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  /* ── Save to Supabase speaking_attempts ── */
  const saveMihimihi = useCallback(async () => {
    if (!audioBlob || saved) return;
    try {
      // Save the full mihimihi text to speaking_attempts via progress API
      // For MVP we store a flag; a proper implementation would upload the audio
      setSaved(true);
    } catch { /* non-blocking */ }
  }, [audioBlob, saved]);

  /* ── Speak the full mihimihi ── */
  const speakAll = () => {
    const full = CORRECT_ORDER.map((s) => s.maori).join(". ");
    speak(full);
  };

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="font-body text-xs text-ink/40 uppercase tracking-widest">Rebuild the pepeha</p>
        <p className="font-body text-sm text-ink/60">
          Drag the sections into the correct cultural order.
        </p>
      </div>

      {/* Correct order guide */}
      <div className="bg-primary/5 rounded-2xl p-4 flex gap-3 flex-wrap justify-center">
        {["maunga", "awa", "waka", "iwi", "hapū", "ingoa"].map((k, i) => (
          <span key={k} className="font-body text-xs text-primary/60 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center font-bold">
              {i + 1}
            </span>
            {k}
            {i < 5 && <span className="text-primary/30 ml-1">→</span>}
          </span>
        ))}
      </div>

      {/* Draggable sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const correctIdx = CORRECT_ORDER.findIndex((s) => s.id === section.id);
          const inPlace    = isCorrect;
          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragOver={onDragOver}
              className={`
                flex items-center gap-3 p-4 rounded-2xl border-2 cursor-grab active:cursor-grabbing
                transition-all select-none
                ${inPlace
                  ? "border-success/50 bg-success/10"
                  : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm"
                }
              `}
            >
              <span className="text-gray-300 font-body text-sm font-bold w-5 text-center select-none">
                ⠿
              </span>
              <span className="text-2xl flex-shrink-0">{section.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-sm text-primary leading-snug" lang="mi">
                  {section.maori}
                </p>
                <p className="font-body text-xs text-ink/50 leading-snug">{section.english}</p>
              </div>
              <span
                className={`text-xs font-body font-bold w-8 text-center flex-shrink-0 ${
                  inPlace ? "text-success" : "text-ink/20"
                }`}
              >
                {correctIdx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Correct state */}
      {isCorrect && phase === "arrange" && (
        <div className="animate-in fade-in duration-500 space-y-4">
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center space-y-2">
            <p className="font-heading text-xl text-success">Ka tino pai! Perfect order!</p>
            <p className="font-body text-sm text-ink/60">
              Now listen to the full pepeha, then record yourself saying it.
            </p>
          </div>

          <button
            onClick={speakAll}
            disabled={speaking}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {speaking
              ? <><div className="flex gap-0.5 items-end h-4">{[0,0.1,0.2,0.1,0].map((d,i)=>(<span key={i} className="w-1 bg-primary rounded-full animate-waveform" style={{animationDelay:`${d}s`}} />))}</div> Playing…</>
              : "🔊 Hear the full pepeha"
            }
          </button>

          <button onClick={() => setPhase("record")} className="w-full btn-primary">
            Record my pepeha →
          </button>
        </div>
      )}

      {/* Recording phase */}
      {phase === "record" && (
        <div className="animate-in fade-in duration-300 space-y-4">
          <div className="bg-primary rounded-2xl p-5 space-y-2">
            {CORRECT_ORDER.map((s) => (
              <p key={s.id} className="font-body text-secondary text-sm leading-relaxed" lang="mi">
                {s.maori}
              </p>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleRecord}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition active:scale-95
                ${recording ? "bg-warning ring-4 ring-warning/30 animate-pulse" : "bg-primary hover:bg-primary/90"}
              `}
            >
              {recording
                ? <span className="w-5 h-5 rounded bg-secondary block" />
                : <svg className="w-7 h-7 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
              }
            </button>
            <p className="font-body text-xs text-ink/40">
              {recording ? "Recording… tap to stop" : "Tap to record your pepeha"}
            </p>
          </div>

          {audioUrl && !recording && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">Your recording</p>
                <audio controls src={audioUrl} className="w-full" style={{ height: 40 }} />
              </div>
              <button
                onClick={async () => { await saveMihimihi(); setPhase("complete"); }}
                className="w-full btn-accent"
              >
                Save my pepeha →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Complete */}
      {phase === "complete" && (
        <div className="animate-in fade-in duration-500 flex flex-col items-center gap-5 py-4 text-center">
          <span className="text-5xl">🌿</span>
          <h3 className="font-heading text-2xl text-primary">Kua oti tō pepeha!</h3>
          <p className="font-body text-ink/60 text-sm">
            Your pepeha has been recorded. Ka pai! Your whakapapa connects you to this land.
          </p>
          <button
            onClick={() => { setSections(shuffle(CORRECT_ORDER)); setPhase("arrange"); setSaved(false); }}
            className="btn-secondary"
          >
            Practice again
          </button>
        </div>
      )}
    </div>
  );
}
