interface ModeSelectionProps {
  onSelect: (mode: "timer" | "stopwatch" | "deepwork") => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Modes</p>
        <h1 className="text-3xl font-semibold text-white">Choose your focus state</h1>
        <p className="text-sm text-slate-400">Each mode adapts to your intention.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          {
            key: "timer",
            title: "Timer Mode",
            desc: "Pomodoro or custom countdowns with auto-save sessions.",
            icon: (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-primary">
                <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M9 3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          },
          {
            key: "stopwatch",
            title: "Stopwatch Mode",
            desc: "Open-ended focus with pause/resume and idle tracking.",
            icon: (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-accent">
                <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 13V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M9 3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M17 6l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          },
          {
            key: "deepwork",
            title: "Deep Work Mode",
            desc: "Locked sessions, distraction penalties, and strict rules.",
            icon: (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-primary">
                <path d="M12 3l7 4v5c0 4.6-3 8.7-7 9-4-.3-7-4.4-7-9V7z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          }
        ].map((mode) => (
          <button
            key={mode.key}
            className="card flex flex-col gap-4 p-6 text-left transition hover:-translate-y-1 hover:shadow-glow"
            onClick={() => onSelect(mode.key as "timer" | "stopwatch" | "deepwork")}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/70">
              {mode.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{mode.title}</h3>
              <p className="text-sm text-slate-400">{mode.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
