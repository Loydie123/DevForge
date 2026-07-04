"use client";

import type { RouteStat } from "../../../services/performance-hub/performance-hub-service";

interface Props {
  routes: RouteStat[];
}

function latencyBadge(ms: number) {
  if (ms < 100) return "bg-emerald-500/10 text-emerald-400";
  if (ms < 300) return "bg-yellow-500/10 text-yellow-400";
  return "bg-red-500/10 text-red-400";
}

function methodBadge(method: string) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-400",
    POST: "bg-emerald-500/10 text-emerald-400",
    PUT: "bg-yellow-500/10 text-yellow-400",
    PATCH: "bg-orange-500/10 text-orange-400",
    DELETE: "bg-red-500/10 text-red-400",
  };
  return colors[method] ?? "bg-gray-500/10 text-gray-400";
}

export default function RouteAnalysisPanel({ routes }: Props) {
  if (!routes.length) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
        No route data yet. Requests will appear here after the backend receives traffic.
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Route Performance</h3>
        <span className="text-xs text-gray-500">sorted by P95 descending</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/50">
            <tr>
              {["Method", "Route", "Calls", "Avg", "P50", "P95", "P99", "Max", "Errors"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {routes.map((r) => (
              <tr key={`${r.method}-${r.path}`} className="hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${methodBadge(r.method)}`}>
                    {r.method}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-300 max-w-[240px] truncate">{r.path}</td>
                <td className="px-4 py-2 text-gray-300">{r.count}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${latencyBadge(r.avgMs)}`}>{r.avgMs} ms</span>
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">{r.p50Ms} ms</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${latencyBadge(r.p95Ms)}`}>{r.p95Ms} ms</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${latencyBadge(r.p99Ms)}`}>{r.p99Ms} ms</span>
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">{r.maxMs} ms</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold ${r.errorRate > 10 ? "text-red-400" : r.errorRate > 0 ? "text-yellow-400" : "text-gray-500"}`}>
                    {r.errorRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
