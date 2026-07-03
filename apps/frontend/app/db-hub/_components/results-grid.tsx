"use client";

import { useState } from "react";
import { QueryResultDto } from "../../../services/db-hub/db-hub-service";

interface ResultsGridProps {
  queryResult: QueryResultDto | null;
  executionError: string | null;
  isExecutingQuery: boolean;
}

export default function ResultsGrid({
  queryResult,
  executionError,
  isExecutingQuery,
}: ResultsGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "json">("grid");

  const getColumns = (data: unknown): string[] => {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      return Object.keys(data[0] as Record<string, unknown>);
    }
    return [];
  };

  const isArrayResult = queryResult && Array.isArray(queryResult.result);
  const resultAsArray = isArrayResult ? (queryResult.result as Record<string, unknown>[]) : [];
  const columns = isArrayResult ? getColumns(resultAsArray) : [];

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-[330px]">
      {/* Header telemetry details */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Results Output
        </span>
        
        {queryResult && !isExecutingQuery && (
          <div className="flex items-center gap-4 text-[10px] font-mono">
            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-lg border font-bold ${
              queryResult.status === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {queryResult.status === "success" ? "🟢 SUCCESS" : "🔴 ERROR"}
            </div>
            
            {/* Latency */}
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-semibold">
              ⏱️ {queryResult.latencyMs}ms
            </div>

            {/* Row Count */}
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
              Rows: {queryResult.rowsCount}
            </div>
          </div>
        )}
      </div>

      {/* Main Results Display area */}
      <div className="flex-1 flex flex-col min-h-0">
        {isExecutingQuery ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 text-center">
            <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
            <span className="font-mono text-xs">Executing query on active connection...</span>
          </div>
        ) : executionError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-rose-500/20 bg-rose-500/5 rounded-xl font-mono text-xs text-rose-400 gap-2 overflow-y-auto">
            <span className="text-lg">⚠️ Query Execution Failed</span>
            <p className="text-center mb-1">{executionError}</p>
            <button
              onClick={() => {
                window.location.href = `/ai-engine?mode=explain&context=${encodeURIComponent(executionError)}`;
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
            >
              🤖 Explain with AI
            </button>
          </div>
        ) : queryResult ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab switchers if data is an array */}
            {isArrayResult && resultAsArray.length > 0 && (
              <div className="flex gap-4 text-xs font-mono font-bold border-b border-slate-800/50 pb-2 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  Table Grid
                </button>
                <button
                  onClick={() => setViewMode("json")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    viewMode === "json"
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  JSON Payload ({resultAsArray.length})
                </button>
              </div>
            )}

            {/* Display Body */}
            <div className="flex-1 overflow-auto pt-3 min-h-0 font-mono text-[11px]">
              {isArrayResult && resultAsArray.length > 0 && viewMode === "grid" ? (
                /* Dynamic HTML Table Grid */
                <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[170px] select-text">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-950/80 sticky top-0 text-[10px] text-slate-500 font-bold border-b border-slate-800">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="p-3 border-r border-slate-800 last:border-r-0 truncate max-w-[150px]" title={col}>
                            {col.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 bg-slate-950/20">
                      {resultAsArray.map((row, rowIndex: number) => (
                        <tr key={rowIndex} className="hover:bg-slate-800/20 transition-colors">
                          {columns.map(col => {
                            const val = row[col];
                            const cellStr = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "");
                            return (
                              <td
                                key={col}
                                className="p-3 border-r border-slate-855 last:border-r-0 text-slate-300 truncate max-w-[150px]"
                                title={cellStr}
                              >
                                {cellStr}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Pretty JSON code block fallback for MongoDB or raw queries */
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text max-h-[170px]">
                  {JSON.stringify(queryResult.result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          /* Idle Console ready screen */
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
            <span className="text-2xl select-none">📊</span>
            <span className="font-mono text-xs font-semibold text-slate-400">Results Console is idle.</span>
            <span className="text-[10px] text-slate-600 font-mono">
              Select a saved connection profile, write your query statement, and click &quot;Execute&quot;.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
