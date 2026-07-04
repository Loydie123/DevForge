"use client";

import type { SeoStats } from "@/services/seo-engine/seo-engine-service";

interface Props {
  stats?: SeoStats;
}

export default function SeoStats({ stats }: Props) {
  const cards = [
    {
      label: "Total Audits",
      value: stats?.totalAudits ?? 0,
      color: "text-indigo-400",
    },
    {
      label: "Avg Score",
      value: stats ? `${stats.avgScore}/100` : "—",
      color:
        (stats?.avgScore ?? 0) >= 75
          ? "text-green-400"
          : (stats?.avgScore ?? 0) >= 50
          ? "text-yellow-400"
          : "text-red-400",
    },
    {
      label: "Issues Found",
      value: stats?.issuesFound ?? 0,
      color: "text-orange-400",
    },
    {
      label: "Errors",
      value: stats?.issuesByType.errors ?? 0,
      color: "text-red-400",
    },
    {
      label: "Warnings",
      value: stats?.issuesByType.warnings ?? 0,
      color: "text-yellow-400",
    },
    {
      label: "Infos",
      value: stats?.issuesByType.infos ?? 0,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-xs text-gray-400">{c.label}</span>
          <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}
