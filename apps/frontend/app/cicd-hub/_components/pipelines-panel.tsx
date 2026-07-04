"use client";

import type { Pipeline } from "../../../services/cicd-hub/cicd-hub-service";

interface Props {
  pipelines: Pipeline[];
  onTrigger: (p: Pipeline) => void;
  triggeringId: string | null;
  showCreateForm: boolean;
  setShowCreateForm: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;
  newBranch: string;
  setNewBranch: (v: string) => void;
  onCreate: () => void;
  isCreating: boolean;
}

function statusDot(status: Pipeline["status"]) {
  const cls: Record<string, string> = {
    idle: "bg-gray-500",
    running: "bg-yellow-400 animate-pulse",
    success: "bg-emerald-400",
    failed: "bg-red-400",
    cancelled: "bg-gray-600",
  };
  return cls[status] ?? "bg-gray-500";
}

function timeAgo(ts?: number) {
  if (!ts) return "never";
  const d = Date.now() - ts;
  if (d < 60_000) return `${Math.round(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.round(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h ago`;
  return `${Math.round(d / 86_400_000)}d ago`;
}

export default function PipelinesPanel({
  pipelines, onTrigger, triggeringId,
  showCreateForm, setShowCreateForm,
  newName, setNewName, newBranch, setNewBranch,
  onCreate, isCreating,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Create button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Pipeline"}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-200">New Pipeline</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="my-api"
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Branch</label>
              <input
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                placeholder="main"
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={onCreate}
            disabled={isCreating || !newName.trim()}
            className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isCreating ? "Creating…" : "Create Pipeline"}
          </button>
        </div>
      )}

      {/* Pipelines list */}
      {pipelines.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
          No pipelines yet. Create one above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pipelines.map((p) => (
            <div key={p.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot(p.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                  <span className="text-xs text-gray-500 font-mono bg-gray-900 px-1.5 py-0.5 rounded">
                    {p.branch}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {p.stages.join(" → ")} · Last run {timeAgo(p.lastRunAt)}
                </div>
              </div>
              <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded ${
                p.status === "success" ? "text-emerald-400 bg-emerald-500/10" :
                p.status === "failed" ? "text-red-400 bg-red-500/10" :
                p.status === "running" ? "text-yellow-400 bg-yellow-500/10" :
                "text-gray-400 bg-gray-700"
              }`}>
                {p.status}
              </span>
              <button
                onClick={() => onTrigger(p)}
                disabled={triggeringId === p.id || p.status === "running"}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {triggeringId === p.id ? "Triggering…" : "Run Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
