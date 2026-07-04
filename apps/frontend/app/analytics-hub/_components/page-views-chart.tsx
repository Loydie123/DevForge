"use client";

import type { HourlyBucket } from "../../../services/analytics-hub/analytics-hub-service";

interface Props {
  hourlyData: HourlyBucket[];
  isLoading: boolean;
}

export default function PageViewsChart({ hourlyData, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-48 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse" />;
  }

  const max = Math.max(...hourlyData.map((h) => h.count), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-end gap-1 h-40">
          {hourlyData.map((bucket, i) => {
            const heightPct = Math.max((bucket.count / max) * 100, bucket.count > 0 ? 4 : 0);
            const isRecent = i >= hourlyData.length - 3;
            return (
              <div key={bucket.hour} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end" style={{ height: "130px" }}>
                  <div
                    className={`w-full rounded-t transition-all ${isRecent ? "bg-sky-500" : "bg-slate-700"} group-hover:opacity-80`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {bucket.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {bucket.count}
                    </span>
                  )}
                </div>
                {i % 4 === 0 && (
                  <span className="text-[9px] font-mono text-slate-600 rotate-0">{bucket.hour}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Hourly Breakdown (last 24h)</span>
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
          {hourlyData.filter((h) => h.count > 0).map((h) => (
            <div key={h.hour} className="flex flex-col items-center bg-slate-800/60 rounded-lg px-2 py-2 gap-1">
              <span className="text-[10px] font-mono text-slate-500">{h.hour}</span>
              <span className="text-sm font-bold font-mono text-sky-400">{h.count}</span>
            </div>
          ))}
          {hourlyData.every((h) => h.count === 0) && (
            <span className="col-span-6 text-xs font-mono text-slate-600">No page views recorded today.</span>
          )}
        </div>
      </div>
    </div>
  );
}
