"use client";

import { MetricPayload } from "@devforge/event-bus";
import { formatBytes } from "../../lib/utils";
import GaugeRing from "../../components/ui/gauge-ring";

interface MetricsDisplayProps {
  metrics: MetricPayload | null;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  // Assume memory allocation maximum of 1GB for percentage display on dashboard
  const maxNodeMemBytes = 1024 * 1024 * 1024;
  const memoryPercent = metrics
    ? Math.min(Math.round((metrics.memoryUsageBytes / maxNodeMemBytes) * 100), 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 lg:col-span-1">
      <h2 className="text-lg font-mono font-bold text-slate-200 border-l-2 border-emerald-500 pl-3 uppercase tracking-wider">
        Real-time Metrics
      </h2>

      {metrics ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Gauge Rings Container */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex items-center justify-around gap-4">
            <GaugeRing
              value={metrics.cpuUsage}
              label="CPU Load"
              sublabel="Process Core"
              color="#10b981"
              size={110}
            />
            <GaugeRing
              value={memoryPercent}
              label="Node RAM"
              sublabel={formatBytes(metrics.memoryUsageBytes)}
              color="#0d9488"
              size={110}
            />
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
