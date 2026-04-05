import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { platform } from "@/services/platform";
import { clearFocusActiveMode, setFocusActiveMode, useBeforeUnloadGuard } from "@/services/focusGuard";
import { useTabSwitchGuard } from "@/services/tabGuard";
import { useSessionMetrics } from "@/services/sessionMetrics";
import { useSettings } from "@/services/settingsStore";
import { createSession } from "@/services/sessionApi";
import { showToast } from "@/services/toast";
import { FocusSession } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import { calcFocusScore } from "@/utils/focusScore";
import { formatDuration } from "@/utils/time";
import { useTimer } from "@/modules/timer/useTimer";

const DEFAULT_DEEP_MINUTES = 52;

export default function DeepWorkScreen() {
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [pendingSession, setPendingSession] = useState<FocusSession | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const { settings } = useSettings();

  const timer = useTimer({
    initialMinutes: DEFAULT_DEEP_MINUTES,
    allowPause: false,
    onComplete: () => {
      if (!sessionStartedAt) return;
      const focusScore = calcFocusScore({
        distractions,
        idleSeconds,
        earlyTerminate: false
      });
      const session: FocusSession = {
        id: crypto.randomUUID(),
        mode: "deepwork",
        durationSeconds: timer.durationSeconds,
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        distractions,
        idleSeconds,
        focusScore,
        label: "Deep Work"
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
      setFocusActiveMode("deepwork");
    } else {
      clearFocusActiveMode("deepwork");
    }
    return () => clearFocusActiveMode("deepwork");
  }, [timer.status]);

  const statusLabel = useMemo(() => {
    switch (timer.status) {
      case "running":
        return "Locked in";
      case "completed":
        return "Deep work complete";
      default:
        return "Ready";
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

  const handleEnd = () => {
    if (!sessionStartedAt) return;
    const elapsedSeconds = timer.durationSeconds - timer.remainingSeconds;
    const focusScore = calcFocusScore({
      distractions,
      idleSeconds,
      earlyTerminate: true
    });
    if (elapsedSeconds >= 30) {
      setPendingSession({
        id: crypto.randomUUID(),
        mode: "deepwork",
        durationSeconds: Math.max(0, elapsedSeconds),
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        distractions,
        idleSeconds,
        focusScore,
        label: "Deep Work"
      });
      setShowSavePrompt(true);
    }
    setSessionStartedAt(null);
    resetMetrics();
    timer.reset();
    setConfirmEnd(false);
    if (settings.blockerEnabled) {
      platform.clearBlocklist().catch(() => undefined);
    }
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
      timer.reset();
      setConfirmEnd(false);
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
    setConfirmEnd(false);
    if (settings.blockerEnabled) {
      platform.clearBlocklist().catch(() => undefined);
    }
  };

  return (
    <section className="min-h-[70vh] rounded-2xl bg-[#020617] p-6 shadow-glow">
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Deep Work</p>
        <div className="text-5xl font-bold text-white">{formatDuration(timer.remainingSeconds)}</div>
        <p className="text-sm text-slate-400">Stay focused. Every distraction counts.</p>
        <p className="text-xs text-slate-500">{statusLabel} · {distractions} distractions</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="min-h-[48px]" onClick={handleStart}>
            {timer.status === "running" ? "Running" : "Start"}
          </Button>
          {!confirmEnd ? (
            <Button variant="ghost" className="min-h-[48px]" onClick={() => setConfirmEnd(true)}>
              End Session
            </Button>
          ) : (
            <Button variant="secondary" className="min-h-[48px]" onClick={handleEnd}>
              Confirm End
            </Button>
          )}
        </div>
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
