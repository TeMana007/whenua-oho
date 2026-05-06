"use client";

import { useRef, useState } from "react";

const PATTERN_NUMBERS = Array.from({ length: 75 }, (_, i) => i + 1); // Reo Ora: 75 patterns

interface UploadedPhrase {
  id:             string;
  maori:          string;
  english:        string;
  pattern_number: number;
  created_at:     string;
}

export default function ContentUpload({
  classId,
  recentPhrases,
}: {
  classId:       string;
  recentPhrases: UploadedPhrase[];
}) {
  const [maori,        setMaori]        = useState("");
  const [english,      setEnglish]      = useState("");
  const [pronunciation,setPronunciation]= useState("");
  const [patternNum,   setPatternNum]   = useState(1);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState("");
  const [phrases,      setPhrases]      = useState<UploadedPhrase[]>(recentPhrases);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maori.trim() || !english.trim()) {
      setError("Te reo and English are both required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/kaiako/content", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          maori:         maori.trim(),
          english:       english.trim(),
          pronunciation: pronunciation.trim(),
          patternNumber: patternNum,
        }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const phrase = await res.json() as UploadedPhrase;
      setPhrases((p) => [phrase, ...p]);
      setMaori("");
      setEnglish("");
      setPronunciation("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-xl text-primary">Upload Content</h2>
        <span className="font-body text-xs bg-accent/20 text-ink/60 px-2 py-0.5 rounded-full">
          Reo Ora aligned
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="font-body text-sm text-ink/60">
          Add phrases tagged to a Reo Ora sentence pattern number (1–75).
          All content is reviewed by Dr. Rāpata Wiri before release.
        </p>

        {error && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl px-3 py-2">
            <p className="font-body text-xs text-warning">{error}</p>
          </div>
        )}

        {/* Pattern number */}
        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Sentence pattern number (Reo Ora)
          </label>
          <select
            value={patternNum}
            onChange={(e) => setPatternNum(Number(e.target.value))}
            className="input-field"
          >
            {PATTERN_NUMBERS.map((n) => (
              <option key={n} value={n}>Pattern {n}</option>
            ))}
          </select>
        </div>

        {/* Te reo phrase */}
        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Te reo Māori *
          </label>
          <input
            value={maori}
            onChange={(e) => setMaori(e.target.value)}
            placeholder="e.g. Ko ___ tōku ingoa"
            className="input-field"
            lang="mi"
            required
          />
        </div>

        {/* English */}
        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            English meaning *
          </label>
          <input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. My name is ___"
            className="input-field"
            required
          />
        </div>

        {/* Pronunciation guide */}
        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Pronunciation guide
          </label>
          <input
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="e.g. koh ___ taw-koo ing-oh-ah"
            className="input-field"
          />
        </div>

        {/* Cultural safety reminder */}
        <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="text-sm flex-shrink-0">🌿</span>
          <p className="font-body text-xs text-primary/70 leading-relaxed">
            <strong>Cultural note:</strong> Never auto-correct te reo Māori words.
            All phrases must be validated by a kaiako before learners see them.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-primary disabled:opacity-50"
        >
          {saving ? "Uploading…" : saved ? "✓ Phrase uploaded!" : "Upload phrase →"}
        </button>
      </form>

      {/* Recent uploads */}
      {phrases.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs text-ink/40 uppercase tracking-wider">Recently uploaded</p>
          {phrases.slice(0, 5).map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-body font-bold text-xs text-primary">{p.pattern_number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-sm text-primary truncate" lang="mi">{p.maori}</p>
                <p className="font-body text-xs text-ink/50 truncate">{p.english}</p>
              </div>
              <span className="font-body text-xs text-ink/30 flex-shrink-0">
                {new Date(p.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
