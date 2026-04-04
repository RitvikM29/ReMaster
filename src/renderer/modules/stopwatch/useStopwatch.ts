import { useEffect, useRef, useState } from "react";

export type StopwatchStatus = "idle" | "running" | "paused";

export function useStopwatch() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [status, setStatus] = useState<StopwatchStatus>("idle");
  const intervalRef = useRef<number | null>(null);
  const msIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "running") return;
    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    msIntervalRef.current = window.setInterval(() => {
      setElapsedMs((prev) => (prev + 100) % 1000);
    }, 100);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (msIntervalRef.current) {
        window.clearInterval(msIntervalRef.current);
        msIntervalRef.current = null;
      }
    };
  }, [status]);

  const start = () => setStatus("running");
  const pause = () => setStatus("paused");
  const stop = () => {
    setStatus("idle");
    setElapsedSeconds(0);
    setElapsedMs(0);
  };

  return { elapsedSeconds, elapsedMs, status, start, pause, stop };
}
