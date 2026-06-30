"use client";

import { MetricPayload } from "@devforge/event-bus";

interface MetricsDisplayProps {
  metrics: MetricPayload | null;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 lg:col-span-1">
      <h2 className="text-lg font-mono font-bold text-slate-200 border-l-2 border-emerald-500 pl-3 uppercase tracking-wider">
        Real-time Metrics
      </h2>

      {metrics ? (
        <div className="grid grid-cols-1 gap-4">
          {/* CPU Usage Card */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
              <span>CPU Usage</span>
              <span className="font-mono text-emerald-400 font-bold">{metrics.cpuUsage}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.cpuUsage}%` }}
              />
            </div>
          </div>

          {/* Memory Usage Card */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
              <span>Memory Usage</span>
              <span className="font-mono text-teal-400 font-bold">
                {formatBytes(metrics.memoryUsageBytes)}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Allocated Node process size
            </div>
          </div>

          {/* Uptime Card */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
            <span className="text-slate-400 text-sm font-medium">Server Uptime</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {metrics.uptimeSeconds}s
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <span className="font-mono text-xs">Waiting for system metrics event...</span>
        </div>
      )}
    </div>
  );
}
