import { useEffect, useMemo, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerOptions {
  initialMinutes: number;
  onComplete?: () => void;
  allowPause?: boolean;
}

export function useTimer(options: TimerOptions) {
  const [durationMinutes, setDurationMinutes] = useState(options.initialMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(options.initialMinutes * 60);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(options.onComplete);

  const durationSeconds = useMemo(() => durationMinutes * 60, [durationMinutes]);

  useEffect(() => {
    setRemainingSeconds(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  }, [options.onComplete]);

  useEffect(() => {
    if (status !== "running") return;
    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current ?? undefined);
          intervalRef.current = null;
          setStatus("completed");
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const start = () => {
    if (status === "running") return;
    if (remainingSeconds === 0) {
      setRemainingSeconds(durationSeconds);
    }
    setStatus("running");
  };

  const pause = () => {
    if (options.allowPause === false) return;
    if (status !== "running") return;
    setStatus("paused");
  };

  const reset = () => {
    setStatus("idle");
    setRemainingSeconds(durationSeconds);
  };

  return {
    durationMinutes,
    durationSeconds,
    remainingSeconds,
    status,
    setDurationMinutes,
    start,
    pause,
    reset
  };
}
