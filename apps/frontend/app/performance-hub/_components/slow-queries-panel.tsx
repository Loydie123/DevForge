"use client";

import type { SlowQuery } from "../../../services/performance-hub/performance-hub-service";

interface Props {
  queries: SlowQuery[];
}

function severityColor(ms: number) {
  if (ms < 500) return "text-yellow-400 bg-yellow-500/10";
  if (ms < 1000) return "text-orange-400 bg-orange-500/10";
  return "text-red-400 bg-red-500/10";
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  return `${Math.round(diff / 3_600_000)}h ago`;
}

export default function SlowQueriesPanel({ queries }: Props) {
  if (!queries.length) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
        <p className="text-emerald-400 font-medium">No slow queries detected</p>
        <p className="text-gray-500 text-sm mt-1">Queries exceeding 200 ms will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {queries.map((q) => (
        <div key={q.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${severityColor(q.latencyMs)}`}>
              {q.latencyMs} ms
            </span>
            <span className="text-xs text-gray-500">{timeAgo(q.timestamp)}</span>
          </div>
          <pre className="text-xs text-gray-300 font-mono bg-gray-900/60 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
            {q.sql}
          </pre>
          {q.params && q.params.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Params: {JSON.stringify(q.params)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
