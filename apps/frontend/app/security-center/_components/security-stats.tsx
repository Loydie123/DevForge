"use client";

import { SecurityStats } from "../../../services/security-center/security-center-service";

interface Props {
  stats: SecurityStats | undefined;
  isLoading: boolean;
}

const STAT_CARDS = [
  { key: "totalRequests",      label: "Total Requests",       color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20" },
  { key: "requestsLastMinute", label: "Req / Last Minute",    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "uniqueIps",          label: "Unique IPs",           color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { key: "suspiciousIps",      label: "Suspicious IPs",       color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20" },
  { key: "auditEventsToday",   label: "Audit Events Today",   color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
] as const;

export default function SecurityStatsPanel({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ key, label, color, bg, border }) => (
          <div key={key} className={`rounded-xl border p-4 flex flex-col gap-2 ${bg} ${border}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${color}`}>{label}</span>
            <span className={`text-3xl font-black font-mono ${color}`}>
              {stats ? String(stats[key]) : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Top paths */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Top Requested Endpoints</span>
        {!stats?.topPaths?.length ? (
          <span className="text-xs text-slate-600 font-mono">No requests recorded yet. Interact with the API to populate this.</span>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.topPaths.map(({ path, count }) => {
              const pct = Math.round((count / (stats.totalRequests || 1)) * 100);
              return (
                <div key={path} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-300 w-64 truncate">{path}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
