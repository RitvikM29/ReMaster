import { apiRequest } from "@/services/apiClient";

export async function signup(payload: { email: string; password: string; name?: string }) {
  return apiRequest<{
    token: string;
    user: { id: number; email: string; name?: string };
    emailSent?: boolean;
    warning?: string | null;
  }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiRequest<{ token: string; user: { id: number; email: string; name?: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function resendVerification(payload: { email: string }) {
  return apiRequest<{ ok: boolean }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
