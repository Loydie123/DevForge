"use client";

import type { PerformanceStats } from "../../../services/performance-hub/performance-hub-service";

interface Props {
  stats: PerformanceStats | null;
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

function latencyColor(ms: number) {
  if (ms < 100) return "text-emerald-400";
  if (ms < 300) return "text-yellow-400";
  return "text-red-400";
}

export default function PerformanceStats({ stats }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Avg Response"
        value={`${stats.avgResponseMs} ms`}
        color={latencyColor(stats.avgResponseMs)}
      />
      <StatCard
        label="P95 Latency"
        value={`${stats.p95ResponseMs} ms`}
        color={latencyColor(stats.p95ResponseMs)}
      />
      <StatCard
        label="Total Requests"
        value={stats.totalRequests.toLocaleString()}
        color="text-blue-400"
        sub="last 500 sampled"
      />
      <StatCard
        label="Error Rate"
        value={`${stats.errorRate}%`}
        color={stats.errorRate > 10 ? "text-red-400" : stats.errorRate > 2 ? "text-yellow-400" : "text-emerald-400"}
      />
      <StatCard
        label="Slow Queries"
        value={stats.slowQueriesCount.toLocaleString()}
        color={stats.slowQueriesCount > 10 ? "text-red-400" : "text-yellow-400"}
        sub="≥ 200 ms threshold"
      />
      <StatCard
        label="Memory Usage"
        value={`${stats.memoryUsageMb} MB`}
        color={stats.memoryUsageMb > 1000 ? "text-red-400" : "text-blue-400"}
      />
      <StatCard
        label="CPU Usage"
        value={`${stats.cpuPercent}%`}
        color={stats.cpuPercent > 80 ? "text-red-400" : stats.cpuPercent > 50 ? "text-yellow-400" : "text-emerald-400"}
      />
    </div>
  );
}
