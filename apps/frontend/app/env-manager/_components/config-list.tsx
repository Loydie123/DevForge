"use client";

import type { EnvConfig, EnvType } from "@/services/env-manager/env-manager-service";

interface Props {
  configs: EnvConfig[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
  envColor: (e: EnvType) => string;
}

export default function ConfigList({ configs, activeId, onSelect, onDelete, onCreateClick, envColor }: Props) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <span className="text-xs font-semibold text-gray-300">Configs</span>
        <button
          onClick={onCreateClick}
          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          + New
        </button>
      </div>
      <div className="flex flex-col divide-y divide-gray-700/40 overflow-y-auto max-h-[calc(100vh-320px)]">
        {configs.length === 0 && (
          <p className="text-xs text-gray-500 p-4 text-center">No configs yet</p>
        )}
        {configs.map((cfg) => (
          <div
            key={cfg.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(cfg.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(cfg.id); }}
            className={`flex flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-gray-700/30 cursor-pointer ${
              activeId === cfg.id ? "bg-indigo-600/10 border-l-2 border-indigo-500" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-white truncate">{cfg.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(cfg.id); }}
                className="text-gray-600 hover:text-red-400 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${envColor(cfg.environment)}`}>
                {cfg.environment}
              </span>
              <span className="text-xs text-gray-500">v{cfg.version}</span>
              <span className="text-xs text-gray-600">{cfg.variables.length} vars</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
