"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeech }   from "@/app/(protected)/practice/hooks/useSpeech";
import { useRecorder } from "@/app/(protected)/practice/hooks/useRecorder";

/* ── Types ──────────────────────────────────────────────────────────── */

interface Message {
  role:    "user" | "assistant";
  content: string;
  isVoice?: boolean;
}

interface Scenario {
  id:          string; // goes into system prompt
  label:       string;
  emoji:       string;
  description: string;
  colour:      string;
}

/* ── Constants ──────────────────────────────────────────────────────── */

const SCENARIOS: Scenario[] = [
  { id: "a te marae — a traditional Māori meeting ground where formal protocol applies",  label: "Marae",  emoji: "🏛️", description: "Traditional meeting ground", colour: "#04342C" },
  { id: "i te mahi — in a friendly New Zealand workplace",                                label: "Mahi",   emoji: "💼", description: "Workplace",              colour: "#2D7A4F" },
  { id: "i roto i tō whānau — at a warm family gathering",                               label: "Whānau", emoji: "👨‍👩‍👧‍👦", description: "Family gathering",       colour: "#C8A951" },
  { id: "i te kāfe — at a relaxed local café",                                           label: "Café",   emoji: "☕", description: "Coffee shop",             colour: "#E07B39" },
];

const EXCHANGES_TO_COMPLETE = 4;

/* ── Hint parser ────────────────────────────────────────────────────── */

function parseHint(text: string): { clean: string; hint: string | null } {
  const match = text.match(/\[Hint:\s*(.+?)\]/i);
  if (!match) return { clean: text, hint: null };
  return { clean: text.replace(match[0], "").trim(), hint: match[1].trim() };
}

/* ── Waveform ───────────────────────────────────────────────────────── */

function Waveform({ colour = "#C8A951" }: { colour?: string }) {
  return (
    <div className="flex items-end gap-0.5 h-8" aria-hidden="true">
      {[0, 0.08, 0.16, 0.08, 0, 0.08, 0.16, 0.08, 0].map((delay, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full animate-waveform"
          style={{ animationDelay: `${delay}s`, backgroundColor: colour }}
        />
      ))}
    </div>
  );
}

/* ── Typing indicator ───────────────────────────────────────────────── */

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <span className="text-xl flex-shrink-0">🌿</span>
      <div className="bg-primary rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 0.2, 0.4].map((d, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-secondary/60 animate-bounce"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Chat bubble ────────────────────────────────────────────────────── */

function ChatBubble({
  message,
  onPlay,
  showHint,
}: {
  message:  Message;
  onPlay?:  (text: string) => void;
  showHint: boolean;
}) {
  const isAI     = message.role === "assistant";
  const { clean, hint } = parseHint(message.content);

  return (
    <div className={`flex items-end gap-2 mb-4 ${isAI ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      {isAI && <span className="text-xl flex-shrink-0 mb-1">🌿</span>}

      <div className={`max-w-[75%] space-y-1.5 ${isAI ? "" : "items-end flex flex-col"}`}>
        {/* Bubble */}
        <div
          className={`
            px-4 py-3 text-sm font-body leading-relaxed
            ${isAI
              ? "bg-primary text-secondary rounded-2xl rounded-bl-sm"
              : "bg-accent text-ink rounded-2xl rounded-br-sm"
            }
          `}
        >
          <span lang={isAI ? "mi" : undefined}>{clean}</span>
        </div>

        {/* Hint pill */}
        {isAI && hint && showHint && (
          <div className="bg-accent/20 border border-accent/40 rounded-xl px-3 py-1.5 text-xs font-body text-ink/70 max-w-full">
            <span className="font-bold text-ink/50 mr-1">💡 Hint:</span>
            {hint}
          </div>
        )}

        {/* AI controls */}
        {isAI && onPlay && (
          <button
            onClick={() => onPlay(clean)}
            className="text-xs text-primary/50 hover:text-primary transition flex items-center gap-1 font-body ml-1"
            aria-label="Play this message"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Replay
          </button>
        )}

        {/* Voice badge */}
        {!isAI && message.isVoice && (
          <span className="text-[10px] text-ink/30 font-body mr-1">🎙 voice</span>
        )}
      </div>
    </div>
  );
}

/* ── Scenario selector ──────────────────────────────────────────────── */

function ScenarioSelector({ onSelect }: { onSelect: (s: Scenario) => void }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl text-primary">Kōrero Partner</h2>
        <p className="font-body text-ink/60 text-sm">
          Choose a scenario — Aroha will start the conversation in te reo Māori.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s)}
            className="group relative flex flex-col items-center gap-3 rounded-3xl p-6 border-2 border-gray-100 bg-white hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.97] text-left"
          >
            <span className="text-4xl">{s.emoji}</span>
            <div>
              <p className="font-heading text-lg text-primary text-center">{s.label}</p>
              <p className="font-body text-xs text-ink/50 text-center">{s.description}</p>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: s.colour }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Completion screen ──────────────────────────────────────────────── */

function CompletionScreen({
  voiceCount,
  onRestart,
}: {
  voiceCount: number;
  onRestart:  () => void;
}) {
  // 4 dots for completing all exchanges, 5th bonus dot for using voice ≥ 3 times
  const filledDots = EXCHANGES_TO_COMPLETE + (voiceCount >= 3 ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-8 py-8 animate-in fade-in duration-700">
      <span className="text-6xl">🎉</span>

      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl text-primary">Ka pai!</h2>
        <p className="font-body text-ink/70">
          You completed a kōrero. Keep practising and your confidence will grow!
        </p>
      </div>

      {/* 5-dot confidence score */}
      <div className="space-y-2 text-center">
        <p className="font-body text-xs text-ink/40 uppercase tracking-widest">
          Confidence achieved
        </p>
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < filledDots ? "#2D7A4F" : "#E5E7EB",
                transform:       i < filledDots ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <p className="font-body text-xs text-ink/40">
          {filledDots}/5 — {voiceCount >= 3 ? "bonus dot for speaking by voice!" : "use voice for a bonus dot"}
        </p>
      </div>

      <div className="w-full space-y-3">
        <button onClick={onRestart} className="w-full btn-primary">
          Practice another scenario →
        </button>
        <a href="/dashboard" className="w-full btn-secondary block text-center leading-[54px]">
          Return to dashboard
        </a>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function KoreroPartner({
  level,
}: {
  level: string;
}) {
  const [phase,        setPhase]        = useState<"select" | "chat" | "complete">("select");
  const [scenario,     setScenario]     = useState<Scenario | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showHint,     setShowHint]     = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [voiceCount,   setVoiceCount]   = useState(0);
  const [slowerRate,   setSlowerRate]   = useState(false);

  const { speak, speaking, cancel } = useSpeech();
  const { recording, audioBlob, startRecording, stopRecording, reset } = useRecorder();

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Send a user message and get AI reply ── */
  const sendToAI = useCallback(
    async (userContent: string, isVoice = false) => {
      const userMsg: Message = { role: "user", content: userContent, isVoice };
      const nextMessages     = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setShowHint(false);

      try {
        const res = await fetch("/api/korero", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: scenario?.id ?? "",
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
            level,
          }),
        });
        if (!res.ok) throw new Error("API error");
        const { message } = (await res.json()) as { message: string };

        const aiMsg: Message = { role: "assistant", content: message };
        const withAI         = [...nextMessages, aiMsg];
        setMessages(withAI);
        setExchangeCount((c) => c + 1);
        if (isVoice) setVoiceCount((c) => c + 1);

        // Auto-play AI response
        const { clean } = parseHint(message);
        speak(clean, slowerRate ? 0.6 : undefined);

        // Completion check
        if (exchangeCount + 1 >= EXCHANGES_TO_COMPLETE) {
          setTimeout(() => setPhase("complete"), 1400);
        }
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Aroha: He hapa — connection error. Try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, scenario, level, exchangeCount, speak, slowerRate]
  );

  /* ── Start scenario — AI speaks first ── */
  const startScenario = useCallback(
    async (s: Scenario) => {
      setScenario(s);
      setMessages([]);
      setExchangeCount(0);
      setVoiceCount(0);
      setPhase("chat");
      setLoading(true);

      try {
        const res = await fetch("/api/korero", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: s.id, messages: [], level }),
        });
        const { message } = (await res.json()) as { message: string };
        setMessages([{ role: "assistant", content: message }]);
        const { clean } = parseHint(message);
        speak(clean);
      } catch {
        setMessages([
          { role: "assistant", content: "Tēnā koe! Kei te pēhea koe?" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [level, speak]
  );

  /* ── Handle voice recording ── */
  const handleMic = async () => {
    if (recording) {
      stopRecording();
    } else {
      reset();
      await startRecording();
    }
  };

  // When recording stops and we have a blob → transcribe → send
  useEffect(() => {
    if (!audioBlob || recording) return;

    (async () => {
      setLoading(true);
      try {
        const file     = new File([audioBlob], "korero.webm", { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", file);
        formData.append("prompt", "Kia ora! Ko wai tōu ingoa? Āe kāo tēnā koe.");

        const txRes = await fetch("/api/transcribe", { method: "POST", body: formData });
        if (!txRes.ok) throw new Error("Transcription failed");
        const { transcript } = (await txRes.json()) as { transcript: string };

        setLoading(false);
        if (transcript.trim()) {
          await sendToAI(transcript, true);
        }
      } catch {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  /* ── Replay last AI message slower ── */
  const replaySlowly = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    cancel();
    const { clean } = parseHint(last.content);
    speak(clean, 0.55);
    setSlowerRate(true);
  };

  /* ── Helpers: does last AI message have a hint? ── */
  const lastAiMsg   = [...messages].reverse().find((m) => m.role === "assistant");
  const lastHintObj = lastAiMsg ? parseHint(lastAiMsg.content) : null;
  const hasHint     = !!lastHintObj?.hint;

  /* ── Render ── */
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {phase === "select" && (
        <div className="flex-1 overflow-y-auto py-2">
          <ScenarioSelector onSelect={startScenario} />
        </div>
      )}

      {phase === "complete" && (
        <div className="flex-1 overflow-y-auto py-2">
          <CompletionScreen
            voiceCount={voiceCount}
            onRestart={() => {
              setPhase("select");
              setMessages([]);
            }}
          />
        </div>
      )}

      {phase === "chat" && (
        <>
          {/* ── Scenario badge ── */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {SCENARIOS.find((s) => s.id === scenario?.id)?.emoji}
              </span>
              <div>
                <p className="font-body font-bold text-sm text-primary leading-none">
                  {scenario?.label}
                </p>
                <p className="font-body text-xs text-ink/40">{scenario?.description}</p>
              </div>
            </div>

            {/* Exchange progress */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: EXCHANGES_TO_COMPLETE }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < exchangeCount ? "bg-success scale-110" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Chat messages ── */}
          <div className="flex-1 overflow-y-auto py-4 space-y-0 pr-1">
            {messages.map((m, i) => (
              <ChatBubble
                key={i}
                message={m}
                showHint={showHint}
                onPlay={
                  m.role === "assistant"
                    ? (text) => speak(text, slowerRate ? 0.6 : undefined)
                    : undefined
                }
              />
            ))}
            {loading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          {/* ── Helper buttons ── */}
          <div className="flex gap-2 py-2 flex-shrink-0">
            <button
              onClick={() => setShowHint((h) => !h)}
              disabled={!hasHint}
              className={`
                flex-1 flex items-center justify-center gap-1 rounded-xl py-2
                text-xs font-body font-bold transition-all
                ${hasHint
                  ? showHint
                    ? "bg-accent/20 text-ink border border-accent"
                    : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                  : "bg-gray-50 text-ink/25 cursor-not-allowed"
                }
              `}
            >
              💡 {showHint ? "Hide hint" : "Show English hint"}
            </button>

            <button
              onClick={replaySlowly}
              disabled={!lastAiMsg || speaking || loading}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl py-2 bg-gray-100 text-ink/60 hover:bg-gray-200 text-xs font-body font-bold transition disabled:opacity-30"
            >
              🐢 Replay slowly
            </button>

            <button
              onClick={() => {
                cancel();
                setPhase("select");
                setMessages([]);
                setExchangeCount(0);
                setVoiceCount(0);
                setShowHint(false);
                setSlowerRate(false);
              }}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl py-2 bg-gray-100 text-ink/60 hover:bg-gray-200 text-xs font-body font-bold transition"
            >
              🔄 Start over
            </button>
          </div>

          {/* ── Input area ── */}
          <div className="py-3 border-t border-gray-100 flex-shrink-0 space-y-3">
            {/* Mic button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleMic}
                disabled={loading}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  shadow-lg transition-all active:scale-95
                  ${recording
                    ? "bg-warning ring-4 ring-warning/30 animate-pulse"
                    : loading
                      ? "bg-gray-300 cursor-wait"
                      : "bg-primary hover:bg-primary/90"
                  }
                `}
                aria-label={recording ? "Stop recording" : "Speak your response"}
              >
                {loading ? (
                  <svg className="w-7 h-7 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
                  </svg>
                ) : recording ? (
                  <span className="w-5 h-5 rounded bg-secondary block" />
                ) : (
                  <svg className="w-7 h-7 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </button>

              {recording && <Waveform />}

              <p className="font-body text-xs text-ink/40">
                {recording ? "Recording… tap to send"
                  : loading  ? "Aroha is thinking…"
                  : "Tap to speak"}
              </p>
            </div>

            {/* Text fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !loading) sendToAI(input.trim(), false);
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Or type in te reo…"
                disabled={loading || recording}
                className="input-field flex-1 text-sm py-2 h-10"
                lang="mi"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || recording}
                className="h-10 px-4 rounded-xl bg-primary text-secondary font-body text-sm font-bold disabled:opacity-30 transition"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
