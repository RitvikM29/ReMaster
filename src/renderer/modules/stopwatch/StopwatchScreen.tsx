import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { platform } from "@/services/platform";
import { clearFocusActiveMode, setFocusActiveMode, useBeforeUnloadGuard } from "@/services/focusGuard";
import { useTabSwitchGuard } from "@/services/tabGuard";
import { useSessionMetrics } from "@/services/sessionMetrics";
import { useSettings } from "@/services/settingsStore";
import { createSession } from "@/services/sessionApi";
import { FocusSession } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import { calcFocusScore } from "@/utils/focusScore";
import { showToast } from "@/services/toast";
import { formatDuration, formatHours } from "@/utils/time";
import { useStopwatch } from "./useStopwatch";

export default function StopwatchScreen() {
  const stopwatch = useStopwatch();
  const { settings } = useSettings();
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<FocusSession | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const { distractions, idleSeconds, resetMetrics } = useSessionMetrics({
    running: stopwatch.status === "running",
    onIdleThreshold: () => stopwatch.pause()
  });

  useBeforeUnloadGuard(stopwatch.status === "running");
  useTabSwitchGuard(stopwatch.status === "running", () => {
    window.alert("Stay focused. Tab switching is tracked.");
  });

  useEffect(() => {
    if (stopwatch.status === "running") {
      setFocusActiveMode("stopwatch");
    } else {
      clearFocusActiveMode("stopwatch");
    }
    return () => clearFocusActiveMode("stopwatch");
  }, [stopwatch.status]);

  const endSession = (earlyTerminate: boolean) => {
    if (!sessionStartedAt || stopwatch.elapsedSeconds < 30) return;
    const focusScore = calcFocusScore({
      distractions,
      idleSeconds,
      earlyTerminate
    });
    const session: FocusSession = {
      id: crypto.randomUUID(),
      mode: "stopwatch",
      durationSeconds: stopwatch.elapsedSeconds,
      startedAt: sessionStartedAt,
      endedAt: new Date().toISOString(),
      distractions,
      idleSeconds,
      focusScore,
      label: "Stopwatch"
    };
    setPendingSession(session);
    setShowSavePrompt(true);
  };

  const handleStart = () => {
    if (!sessionStartedAt) {
      setSessionStartedAt(new Date().toISOString());
    }
    stopwatch.start();
    if (settings.blockerEnabled) {
      platform.applyBlocklist(settings.siteBlocklist).catch(() => undefined);
    }
  };

  const handleStop = () => {
    if (settings.blockerEnabled) {
      platform.clearBlocklist().catch(() => undefined);
    }
    if (stopwatch.elapsedSeconds >= 30) {
      endSession(true);
      return;
    }
    stopwatch.stop();
    resetMetrics();
    setSessionStartedAt(null);
  };

  const handleSave = async () => {
    if (!pendingSession) return;
    try {
      await createSession(pendingSession);
      showToast("Session saved to history.");
      setPendingSession(null);
      setShowSavePrompt(false);
      setSessionStartedAt(null);
      resetMetrics();
      stopwatch.stop();
    } catch {
      window.alert("Failed to save session. Make sure the API server is running.");
    }
  };

  const handleDiscard = () => {
    setPendingSession(null);
    setShowSavePrompt(false);
    setSessionStartedAt(null);
    resetMetrics();
    stopwatch.stop();
  };

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Stopwatch</p>
          <h1 className="text-3xl font-semibold text-white">Flow without a finish line.</h1>
          <p className="text-sm text-slate-400">Open-ended focus with gentle pacing.</p>
        </div>
        {stopwatch.status === "running" ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            LIVE
          </span>
        ) : null}
      </header>

      <Card className={`flex flex-col items-center gap-6 p-8 ${stopwatch.status === "running" ? "shadow-glow" : ""}`}>
        <div className="text-center">
          <p className="text-5xl font-bold text-white">
            {formatDuration(stopwatch.elapsedSeconds)}
            <span className="ml-2 text-xl text-slate-400">{String(stopwatch.elapsedMs).padStart(3, "0")}</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">No time limit</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="min-h-[48px]" onClick={handleStart}>
            <span className="text-base">▶</span>
            {stopwatch.status === "running" ? "Running" : "Start"}
          </Button>
          <Button variant="secondary" className="min-h-[48px]" onClick={stopwatch.pause}>
            <span className="text-base">⏸</span>
            Pause
          </Button>
          <Button variant="ghost" className="min-h-[48px]" onClick={handleStop}>
            <span className="text-base">■</span>
            Stop
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distractions</p>
          <p className="mt-2 text-2xl font-bold">{distractions}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Idle time</p>
          <p className="mt-2 text-2xl font-bold">{formatHours(idleSeconds)}</p>
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
