import { useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { apiRequest } from "@/services/apiClient";

export default function ResetPasswordPage({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleReset = async () => {
    setStatus("loading");
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-slate-400">Enter a new password.</p>
        <input
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {status === "done" ? (
          <p className="mt-3 text-sm text-emerald-400">Password updated. You can sign in.</p>
        ) : status === "error" ? (
          <p className="mt-3 text-sm text-red-400">Reset failed. Try again.</p>
        ) : null}
        <Button className="mt-6 w-full" onClick={handleReset} disabled={status === "loading" || !password}>
          {status === "loading" ? "Resetting..." : "Reset password"}
        </Button>
      </Card>
    </div>
  );
}
