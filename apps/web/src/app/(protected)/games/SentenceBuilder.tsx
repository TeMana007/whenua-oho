"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeech } from "@/app/(protected)/practice/hooks/useSpeech";

const SENTENCES = [
  { words: ["Ko", "Aroha", "tōku", "ingoa"],    english: "My name is Aroha" },
  { words: ["Nō", "Tāmaki", "ahau"],            english: "I am from Auckland" },
  { words: ["He", "kaiako", "ahau"],             english: "I am a teacher" },
  { words: ["Kei", "Ōtautahi", "ahau", "e", "noho", "ana"], english: "I live in Christchurch" },
  { words: ["Ko", "Taranaki", "tōku", "maunga"], english: "My mountain is Taranaki" },
];

interface Tile { id: string; word: string }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function SentenceBuilder() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [available,   setAvailable]   = useState<Tile[]>([]);
  const [placed,      setPlaced]      = useState<Tile[]>([]);
  const [correct,     setCorrect]     = useState(false);
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);
  const dragId = useRef<string | null>(null);
  const dragFrom = useRef<"available" | "placed" | null>(null);
  const { speak } = useSpeech();

  const loadSentence = useCallback((idx: number) => {
    const tiles: Tile[] = SENTENCES[idx].words.map((w, i) => ({ id: `${i}-${w}`, word: w }));
    setAvailable(shuffle(tiles));
    setPlaced([]);
    setCorrect(false);
  }, []);

  useEffect(() => { loadSentence(sentenceIdx); }, [sentenceIdx, loadSentence]);

  // Check correctness
  useEffect(() => {
    const target = SENTENCES[sentenceIdx].words;
    const built  = placed.map((t) => t.word);
    if (built.length === target.length && built.every((w, i) => w === target[i])) {
      setCorrect(true);
      setScore((s) => s + 1);
      speak(target.join(" "));
    }
  }, [placed, sentenceIdx, speak]);

  const next = () => {
    if (sentenceIdx + 1 >= SENTENCES.length) { setDone(true); return; }
    setSentenceIdx((i) => i + 1);
  };

  /* ── Drag handlers ── */
  const onDragStart = (e: React.DragEvent, id: string, from: "available" | "placed") => {
    dragId.current   = id;
    dragFrom.current = from;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropToPlaced = (e: React.DragEvent) => {
    e.preventDefault();
    const id   = dragId.current!;
    const from = dragFrom.current!;
    if (from === "available") {
      const tile = available.find((t) => t.id === id)!;
      setAvailable((a) => a.filter((t) => t.id !== id));
      setPlaced((p) => [...p, tile]);
    }
  };

  const onDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    const id   = dragId.current!;
    const from = dragFrom.current!;
    if (from === "placed") {
      const tile = placed.find((t) => t.id === id)!;
      setPlaced((p) => p.filter((t) => t.id !== id));
      setAvailable((a) => [...a, tile]);
    }
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <span className="text-6xl">🏆</span>
        <h3 className="font-heading text-2xl text-primary">Ka rawe!</h3>
        <p className="font-body text-ink/60">You scored {score}/{SENTENCES.length} sentences.</p>
        <button onClick={() => { setSentenceIdx(0); setScore(0); setDone(false); }} className="btn-primary">
          Play again
        </button>
      </div>
    );
  }

  const sentence = SENTENCES[sentenceIdx];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="font-body text-xs text-ink/40 uppercase tracking-widest">Build the sentence</p>
        <p className="font-heading text-lg text-primary">&ldquo;{sentence.english}&rdquo;</p>
        <p className="font-body text-xs text-ink/30">{sentenceIdx + 1} / {SENTENCES.length}</p>
      </div>

      {/* Drop zone — built sentence */}
      <div
        onDrop={onDropToPlaced}
        onDragOver={onDragOver}
        className={`
          min-h-[72px] w-full rounded-2xl border-2 border-dashed p-3
          flex flex-wrap gap-2 items-center justify-center transition-all
          ${correct
            ? "border-success bg-success/10"
            : placed.length === 0
              ? "border-gray-200 bg-gray-50"
              : "border-primary/40 bg-primary/5"
          }
        `}
      >
        {placed.length === 0 && !correct && (
          <p className="font-body text-xs text-ink/30">Drag words here to build the sentence</p>
        )}
        {placed.map((tile) => (
          <div
            key={tile.id}
            draggable
            onDragStart={(e) => onDragStart(e, tile.id, "placed")}
            className={`
              px-4 py-2 rounded-xl font-body font-bold text-sm cursor-grab active:cursor-grabbing select-none
              transition-all hover:shadow-md
              ${correct ? "bg-success text-white" : "bg-primary text-secondary"}
            `}
            lang="mi"
          >
            {tile.word}
          </div>
        ))}
        {correct && (
          <span className="text-success font-body font-bold text-sm ml-2">✓ Tino pai!</span>
        )}
      </div>

      {/* Available tiles */}
      <div
        onDrop={onDropToAvailable}
        onDragOver={onDragOver}
        className="min-h-[64px] w-full flex flex-wrap gap-2 justify-center p-2"
      >
        {available.map((tile) => (
          <div
            key={tile.id}
            draggable
            onDragStart={(e) => onDragStart(e, tile.id, "available")}
            className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 font-body font-bold text-sm text-ink cursor-grab active:cursor-grabbing select-none hover:border-primary/40 hover:shadow-sm transition-all"
            lang="mi"
          >
            {tile.word}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => loadSentence(sentenceIdx)}
          className="flex-1 btn-secondary text-sm"
        >
          Reset
        </button>
        {correct && (
          <button onClick={next} className="flex-1 btn-primary">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
