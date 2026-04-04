import { useMemo } from "react";

export type HeatmapDatum = {
  date: string;
  count: number;
};

const COLORS = ["#020617", "#0e7490", "#0891b2", "#06b6d4", "#22d3ee"];

function normalizeLevel(count: number, max: number) {
  if (count <= 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] text-slate-100 shadow-soft">
      {label}
    </div>
  );
}

function HeatmapCell({ count, date, max }: { count: number; date: string; max: number }) {
  const level = normalizeLevel(count, max);
  const label = `${count} sessions on ${new Date(date).toLocaleString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="group relative">
      <div
        className="h-4 w-4 rounded-sm transition-transform duration-150 group-hover:scale-110"
        style={{ backgroundColor: COLORS[level], boxShadow: level > 2 ? "0 0 8px rgba(34,211,238,0.4)" : "none" }}
      />
      <div className="hidden group-hover:block">
        <Tooltip label={label} />
      </div>
    </div>
  );
}

function HeatmapGrid({ data }: { data: HeatmapDatum[] }) {
  const max = useMemo(() => Math.max(...data.map((d) => d.count), 0), [data]);

  return (
    <div className="grid grid-rows-7 grid-flow-col gap-2 animate-fade-in">
      {data.map((day) => (
        <HeatmapCell key={day.date} count={day.count} date={day.date} max={max} />
      ))}
    </div>
  );
}

export default function Heatmap({ data, showMonths = true }: { data: HeatmapDatum[]; showMonths?: boolean }) {
  const weekCount = Math.ceil(data.length / 7);
  const monthLabels = showMonths
    ? Array.from({ length: weekCount }).map((_, weekIndex) => {
        if (weekIndex % 4 !== 0) return "";
        const first = data[weekIndex * 7];
        if (!first) return "";
        const date = new Date(first.date);
        return date.toLocaleString("en-US", { month: "short" });
      })
    : [];

  return (
    <div>
      {showMonths ? (
        <div className="mb-2 flex gap-2 pl-8 text-xs text-slate-500">
          {monthLabels.map((label, idx) => (
            <span key={`${label}-${idx}`} className="inline-block w-4 text-left">
              {label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-3">
        <div className="flex flex-col gap-2 text-[10px] text-slate-500">
          <span className="h-4">Sun</span>
          <span className="h-4">Mon</span>
          <span className="h-4">Tue</span>
          <span className="h-4">Wed</span>
          <span className="h-4">Thu</span>
          <span className="h-4">Fri</span>
          <span className="h-4">Sat</span>
        </div>
        <HeatmapGrid data={data} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>Less</span>
        {COLORS.map((color) => (
          <span key={color} className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
