import { useMemo } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Heatmap, { HeatmapDatum } from "@/components/Heatmap";
import { useActivityMonitor } from "@/services/activityMonitor";
import { useSessions } from "@/hooks/useSessions";
import { calculateCompletedSessions, calculateStreakDays, calculateTodaySeconds, averageFocusScore } from "@/utils/sessionStats";
import { formatHours } from "@/utils/time";

interface HomeDashboardProps {
  onQuickStart: (mode: "timer" | "stopwatch" | "deepwork") => void;
}

export default function HomeDashboard({ onQuickStart }: HomeDashboardProps) {
  const { sessions, loading } = useSessions();
  const todaySeconds = calculateTodaySeconds(sessions);
  const streakDays = calculateStreakDays(sessions);
  const totalSessions = calculateCompletedSessions(sessions);
  const avgScore = averageFocusScore(sessions);
  const activity = useActivityMonitor();
  const username = useMemo(() => localStorage.getItem("remaster.username") || "there", []);

  const heatmapData = useMemo<HeatmapDatum[]>(() => {
    if (sessions.length === 0) {
      return [
        { date: "2026-03-31", count: 0 },
        { date: "2026-04-01", count: 2 },
        { date: "2026-04-02", count: 4 },
        { date: "2026-04-03", count: 1 },
        { date: "2026-04-04", count: 0 },
        { date: "2026-04-05", count: 3 },
        { date: "2026-04-06", count: 5 },
        { date: "2026-04-07", count: 2 },
        { date: "2026-04-08", count: 0 },
        { date: "2026-04-09", count: 1 },
        { date: "2026-04-10", count: 4 },
        { date: "2026-04-11", count: 0 },
        { date: "2026-04-12", count: 3 },
        { date: "2026-04-13", count: 5 },
        { date: "2026-04-14", count: 2 },
        { date: "2026-04-15", count: 1 },
        { date: "2026-04-16", count: 4 },
        { date: "2026-04-17", count: 3 },
        { date: "2026-04-18", count: 0 },
        { date: "2026-04-19", count: 2 },
        { date: "2026-04-20", count: 5 },
        { date: "2026-04-21", count: 4 },
        { date: "2026-04-22", count: 2 },
        { date: "2026-04-23", count: 1 },
        { date: "2026-04-24", count: 3 },
        { date: "2026-04-25", count: 0 },
        { date: "2026-04-26", count: 4 },
        { date: "2026-04-27", count: 5 }
      ];
    }
    const map = new Map<string, number>();
    sessions.forEach((session) => {
      const key = session.startedAt.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    const days: HeatmapDatum[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ date: key, count: map.get(key) ?? 0 });
    }
    return days;
  }, [sessions]);

  const host = useMemo(() => {
    if (!activity.url) return null;
    try {
      return new URL(activity.url).hostname;
    } catch {
      return null;
    }
  }, [activity.url]);

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-white">Ready to focus, {username}?</h1>
          <p className="text-sm text-slate-400">Build calm momentum with every session.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onQuickStart("timer")}>Start Timer</Button>
          <Button variant="secondary" onClick={() => onQuickStart("stopwatch")}>Start Stopwatch</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          {
            label: "Today's Focus Time",
            value: loading ? "--" : formatHours(todaySeconds),
            icon: (
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          },
          {
            label: "Sessions Completed",
            value: loading ? "--" : totalSessions,
            icon: (
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent">
                <path d="M5 12l4 4L19 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          },
          {
            label: "Focus Score",
            value: loading ? "--" : avgScore,
            icon: (
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary">
                <path d="M12 3l8 4v5c0 4.5-3.3 8.2-8 8.5-4.7-.3-8-4-8-8.5V7z" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            )
          }
        ].map((card) => (
          <Card key={card.label} className="p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className="rounded-xl bg-slate-800/60 p-3">{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weekly Sessions Heatmap</h3>
          <p className="text-sm text-slate-500">Last 4 weeks</p>
        </div>
        <div className="mt-6">
          <Heatmap data={heatmapData} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Quick insights</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>{loading ? "Loading sessions..." : `Sessions completed: ${totalSessions}`}</li>
            <li>{loading ? "" : `Average focus score: ${avgScore}`}</li>
            <li>{loading ? "" : `Current streak: ${streakDays} days`}</li>
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Live status</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>Active tab: {activity.title ?? "N/A"}</p>
            <p>Page: {host ?? "N/A"}</p>
            <p>Idle: {Math.floor(activity.idleSeconds)}s</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
