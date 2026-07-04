"use client";

import type { PipelineRun } from "../../../services/cicd-hub/cicd-hub-service";

interface Props {
  runs: PipelineRun[];
  onSelectRun: (id: string) => void;
}

function fmtDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return `${Math.round(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.round(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h ago`;
  return `${Math.round(d / 86_400_000)}d ago`;
}

function statusBadge(status: PipelineRun["status"]) {
  const cls: Record<string, string> = {
    running: "text-yellow-400 bg-yellow-500/10",
    success: "text-emerald-400 bg-emerald-500/10",
    failed: "text-red-400 bg-red-500/10",
    cancelled: "text-gray-400 bg-gray-700",
    idle: "text-gray-400 bg-gray-700",
  };
  return cls[status] ?? "text-gray-400 bg-gray-700";
}

function triggerBadge(trigger: PipelineRun["trigger"]) {
  const cls: Record<string, string> = {
    manual: "text-blue-400 bg-blue-500/10",
    webhook: "text-purple-400 bg-purple-500/10",
    schedule: "text-indigo-400 bg-indigo-500/10",
  };
  return cls[trigger] ?? "text-gray-400 bg-gray-700";
}

export default function RunsPanel({ runs, onSelectRun }: Props) {
  if (!runs.length) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
        No runs yet. Trigger a pipeline to see results here.
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/50">
            <tr>
              {["Pipeline", "Branch", "Trigger", "Status", "Duration", "Started", "Logs"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-2.5 text-white font-medium">{r.pipelineName}</td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded">
                    {r.branch}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${triggerBadge(r.trigger)}`}>
                    {r.trigger}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize font-semibold ${statusBadge(r.status)}`}>
                    {r.status === "running" && <span className="inline-block mr-1 animate-pulse">●</span>}
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{fmtDuration(r.durationMs)}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{timeAgo(r.startedAt)}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onSelectRun(r.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
