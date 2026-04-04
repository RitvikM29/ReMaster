import { useEffect, useState } from "react";
import { ActivitySnapshot } from "@/types";
import { isElectron, platform } from "@/services/platform";

const emptySnapshot: ActivitySnapshot = {
  appName: null,
  title: null,
  ownerName: null,
  url: null,
  idleSeconds: 0
};

export function useActivityMonitor() {
  const [snapshot, setSnapshot] = useState<ActivitySnapshot>(emptySnapshot);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;
    let lastActive = Date.now();

    const updateSnapshot = () => {
      const idleSeconds = Math.max(0, Math.floor((Date.now() - lastActive) / 1000));
      setSnapshot({
        appName: "Browser",
        title: document.hidden ? "Tab Hidden" : document.title,
        ownerName: "Browser",
        url: window.location.href,
        idleSeconds
      });
    };

    if (isElectron) {
      platform
        .getActivitySnapshot()
        .then((data) => {
          if (mounted) setSnapshot(data);
        })
        .catch(() => undefined);
    } else {
      updateSnapshot();
      intervalId = window.setInterval(updateSnapshot, 1000);
    }

    const handler = (payload: ActivitySnapshot) => {
      setSnapshot(payload);
    };

    const listener = platform.onActivityUpdate(handler);

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove", "keydown", "scroll", "click"];
    const onUserActivity = () => {
      lastActive = Date.now();
      if (!isElectron) updateSnapshot();
    };

    activityEvents.forEach((eventName) => window.addEventListener(eventName, onUserActivity));
    document.addEventListener("visibilitychange", onUserActivity);

    return () => {
      mounted = false;
      platform.offActivityUpdate(listener);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onUserActivity));
      document.removeEventListener("visibilitychange", onUserActivity);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  return snapshot;
}
