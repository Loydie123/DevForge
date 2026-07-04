"use client";

import type { Plugin } from "@/services/plugin-system/plugin-system-service";

const hookColor: Record<string, string> = {
  onRequest: "text-blue-400 bg-blue-400/10",
  onResponse: "text-green-400 bg-green-400/10",
  onError: "text-red-400 bg-red-400/10",
  onLog: "text-yellow-400 bg-yellow-400/10",
  onMetric: "text-purple-400 bg-purple-400/10",
};

const categoryIcon: Record<string, string> = {
  monitoring: "📊",
  security: "🔐",
  analytics: "📈",
  logging: "📄",
  devops: "🐳",
  ai: "🤖",
  utility: "🔧",
};

interface Props {
  plugins: Plugin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onUninstall: (id: string) => void;
  isToggling: boolean;
}

export default function InstalledPanel({ plugins, selectedId, onSelect, onToggle, onUninstall, isToggling }: Props) {
  if (plugins.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No plugins installed. Browse the Marketplace tab to install one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {plugins.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(p.id)}
          onKeyDown={(e) => { if (e.key === "Enter") onSelect(p.id); }}
          className={`bg-gray-800/60 border rounded-xl p-4 cursor-pointer flex flex-col gap-3 transition-all hover:bg-gray-700/40 ${
            selectedId === p.id ? "border-indigo-500/60" : "border-gray-700/50"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{categoryIcon[p.manifest.category] ?? "🔌"}</span>
              <div>
                <div className="text-sm font-semibold text-white">{p.manifest.name}</div>
                <div className="text-xs text-gray-500">v{p.manifest.version} · {p.manifest.author}</div>
              </div>
            </div>
            <div
              role="switch"
              aria-checked={p.enabled}
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onToggle(p.id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onToggle(p.id); } }}
              className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors shrink-0 ${p.enabled ? "bg-indigo-600" : "bg-gray-600"} ${isToggling ? "opacity-50" : ""}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.enabled ? "translate-x-5" : ""}`} />
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-400 line-clamp-2">{p.manifest.description}</p>

          {/* Hooks */}
          <div className="flex flex-wrap gap-1">
            {p.manifest.hooks.map((h) => (
              <span key={h} className={`text-xs px-1.5 py-0.5 rounded font-mono ${hookColor[h] ?? "text-gray-400 bg-gray-400/10"}`}>
                {h}
              </span>
            ))}
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-700/50">
            <span>{p.triggerCount} triggers</span>
            {p.errorCount > 0 && <span className="text-red-400">{p.errorCount} errors</span>}
            <button
              onClick={(e) => { e.stopPropagation(); onUninstall(p.id); }}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              Uninstall
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
