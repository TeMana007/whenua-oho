"use client";

import { useRef, useState } from "react";

interface Challenge {
  id:          string;
  phrase:      string;
  description: string;
  due_date:    string;
  submissions: number;
}

export default function ChallengeSetter({
  classId,
  existing,
}: {
  classId:  string;
  existing: Challenge[];
}) {
  const [phrase,      setPhrase]      = useState("");
  const [description, setDescription] = useState("");
  const [dueDate,     setDueDate]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [challenges,  setChallenges]  = useState<Challenge[]>(existing);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) { setError("Please enter a phrase."); return; }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/kaiako/challenge", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, phrase, description, dueDate }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const newChallenge = await res.json() as Challenge;
      setChallenges((c) => [newChallenge, ...c]);
      setPhrase("");
      setDescription("");
      setDueDate("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save challenge. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl text-primary">Weekly Challenge</h2>

      {/* Setter form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="font-body text-sm text-ink/60">
          Set a phrase challenge for your class this week. Ākonga will be notified to practise it.
        </p>

        {error && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl px-3 py-2">
            <p className="font-body text-xs text-warning">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Te reo phrase *
          </label>
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="e.g. Kei te pēhea koe?"
            className="input-field"
            lang="mi"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Context / instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Use this greeting when entering the marae this week."
            className="input-field resize-none"
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">
            Due date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-field"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-accent disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "✓ Challenge set!" : "Set challenge →"}
        </button>
      </form>

      {/* Existing challenges */}
      {challenges.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs text-ink/40 uppercase tracking-wider">Recent challenges</p>
          {challenges.slice(0, 3).map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🎯</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-sm text-primary" lang="mi">{c.phrase}</p>
                {c.description && (
                  <p className="font-body text-xs text-ink/50 mt-0.5">{c.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {c.due_date && (
                    <span className="font-body text-xs text-ink/40">
                      Due: {new Date(c.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <span className="font-body text-xs text-success font-bold">
                    {c.submissions} submission{c.submissions !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
