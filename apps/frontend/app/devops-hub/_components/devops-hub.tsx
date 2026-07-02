"use client";

import { useEffect } from "react";
import useDevopsHub from "../../../hooks/use-devops-hub/use-devops-hub";
import { useWorkspace } from "../../../components/workspace-context";
import ContainersPanel from "./containers-panel";

export default function DevopsHub() {
  const {
    isAuthLoading,
    isConnected,
    enrichedContainers,
    isLoadingContainers,
    refetchContainers,
    selectedContainerId,
    setSelectedContainerId,
    selectedStats,
    isLoadingStats,
    handleAction,
    isActioning,
    actionFeedback,
  } = useDevopsHub();

  const { setIsConnected } = useWorkspace();

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Authenticating...</p>
      </div>
    );
  }

  const runningCount = enrichedContainers.filter(
    (c) => c.State?.toLowerCase() === "running"
  ).length;
  const stoppedCount = enrichedContainers.filter(
    (c) => c.State?.toLowerCase() === "exited"
  ).length;

  return (
    <>
      {/* Page Title Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-violet-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-200">
                DevOps Hub
              </h1>
              <p className="text-[10px] font-mono text-slate-500">
                Docker Container Manager
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">
                {runningCount} running
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-mono text-red-400">
                {stoppedCount} stopped
              </span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            {/* WS Indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                }`}
              />
              <span className="text-[10px] font-mono text-slate-500">
                {isConnected ? "Live metrics" : "Offline"}
              </span>
            </div>
            {/* Refresh Button */}
            <button
              id="btn-refresh-containers"
              onClick={() => void refetchContainers()}
              className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
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
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ContainersPanel
          containers={enrichedContainers}
          isLoading={isLoadingContainers}
          selectedContainerId={selectedContainerId}
          onSelect={setSelectedContainerId}
          selectedStats={selectedStats}
          isLoadingStats={isLoadingStats}
          onAction={handleAction}
          isActioning={isActioning}
          actionFeedback={actionFeedback}
        />
      </div>
    </>
  );
}

