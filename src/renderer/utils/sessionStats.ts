import { FocusSession } from "@/types";

export function calculateTodaySeconds(sessions: FocusSession[]) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return sessions
    .filter((s) => new Date(s.startedAt) >= start)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
}

export function calculateStreakDays(sessions: FocusSession[]) {
  const dates = new Set(sessions.map((session) => new Date(session.startedAt).toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak += 1;
    } else if (offset > 0) {
      break;
    }
  }
  return streak;
}

export function calculateCompletedSessions(sessions: FocusSession[]) {
  return sessions.length;
}

export function averageFocusScore(sessions: FocusSession[]) {
  if (!sessions.length) return 0;
  const total = sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0);
  return Math.round(total / sessions.length);
}
