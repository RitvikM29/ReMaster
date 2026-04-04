import { useEffect, useState } from "react";

export type DistractionRule = "leave-remaster" | "any-non-allowlisted";

export interface FocusSettings {
  allowlist: string[];
  blocklist: string[];
  siteAllowlist: string[];
  siteBlocklist: string[];
  distractionRule: DistractionRule;
  idleAutoPause: boolean;
  idleThresholdSeconds: number;
  blockerEnabled: boolean;
}

const STORAGE_KEY = "remaster.settings.v1";

const defaultSettings: FocusSettings = {
  allowlist: ["ReMaster", "Electron"],
  blocklist: [],
  siteAllowlist: [],
  siteBlocklist: [],
  distractionRule: "leave-remaster",
  idleAutoPause: false,
  idleThresholdSeconds: 60,
  blockerEnabled: false
};

const listeners = new Set<(settings: FocusSettings) => void>();

function sanitizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function sanitizeSettings(raw: Partial<FocusSettings> | null): FocusSettings {
  return {
    allowlist: sanitizeList(raw?.allowlist ?? defaultSettings.allowlist),
    blocklist: sanitizeList(raw?.blocklist ?? defaultSettings.blocklist),
    siteAllowlist: sanitizeList(raw?.siteAllowlist ?? defaultSettings.siteAllowlist),
    siteBlocklist: sanitizeList(raw?.siteBlocklist ?? defaultSettings.siteBlocklist),
    distractionRule:
      raw?.distractionRule === "any-non-allowlisted" || raw?.distractionRule === "leave-remaster"
        ? raw.distractionRule
        : defaultSettings.distractionRule,
    idleAutoPause: typeof raw?.idleAutoPause === "boolean" ? raw.idleAutoPause : defaultSettings.idleAutoPause,
    idleThresholdSeconds:
      typeof raw?.idleThresholdSeconds === "number" && raw.idleThresholdSeconds >= 5
        ? raw.idleThresholdSeconds
        : defaultSettings.idleThresholdSeconds,
    blockerEnabled: typeof raw?.blockerEnabled === "boolean" ? raw.blockerEnabled : defaultSettings.blockerEnabled
  };
}

function readSettings(): FocusSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as Partial<FocusSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: FocusSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const settingsStore = {
  get(): FocusSettings {
    return readSettings();
  },
  update(patch: Partial<FocusSettings>) {
    const next = sanitizeSettings({ ...readSettings(), ...patch });
    writeSettings(next);
    listeners.forEach((listener) => listener(next));
  },
  subscribe(listener: (settings: FocusSettings) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<FocusSettings>(() => settingsStore.get());

  useEffect(() => {
    const unsubscribe = settingsStore.subscribe(setSettings);
    return () => unsubscribe();
  }, []);

  return { settings, updateSettings: settingsStore.update };
}
