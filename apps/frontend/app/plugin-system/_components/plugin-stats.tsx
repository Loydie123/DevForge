"use client";

import type { PluginStats } from "@/services/plugin-system/plugin-system-service";

const HOOKS = ["onRequest", "onResponse", "onError", "onLog", "onMetric"] as const;

export default function PluginStats({ stats }: { stats?: PluginStats }) {
  const cards = [
    { label: "Installed", value: stats?.totalPlugins ?? 0, color: "text-indigo-400" },
    { label: "Active", value: stats?.activePlugins ?? 0, color: "text-green-400" },
    { label: "Total Triggers", value: stats?.totalTriggers ?? 0, color: "text-blue-400" },
    { label: "Errors", value: stats?.totalErrors ?? 0, color: "text-red-400" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-xs text-gray-400">{c.label}</span>
            <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
          </div>
        ))}
      </div>

      {stats && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-300 mb-3">Hook Usage</p>
          <div className="flex flex-col gap-2">
            {HOOKS.map((hook) => {
              const count = stats.hookUsage[hook] ?? 0;
              const max = Math.max(...Object.values(stats.hookUsage), 1);
              return (
                <div key={hook} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-indigo-300 w-28 shrink-0">{hook}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
