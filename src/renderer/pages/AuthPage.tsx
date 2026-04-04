import { useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/services/apiClient";
import { resendVerification } from "@/services/authApi";

export default function AuthPage() {
  const { login, signup, loading, error, notice } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [resetMode, setResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (resetMode) return;
    if (mode === "signup") {
      signup(email, password, name);
    } else {
      login(email, password);
    }
  };

  const handleReset = async () => {
    setResetStatus(null);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setResetStatus("If an account exists, a reset link was sent.");
    } catch {
      setResetStatus("Reset failed. Try again.");
    }
  };

  const handleResend = async () => {
    setVerifyStatus(null);
    try {
      await resendVerification({ email });
      setVerifyStatus("Verification email sent. Check your inbox.");
    } catch (err) {
      setVerifyStatus(err instanceof Error ? err.message : "Resend failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-white">Welcome to ReMaster</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to sync your focus history.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          ) : null}
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {resetMode ? null : (
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {notice ? <p className="text-sm text-amber-300">{notice}</p> : null}
          {verifyStatus ? <p className="text-sm text-slate-400">{verifyStatus}</p> : null}
          {resetStatus ? <p className="text-sm text-slate-400">{resetStatus}</p> : null}
          {resetMode ? (
            <Button className="w-full" type="button" onClick={handleReset} disabled={loading || !email}>
              Send reset link
            </Button>
          ) : (
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          )}
        </form>
        <div className="mt-4 text-sm text-slate-400">
          {resetMode ? (
            <button className="text-primary" onClick={() => setResetMode(false)} type="button">
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "signup" ? "Already have an account?" : "New to ReMaster?"}
              <button
                className="ml-2 text-primary"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                type="button"
              >
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
              <button className="ml-4 text-slate-500" onClick={() => setResetMode(true)} type="button">
                Forgot password?
              </button>
              <button className="ml-4 text-slate-500" onClick={handleResend} type="button">
                Resend verification
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
