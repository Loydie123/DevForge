"use client";

import { UptimeCheck } from "../../../services/monitoring-service";

function statusDot(status: string) {
  switch (status) {
    case "up":
      return "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
    case "down":
      return "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]";
    default:
      return "bg-slate-500";
  }
}

function latencyColor(ms: number | null): string {
  if (ms === null) return "text-slate-500";
  if (ms < 200) return "text-emerald-400";
  if (ms < 500) return "text-yellow-400";
  return "text-red-400";
}

interface UptimeChecksPanelProps {
  checks: UptimeCheck[];
  isLoading: boolean;
  selectedCheckId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeletingCheck: boolean;

  // Add form
  isAddCheckOpen: boolean;
  setIsAddCheckOpen: (v: boolean) => void;
  checkName: string;
  setCheckName: (v: string) => void;
  checkUrl: string;
  setCheckUrl: (v: string) => void;
  checkInterval: string;
  setCheckInterval: (v: string) => void;
  onCreateCheck: () => void;
  isCreatingCheck: boolean;
}

export default function UptimeChecksPanel({
  checks,
  isLoading,
  selectedCheckId,
  onSelect,
  onDelete,
  isDeletingCheck,
  isAddCheckOpen,
  setIsAddCheckOpen,
  checkName,
  setCheckName,
  checkUrl,
  setCheckUrl,
  checkInterval,
  setCheckInterval,
  onCreateCheck,
  isCreatingCheck,
}: UptimeChecksPanelProps) {
  const selectedCheck = checks.find((c) => c.id === selectedCheckId);

  // Calculate uptime percentage for a check from its results
  const calcUptime = (check: UptimeCheck): string => {
    if (!check.results || check.results.length === 0) return "—";
    const upCount = check.results.filter((r) => r.status === "up").length;
    return ((upCount / check.results.length) * 100).toFixed(1) + "%";
  };

  // Average latency
  const calcAvgLatency = (check: UptimeCheck): string => {
    if (!check.results || check.results.length === 0) return "—";
    const total = check.results.reduce((sum, r) => sum + r.latencyMs, 0);
    return Math.round(total / check.results.length) + "ms";
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          Uptime Monitors
        </h2>
        <button
          id="btn-add-uptime-check"
          onClick={() => setIsAddCheckOpen(!isAddCheckOpen)}
          className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Monitor
        </button>
      </div>

      {/* Add form collapsible */}
      {isAddCheckOpen && (
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/40 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                Name
              </label>
              <input
                id="input-check-name"
                value={checkName}
                onChange={(e) => setCheckName(e.target.value)}
                placeholder="My API"
                className="w-full text-xs font-mono bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                URL
              </label>
              <input
                id="input-check-url"
                value={checkUrl}
                onChange={(e) => setCheckUrl(e.target.value)}
                placeholder="https://api.example.com/health"
                className="w-full text-xs font-mono bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                Interval (sec)
              </label>
              <input
                id="input-check-interval"
                type="number"
                value={checkInterval}
                onChange={(e) => setCheckInterval(e.target.value)}
                placeholder="60"
                className="w-full text-xs font-mono bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddCheckOpen(false)}
              className="text-[10px] font-mono px-3 py-1 rounded-md border border-slate-700 text-slate-400 hover:border-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              id="btn-create-check"
              disabled={!checkName || !checkUrl || isCreatingCheck}
              onClick={onCreateCheck}
              className="text-[10px] font-mono px-3 py-1 rounded-md border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all disabled:opacity-30"
            >
              {isCreatingCheck ? "Creating..." : "Create Monitor"}
            </button>
          </div>
        </div>
      )}

      {/* Checks list + detail split */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 320 }}>
        {/* List */}
        <div className="w-80 shrink-0 border-r border-slate-700/50 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-slate-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <svg
                className="w-8 h-8 opacity-30 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-mono">No monitors configured</p>
              <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                Add a URL to start monitoring
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {checks.map((check) => (
                <button
                  key={check.id}
                  onClick={() => onSelect(check.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-all duration-150 hover:border-emerald-500/40 ${
                    selectedCheckId === check.id
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${statusDot(check.status)}`}
                    />
                    <span className="text-xs font-mono font-bold text-slate-200 truncate">
                      {check.name}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-500 truncate pl-4">
                    {check.url}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 pl-4">
                    <span className="text-[9px] font-mono text-slate-500">
                      Uptime:{" "}
                      <span className="text-emerald-400 font-bold">
                        {calcUptime(check)}
                      </span>
                    </span>
                    <span
                      className={`text-[9px] font-mono ${latencyColor(check.latencyMs)}`}
                    >
                      {check.latencyMs !== null
                        ? `${check.latencyMs}ms`
                        : "—"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail view */}
        <div className="flex-1 overflow-y-auto">
          {selectedCheck ? (
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${statusDot(selectedCheck.status)}`}
                    />
                    <h3 className="text-sm font-mono font-bold text-slate-200">
                      {selectedCheck.name}
                    </h3>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5 ml-4">
                    {selectedCheck.url}
                  </p>
                </div>
                <button
                  id={`btn-delete-check-${selectedCheck.id}`}
                  disabled={isDeletingCheck}
                  onClick={() => onDelete(selectedCheck.id)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all disabled:opacity-30"
                >
                  Delete
                </button>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Status",
                    value: selectedCheck.status.toUpperCase(),
                    color:
                      selectedCheck.status === "up"
                        ? "text-emerald-400"
                        : "text-red-400",
                  },
                  {
                    label: "Uptime",
                    value: calcUptime(selectedCheck),
                    color: "text-teal-400",
                  },
                  {
                    label: "Avg Latency",
                    value: calcAvgLatency(selectedCheck),
                    color: "text-blue-400",
                  },
                  {
                    label: "Interval",
                    value: `${selectedCheck.interval}s`,
                    color: "text-slate-300",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-3"
                  >
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <p
                      className={`text-base font-mono font-bold mt-0.5 ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ping timeline (mini chart) */}
              <div>
                <h4 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Recent Checks (last {selectedCheck.results.length})
                </h4>
                <div className="flex items-end gap-[2px] h-16">
                  {[...selectedCheck.results].reverse().map((r) => {
                    const maxLatency = Math.max(
                      ...selectedCheck.results.map((x) => x.latencyMs),
                      1
                    );
                    const height = Math.max(
                      (r.latencyMs / maxLatency) * 100,
                      4
                    );
                    return (
                      <div
                        key={r.id}
                        title={`${r.status === "up" ? "✓" : "✗"} ${r.latencyMs}ms · ${new Date(r.createdAt).toLocaleTimeString()}`}
                        className={`flex-1 rounded-t transition-all cursor-pointer hover:opacity-80 ${
                          r.status === "up"
                            ? "bg-emerald-500/60"
                            : "bg-red-500/60"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                  {selectedCheck.results.length === 0 && (
                    <p className="text-[10px] font-mono text-slate-600 py-4 w-full text-center">
                      No results yet — waiting for first ping
                    </p>
                  )}
                </div>
              </div>

              {/* Results table */}
              <div>
                <h4 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ping History
                </h4>
                <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/50">
                    {["Status", "Code", "Latency", "Error", "Time"].map(
                      (h) => (
                        <span
                          key={h}
                          className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest"
                        >
                          {h}
                        </span>
                      )
                    )}
                  </div>
                  {selectedCheck.results.slice(0, 15).map((r, idx) => (
                    <div
                      key={r.id}
                      className={`grid grid-cols-5 gap-2 px-3 py-1.5 text-[10px] font-mono ${
                        idx !== Math.min(selectedCheck.results.length, 15) - 1
                          ? "border-b border-slate-800/50"
                          : ""
                      }`}
                    >
                      <span
                        className={
                          r.status === "up"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {r.status === "up" ? "● UP" : "● DOWN"}
                      </span>
                      <span className="text-slate-400">
                        {r.statusCode ?? "—"}
                      </span>
                      <span className={latencyColor(r.latencyMs)}>
                        {r.latencyMs}ms
                      </span>
                      <span className="text-slate-500 truncate">
                        {r.error ?? "—"}
                      </span>
                      <span className="text-slate-600">
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center py-16">
                <svg
                  className="w-10 h-10 mx-auto text-slate-700 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-mono text-slate-500">
                  Select a monitor to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
