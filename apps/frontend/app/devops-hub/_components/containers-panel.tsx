"use client";

import { DockerContainer, DockerStats } from "../../../services/devops-hub-service";
import { LiveContainerMetric } from "../../../hooks/use-devops-hub/use-devops-hub";
import { ContainerAction } from "../../../services/devops-hub-service";

interface EnrichedContainer extends DockerContainer {
  live: LiveContainerMetric | null;
}

interface ContainersPanelProps {
  containers: EnrichedContainer[];
  isLoading: boolean;
  selectedContainerId: string | null;
  onSelect: (id: string) => void;
  selectedStats: DockerStats | null | undefined;
  isLoadingStats: boolean;
  onAction: (id: string, action: ContainerAction) => void;
  isActioning: boolean;
  actionFeedback: { id: string; message: string; success: boolean } | null;
}

function stateColor(state: string) {
  switch (state?.toLowerCase()) {
    case "running":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "exited":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    case "paused":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  }
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[11px] font-mono text-slate-300 font-semibold">
        {value}
      </span>
    </div>
  );
}

export default function ContainersPanel({
  containers,
  isLoading,
  selectedContainerId,
  onSelect,
  selectedStats,
  isLoadingStats,
  onAction,
  isActioning,
  actionFeedback,
}: ContainersPanelProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-mono">Connecting to Docker...</span>
        </div>
      </div>
    );
  }

  if (!containers.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <span className="text-sm font-mono">No Docker containers found</span>
          <span className="text-xs text-slate-600">Make sure Docker is running</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Containers List */}
      <div className="w-80 shrink-0 border-r border-slate-800 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            Containers
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            {containers.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {containers.map((c) => (
            <button
              key={c.ID}
              onClick={() => onSelect(c.ID)}
              className={`w-full text-left rounded-lg border p-3 transition-all duration-150 hover:border-emerald-500/40 group ${
                selectedContainerId === c.ID
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60"
              }`}
            >
              {/* Container name */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-slate-200 truncate">
                    {c.Names.replace(/^\//, "")}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    {c.Image}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${stateColor(c.State)}`}
                >
                  {c.State}
                </span>
              </div>

              {/* Live metrics badge if available */}
              {c.live && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-500">CPU</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      {c.live.CPUPerc}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-500">MEM</span>
                    <span className="text-[9px] font-mono text-teal-400 font-bold">
                      {c.live.MemPerc}
                    </span>
                  </div>
                </div>
              )}

              {/* Ports if available */}
              {c.Ports && (
                <p className="text-[9px] font-mono text-slate-600 mt-1.5 truncate">
                  {c.Ports}
                </p>
              )}

              {/* Feedback toast inline */}
              {actionFeedback?.id === c.ID && (
                <div
                  className={`mt-2 text-[9px] font-mono px-2 py-1 rounded border ${
                    actionFeedback.success
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                      : "text-red-400 border-red-500/30 bg-red-500/5"
                  }`}
                >
                  {actionFeedback.message}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedContainerId ? (
          (() => {
            const container = containers.find(
              (c) => c.ID === selectedContainerId
            );
            if (!container) return null;
            const isRunning = container.State?.toLowerCase() === "running";

            return (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-mono font-bold text-slate-200">
                      {container.Names.replace(/^\//, "")}
                    </h2>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {container.ID.slice(0, 12)} · {container.Image}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-start-${container.ID}`}
                      disabled={isActioning || isRunning}
                      onClick={() => onAction(container.ID, "start")}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-md border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Start
                    </button>
                    <button
                      id={`btn-stop-${container.ID}`}
                      disabled={isActioning || !isRunning}
                      onClick={() => onAction(container.ID, "stop")}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-md border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                      Stop
                    </button>
                    <button
                      id={`btn-restart-${container.ID}`}
                      disabled={isActioning || !isRunning}
                      onClick={() => onAction(container.ID, "restart")}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-md border border-yellow-500/30 text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Restart
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 border-b border-slate-800">
                  {isLoadingStats ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-slate-800/40 rounded-lg p-4 animate-pulse h-16" />
                    ))
                  ) : selectedStats ? (
                    <>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="CPU Usage" value={selectedStats.CPUPerc} />
                        <div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                            style={{
                              width: selectedStats.CPUPerc.replace("%", "") + "%",
                            }}
                          />
                        </div>
                      </div>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="Memory %" value={selectedStats.MemPerc} />
                        <div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                            style={{
                              width: selectedStats.MemPerc.replace("%", "") + "%",
                            }}
                          />
                        </div>
                      </div>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="Memory Usage" value={selectedStats.MemUsage} />
                      </div>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="Network I/O" value={selectedStats.NetIO} />
                      </div>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="Block I/O" value={selectedStats.BlockIO} />
                      </div>
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <StatBadge label="Status" value={container.Status} />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 text-center text-xs font-mono text-slate-500 py-4">
                      No stats available for this container
                    </div>
                  )}
                </div>

                {/* Container Details */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Container Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Full ID", value: container.ID },
                      { label: "Image", value: container.Image },
                      { label: "State", value: container.State },
                      { label: "Status", value: container.Status },
                      { label: "Ports", value: container.Ports || "None" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-start gap-4 text-xs font-mono py-2 border-b border-slate-800/50"
                      >
                        <span className="w-24 shrink-0 text-slate-500">{label}</span>
                        <span className="text-slate-300 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-slate-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              <p className="text-xs font-mono text-slate-500">
                Select a container to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
