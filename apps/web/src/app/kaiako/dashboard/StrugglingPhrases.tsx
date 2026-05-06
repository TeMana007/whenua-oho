/* ── Panel 2: Top 5 struggling phrases ─────────────────────────── */

export interface StrugglePhrase {
  phraseId:    string;
  maori:       string;
  english:     string;
  avgScore:    number;
  attempts:    number;
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score * 5);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all"
          style={{
            backgroundColor: i < filled
              ? score >= 0.6 ? "#2D7A4F" : score >= 0.4 ? "#C8A951" : "#E07B39"
              : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

export default function StrugglingPhrases({ phrases }: { phrases: StrugglePhrase[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-xl text-primary">Struggling Phrases</h2>
        <span className="font-body text-xs bg-warning/15 text-warning px-2 py-0.5 rounded-full">
          Needs attention
        </span>
      </div>

      {phrases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <span className="text-3xl">🎉</span>
          <p className="font-heading text-lg text-primary">Ka pai!</p>
          <p className="font-body text-sm text-ink/40">No phrases below 50% confidence.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phrases.map((p, i) => (
            <div
              key={p.phraseId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
            >
              {/* Rank */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-sm flex-shrink-0"
                style={{
                  backgroundColor: i === 0 ? "#E07B3920" : "#f3f4f6",
                  color:           i === 0 ? "#E07B39"   : "#9ca3af",
                }}
              >
                {i + 1}
              </div>

              {/* Phrase */}
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-sm text-primary truncate" lang="mi">
                  {p.maori}
                </p>
                <p className="font-body text-xs text-ink/50 truncate">{p.english}</p>
              </div>

              {/* Score */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <ScoreDots score={p.avgScore} />
                <p className="font-body text-xs text-ink/40">
                  {Math.round(p.avgScore * 100)}% · {p.attempts} attempt{p.attempts !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {phrases.length > 0 && (
        <p className="font-body text-xs text-ink/40 text-center">
          Consider focusing this week&apos;s practice on these phrases.
        </p>
      )}
    </section>
  );
}
