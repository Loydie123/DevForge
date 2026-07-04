"use client";

import { ErrorStats } from "../../../services/error-tracker/error-tracker-service";

interface Props {
  stats: ErrorStats | undefined;
  isLoading: boolean;
}

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", dot: "bg-orange-400" },
  medium:   { label: "Medium",   color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  low:      { label: "Low",      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
} as const;

export default function ErrorStatsPanel({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const topServices = Object.entries(stats?.byService ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {/* Severity cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(SEVERITY_CONFIG) as (keyof typeof SEVERITY_CONFIG)[]).map((sev) => {
          const cfg = SEVERITY_CONFIG[sev];
          const count = stats?.bySeverity[sev] ?? 0;
          return (
            <div key={sev} className={`rounded-xl border p-4 flex flex-col gap-2 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <span className={`text-3xl font-black font-mono ${cfg.color}`}>{count}</span>
              <span className="text-[10px] text-slate-500 font-mono">exceptions</span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Total + Recent */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Logged</span>
            <span className="text-2xl font-black text-white font-mono">{stats?.total ?? 0}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Last Hour</span>
            <span className="text-2xl font-black text-sky-400 font-mono">{stats?.recentCount ?? 0}</span>
          </div>
        </div>

        {/* Top services */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Top Services</span>
          {topServices.length === 0 ? (
            <span className="text-xs text-slate-600 font-mono">No data yet</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              {topServices.map(([svc, count]) => (
                <div key={svc} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">{svc}</span>
                  <span className="text-xs font-bold text-slate-400 font-mono">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
