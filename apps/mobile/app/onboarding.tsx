import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { KoruSpinner } from "@korero/ui";
import { createSupabaseClient } from "@korero/data";

// ─── Types ──────────────────────────────────────────────────────────────────

type Level = "beginner" | "intermediate" | "advanced";
type Step = 0 | 1 | 2 | 3 | 4;

interface OnboardingData {
  name: string;
  level: Level | null;
  classCode: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVELS = [
  {
    key: "beginner" as Level,
    maori: "KĀKANO",
    english: "Beginner",
    meaning: "Seed — just beginning",
    emoji: "🌱",
    example: "Kia ora! He aha tō ingoa?",
    translation: "Hello! What is your name?",
    selectedBg: "#04342C",
    selectedText: "#F5F0E8",
  },
  {
    key: "intermediate" as Level,
    maori: "TIPU",
    english: "Emerging",
    meaning: "Growing — finding your voice",
    emoji: "🌿",
    example: "E haere ana ahau ki te kura.",
    translation: "I am going to school.",
    selectedBg: "#C8A951",
    selectedText: "#1A1A1A",
  },
  {
    key: "advanced" as Level,
    maori: "PUĀWAI",
    english: "Intermediate",
    meaning: "Blooming — confident speaker",
    emoji: "🌺",
    example: "Nō reira, tēnā koutou katoa.",
    translation: "And so, greetings to all of you.",
    selectedBg: "#2D7A4F",
    selectedText: "#F5F0E8",
  },
];

const TOMORROW_TASKS: Record<Level, { te_reo: string; english: string; topic: string }> = {
  beginner:     { te_reo: "Ko wai tōu ingoa?",          english: "What is your name?",         topic: "Ngā mihi — Greetings" },
  intermediate: { te_reo: "E haere ana koe ki hea?",    english: "Where are you going?",       topic: "Te haere — Getting around" },
  advanced:     { te_reo: "He aha tāu mahi i tērā rā?", english: "What did you do yesterday?", topic: "Te wā — Talking about time" },
};

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const koruOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(koruOpacity, { toValue: 1, duration: 900, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 700, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(btnOpacity,  { toValue: 1, duration: 500, easing: Easing.ease, useNativeDriver: true }),
    ]).start();
  }, [koruOpacity, textOpacity, btnOpacity]);

  return (
    <View className="flex-1 bg-primary items-center justify-center px-8 gap-10">
      <Animated.View style={{ opacity: koruOpacity }}>
        <KoruSpinner size={120} color="#C8A951" />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }} className="items-center gap-2">
        <Text className="font-heading text-5xl text-secondary text-center leading-tight">
          Nau mai,{"\n"}haere mai
        </Text>
        <Text className="font-body text-lg text-secondary/70 text-center mt-2">
          Ko tō ao ako tēnei
        </Text>
        <Text className="font-body text-sm text-secondary/40 text-center">
          This is your learning world
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: btnOpacity }} className="w-full">
        <Pressable
          onPress={onNext}
          className="h-14 min-h-[56px] rounded-2xl bg-accent items-center justify-center active:opacity-80"
        >
          <Text className="font-body-bold text-base text-ink tracking-wide">
            Tīmata — Begin
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Step 1: Name ────────────────────────────────────────────────────────────

function NameStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <View className="flex-1 bg-primary items-center justify-center px-8 gap-10">
      <View className="items-center gap-2">
        <Text className="font-heading text-4xl text-secondary text-center leading-tight">
          Ko wai tōu ingoa?
        </Text>
        <Text className="font-body text-base text-secondary/60 text-center">
          What is your name?
        </Text>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Type your name…"
        placeholderTextColor="rgba(245,240,232,0.3)"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => trimmed && onNext(trimmed)}
        style={{
          width: "100%",
          borderBottomWidth: 2,
          borderBottomColor: trimmed ? "#C8A951" : "rgba(245,240,232,0.3)",
          paddingVertical: 12,
          fontSize: 28,
          fontFamily: "PlayfairDisplay_700Bold",
          color: "#F5F0E8",
          textAlign: "center",
        }}
      />

      <Pressable
        onPress={() => trimmed && onNext(trimmed)}
        disabled={!trimmed}
        className={`w-full h-14 min-h-[56px] rounded-2xl bg-accent items-center justify-center ${!trimmed ? "opacity-40" : "active:opacity-80"}`}
      >
        <Text className="font-body-bold text-base text-ink">
          {trimmed ? `Tōku ingoa ko ${trimmed}` : "Tōku ingoa ko ___"}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Step 2: Level ───────────────────────────────────────────────────────────

function LevelStep({ onNext }: { onNext: (level: Level) => void }) {
  const [selected, setSelected] = useState<Level | null>(null);
  const selectedMeta = LEVELS.find((l) => l.key === selected);

  return (
    <View className="flex-1 bg-secondary">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40, gap: 24 }}>
        <View className="items-center gap-2">
          <Text className="font-heading text-4xl text-primary text-center leading-tight">
            Kei hea tō mōhio?
          </Text>
          <Text className="font-body text-sm text-ink/60 text-center">
            Where is your level? Choose the one that feels right.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {LEVELS.map((lvl) => {
            const isSelected = selected === lvl.key;
            return (
              <Pressable
                key={lvl.key}
                onPress={() => setSelected(lvl.key)}
                style={{
                  backgroundColor: isSelected ? lvl.selectedBg : "#FFFFFF",
                  borderWidth: 2,
                  borderColor: isSelected ? lvl.selectedBg : "rgba(26,26,26,0.08)",
                  borderRadius: 24,
                  padding: 20,
                }}
              >
                <Text style={{ fontSize: 36 }}>{lvl.emoji}</Text>
                <Text style={{
                  fontFamily: "PlayfairDisplay_700Bold",
                  fontSize: 26,
                  color: isSelected ? lvl.selectedText : "#04342C",
                  marginTop: 8,
                }}>
                  {lvl.maori}
                </Text>
                <Text style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 14,
                  color: isSelected ? lvl.selectedText : "#1A1A1A",
                  opacity: 0.7,
                  marginTop: 2,
                }}>
                  {lvl.english} — {lvl.meaning}
                </Text>
                <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: isSelected ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.07)" }}>
                  <Text style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 15, fontStyle: "italic", color: isSelected ? lvl.selectedText : "#04342C" }}>
                    "{lvl.example}"
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: isSelected ? lvl.selectedText : "#1A1A1A", opacity: 0.5, marginTop: 2 }}>
                    {lvl.translation}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => selected && onNext(selected)}
          disabled={!selected}
          style={{
            backgroundColor: "#04342C",
            borderRadius: 16,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            opacity: selected ? 1 : 0.4,
          }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: "#F5F0E8" }}>
            {selected ? `Āe, ko ${selectedMeta?.maori} ahau` : "Choose your level"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Step 3: Class Code ──────────────────────────────────────────────────────

function ClassCodeStep({
  onNext,
  onSkip,
}: {
  onNext: (code: string) => void;
  onSkip: () => void;
}) {
  const [code, setCode]         = useState("");
  const [classMeta, setClassMeta] = useState<{ kaiako_name: string; week_number: number; current_theme: string | null } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading]   = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setClassMeta(null);
    try {
      const { data } = await createSupabaseClient()
        .from("classes")
        .select("class_code, kaiako_name, week_number, current_theme")
        .eq("class_code", code.trim().toUpperCase())
        .single();
      if (data) setClassMeta(data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-secondary px-6 justify-center" style={{ gap: 28 }}>
      <View className="items-center gap-2">
        <Text style={{ fontSize: 48 }}>🏫</Text>
        <Text className="font-heading text-4xl text-primary text-center">
          He akomanga tōu?
        </Text>
        <Text className="font-body text-sm text-ink/60 text-center">
          Enter the class code your kaiako gave you.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          value={code}
          onChangeText={(t) => { setCode(t.toUpperCase()); setClassMeta(null); setNotFound(false); }}
          placeholder="e.g. MAORI101"
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={lookup}
          style={{
            flex: 1,
            height: 56,
            backgroundColor: "#FFF",
            borderRadius: 14,
            borderWidth: 2,
            borderColor: classMeta ? "#04342C" : "rgba(26,26,26,0.12)",
            paddingHorizontal: 16,
            fontSize: 18,
            fontFamily: "DMSans_700Bold",
            textAlign: "center",
            letterSpacing: 3,
            color: "#1A1A1A",
          }}
        />
        <Pressable
          onPress={lookup}
          disabled={!code.trim() || loading}
          style={{
            height: 56,
            paddingHorizontal: 18,
            backgroundColor: "#04342C",
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            opacity: code.trim() && !loading ? 1 : 0.4,
          }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", color: "#F5F0E8" }}>
            {loading ? "…" : "Find"}
          </Text>
        </Pressable>
      </View>

      {notFound && (
        <View style={{ backgroundColor: "rgba(224,123,57,0.12)", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(224,123,57,0.3)" }}>
          <Text className="font-body text-sm text-warning text-center">
            Kāo — that code wasn't found. Check with your kaiako.
          </Text>
        </View>
      )}

      {classMeta && (
        <View style={{ backgroundColor: "rgba(4,52,44,0.06)", borderRadius: 20, padding: 20, borderWidth: 2, borderColor: "#04342C" }}>
          <Text className="font-body text-xs text-ink/40 uppercase tracking-widest">Class found!</Text>
          <Text className="font-heading text-2xl text-primary mt-1">{code.toUpperCase()}</Text>
          <Text className="font-body text-sm text-ink/70 mt-1">Kaiako: <Text className="font-body-bold text-ink">{classMeta.kaiako_name}</Text></Text>
          <Text className="font-body text-sm text-ink/70">Week {classMeta.week_number}{classMeta.current_theme ? ` · ${classMeta.current_theme}` : ""}</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <Pressable
          onPress={() => classMeta && onNext(code.toUpperCase())}
          disabled={!classMeta}
          style={{ backgroundColor: "#04342C", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: classMeta ? 1 : 0.4 }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#F5F0E8" }}>
            Āe, tōku akomanga tēnei — Join
          </Text>
        </Pressable>
        <Pressable onPress={onSkip} style={{ paddingVertical: 14, alignItems: "center" }}>
          <Text className="font-body text-sm text-ink/40">Tāpui — Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Step 4: Voice ───────────────────────────────────────────────────────────

function Waveform({ isActive }: { isActive: boolean }) {
  const BARS = 9;
  const anims = useRef(Array.from({ length: BARS }, () => new Animated.Value(6))).current;

  useEffect(() => {
    if (isActive) {
      const animations = anims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 38 + (i % 3) * 8, duration: 280 + i * 55, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
            Animated.timing(anim, { toValue: 6,                  duration: 280 + i * 55, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          ])
        )
      );
      Animated.parallel(animations).start();
    } else {
      anims.forEach((a) => { a.stopAnimation(); a.setValue(6); });
    }
    return () => anims.forEach((a) => a.stopAnimation());
  }, [isActive, anims]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 56 }}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{ width: 8, height: anim, backgroundColor: "#C8A951", borderRadius: 4 }}
        />
      ))}
    </View>
  );
}

function VoiceStep({
  name,
  level,
  onFinish,
}: {
  name: string;
  level: Level;
  onFinish: () => void;
}) {
  type Phase = "idle" | "recording" | "recorded";
  const [phase, setPhase]           = useState<Phase>("idle");
  const [finishing, setFinishing]   = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef     = useRef<Audio.Sound | null>(null);
  const uriRef       = useRef<string | null>(null);

  const phrase = `Kia ora! Ko ${name || "ahau"} tōku ingoa.`;
  const task = TOMORROW_TASKS[level];

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow microphone access to record your voice.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setPhase("recording");
    } catch (e) {
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      await recordingRef.current?.stopAndUnloadAsync();
      uriRef.current = recordingRef.current?.getURI() ?? null;
      setPhase("recorded");
    } catch (e) {
      setPhase("idle");
    }
  };

  const playback = async () => {
    if (!uriRef.current) return;
    try {
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: uriRef.current });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {}
  };

  const handleFinish = async () => {
    setFinishing(true);
    await onFinish();
  };

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#04342C", padding: 28, justifyContent: "center", gap: 28 }}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 48 }}>🎙️</Text>
        <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 36, color: "#F5F0E8", textAlign: "center", lineHeight: 44 }}>
          Me rongo tāua{"\n"}i tō reo!
        </Text>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(245,240,232,0.6)", textAlign: "center" }}>
          Let's hear your voice!
        </Text>
      </View>

      {/* Phrase card */}
      <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.5)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          Say this phrase
        </Text>
        <Text style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 22, color: "#C8A951", fontStyle: "italic", textAlign: "center" }}>
          "{phrase}"
        </Text>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(245,240,232,0.5)", textAlign: "center", marginTop: 4 }}>
          Hello! My name is {name || "…"}.
        </Text>
      </View>

      {/* Waveform */}
      <Waveform isActive={phase === "recording"} />

      {/* Mic button */}
      {phase !== "recorded" && (
        <View style={{ alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={phase === "idle" ? startRecording : stopRecording}
            style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: phase === "recording" ? "#ef4444" : "#C8A951",
              alignItems: "center", justifyContent: "center",
              shadowColor: phase === "recording" ? "#ef4444" : "#C8A951",
              shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
            }}
          >
            <Text style={{ fontSize: 36 }}>🎙️</Text>
          </Pressable>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.4)" }}>
            {phase === "idle" ? "Tap to record" : "Tap to stop"}
          </Text>
        </View>
      )}

      {/* Post-recording */}
      {phase === "recorded" && (
        <View style={{ gap: 16 }}>
          <View style={{ backgroundColor: "rgba(45,122,79,0.25)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(45,122,79,0.4)", alignItems: "center" }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: "#F5F0E8" }}>Ka rawe! 🎉</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "rgba(245,240,232,0.7)", marginTop: 4, textAlign: "center" }}>
              Ka pai tō kōrero — great speaking!
            </Text>
          </View>

          <Pressable onPress={playback} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#F5F0E8", fontSize: 14 }}>▶</Text>
            </View>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: "rgba(245,240,232,0.6)" }}>Play back my recording</Text>
          </Pressable>

          {/* Tomorrow's task */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              📅 Tomorrow's first task
            </Text>
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: "#C8A951", marginBottom: 6 }}>{task.topic}</Text>
            <Text style={{ fontFamily: "PlayfairDisplay_400Regular", fontSize: 18, color: "#F5F0E8", fontStyle: "italic" }}>"{task.te_reo}"</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.4)", marginTop: 2 }}>{task.english}</Text>
          </View>

          <Pressable
            onPress={handleFinish}
            disabled={finishing}
            style={{ backgroundColor: "#C8A951", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: finishing ? 0.6 : 1 }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: "#1A1A1A" }}>
              {finishing ? "Setting up your space…" : "Haere tonu — Let's go! →"}
            </Text>
          </Pressable>
        </View>
      )}

      {phase === "idle" && (
        <Pressable onPress={handleFinish} style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: "rgba(245,240,232,0.3)" }}>Skip for now</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Main Onboarding Screen ──────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<OnboardingData>({ name: "", level: null, classCode: null });

  const advance = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setStep((s) => (s + 1) as Step);
  };

  const finish = async (patch: Partial<OnboardingData> = {}) => {
    const final = { ...data, ...patch };
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth/login"); return; }

    await supabase.from("learners").update({
      name: final.name.trim(),
      level: final.level ?? "beginner",
      class_code: final.classCode ?? null,
    }).eq("id", user.id);

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      {/* Progress dots */}
      {step > 0 && step < 4 && (
        <View style={{ position: "absolute", top: 16, left: 0, right: 0, zIndex: 50, flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {[1, 2, 3, 4].map((_, i) => (
            <View
              key={i}
              style={{
                height: 4,
                width: i < step ? 24 : 16,
                borderRadius: 2,
                backgroundColor: i < step ? "#C8A951" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </View>
      )}

      {step === 0 && <WelcomeStep onNext={() => advance({})} />}
      {step === 1 && <NameStep onNext={(name) => advance({ name })} />}
      {step === 2 && <LevelStep onNext={(level) => advance({ level })} />}
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
          onFinish={() => finish()}
        />
      )}
    </SafeAreaView>
  );
}
