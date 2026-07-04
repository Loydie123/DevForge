"use client";

import type { AnalyticsStats } from "../../../services/analytics-hub/analytics-hub-service";

interface Props {
  stats: AnalyticsStats | undefined;
  isLoading: boolean;
}

const CARDS = [
  { key: "pageViewsToday",      label: "Page Views Today",     color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20" },
  { key: "uniqueVisitorsToday", label: "Unique Visitors",      color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  { key: "activeUsers",         label: "Active Users (Live)",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "eventsToday",         label: "Events Today",         color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
] as const;

export default function AnalyticsStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, color, bg, border }) => (
        <div key={key} className={`rounded-xl border p-5 flex flex-col gap-2 ${bg} ${border}`}>
          <div className="flex items-center gap-2">
            {key === "activeUsers" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${color}`}>{label}</span>
          </div>
          <span className={`text-4xl font-black font-mono ${color}`}>
            {stats ? String(stats[key]) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
