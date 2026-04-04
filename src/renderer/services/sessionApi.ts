import { apiRequest } from "@/services/apiClient";
import { FocusSession } from "@/types";
import { emitSessionChange } from "@/services/sessionEvents";

export interface AnalyticsResponse {
  daily: [string, number][];
  subjectSplit: [string, number][];
  focusScores: number[];
  insights: string[];
}

export async function fetchSessions() {
  return apiRequest<FocusSession[]>("/sessions");
}

export async function createSession(payload: FocusSession) {
  const session = await apiRequest<FocusSession>("/sessions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  emitSessionChange();
  return session;
}

export async function fetchAnalytics() {
  return apiRequest<AnalyticsResponse>("/analytics");
}
