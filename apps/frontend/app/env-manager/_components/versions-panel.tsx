"use client";

import type { EnvVersion } from "@/services/env-manager/env-manager-service";

interface Props {
  versions: EnvVersion[];
  isLoading: boolean;
  onRestore: (versionId: string) => void;
  isRestoring: boolean;
}

export default function VersionsPanel({ versions, isLoading, onRestore, isRestoring }: Props) {
  if (isLoading) {
    return <div className="text-xs text-gray-500 animate-pulse py-8 text-center">Loading versions…</div>;
  }

  if (versions.length === 0) {
    return <div className="text-xs text-gray-500 py-8 text-center">No version history</div>;
  }

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/80">
        <span className="text-xs font-semibold text-gray-300">Version History</span>
      </div>
      <div className="flex flex-col divide-y divide-gray-700/40">
        {versions.map((ver) => (
          <div key={ver.id} className="flex items-start gap-4 px-4 py-3 hover:bg-gray-700/20 group">
            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
              <span className="text-indigo-400 font-mono text-xs font-bold">v{ver.version}</span>
              <div className="w-px flex-1 bg-gray-700 min-h-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-white">{ver.note ?? "Config updated"}</span>
              </div>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span>{ver.changedBy}</span>
                <span>{new Date(ver.changedAt).toLocaleString()}</span>
                <span>{ver.snapshot.length} variables</span>
              </div>
            </div>
            <button
              onClick={() => onRestore(ver.id)}
              disabled={isRestoring}
              className="text-xs px-3 py-1 bg-gray-700 hover:bg-indigo-600 disabled:opacity-50 text-gray-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
