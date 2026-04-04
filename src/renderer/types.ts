export type FocusMode = "timer" | "stopwatch" | "deepwork";

export interface FocusSession {
  id: string | number;
  mode: FocusMode;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  distractions: number;
  idleSeconds: number;
  focusScore: number;
  label?: string;
}

export interface FocusStats {
  todaySeconds: number;
  streakDays: number;
}

export interface ActivitySnapshot {
  appName: string | null;
  title: string | null;
  ownerName: string | null;
  url: string | null;
  idleSeconds: number;
}
