"use client";

import { SystemMetrics } from "../../../services/monitoring-service";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function GaugeRing({
  value,
  label,
  sublabel,
  color,
  size = 120,
}: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-800"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold text-slate-100">
            {value}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-mono font-bold text-slate-300">
          {label}
        </p>
        <p className="text-[9px] font-mono text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}

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
