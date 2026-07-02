"use client";

import { SystemMetrics } from "../../../services/monitoring-service";
import { formatBytes } from "../../../lib/utils";
import GaugeRing from "../../../components/ui/gauge-ring";

interface SystemMetricsPanelProps {
  metrics: SystemMetrics | undefined;
  isLoading: boolean;
}

export default function SystemMetricsPanel({
  metrics,
  isLoading,
}: SystemMetricsPanelProps) {
  if (isLoading || !metrics) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
          System Resources
        </h2>
        <div className="flex items-center justify-center gap-8 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[120px] h-[120px] rounded-full bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          System Resources
        </h2>
        <span className="text-[9px] font-mono text-slate-600">
          Updated {new Date(metrics.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Gauge Rings */}
      <div className="flex items-center justify-around gap-4 mb-6">
        <GaugeRing
          value={metrics.cpu.usedPercent}
          label="CPU"
          sublabel={`${metrics.cpu.cores} cores · ${metrics.cpu.model.split(" ").slice(0, 3).join(" ")}`}
          color="#10b981"
        />
        <GaugeRing
          value={metrics.memory.usedPercent}
          label="Memory"
          sublabel={`${formatBytes(metrics.memory.usedBytes)} / ${formatBytes(metrics.memory.totalBytes)}`}
          color="#6366f1"
        />
        <GaugeRing
          value={metrics.disk.usedPercent}
          label="Disk"
          sublabel={`${formatBytes(metrics.disk.usedBytes)} / ${formatBytes(metrics.disk.totalBytes)}`}
          color="#f59e0b"
        />
      </div>

      {/* Detail bars */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "CPU",
            used: `${metrics.cpu.usedPercent}%`,
            free: `${100 - metrics.cpu.usedPercent}% idle`,
            pct: metrics.cpu.usedPercent,
            from: "from-emerald-500",
            to: "to-teal-500",
          },
          {
            label: "RAM",
            used: formatBytes(metrics.memory.usedBytes),
            free: `${formatBytes(metrics.memory.freeBytes)} free`,
            pct: metrics.memory.usedPercent,
            from: "from-indigo-500",
            to: "to-violet-500",
          },
          {
            label: "Disk",
            used: formatBytes(metrics.disk.usedBytes),
            free: `${formatBytes(metrics.disk.freeBytes)} free`,
            pct: metrics.disk.usedPercent,
            from: "from-amber-500",
            to: "to-orange-500",
          },
        ].map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500">
                {item.label}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {item.used}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${item.from} ${item.to} rounded-full transition-all duration-700`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <span className="text-[8px] font-mono text-slate-600">
              {item.free}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
