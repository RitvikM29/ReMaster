import { useEffect, useMemo, useState } from "react";
import { platform } from "@/services/platform";
import { clearFocusActiveMode, setFocusActiveMode, useBeforeUnloadGuard } from "@/services/focusGuard";
import { useTabSwitchGuard } from "@/services/tabGuard";
import { useSettings } from "@/services/settingsStore";
import { useSessionMetrics } from "@/services/sessionMetrics";
import { createSession } from "@/services/sessionApi";
import { FocusSession } from "@/types";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmModal from "@/components/ConfirmModal";
import TimerDisplay from "@/components/TimerDisplay";
import { formatHours } from "@/utils/time";
import { calcFocusScore } from "@/utils/focusScore";
import { useTimer } from "./useTimer";

const PRESETS = [
  { label: "Pomodoro 25/5", minutes: 25 },
  { label: "Sprint 45", minutes: 45 },
  { label: "Deep 60", minutes: 60 }
];
export default function TimerScreen() {
  const [label, setLabel] = useState("Deep work");
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<FocusSession | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const { settings } = useSettings();

  const timer = useTimer({
    initialMinutes: 25,
    onComplete: () => {
      if (!sessionStartedAt) return;
      const focusScore = calcFocusScore({
        distractions,
        idleSeconds,
        earlyTerminate: false
      });
      const session: FocusSession = {
        id: crypto.randomUUID(),
        mode: "timer",
        durationSeconds: timer.durationSeconds,
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        distractions,
        idleSeconds,
        focusScore,
        label
      };
      setPendingSession(session);
      setShowSavePrompt(true);
    }
  });

  const { distractions, idleSeconds, resetMetrics } = useSessionMetrics({
    running: timer.status === "running",
    onIdleThreshold: () => timer.pause()
  });

  useBeforeUnloadGuard(timer.status === "running");
  useTabSwitchGuard(timer.status === "running", () => {
    window.alert("Stay focused. Tab switching is tracked.");
  });

  useEffect(() => {
    if (timer.status === "running") {
      setFocusActiveMode("timer");
    } else {
      clearFocusActiveMode("timer");
    }
    return () => clearFocusActiveMode("timer");
  }, [timer.status]);

  const statusLabel = useMemo(() => {
    switch (timer.status) {
      case "running":
        return "Focus in progress";
      case "paused":
        return "Paused";
      case "completed":
        return "Session complete";
      default:
        return "Ready to start";
    }
  }, [timer.status]);

  const handleStart = () => {
    if (!sessionStartedAt) {
      setSessionStartedAt(new Date().toISOString());
    }
    timer.start();
    if (settings.blockerEnabled) {
      platform.applyBlocklist(settings.siteBlocklist).catch(() => undefined);
    }
  };

  const handleReset = () => {
    const elapsedSeconds = timer.durationSeconds - timer.remainingSeconds;
    if (sessionStartedAt && elapsedSeconds >= 30) {
      const focusScore = calcFocusScore({
        distractions,
        idleSeconds,
        earlyTerminate: true
      });
      setPendingSession({
        id: crypto.randomUUID(),
        mode: "timer",
        durationSeconds: elapsedSeconds,
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        distractions,
        idleSeconds,
        focusScore,
        label
      });
      setShowSavePrompt(true);
      return;
    }
    setSessionStartedAt(null);
    resetMetrics();
    timer.reset();
    if (settings.blockerEnabled) {
      platform.clearBlocklist().catch(() => undefined);
    }
  };

  const handleSave = async () => {
    if (!pendingSession) return;
    try {
      await createSession(pendingSession);
      setPendingSession(null);
      setShowSavePrompt(false);
      setSessionStartedAt(null);
      resetMetrics();
      timer.reset();
      if (settings.blockerEnabled) {
        platform.clearBlocklist().catch(() => undefined);
      }
    } catch {
      window.alert("Failed to save session. Make sure the API server is running.");
    }
  };

  const handleDiscard = () => {
    setPendingSession(null);
    setShowSavePrompt(false);
    setSessionStartedAt(null);
    resetMetrics();
    timer.reset();
    if (settings.blockerEnabled) {
      platform.clearBlocklist().catch(() => undefined);
    }
  };

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Timer Mode</p>
          <h1 className="text-3xl font-semibold text-white">Stay locked. Stay calm.</h1>
          <p className="text-sm text-slate-400">{statusLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                timer.durationMinutes === preset.minutes
                  ? "border-primary/60 bg-primary/10 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
              onClick={() => timer.setDurationMinutes(preset.minutes)}
              disabled={timer.status === "running"}
            >
              {preset.label}
            </button>
          ))}
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Custom (min)
            <input
              className="h-10 w-24 rounded-full border border-slate-700 bg-slate-900 px-3 text-sm text-white"
              type="number"
              min={5}
              step={5}
              value={timer.durationMinutes}
              onChange={(event) => timer.setDurationMinutes(Number(event.target.value))}
              disabled={timer.status === "running"}
            />
          </label>
        </div>
      </header>

      <Card className="flex flex-col items-center gap-6 p-8">
        <TimerDisplay
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.durationSeconds}
          status={timer.status}
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="min-h-[48px]" onClick={handleStart}>
            <span className="text-base">▶</span>
            {timer.status === "running" ? "Running" : "Start"}
          </Button>
          <Button variant="secondary" className="min-h-[48px]" onClick={timer.pause}>
            <span className="text-base">⏸</span>
            Pause
          </Button>
          <Button variant="ghost" className="min-h-[48px]" onClick={handleReset}>
            <span className="text-base">↺</span>
            Reset
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Session label</p>
          <input
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Math revision"
          />
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distractions</p>
          <p className="mt-2 text-2xl font-bold">{distractions}</p>
          <p className="text-sm text-slate-500">switches logged</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Idle time</p>
          <p className="mt-2 text-2xl font-bold">{formatHours(idleSeconds)}</p>
          <p className="text-sm text-slate-500">
            {settings.distractionRule === "leave-remaster" ? "Leaving ReMaster" : "Any non-allowlisted app"}
          </p>
        </Card>
      </div>
      <ConfirmModal
        open={showSavePrompt}
        title="Save this session?"
        description="Do you want to save this focus session to your history?"
        confirmLabel="Save session"
        cancelLabel="Discard"
        onConfirm={handleSave}
        onCancel={handleDiscard}
      />
    </section>
  );
}
