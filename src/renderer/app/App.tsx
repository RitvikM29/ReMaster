import { useState } from "react";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import HomeDashboard from "@/pages/HomeDashboard";
import ModeSelection from "@/pages/ModeSelection";
import SessionSummary from "@/pages/SessionSummary";
import { useSessions } from "@/hooks/useSessions";
import TimerScreen from "@/modules/timer/TimerScreen";
import StopwatchScreen from "@/modules/stopwatch/StopwatchScreen";
import DeepWorkScreen from "@/modules/deepwork/DeepWorkScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import HistoryDashboard from "@/pages/HistoryDashboard";
import ToastHost from "@/components/ToastHost";

export type ScreenKey =
  | "home"
  | "modes"
  | "timer"
  | "stopwatch"
  | "deepwork"
  | "summary"
  | "analytics"
  | "history"
  | "settings";

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("home");
  const sessions = useSessions();
  const latestScore = sessions[0]?.focusScore;

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] gap-6 p-6">
      <ToastHost />
      <aside className="card flex flex-col gap-8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow" />
          <div>
            <h2 className="text-lg font-semibold">ReMaster</h2>
            <p className="text-sm text-slate-400">Focus OS</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {[
            ["home", "Home"],
            ["modes", "Modes"],
            ["timer", "Timer"],
            ["stopwatch", "Stopwatch"],
            ["deepwork", "Deep Work"],
            ["summary", "Summary"],
            ["analytics", "Analytics"],
            ["history", "History"],
            ["settings", "Settings"]
          ].map(([key, label]) => (
            <button
              key={key}
              className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
                screen === key
                  ? "border-primary/60 bg-primary/10 text-white"
                  : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
              onClick={() => {
                const next = key as ScreenKey;
                if (next === screen) return;
                setScreen(next);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus score</p>
          <div className="text-3xl font-bold text-white">{latestScore ?? "--"}</div>
        </div>
      </aside>

      <main className="flex flex-col gap-6">
        <div className={screen === "home" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <HomeDashboard onQuickStart={(mode) => setScreen(mode)} />
        </div>
        <div className={screen === "modes" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <ModeSelection onSelect={(mode) => setScreen(mode)} />
        </div>
        <div className={screen === "timer" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <TimerScreen />
        </div>
        <div className={screen === "stopwatch" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <StopwatchScreen />
        </div>
        <div className={screen === "deepwork" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <DeepWorkScreen />
        </div>
        <div className={screen === "summary" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <SessionSummary />
        </div>
        <div className={screen === "analytics" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <AnalyticsDashboard />
        </div>
        <div className={screen === "history" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <HistoryDashboard />
        </div>
        <div className={screen === "settings" ? "screen-wrapper screen-active" : "screen-wrapper screen-hidden"}>
          <SettingsScreen />
        </div>
      </main>
    </div>
  );
}
