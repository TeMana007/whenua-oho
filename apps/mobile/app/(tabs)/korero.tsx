import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Audio }   from "expo-av";
import * as Speech from "expo-speech";

/* ────────────────────────────────────────────────────────────────────
   Types & constants
──────────────────────────────────────────────────────────────────── */

interface Message {
  role:    "user" | "assistant";
  content: string;
  isVoice?: boolean;
}

interface Scenario {
  id:          string;
  label:       string;
  emoji:       string;
  description: string;
  colour:      string;
}

const SCENARIOS: Scenario[] = [
  { id: "a te marae — a traditional Māori meeting ground where formal protocol applies",  label: "Marae",  emoji: "🏛️", description: "Traditional meeting ground", colour: "#04342C" },
  { id: "i te mahi — in a friendly New Zealand workplace",                                label: "Mahi",   emoji: "💼", description: "Workplace",              colour: "#2D7A4F" },
  { id: "i roto i tō whānau — at a warm family gathering",                               label: "Whānau", emoji: "👨‍👩‍👧‍👦", description: "Family gathering",       colour: "#C8A951" },
  { id: "i te kāfe — at a relaxed local café",                                           label: "Café",   emoji: "☕", description: "Coffee shop",             colour: "#E07B39" },
];

const EXCHANGES_TO_COMPLETE = 4;
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/* ────────────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────────────── */

function parseHint(text: string): { clean: string; hint: string | null } {
  const match = text.match(/\[Hint:\s*(.+?)\]/i);
  if (!match) return { clean: text, hint: null };
  return { clean: text.replace(match[0], "").trim(), hint: match[1].trim() };
}

async function callKorero(
  scenario: string,
  messages: { role: "user" | "assistant"; content: string }[],
  level: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/korero`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario, messages, level }),
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.message as string;
}

async function transcribeUri(uri: string, hint: string): Promise<string> {
  const formData = new FormData();
  formData.append("audio", { uri, name: "korero.m4a", type: "audio/m4a" } as unknown as Blob);
  formData.append("prompt", hint);
  const res = await fetch(`${API_BASE}/api/transcribe`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Transcription failed");
  const data = await res.json();
  return data.transcript as string;
}

/* ────────────────────────────────────────────────────────────────────
   Waveform
──────────────────────────────────────────────────────────────────── */

function WaveBar({ delay, colour }: { delay: number; colour: string }) {
  const anim = useRef(new Animated.Value(6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 36, duration: 280, delay, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 6,  duration: 280,         useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  return (
    <Animated.View style={{ width: 5, height: anim, borderRadius: 3, backgroundColor: colour, marginHorizontal: 2 }} />
  );
}

function Waveform({ colour = "#C8A951" }: { colour?: string }) {
  const delays = [0, 60, 120, 60, 0, 60, 120, 60, 0];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 44 }}>
      {delays.map((d, i) => <WaveBar key={i} delay={d} colour={colour} />)}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Chat bubble
──────────────────────────────────────────────────────────────────── */

function ChatBubble({
  message,
  onPlay,
  showHint,
}: {
  message:  Message;
  onPlay?:  (text: string) => void;
  showHint: boolean;
}) {
  const isAI = message.role === "assistant";
  const { clean, hint } = parseHint(message.content);

  return (
    <View style={[s.bubbleRow, isAI ? null : { flexDirection: "row-reverse" }]}>
      {isAI && <Text style={s.avatar}>🌿</Text>}
      <View style={[s.bubbleGroup, isAI ? null : { alignItems: "flex-end" }]}>
        <View style={[s.bubble, isAI ? s.bubbleAI : s.bubbleUser]}>
          <Text style={isAI ? s.bubbleTextAI : s.bubbleTextUser}>{clean}</Text>
        </View>
        {isAI && hint && showHint && (
          <View style={s.hintPill}>
            <Text style={s.hintText}><Text style={{ fontWeight: "700" }}>💡 Hint: </Text>{hint}</Text>
          </View>
        )}
        {isAI && onPlay && (
          <TouchableOpacity onPress={() => onPlay(clean)} style={s.replayBtn}>
            <Text style={s.replayText}>▶ Replay</Text>
          </TouchableOpacity>
        )}
        {!isAI && message.isVoice && (
          <Text style={s.voiceBadge}>🎙 voice</Text>
        )}
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Typing indicator
──────────────────────────────────────────────────────────────────── */

/* ── Typing dot — must be its own component so hooks aren't called inside .map() ── */
function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 400, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400,        useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  return (
    <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5F0E8", opacity: anim }} />
  );
}

function TypingBubble() {
  return (
    <View style={[s.bubbleRow]}>
      <Text style={s.avatar}>🌿</Text>
      <View style={[s.bubble, s.bubbleAI, { paddingVertical: 12, paddingHorizontal: 16 }]}>
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {[0, 200, 400].map((d, i) => (
            <TypingDot key={i} delay={d} />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Scenario selector
──────────────────────────────────────────────────────────────────── */

function ScenarioSelector({ onSelect }: { onSelect: (s: Scenario) => void }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
      <View style={{ alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Text style={s.heading}>Kōrero Partner</Text>
        <Text style={s.subtext}>Choose a scenario — Aroha will start the conversation in te reo Māori.</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {SCENARIOS.map((sc) => (
          <TouchableOpacity
            key={sc.label}
            onPress={() => onSelect(sc)}
            style={[s.scenarioCard, { borderBottomColor: sc.colour, borderBottomWidth: 3 }]}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 40 }}>{sc.emoji}</Text>
            <Text style={s.scenarioLabel}>{sc.label}</Text>
            <Text style={s.scenarioDesc}>{sc.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Completion screen
──────────────────────────────────────────────────────────────────── */

function CompletionScreen({ voiceCount, onRestart }: { voiceCount: number; onRestart: () => void }) {
  const filledDots = EXCHANGES_TO_COMPLETE + (voiceCount >= 3 ? 1 : 0);
  return (
    <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center", gap: 24 }}>
      <Text style={{ fontSize: 72 }}>🎉</Text>
      <Text style={s.heading}>Ka pai!</Text>
      <Text style={[s.subtext, { textAlign: "center" }]}>
        You completed a kōrero. Keep practising and your confidence will grow!
      </Text>
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text style={s.dotLabel}>Confidence achieved</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 20, height: 20, borderRadius: 10,
                backgroundColor: i < filledDots ? "#2D7A4F" : "#E5E7EB",
                transform: [{ scale: i < filledDots ? 1.2 : 1 }],
              }}
            />
          ))}
        </View>
        <Text style={s.dotLabel}>
          {filledDots}/5 — {voiceCount >= 3 ? "bonus dot for speaking by voice!" : "use voice for a bonus dot"}
        </Text>
      </View>
      <TouchableOpacity style={[s.btnPrimary, { width: "100%" }]} onPress={onRestart}>
        <Text style={s.btnPrimaryText}>Practice another scenario →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main screen
──────────────────────────────────────────────────────────────────── */

export default function KoreroScreen() {
  const level = "beginner";

  const [phase,         setPhase]         = useState<"select" | "chat" | "complete">("select");
  const [scenario,      setScenario]      = useState<Scenario | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showHint,      setShowHint]      = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [voiceCount,    setVoiceCount]    = useState(0);
  const [recording,     setRecording]     = useState(false);
  const [speaking,      setSpeaking]      = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollRef    = useRef<ScrollView>(null);

  const speakText = useCallback((text: string, rate = 0.82) => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: "mi", rate,
      onDone:    () => setSpeaking(false),
      onError:   () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /* ── Send message + get AI reply ── */
  const sendToAI = useCallback(async (content: string, isVoice = false) => {
    const userMsg: Message = { role: "user", content, isVoice };
    const nextMessages     = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setShowHint(false);
    scrollToBottom();

    try {
      const reply = await callKorero(
        scenario?.id ?? "",
        nextMessages.map(({ role, content: c }) => ({ role, content: c })),
        level
      );
      const aiMsg: Message = { role: "assistant", content: reply };
      const withAI = [...nextMessages, aiMsg];
      setMessages(withAI);
      setExchangeCount((c) => c + 1);
      if (isVoice) setVoiceCount((c) => c + 1);

      const { clean } = parseHint(reply);
      speakText(clean);
      scrollToBottom();

      if (exchangeCount + 1 >= EXCHANGES_TO_COMPLETE) {
        setTimeout(() => setPhase("complete"), 1500);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "He hapa — kāore e taea. Try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, scenario, level, exchangeCount, speakText]);

  /* ── Start scenario ── */
  const startScenario = useCallback(async (sc: Scenario) => {
    setScenario(sc);
    setMessages([]);
    setExchangeCount(0);
    setVoiceCount(0);
    setPhase("chat");
    setLoading(true);

    try {
      const reply = await callKorero(sc.id, [], level);
      setMessages([{ role: "assistant", content: reply }]);
      const { clean } = parseHint(reply);
      speakText(clean);
    } catch {
      setMessages([{ role: "assistant", content: "Tēnā koe! Kei te pēhea koe?" }]);
    } finally {
      setLoading(false);
    }
  }, [level, speakText]);

  /* ── Voice recording ── */
  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = rec;
    setRecording(true);
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    setRecording(false);

    if (!uri) return;
    setLoading(true);
    try {
      const transcript = await transcribeUri(uri, "Kia ora! Ko wai tōu ingoa?");
      if (transcript.trim()) await sendToAI(transcript, true);
    } catch {
      setLoading(false);
    }
  };

  const handleMic = () => {
    if (recording) stopRecording();
    else           startRecording();
  };

  /* ── Helpers ── */
  const lastAiMsg   = [...messages].reverse().find((m) => m.role === "assistant");
  const lastHintObj = lastAiMsg ? parseHint(lastAiMsg.content) : null;
  const hasHint     = !!lastHintObj?.hint;

  const replaySlowly = () => {
    if (!lastAiMsg) return;
    Speech.stop();
    const { clean } = parseHint(lastAiMsg.content);
    speakText(clean, 0.55);
  };

  /* ── Render ── */
  if (phase === "select") return <ScenarioSelector onSelect={startScenario} />;
  if (phase === "complete") {
    return (
      <CompletionScreen
        voiceCount={voiceCount}
        onRestart={() => { setPhase("select"); setMessages([]); setExchangeCount(0); }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F0E8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Scenario bar */}
      <View style={s.scenarioBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{scenario?.emoji}</Text>
          <View>
            <Text style={s.scenarioBarLabel}>{scenario?.label}</Text>
            <Text style={s.scenarioBarDesc}>{scenario?.description}</Text>
          </View>
        </View>
        {/* Progress dots */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          {Array.from({ length: EXCHANGES_TO_COMPLETE }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: i < exchangeCount ? "#2D7A4F" : "#E5E7EB",
              }}
            />
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 4 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            message={m}
            showHint={showHint}
            onPlay={m.role === "assistant" ? speakText : undefined}
          />
        ))}
        {loading && <TypingBubble />}
      </ScrollView>

      {/* Helper buttons */}
      <View style={s.helperRow}>
        <TouchableOpacity
          onPress={() => setShowHint((h) => !h)}
          disabled={!hasHint}
          style={[s.helperBtn, showHint && hasHint && { backgroundColor: "rgba(200,169,81,0.2)", borderColor: "#C8A951", borderWidth: 1 }]}
        >
          <Text style={[s.helperText, !hasHint && { opacity: 0.3 }]}>💡 {showHint ? "Hide hint" : "Show hint"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={replaySlowly} disabled={!lastAiMsg || loading} style={s.helperBtn}>
          <Text style={[s.helperText, (!lastAiMsg || loading) && { opacity: 0.3 }]}>🐢 Replay slowly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { Speech.stop(); setPhase("select"); setMessages([]); setExchangeCount(0); setVoiceCount(0); }}
          style={s.helperBtn}
        >
          <Text style={s.helperText}>🔄 Start over</Text>
        </TouchableOpacity>
      </View>

      {/* Input area */}
      <View style={s.inputArea}>
        {/* Mic */}
        <View style={{ alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={handleMic}
            disabled={loading}
            style={[
              s.micBtn,
              recording && s.micBtnRecording,
              loading && { backgroundColor: "#D1D5DB" },
            ]}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="large" />
              : recording
                ? <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: "#F5F0E8" }} />
                : <Text style={{ fontSize: 28 }}>🎙️</Text>
            }
          </TouchableOpacity>
          {recording && <Waveform />}
          <Text style={s.micHint}>
            {recording ? "Recording… tap to send"
              : loading  ? "Aroha is thinking…"
              : "Tap to speak"}
          </Text>
        </View>

        {/* Text fallback */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Or type in te reo…"
            placeholderTextColor="rgba(26,26,26,0.35)"
            editable={!loading && !recording}
            style={s.textInput}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (input.trim() && !loading) sendToAI(input.trim(), false);
            }}
          />
          <TouchableOpacity
            onPress={() => { if (input.trim() && !loading) sendToAI(input.trim(), false); }}
            disabled={!input.trim() || loading || recording}
            style={[s.sendBtn, (!input.trim() || loading || recording) && { opacity: 0.35 }]}
          >
            <Text style={s.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Styles
──────────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  heading:   { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: "#04342C", textAlign: "center" },
  subtext:   { fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.55)", textAlign: "center" },

  /* Scenario cards */
  scenarioCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  scenarioLabel: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "#04342C", textAlign: "center" },
  scenarioDesc:  { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.45)", textAlign: "center" },

  /* Scenario bar (in chat) */
  scenarioBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "rgba(245,240,232,0.98)",
  },
  scenarioBarLabel: { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" },
  scenarioBarDesc:  { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.4)" },

  /* Bubbles */
  bubbleRow:  { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  bubbleGroup: { flex: 1, gap: 4 },
  avatar:     { fontSize: 20, marginBottom: 4 },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleAI:       { backgroundColor: "#04342C", borderBottomLeftRadius: 4 },
  bubbleUser:     { backgroundColor: "#C8A951", borderBottomRightRadius: 4 },
  bubbleTextAI:   { fontFamily: "DMSans_400Regular", fontSize: 15, color: "#F5F0E8", lineHeight: 22 },
  bubbleTextUser: { fontFamily: "DMSans_400Regular", fontSize: 15, color: "#1A1A1A", lineHeight: 22 },
  replayBtn:      { paddingLeft: 4, paddingTop: 2 },
  replayText:     { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(4,52,44,0.45)" },
  voiceBadge:     { fontFamily: "DMSans_400Regular", fontSize: 10, color: "rgba(26,26,26,0.3)", textAlign: "right", paddingRight: 4 },
  hintPill: {
    backgroundColor: "rgba(200,169,81,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(200,169,81,0.4)",
    maxWidth: "90%",
  },
  hintText: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.65)" },

  /* Helpers */
  helperRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  helperBtn:  {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: "center",
  },
  helperText: { fontFamily: "DMSans_700Bold", fontSize: 10, color: "rgba(26,26,26,0.6)" },

  /* Input area */
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: "#F5F0E8",
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#04342C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  micBtnRecording: {
    backgroundColor: "#E07B39",
    shadowColor: "#E07B39",
    shadowOpacity: 0.4,
  },
  micHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "rgba(26,26,26,0.4)",
    textAlign: "center",
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(4,52,44,0.2)",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#1A1A1A",
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#04342C",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#F5F0E8" },

  /* Completion */
  dotLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.4)", textAlign: "center" },
  btnPrimary: {
    height: 56, borderRadius: 16, backgroundColor: "#04342C",
    alignItems: "center", justifyContent: "center",
  },
  btnPrimaryText: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#F5F0E8" },
});
