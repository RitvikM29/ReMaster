import { useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { apiRequest } from "@/services/apiClient";

export default function VerifyPage({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleVerify = async () => {
    setStatus("loading");
    try {
      await apiRequest("/auth/verify", { method: "POST", body: JSON.stringify({ token }) });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-400">Click below to confirm your account.</p>
        {status === "done" ? (
          <p className="mt-4 text-sm text-emerald-400">Verified! You can now sign in.</p>
        ) : status === "error" ? (
          <p className="mt-4 text-sm text-red-400">Verification failed. Request a new link.</p>
        ) : null}
        <Button className="mt-6 w-full" onClick={handleVerify} disabled={status === "loading"}>
          {status === "loading" ? "Verifying..." : "Verify"}
        </Button>
      </Card>
    </div>
  );
}
