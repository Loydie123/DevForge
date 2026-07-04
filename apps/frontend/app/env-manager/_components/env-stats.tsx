"use client";

import type { EnvStats } from "@/services/env-manager/env-manager-service";

export default function EnvStats({ stats }: { stats?: EnvStats }) {
  const cards = [
    { label: "Configs", value: stats?.totalConfigs ?? 0, color: "text-indigo-400" },
    { label: "Variables", value: stats?.totalVariables ?? 0, color: "text-gray-300" },
    { label: "Secrets", value: stats?.totalSecrets ?? 0, color: "text-red-400" },
    { label: "Versions", value: stats?.totalVersions ?? 0, color: "text-purple-400" },
    { label: "Dev", value: stats?.byEnvironment.development ?? 0, color: "text-green-400" },
    { label: "Staging", value: stats?.byEnvironment.staging ?? 0, color: "text-yellow-400" },
    { label: "Prod", value: stats?.byEnvironment.production ?? 0, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs text-gray-400">{c.label}</span>
          <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}
