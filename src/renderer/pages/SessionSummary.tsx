import Card from "@/components/Card";
import { useSessions } from "@/hooks/useSessions";
import { formatHours } from "@/utils/time";

export default function SessionSummary() {
  const { sessions, loading } = useSessions();
  const latest = sessions[0];
  const duration = latest ? formatHours(latest.durationSeconds) : "0h 0m";

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Session Summary</p>
        <h1 className="text-3xl font-semibold text-white">You stayed with the work.</h1>
        <p className="text-sm text-slate-400">Celebrate the quiet progress.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "--" : duration}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distractions</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "--" : latest?.distractions ?? 0}</p>
        </Card>
        <Card className="p-6 border border-primary/50 shadow-glow">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus Score</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "--" : latest?.focusScore ?? 0}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold">Momentum unlocked</h3>
        <p className="mt-2 text-sm text-slate-400">
          {loading
            ? "Loading your latest session..."
            : latest
              ? "Short, focused sessions build unstoppable consistency. Keep going."
              : "Start a session to see your summary."}
        </p>
      </Card>
    </section>
  );
}
