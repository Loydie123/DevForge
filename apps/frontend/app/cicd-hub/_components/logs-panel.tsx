"use client";

import type { PipelineRun } from "../../../services/cicd-hub/cicd-hub-service";

interface Props {
  run: PipelineRun | null;
  onBack: () => void;
}

function stageBadge(status: string) {
  const cls: Record<string, string> = {
    pending: "text-gray-400 bg-gray-700",
    running: "text-yellow-400 bg-yellow-500/10 animate-pulse",
    success: "text-emerald-400 bg-emerald-500/10",
    failed: "text-red-400 bg-red-500/10",
    skipped: "text-gray-500 bg-gray-800",
  };
  return cls[status] ?? "text-gray-400 bg-gray-700";
}

function fmtDuration(ms?: number) {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function LogsPanel({ run, onBack }: Props) {
  if (!run) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
        Select a run from the Run History tab to view logs.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-white transition-colors">
          ← Back
        </button>
        <div className="flex-1">
          <span className="text-sm font-semibold text-white">{run.pipelineName}</span>
          <span className="text-xs text-gray-500 ml-2">#{run.id.slice(-6)}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold capitalize ${
          run.status === "success" ? "text-emerald-400 bg-emerald-500/10" :
          run.status === "failed" ? "text-red-400 bg-red-500/10" :
          run.status === "running" ? "text-yellow-400 bg-yellow-500/10" :
          "text-gray-400 bg-gray-700"
        }`}>
          {run.status === "running" && <span className="mr-1 animate-pulse">●</span>}
          {run.status}
        </span>
      </div>

      {/* Stage pipeline bar */}
      <div className="flex gap-2 items-center">
        {run.stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-700">→</span>}
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${stageBadge(stage.status)}`}>
              {stage.name}
              {stage.durationMs ? <span className="ml-1 opacity-60">({fmtDuration(stage.durationMs)})</span> : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Logs per stage */}
      {run.stages.map((stage) => (
        <div key={stage.name} className="bg-gray-900 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className={`px-4 py-2 flex items-center justify-between border-b border-gray-700/50 ${
            stage.status === "failed" ? "bg-red-500/5" :
            stage.status === "success" ? "bg-emerald-500/5" :
            stage.status === "running" ? "bg-yellow-500/5" : ""
          }`}>
            <span className="text-sm font-semibold text-gray-200 capitalize">{stage.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${stageBadge(stage.status)}`}>
              {stage.status}
            </span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
            {stage.logs.length === 0 ? (
              <span className="text-gray-600 italic">
                {stage.status === "pending" ? "Waiting…" :
                 stage.status === "skipped" ? "Skipped" : "No logs"}
              </span>
            ) : (
              stage.logs.map((log, i) => (
                <div key={i} className={`${
                  log.startsWith("❌") || log.startsWith("✗") ? "text-red-400" :
                  log.startsWith("✅") || log.startsWith("✓") ? "text-emerald-400" :
                  log.startsWith("🚀") || log.startsWith("📦") || log.startsWith("🔨") || log.startsWith("🧪") ? "text-indigo-300" :
                  "text-gray-400"
                }`}>
                  {log}
                </div>
              ))
            )}
            {stage.status === "running" && (
              <span className="text-yellow-400 animate-pulse">▋</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
