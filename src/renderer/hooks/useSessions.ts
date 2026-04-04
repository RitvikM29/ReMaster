import { useCallback, useEffect, useState } from "react";
import { FocusSession } from "@/types";
import { fetchSessions } from "@/services/sessionApi";
import { subscribeSessionChange } from "@/services/sessionEvents";

export function useSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeSessionChange(load);
    const handleFocus = () => load();
    const handleVisibility = () => {
      if (!document.hidden) load();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load]);

  return { sessions, loading, error, reload: load };
}
