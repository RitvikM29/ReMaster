import { useCallback, useState } from "react";
import { clearAuth, getUser, setAuth } from "@/services/authStore";
import { login, signup } from "@/services/authApi";

export function useAuth() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await login({ email, password });
      setAuth(result.token, result.user);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await signup({ email, password, name });
      setAuth(result.token, result.user);
      setUser(result.user);
      if (result.warning) {
        setNotice(result.warning);
      } else if (result.emailSent === false) {
        setNotice("Verification email could not be sent. You can resend from the login screen.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return { user, loading, error, notice, login: handleLogin, signup: handleSignup, logout };
}
