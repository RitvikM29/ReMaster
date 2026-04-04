import { useEffect, useRef, useState } from "react";
import { useActivityMonitor } from "@/services/activityMonitor";
import { useSettings } from "@/services/settingsStore";
import { extractDomain, matchesList } from "@/utils/distraction";

const REMASTER_APP_NAME = "remaster";
const BROWSER_APPS = ["Browser", "Chrome", "Google Chrome", "Chromium", "Microsoft Edge", "Safari", "Firefox", "Brave"];

function isBrowserApp(appName: string | null) {
  if (!appName) return false;
  const lower = appName.toLowerCase();
  return BROWSER_APPS.some((name) => lower.includes(name.toLowerCase()));
}

interface SessionMetricsOptions {
  running: boolean;
  onIdleThreshold?: () => void;
}

export function useSessionMetrics({ running, onIdleThreshold }: SessionMetricsOptions) {
  const activity = useActivityMonitor();
  const { settings } = useSettings();
  const [distractions, setDistractions] = useState(0);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastAppRef = useRef<string | null>(null);
  const lastDomainRef = useRef<string | null>(null);
  const lastTitleRef = useRef<string | null>(null);
  const lastIdleRef = useRef(0);
  const idlePausedRef = useRef(false);

  useEffect(() => {
    if (!running) {
      lastAppRef.current = activity.appName ?? null;
      lastDomainRef.current = extractDomain(activity.url ?? null);
      lastTitleRef.current = activity.title ?? null;
      lastIdleRef.current = activity.idleSeconds;
      idlePausedRef.current = false;
      return;
    }

    const currentApp = activity.appName ?? null;
    const lastApp = lastAppRef.current;
    if (currentApp && currentApp !== lastApp) {
      const allowlisted = matchesList(currentApp, settings.allowlist);
      const blocklisted = matchesList(currentApp, settings.blocklist);
      const lastWasRemaster = lastApp?.toLowerCase().includes(REMASTER_APP_NAME) ?? false;
      const shouldCount =
        settings.distractionRule === "leave-remaster"
          ? lastWasRemaster && !allowlisted
          : !allowlisted;
      if (shouldCount || blocklisted) {
        setDistractions((value) => value + 1);
      }
      lastAppRef.current = currentApp;
      lastTitleRef.current = activity.title ?? null;
    }

    if (currentApp && currentApp === lastApp && isBrowserApp(currentApp)) {
      const currentTitle = activity.title ?? null;
      const lastTitle = lastTitleRef.current;
      if (currentTitle && lastTitle && currentTitle !== lastTitle) {
        setDistractions((value) => value + 1);
        window.dispatchEvent(new CustomEvent("remaster:tab-switch"));
      }
      lastTitleRef.current = currentTitle;
    }

    const currentDomain = extractDomain(activity.url ?? null);
    const lastDomain = lastDomainRef.current;
    if (currentDomain && currentDomain !== lastDomain) {
      const allowlisted = matchesList(currentDomain, settings.siteAllowlist);
      const blocklisted = matchesList(currentDomain, settings.siteBlocklist);
      const shouldCount = !allowlisted || blocklisted;
      if (shouldCount) {
        setDistractions((value) => value + 1);
        window.dispatchEvent(new CustomEvent("remaster:tab-switch"));
      }
      lastDomainRef.current = currentDomain;
    }

    const idleNow = Math.floor(activity.idleSeconds);
    if (!document.hidden && idleNow >= settings.idleThresholdSeconds) {
      const idlePrev = lastIdleRef.current;
      if (idlePrev >= settings.idleThresholdSeconds) {
        const delta = Math.max(0, idleNow - idlePrev);
        if (delta > 0) {
          setIdleSeconds((value) => value + delta);
        }
      }
    }

    if (settings.idleAutoPause) {
      if (!document.hidden && idleNow >= settings.idleThresholdSeconds && !idlePausedRef.current) {
        onIdleThreshold?.();
        idlePausedRef.current = true;
      }
      if (idleNow < settings.idleThresholdSeconds && idlePausedRef.current) {
        idlePausedRef.current = false;
      }
    }

    lastIdleRef.current = idleNow;
  }, [activity, onIdleThreshold, running, settings]);

  const resetMetrics = () => {
    setDistractions(0);
    setIdleSeconds(0);
    lastAppRef.current = null;
    lastDomainRef.current = null;
    lastIdleRef.current = 0;
    idlePausedRef.current = false;
  };

  return {
    distractions,
    idleSeconds,
    resetMetrics
  };
}
