import { FocusSession } from "@/types";
import { toLocalDateKey } from "@/utils/date";

export function groupSessionsByWeek(sessions: FocusSession[]) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const map = new Map<string, FocusSession[]>();
  sessions.forEach((session) => {
    const date = new Date(session.startedAt);
    if (date < start) return;
    const key = toLocalDateKey(date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(session);
  });

  const days: Array<{ date: string; sessions: FocusSession[] }> = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toLocalDateKey(date);
    days.push({ date: key, sessions: map.get(key) ?? [] });
  }
  return days;
}
