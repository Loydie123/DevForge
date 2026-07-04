"use client";

import type { CicdStats } from "../../../services/cicd-hub/cicd-hub-service";

interface Props {
  stats: CicdStats | null;
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

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export default function CicdStats({ stats }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        label="Total Runs"
        value={stats.totalRuns.toLocaleString()}
        color="text-blue-400"
      />
      <StatCard
        label="Success Rate"
        value={`${stats.successRate}%`}
        color={stats.successRate >= 80 ? "text-emerald-400" : stats.successRate >= 60 ? "text-yellow-400" : "text-red-400"}
      />
      <StatCard
        label="Avg Duration"
        value={fmtDuration(stats.avgDurationMs)}
        color="text-indigo-400"
      />
      <StatCard
        label="Active Runs"
        value={stats.activeRuns.toString()}
        color={stats.activeRuns > 0 ? "text-yellow-400" : "text-gray-500"}
        sub={stats.activeRuns > 0 ? "running now" : "none running"}
      />
      <StatCard
        label="Pipelines"
        value={stats.totalPipelines.toString()}
        color="text-purple-400"
      />
      <StatCard
        label="Failed Today"
        value={stats.failedToday.toString()}
        color={stats.failedToday > 0 ? "text-red-400" : "text-emerald-400"}
      />
    </div>
  );
}
