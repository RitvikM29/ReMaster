import { useEffect, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  info: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; tone?: ToastTone }>).detail;
      if (!detail?.message) return;
      const toast: Toast = {
        id: crypto.randomUUID(),
        message: detail.message,
        tone: detail.tone ?? "success"
      };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3200);
    };
    window.addEventListener("remaster:toast", handler);
    return () => window.removeEventListener("remaster:toast", handler);
  }, []);

  const visible = useMemo(() => toasts.slice(-3), [toasts]);

  if (!visible.length) return null;

  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
      {visible.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[220px] rounded-2xl border px-4 py-3 text-sm shadow-glow backdrop-blur ${toneStyles[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
