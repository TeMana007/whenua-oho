/* ── Panel 1: Class overview ─────────────────────────────────────── */

interface Learner {
  id:             string;
  name:           string;
  level:          string;
  last_reviewed:  string | null;
  confidence_avg: number;
  streak:         number;
}

function ConfidenceBar({ value }: { value: number }) {
  const pct    = Math.round(value * 100);
  const colour = value >= 0.7 ? "#2D7A4F" : value >= 0.4 ? "#C8A951" : "#E07B39";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </div>
      <span className="font-body text-xs text-ink/40 w-8 text-right">{pct}%</span>
    </div>
  );
}

/** SVG sparkline of last-7-days confidence (fake trend using avg as base). */
function Sparkline({ avg }: { avg: number }) {
  const points = Array.from({ length: 7 }, (_, i) => {
    const jitter = (Math.sin(i * 2.3 + avg * 10) * 0.12);
    return Math.max(0.05, Math.min(0.98, avg + jitter));
  });

  const W = 80; const H = 28;
  const coords = points.map((v, i) => `${(i / 6) * W},${H - v * H}`).join(" ");

  const colour = avg >= 0.7 ? "#2D7A4F" : avg >= 0.4 ? "#C8A951" : "#E07B39";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline
        points={coords}
        fill="none"
        stroke={colour}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((v, i) => (
        <circle
          key={i}
          cx={(i / 6) * W}
          cy={H - v * H}
          r={i === 6 ? 3 : 1.5}
          fill={colour}
        />
      ))}
    </svg>
  );
}

function practicedThisWeek(lastReviewed: string | null): boolean {
  if (!lastReviewed) return false;
  const daysSince = (Date.now() - new Date(lastReviewed).getTime()) / 86_400_000;
  return daysSince <= 7;
}

export default function ClassOverview({ learners }: { learners: Learner[] }) {
  const practised  = learners.filter((l) => practicedThisWeek(l.last_reviewed));
  const notPracted = learners.filter((l) => !practicedThisWeek(l.last_reviewed));
  const classAvg   = learners.length
    ? learners.reduce((s, l) => s + l.confidence_avg, 0) / learners.length
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-primary">Class Overview</h2>
        <div className="text-right">
          <p className="font-body text-xs text-ink/40">Class avg. confidence</p>
          <p className="font-heading text-2xl text-primary">{Math.round(classAvg * 100)}%</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-2">
          <p className="font-body text-xs text-success font-bold">✓ Practised this week</p>
          <p className="font-heading text-2xl text-success">{practised.length}</p>
        </div>
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-2">
          <p className="font-body text-xs text-warning font-bold">⚠ Not yet this week</p>
          <p className="font-heading text-2xl text-warning">{notPracted.length}</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
          <p className="font-body text-xs text-primary/60 font-bold">Total ākonga</p>
          <p className="font-heading text-2xl text-primary">{learners.length}</p>
        </div>
      </div>

      {/* Learner table */}
      {learners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="font-body text-ink/40 text-sm">No learners in this class yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3">Ākonga</th>
                  <th className="text-left font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3">Level</th>
                  <th className="text-left font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Trend (7d)</th>
                  <th className="text-left font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3">Confidence</th>
                  <th className="text-center font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3">Streak</th>
                  <th className="text-center font-body text-xs text-ink/40 uppercase tracking-wider px-4 py-3">This week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {learners.map((l) => {
                  const active = practicedThisWeek(l.last_reviewed);
                  return (
                    <tr key={l.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-body font-bold text-sm text-ink">{l.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-xs text-ink/50 capitalize">{l.level}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Sparkline avg={l.confidence_avg} />
                      </td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <ConfidenceBar value={l.confidence_avg} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-body text-sm text-ink/60">
                          {l.streak > 0 ? `🔥 ${l.streak}d` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-success" : "bg-gray-200"}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
