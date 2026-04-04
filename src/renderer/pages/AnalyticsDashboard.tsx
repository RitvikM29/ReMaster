import ChartContainer from "@/components/ChartContainer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatHours } from "@/utils/time";

export default function AnalyticsDashboard() {
  const { analytics, loading, error } = useAnalytics();
  if (!loading && !analytics) {
    return (
      <section className="flex flex-col gap-6 animate-fade-in">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Analytics</p>
          <h1 className="text-3xl font-semibold text-white">Focus trends</h1>
          <p className="text-sm text-slate-400">Track the patterns that build momentum.</p>
        </header>
        <div className="card p-6 text-sm text-slate-400">
          {error ? "Unable to load analytics. Is the API server running?" : "No sessions yet. Start a focus session to unlock analytics."}
        </div>
      </section>
    );
  }
  const daily = analytics?.daily.length ? analytics.daily : [["Today", 0]];
  const maxDaily = Math.max(...daily.map((item) => item[1]), 1);
  const subjectTotal = analytics?.subjectSplit.reduce((sum, item) => sum + item[1], 0) || 1;
  const focusScores = analytics?.focusScores.slice(-7) ?? [];
  const maxScore = Math.max(...focusScores, 1);

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Analytics</p>
        <h1 className="text-3xl font-semibold text-white">Focus trends</h1>
        <p className="text-sm text-slate-400">Track the patterns that build momentum.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Weekly Focus Trend" subtitle={loading ? "Loading analytics..." : "Recent 7 days"}>
          <div className="flex h-48 items-end gap-3">
            {daily.map(([date, seconds]) => (
              <div
                key={date}
                className="flex-1 rounded-full bg-gradient-to-t from-primary/70 to-accent/60 transition hover:opacity-80"
                style={{ height: `${Math.max(10, (seconds / maxDaily) * 100)}%` }}
                title={`${date} · ${formatHours(seconds)}`}
              />
            ))}
          </div>
        </ChartContainer>
        <ChartContainer title="Subject split" subtitle={loading ? "Loading insights..." : `Top subject: ${analytics?.subjectSplit[0]?.[0] ?? "General"}`}>
          <div className="relative h-48 w-48">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#4F46E5 0 ${Math.round(
                  ((analytics?.subjectSplit[0]?.[1] ?? 0) / subjectTotal) * 100
                )}%, #22C55E 0 ${Math.round(
                  ((analytics?.subjectSplit[0]?.[1] ?? 0) / subjectTotal) * 100 +
                    ((analytics?.subjectSplit[1]?.[1] ?? 0) / subjectTotal) * 100
                )}%, #334155 0 100%)`
              }}
            />
            <div className="absolute inset-6 rounded-full bg-base/90 text-center text-xs text-slate-300 flex items-center justify-center">
              {analytics?.subjectSplit[0]?.[0] ?? "General"}
            </div>
          </div>
        </ChartContainer>
      </div>

      <ChartContainer title="Focus score trend" subtitle={error ? "Unable to load analytics." : `Last ${focusScores.length || 0} sessions`}>
        <div className="relative h-40 rounded-xl border border-slate-800">
          {focusScores.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-glow"
              style={{
                left: `${(index / Math.max(focusScores.length - 1, 1)) * 100}%`,
                bottom: `${Math.max(10, (value / maxScore) * 100)}%`
              }}
            />
          ))}
        </div>
      </ChartContainer>

      {analytics?.insights?.length ? (
        <ChartContainer title="Smart insights">
          <ul className="space-y-2 text-sm text-slate-400">
            {analytics.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </ChartContainer>
      ) : null}
    </section>
  );
}
