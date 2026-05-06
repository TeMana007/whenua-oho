import { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Platform,
} from "react-native";
import { Audio }   from "expo-av";
import * as Speech from "expo-speech";
import { createSupabaseClient } from "@korero/data";
import { LESSONS } from "@korero/curriculum";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/* ── Types ── */
interface ReviewCard {
  phraseId:      string;
  maori:         string;
  english:       string;
  pronunciation: string;
}

type Rating    = "again" | "hard" | "got_it" | "easy";
type CardPhase = "prompt" | "recording" | "reveal";

const RATINGS: { key: Rating; label: string; sub: string; colour: string }[] = [
  { key: "again",  label: "Again",  sub: "1d",  colour: "#E07B39" },
  { key: "hard",   label: "Hard",   sub: "3d",  colour: "#C8A951" },
  { key: "got_it", label: "Got it", sub: "7d",  colour: "#2D7A4F" },
  { key: "easy",   label: "Easy",   sub: "30d", colour: "#04342C" },
];

/* ── Waveform ── */
function WaveBar({ delay }: { delay: number }) {
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
  return <Animated.View style={{ width: 5, height: anim, borderRadius: 3, backgroundColor: "#E07B39", marginHorizontal: 2 }} />;
}

function Waveform() {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 40 }}>
      {[0, 60, 120, 60, 0, 60, 120, 60, 0].map((d, i) => <WaveBar key={i} delay={d} />)}
    </View>
  );
}

/* ── End screen ── */
function EndScreen({ count, onRestart }: { count: number; onRestart: () => void }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 32, alignItems: "center", gap: 24 }}>
      <Text style={{ fontSize: 72 }}>✅</Text>
      <Text style={s.heading}>Kua mutu!</Text>
      <Text style={s.subtext}>Session complete — you reviewed {count} phrase{count !== 1 ? "s" : ""}.</Text>
      <TouchableOpacity style={[s.btnPrimary, { width: "100%" }]} onPress={onRestart}>
        <Text style={s.btnPrimaryText}>Review again →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ── Main screen ── */
export default function ReviewScreen() {
  const [cards,    setCards]    = useState<ReviewCard[]>([]);
  const [index,    setIndex]    = useState(0);
  const [phase,    setPhase]    = useState<CardPhase>("prompt");
  const [flipped,  setFlipped]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [recording, setRecording] = useState(false);
  const [speaking,  setSpeaking]  = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const flipAnim     = useRef(new Animated.Value(0)).current;

  /* ── Load due cards ── */
  useEffect(() => {
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        const { data: learner } = await supabase
          .from("learners")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (!learner) throw new Error("No learner");

        const { data: due } = await supabase
          .from("learner_progress")
          .select("phrase_id, phrases(id, maori, english, pronunciation)")
          .eq("learner_id", learner.id)
          .lte("next_review", new Date().toISOString())
          .order("next_review")
          .limit(10);

        const loaded: ReviewCard[] = (due ?? [])
          .filter((d) => d.phrases)
          .map((d) => ({
            phraseId:      (d.phrases as { id: string }).id,
            maori:         (d.phrases as { maori: string }).maori,
            english:       (d.phrases as { english: string }).english,
            pronunciation: (d.phrases as { pronunciation: string | null }).pronunciation ?? "",
          }));

        if (loaded.length > 0) {
          setCards(loaded);
        } else {
          // Fallback to curriculum
          const fallback = LESSONS.flatMap((l) =>
            l.phrases.map((p) => ({
              phraseId:      `curriculum-${p.maori}`,
              maori:         p.maori,
              english:       p.english,
              pronunciation: p.pronunciation ?? "",
            }))
          ).slice(0, 10);
          setCards(fallback);
        }
      } catch {
        // Curriculum fallback on error
        const fallback = LESSONS.flatMap((l) =>
          l.phrases.map((p) => ({
            phraseId:      `curriculum-${p.maori}`,
            maori:         p.maori,
            english:       p.english,
            pronunciation: p.pronunciation ?? "",
          }))
        ).slice(0, 10);
        setCards(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const card = cards[index];

  /* ── Auto-play English on new card ── */
  useEffect(() => {
    if (!card) return;
    setPhase("prompt");
    setFlipped(false);
    flipAnim.setValue(0);
    const t = setTimeout(() => {
      setSpeaking(true);
      Speech.speak(card.english, {
        language: "en", rate: 0.85,
        onDone: () => setSpeaking(false), onError: () => setSpeaking(false),
      });
    }, 600);
    return () => clearTimeout(t);
  }, [index, card]);

  /* ── Card flip animation ── */
  const flipCard = useCallback(() => {
    Animated.timing(flipAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start(() => setFlipped(true));
    if (card) {
      setTimeout(() => {
        setSpeaking(true);
        Speech.speak(card.maori, {
          language: "mi", rate: 0.82,
          onDone: () => setSpeaking(false), onError: () => setSpeaking(false),
        });
      }, 700);
    }
  }, [card, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backInterpolate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  /* ── Recording ── */
  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = rec;
    setRecording(true);
    setPhase("recording");
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    recordingRef.current = null;
    setRecording(false);
    setPhase("reveal");
    flipCard();
  };

  /* ── Rating ── */
  const rate = async (rating: Rating) => {
    try {
      await fetch(`${API_BASE}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phraseId: card.phraseId, rating }),
      });
    } catch { /* non-blocking */ }

    setTimeout(() => {
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 300);
  };

  /* ── Render ── */
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: "#04342C" }}>
          Loading review…
        </Text>
      </View>
    );
  }

  if (done) {
    return <EndScreen count={cards.length} onRestart={() => { setIndex(0); setDone(false); setFlipped(false); flipAnim.setValue(0); }} />;
  }

  if (!card) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={s.heading}>Ka pai!</Text>
        <Text style={s.subtext}>No phrases due for review. Come back later!</Text>
      </View>
    );
  }

  const progress = (index / cards.length) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress}%` as `${number}%` }]} />
      </View>
      <Text style={s.progressLabel}>Card {index + 1} of {cards.length}</Text>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, alignItems: "center" }}>
        {/* Card */}
        <View style={{ width: "100%", height: 300 }}>
          {/* Front */}
          <Animated.View
            style={[
              s.card, s.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
              flipped && { position: "absolute", opacity: 0 },
            ]}
          >
            <Text style={{ fontSize: 52 }}>🗣️</Text>
            <Text style={s.cardHint}>How do you say this in te reo?</Text>
            <Text style={s.cardEnglish}>{card.english}</Text>
            <TouchableOpacity
              onPress={() => {
                setSpeaking(true);
                Speech.speak(card.english, { language: "en", onDone: () => setSpeaking(false) });
              }}
              style={s.replayBtn}
            >
              <Text style={s.replayBtnText}>{speaking ? "Playing…" : "🔊 Play again"}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Back */}
          {flipped && (
            <Animated.View
              style={[
                s.card, s.cardBack,
                { transform: [{ rotateY: backInterpolate }] },
              ]}
            >
              <Text style={s.answerHint}>The answer</Text>
              <Text style={s.answerMaori}>{card.maori}</Text>
              <Text style={s.answerPronounciation}>{card.pronunciation}</Text>
              <TouchableOpacity
                onPress={() => Speech.speak(card.maori, { language: "mi", rate: 0.82 })}
                style={[s.replayBtn, { backgroundColor: "rgba(4,52,44,0.12)" }]}
              >
                <Text style={[s.replayBtnText, { color: "#04342C" }]}>🔊 Hear pronunciation</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Controls — before flip */}
        {!flipped && (
          <View style={{ width: "100%", alignItems: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={[s.micBtn, recording && s.micBtnRecording]}
            >
              {recording
                ? <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: "#F5F0E8" }} />
                : <Text style={{ fontSize: 28 }}>🎙️</Text>
              }
            </TouchableOpacity>
            {recording && <Waveform />}
            <Text style={s.micHint}>
              {recording ? "Recording… tap to stop & reveal" : "Record your answer"}
            </Text>
            <TouchableOpacity
              onPress={() => { setPhase("reveal"); flipCard(); }}
              style={[s.btnSecondary, { width: "100%" }]}
            >
              <Text style={s.btnSecondaryText}>Reveal without recording</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rating buttons — after flip */}
        {flipped && (
          <View style={{ width: "100%", gap: 10 }}>
            <Text style={[s.subtext, { textAlign: "center" }]}>How did you do?</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {RATINGS.map(({ key, label, sub, colour }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => rate(key)}
                  style={[s.ratingBtn, { borderColor: colour + "60", backgroundColor: colour + "15" }]}
                >
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: colour }}>{label}</Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 10, color: colour + "AA" }}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ── Styles ── */
const s = StyleSheet.create({
  heading: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: "#04342C", textAlign: "center" },
  subtext: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.55)" },

  progressBar: { height: 4, backgroundColor: "rgba(4,52,44,0.1)", marginTop: Platform.OS === "ios" ? 0 : 4 },
  progressFill: { height: "100%", backgroundColor: "#C8A951" },
  progressLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.4)", textAlign: "center", paddingVertical: 8 },

  card: {
    width: "100%", height: 300, borderRadius: 24, padding: 24,
    alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  cardFront: { backgroundColor: "#04342C" },
  cardBack:  { backgroundColor: "#F5F0E8", borderWidth: 2, borderColor: "rgba(4,52,44,0.2)" },
  cardHint:  { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.5)", textTransform: "uppercase", letterSpacing: 1.5 },
  cardEnglish: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: "#F5F0E8", textAlign: "center", lineHeight: 38 },
  replayBtn: { backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginTop: 4 },
  replayBtnText: { fontFamily: "DMSans_400Regular", fontSize: 13, color: "#F5F0E8" },
  answerHint: { fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(4,52,44,0.4)", textTransform: "uppercase", letterSpacing: 1.5 },
  answerMaori: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 32, color: "#04342C", textAlign: "center", lineHeight: 44 },
  answerPronounciation: { fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(26,26,26,0.45)", fontStyle: "italic" },

  micBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#04342C",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  micBtnRecording: { backgroundColor: "#E07B39", shadowColor: "#E07B39", shadowOpacity: 0.4 },
  micHint: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.4)", textAlign: "center" },

  ratingBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, borderWidth: 2, alignItems: "center", gap: 2 },

  btnSecondary: {
    height: 48, borderRadius: 14, borderWidth: 2, borderColor: "#04342C",
    alignItems: "center", justifyContent: "center",
  },
  btnSecondaryText: { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" },
  btnPrimary: {
    height: 56, borderRadius: 16, backgroundColor: "#04342C",
    alignItems: "center", justifyContent: "center",
  },
  btnPrimaryText: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#F5F0E8" },
});
