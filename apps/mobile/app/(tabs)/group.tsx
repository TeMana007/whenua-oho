import { useCallback, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, PanResponder, Animated,
} from "react-native";
import * as Speech from "expo-speech";

/* ────────────────────────────────────────────────────────────────────
   Game selector hub
──────────────────────────────────────────────────────────────────── */

type GameId = "sentence" | "listen" | "mihimihi";

const GAMES = [
  { id: "sentence" as GameId, label: "Sentence Builder", maori: "Hanga Kōrero", emoji: "🧩", description: "Arrange scrambled words into the correct order.", colour: "#04342C" },
  { id: "listen"   as GameId, label: "Listen & Choose",  maori: "Whakarongo",   emoji: "👂", description: "Hear a phrase and tap the matching scene.",       colour: "#2D7A4F" },
  { id: "mihimihi" as GameId, label: "Rebuild the Pepeha", maori: "Hanga Pepeha", emoji: "🌿", description: "Arrange six pepeha sections in the right cultural order.", colour: "#C8A951" },
];

/* ────────────────────────────────────────────────────────────────────
   Game 1: Sentence Builder (tap-to-place on mobile)
──────────────────────────────────────────────────────────────────── */

const SENTENCES = [
  { words: ["Ko", "Aroha", "tōku", "ingoa"],     english: "My name is Aroha" },
  { words: ["Nō", "Tāmaki", "ahau"],             english: "I am from Auckland" },
  { words: ["He", "kaiako", "ahau"],              english: "I am a teacher" },
  { words: ["Ko", "Taranaki", "tōku", "maunga"], english: "My mountain is Taranaki" },
  { words: ["Kei", "te", "pēhea", "koe"],        english: "How are you?" },
];

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

function SentenceBuilderGame({ onBack }: { onBack: () => void }) {
  const [idx,       setIdx]       = useState(0);
  const [available, setAvailable] = useState<string[]>(() => shuffle(SENTENCES[0].words));
  const [placed,    setPlaced]    = useState<string[]>([]);
  const [correct,   setCorrect]   = useState(false);
  const [score,     setScore]     = useState(0);
  const [done,      setDone]      = useState(false);

  const loadSentence = (i: number) => {
    setAvailable(shuffle(SENTENCES[i].words));
    setPlaced([]);
    setCorrect(false);
  };

  const tapAvailable = (word: string, wordIdx: number) => {
    if (correct) return;
    const next = [...placed, word];
    const avail = available.filter((_, i) => i !== wordIdx);
    setPlaced(next);
    setAvailable(avail);
    if (next.join(" ") === SENTENCES[idx].words.join(" ")) {
      setCorrect(true);
      setScore((s) => s + 1);
      Speech.speak(SENTENCES[idx].words.join(" "), { language: "mi", rate: 0.82 });
    }
  };

  const tapPlaced = (word: string, wordIdx: number) => {
    if (correct) return;
    setPlaced(placed.filter((_, i) => i !== wordIdx));
    setAvailable([...available, word]);
  };

  const next = () => {
    if (idx + 1 >= SENTENCES.length) { setDone(true); return; }
    const ni = idx + 1;
    setIdx(ni);
    loadSentence(ni);
  };

  if (done) return (
    <View style={gs.center}>
      <Text style={{ fontSize: 56 }}>🏆</Text>
      <Text style={gs.heading}>Ka rawe!</Text>
      <Text style={gs.subtext}>You scored {score}/{SENTENCES.length}</Text>
      <TouchableOpacity style={gs.btnPrimary} onPress={() => { setIdx(0); setScore(0); setDone(false); loadSentence(0); }}>
        <Text style={gs.btnPrimaryText}>Play again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={gs.gameHint}>Build the sentence</Text>
      <Text style={gs.gameTarget}>"{SENTENCES[idx].english}"</Text>

      {/* Placed words */}
      <View style={[gs.dropZone, correct && { borderColor: "#2D7A4F", backgroundColor: "rgba(45,122,79,0.08)" }]}>
        {placed.length === 0
          ? <Text style={gs.dropHint}>Tap words below to add them</Text>
          : <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {placed.map((w, i) => (
                <TouchableOpacity key={i} onPress={() => tapPlaced(w, i)}
                  style={[gs.tile, correct && { backgroundColor: "#2D7A4F" }]}>
                  <Text style={gs.tileText}>{w}</Text>
                </TouchableOpacity>
              ))}
              {correct && <Text style={{ fontFamily: "DMSans_700Bold", color: "#2D7A4F", fontSize: 13, alignSelf: "center" }}>✓ Tino pai!</Text>}
            </View>
        }
      </View>

      {/* Available tiles */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {available.map((w, i) => (
          <TouchableOpacity key={i} onPress={() => tapAvailable(w, i)} style={gs.tileAvail}>
            <Text style={gs.tileAvailText}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity style={[gs.btnSecondary, { flex: 1 }]} onPress={() => loadSentence(idx)}>
          <Text style={gs.btnSecondaryText}>Reset</Text>
        </TouchableOpacity>
        {correct && (
          <TouchableOpacity style={[gs.btnPrimary, { flex: 1 }]} onPress={next}>
            <Text style={gs.btnPrimaryText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Game 2: Listen & Choose
──────────────────────────────────────────────────────────────────── */

const ROUNDS = [
  { phrase: "Kia ora!",           english: "Hello!",              correct: 0, options: [{ emoji: "🤝", label: "Greeting" }, { emoji: "🍽️", label: "Eating" }, { emoji: "😴", label: "Sleeping" }] },
  { phrase: "Ko wai tōu ingoa?",  english: "What is your name?",  correct: 1, options: [{ emoji: "🌄", label: "Mountain" }, { emoji: "💬", label: "Asking name" }, { emoji: "🏠", label: "Home" }] },
  { phrase: "Nō hea koe?",        english: "Where are you from?", correct: 2, options: [{ emoji: "🍎", label: "Food" }, { emoji: "📚", label: "Learning" }, { emoji: "🗺️", label: "Place" }] },
  { phrase: "Kei te pēhea koe?",  english: "How are you?",        correct: 0, options: [{ emoji: "😊", label: "Well-being" }, { emoji: "🎵", label: "Music" }, { emoji: "🏃", label: "Running" }] },
  { phrase: "Tēnā koutou katoa",  english: "Greetings to you all",correct: 1, options: [{ emoji: "🤸", label: "Exercise" }, { emoji: "👥", label: "Group" }, { emoji: "🌊", label: "Ocean" }] },
];

function ListenAndChooseGame({ onBack }: { onBack: () => void }) {
  const [round,    setRound]    = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const current = ROUNDS[round];
  const play = () => {
    setSpeaking(true);
    Speech.speak(current.phrase, { language: "mi", rate: 0.82, onDone: () => setSpeaking(false) });
  };

  const select = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct) { setScore((s) => s + 1); Speech.speak("Ka pai!", { language: "mi" }); }
  };

  const next = () => {
    if (round + 1 >= ROUNDS.length) { setDone(true); return; }
    setRound((r) => r + 1);
    setSelected(null);
  };

  if (done) return (
    <View style={gs.center}>
      <Text style={{ fontSize: 56 }}>{score === 5 ? "🏆" : "⭐"}</Text>
      <Text style={gs.heading}>{score === 5 ? "Ka pai rawa atu!" : "Ka pai!"}</Text>
      <Text style={gs.subtext}>{score}/{ROUNDS.length} correct</Text>
      <TouchableOpacity style={gs.btnPrimary} onPress={() => { setRound(0); setScore(0); setSelected(null); setDone(false); }}>
        <Text style={gs.btnPrimaryText}>Play again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={gs.gameHint}>Round {round + 1} / {ROUNDS.length}</Text>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {ROUNDS.map((_, i) => (
            <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < round ? "#2D7A4F" : i === round ? "#C8A951" : "#E5E7EB" }} />
          ))}
        </View>
      </View>

      {/* Play button */}
      <View style={{ backgroundColor: "#04342C", borderRadius: 20, padding: 24, alignItems: "center", gap: 12 }}>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.5)", textTransform: "uppercase", letterSpacing: 2 }}>
          Listen and choose
        </Text>
        <TouchableOpacity
          onPress={play} disabled={speaking}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#C8A951", alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: speaking ? 16 : 24 }}>{speaking ? "🎵" : "▶"}</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.4)" }}>Tap to hear the phrase</Text>
      </View>

      {/* Options */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {current.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect  = i === current.correct;
          let bg = "#fff"; let border = "rgba(0,0,0,0.08)";
          if (selected !== null) {
            if (isCorrect)               { bg = "rgba(45,122,79,0.1)"; border = "#2D7A4F"; }
            else if (isSelected)         { bg = "rgba(224,123,57,0.1)"; border = "#E07B39"; }
          }
          return (
            <TouchableOpacity key={i} onPress={() => select(i)} disabled={selected !== null}
              style={{ flex: 1, backgroundColor: bg, borderRadius: 16, borderWidth: 2, borderColor: border, padding: 16, alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 36 }}>{opt.emoji}</Text>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.6)", textAlign: "center" }}>{opt.label}</Text>
              {selected !== null && isCorrect && <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: "#2D7A4F" }}>✓</Text>}
              {selected !== null && isSelected && !isCorrect && <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: "#E07B39" }}>✗</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {selected !== null && (
        <View style={{ gap: 10 }}>
          <View style={{ backgroundColor: selected === current.correct ? "rgba(45,122,79,0.1)" : "rgba(224,123,57,0.1)", borderRadius: 14, padding: 12 }}>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: selected === current.correct ? "#2D7A4F" : "#E07B39", textAlign: "center" }}>
              "{current.phrase}" — {current.english}
            </Text>
          </View>
          <TouchableOpacity style={gs.btnPrimary} onPress={next}>
            <Text style={gs.btnPrimaryText}>{round + 1 >= ROUNDS.length ? "See results →" : "Next round →"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Game 3: Rebuild the Pepeha (tap-to-swap on mobile)
──────────────────────────────────────────────────────────────────── */

const PEPEHA = [
  { id: "1", maori: "Ko Taranaki tōku maunga",   english: "Mountain",  emoji: "🏔️" },
  { id: "2", maori: "Ko Whanganui tōku awa",     english: "River",     emoji: "🏞️" },
  { id: "3", maori: "Ko Aotea tōku waka",        english: "Waka",      emoji: "🛶" },
  { id: "4", maori: "Ko Ngāti Mutunga tōku iwi", english: "Tribe",     emoji: "🪶" },
  { id: "5", maori: "Ko Parininihi tōku hapū",   english: "Hapū",      emoji: "👪" },
  { id: "6", maori: "Ko Aroha tōku ingoa",       english: "Name",      emoji: "✨" },
];

function RebuildPepehaGame({ onBack }: { onBack: () => void }) {
  const [sections, setSections] = useState(() => shuffle(PEPEHA));
  const [selected, setSelected] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);

  const isCorrect = sections.every((s, i) => s.id === PEPEHA[i].id);

  const tap = (i: number) => {
    if (isCorrect) return;
    if (selected === null) { setSelected(i); return; }
    if (selected === i) { setSelected(null); return; }
    const next = [...sections];
    [next[selected], next[i]] = [next[i], next[selected]];
    setSections(next);
    setSelected(null);
  };

  const speakAll = () => {
    const full = PEPEHA.map((s) => s.maori).join(". ");
    Speech.speak(full, { language: "mi", rate: 0.78 });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text style={gs.gameHint}>Tap two sections to swap them into the correct order</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {["maunga", "awa", "waka", "iwi", "hapū", "ingoa"].map((k, i) => (
          <Text key={k} style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(4,52,44,0.5)" }}>
            {i + 1}. {k}{i < 5 ? " →" : ""}
          </Text>
        ))}
      </View>

      {sections.map((sec, i) => {
        const isSelected = selected === i;
        const inPlace    = isCorrect;
        return (
          <TouchableOpacity
            key={sec.id} onPress={() => tap(i)}
            style={[
              gs.pepehaRow,
              isSelected && { borderColor: "#C8A951", backgroundColor: "rgba(200,169,81,0.12)", transform: [{ scale: 1.02 }] },
              inPlace && { borderColor: "#2D7A4F", backgroundColor: "rgba(45,122,79,0.08)" },
            ]}
          >
            <Text style={{ fontSize: 24 }}>{sec.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" }}>{sec.maori}</Text>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.45)" }}>{sec.english}</Text>
            </View>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 12, color: inPlace ? "#2D7A4F" : "rgba(26,26,26,0.2)" }}>
              {PEPEHA.findIndex((p) => p.id === sec.id) + 1}
            </Text>
          </TouchableOpacity>
        );
      })}

      {isCorrect && !complete && (
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: "rgba(45,122,79,0.1)", borderRadius: 16, padding: 14, alignItems: "center" }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "#2D7A4F" }}>Ka tino pai! Perfect order!</Text>
          </View>
          <TouchableOpacity style={gs.btnSecondary} onPress={speakAll}>
            <Text style={gs.btnSecondaryText}>🔊 Hear the full pepeha</Text>
          </TouchableOpacity>
          <TouchableOpacity style={gs.btnPrimary} onPress={() => setComplete(true)}>
            <Text style={gs.btnPrimaryText}>Complete ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {complete && (
        <View style={{ alignItems: "center", gap: 14 }}>
          <Text style={{ fontSize: 48 }}>🌿</Text>
          <Text style={gs.heading}>Kua oti tō pepeha!</Text>
          <Text style={gs.subtext}>Your pepeha connects you to this land. Ka pai!</Text>
          <TouchableOpacity style={gs.btnSecondary} onPress={() => { setSections(shuffle(PEPEHA)); setComplete(false); setSelected(null); }}>
            <Text style={gs.btnSecondaryText}>Practice again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main screen
──────────────────────────────────────────────────────────────────── */

export default function GamesScreen() {
  const [active, setActive] = useState<GameId | null>(null);
  const game = GAMES.find((g) => g.id === active);

  if (active && game) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
        {/* Header */}
        <View style={gs.header}>
          <TouchableOpacity onPress={() => setActive(null)} style={{ padding: 4 }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" }}>← Back</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 22 }}>{game.emoji}</Text>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "#04342C" }}>{game.label}</Text>
          </View>
          <View style={{ width: 52 }} />
        </View>

        {active === "sentence"  && <SentenceBuilderGame  onBack={() => setActive(null)} />}
        {active === "listen"    && <ListenAndChooseGame  onBack={() => setActive(null)} />}
        {active === "mihimihi"  && <RebuildPepehaGame    onBack={() => setActive(null)} />}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F5F0E8" }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={[gs.heading, { marginBottom: 4 }]}>Ngā Kēmu</Text>
      <Text style={gs.subtext}>Language games to sharpen your te reo</Text>
      {GAMES.map((g) => (
        <TouchableOpacity
          key={g.id} onPress={() => setActive(g.id)}
          style={[gs.gameCard, { borderBottomColor: g.colour, borderBottomWidth: 3 }]}
          activeOpacity={0.75}
        >
          <View style={[gs.gameIcon, { backgroundColor: g.colour + "18" }]}>
            <Text style={{ fontSize: 32 }}>{g.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: "#04342C" }}>{g.label}</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(26,26,26,0.4)", marginBottom: 4 }}>{g.maori}</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(26,26,26,0.6)" }}>{g.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

/* ── Styles ── */
const gs = StyleSheet.create({
  center:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24, backgroundColor: "#F5F0E8" },
  heading:  { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26, color: "#04342C", textAlign: "center" },
  subtext:  { fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(26,26,26,0.55)", textAlign: "center" },
  gameHint: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.4)", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  gameTarget: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: "#04342C", textAlign: "center" },
  header:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  gameCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, flexDirection: "row", gap: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  gameIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dropZone: { minHeight: 64, borderRadius: 16, borderWidth: 2, borderColor: "rgba(4,52,44,0.2)", borderStyle: "dashed", backgroundColor: "rgba(4,52,44,0.03)", padding: 10, alignItems: "center", justifyContent: "center" },
  dropHint: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(26,26,26,0.3)" },
  tile:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#04342C" },
  tileText:     { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#F5F0E8" },
  tileAvail:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 2, borderColor: "rgba(4,52,44,0.2)" },
  tileAvailText:{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#04342C" },
  pepehaRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: "rgba(0,0,0,0.07)", backgroundColor: "#fff" },
  btnPrimary:   { height: 52, borderRadius: 14, backgroundColor: "#04342C", alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#F5F0E8" },
  btnSecondary: { height: 52, borderRadius: 14, borderWidth: 2, borderColor: "#04342C", alignItems: "center", justifyContent: "center" },
  btnSecondaryText: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#04342C" },
});
