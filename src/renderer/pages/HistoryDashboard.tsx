import { useMemo } from "react";
import Card from "@/components/Card";
import { useSessions } from "@/hooks/useSessions";
import { groupSessionsByWeek } from "@/utils/week";
import { formatHours } from "@/utils/time";

export default function HistoryDashboard() {
  const { sessions, loading, error, reload } = useSessions();
  const weekly = useMemo(() => groupSessionsByWeek(sessions), [sessions]);

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">History</p>
        <h1 className="text-3xl font-semibold text-white">Weekly effort</h1>
        <p className="text-sm text-slate-400">Review your sessions day by day.</p>
      </header>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading sessions...</p>
        ) : error ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Unable to load sessions. Is the API server running?</p>
            <button className="btn btn-secondary" onClick={reload}>Retry</button>
          </div>
        ) : weekly.every((day) => day.sessions.length === 0) ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">No sessions logged this week.</p>
            {sessions.length > 0 ? (
              <div className="rounded-xl border border-slate-800/60 p-4">
                <p className="text-sm text-slate-400">Recent sessions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {sessions.slice(0, 10).map((session) => (
                    <li key={`recent-${session.id}`}>
                      {new Date(session.startedAt).toLocaleString()} · {session.mode} · {Math.round(session.durationSeconds / 60)} min
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {weekly.map((day) => {
              const totalSeconds = day.sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
              return (
                <div key={day.date} className="rounded-xl border border-slate-800/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{day.date}</p>
                    <p className="text-sm text-slate-400">{formatHours(totalSeconds)}</p>
                  </div>
                  {day.sessions.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-400">
                      {day.sessions.map((session) => (
                        <li key={`${day.date}-${session.id}`}>
                          {session.mode} · {Math.round(session.durationSeconds / 60)} min · {session.distractions} distractions
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No sessions.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
