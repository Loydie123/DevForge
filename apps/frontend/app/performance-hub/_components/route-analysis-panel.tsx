"use client";

import type { RouteStat } from "../../../services/performance-hub/performance-hub-service";

interface Props {
  routes: RouteStat[];
}

function latencyColor(ms: number) {
  if (ms < 100) return "text-emerald-400";
  if (ms < 300) return "text-yellow-400";
  return "text-red-400";
}

function latencyBg(ms: number) {
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

function Ms({ value, highlight }: { value: number; highlight?: boolean }) {
  return (
    <span className={`whitespace-nowrap text-xs font-mono ${highlight ? `font-semibold ${latencyColor(value)}` : "text-gray-400"}`}>
      {value}
      <span className="opacity-50 ml-0.5">ms</span>
    </span>
  );
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
        <table className="w-full text-xs">
          <thead className="bg-gray-900/50">
            <tr>
              {[
                { label: "Method", w: "w-16" },
                { label: "Route", w: "w-48" },
                { label: "Calls", w: "w-12" },
                { label: "Avg", w: "w-16" },
                { label: "P50", w: "w-16" },
                { label: "P95", w: "w-16" },
                { label: "P99", w: "w-16" },
                { label: "Max", w: "w-16" },
                { label: "Errors", w: "w-14" },
              ].map(({ label, w }) => (
                <th
                  key={label}
                  className={`px-3 py-2 text-left font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap ${w}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {routes.map((r) => (
              <tr key={`${r.method}-${r.path}`} className="hover:bg-gray-700/20 transition-colors">
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${methodBadge(r.method)}`}>
                    {r.method}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-gray-300 max-w-[200px] truncate">{r.path}</td>
                <td className="px-3 py-2.5 text-gray-300 text-center">{r.count}</td>
                <td className="px-3 py-2.5">
                  <span className={`whitespace-nowrap px-2 py-0.5 rounded font-mono font-semibold ${latencyBg(r.avgMs)}`}>
                    {r.avgMs}<span className="opacity-60 text-[10px] ml-0.5">ms</span>
                  </span>
                </td>
                <td className="px-3 py-2.5"><Ms value={r.p50Ms} /></td>
                <td className="px-3 py-2.5">
                  <span className={`whitespace-nowrap px-2 py-0.5 rounded font-mono font-semibold ${latencyBg(r.p95Ms)}`}>
                    {r.p95Ms}<span className="opacity-60 text-[10px] ml-0.5">ms</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`whitespace-nowrap px-2 py-0.5 rounded font-mono font-semibold ${latencyBg(r.p99Ms)}`}>
                    {r.p99Ms}<span className="opacity-60 text-[10px] ml-0.5">ms</span>
                  </span>
                </td>
                <td className="px-3 py-2.5"><Ms value={r.maxMs} /></td>
                <td className="px-3 py-2.5">
                  <span className={`whitespace-nowrap font-semibold ${r.errorRate > 10 ? "text-red-400" : r.errorRate > 0 ? "text-yellow-400" : "text-gray-600"}`}>
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
