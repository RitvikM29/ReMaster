import { getToken } from "@/services/authStore";

const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:4000");

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.error || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  return (await response.json()) as T;
}
