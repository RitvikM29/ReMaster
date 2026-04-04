import { formatDuration } from "@/utils/time";

interface TimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: "idle" | "running" | "paused" | "completed";
}

export default function TimerDisplay({ remainingSeconds, totalSeconds, status }: TimerDisplayProps) {
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <svg className="absolute" width="260" height="260">
        <circle
          cx="130"
          cy="130"
          r={radius}
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="130"
          cy="130"
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={status === "running" ? "transition-all duration-500" : "transition-all duration-300"}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
      </svg>
      <div className={status === "running" ? "text-center animate-pop-in" : "text-center"}>
        <p className="text-5xl font-bold text-white">{formatDuration(remainingSeconds)}</p>
        <p className="mt-2 text-sm text-slate-400">{Math.floor(totalSeconds / 60)} min focus</p>
      </div>
      {status === "completed" ? (
        <div className="absolute inset-0 rounded-full border border-primary/40 animate-ring-pulse" />
      ) : null}
    </div>
  );
}
