"use client";

import useMonitoring from "../../../hooks/use-monitoring/use-monitoring";
import SystemMetricsPanel from "./system-metrics-panel";
import UptimeChecksPanel from "./uptime-checks-panel";

export default function MonitoringHub() {
  const {
    systemMetrics,
    isLoadingSystem,
    uptimeChecks,
    isLoadingChecks,
    selectedCheckId,
    setSelectedCheckId,
    isAddCheckOpen,
    setIsAddCheckOpen,
    checkName,
    setCheckName,
    checkUrl,
    setCheckUrl,
    checkInterval,
    setCheckInterval,
    handleCreateCheck,
    isCreatingCheck,
    handleDeleteCheck,
    isDeletingCheck,
    isConnected,
  } = useMonitoring();

  const upCount = uptimeChecks.filter((c) => c.status === "up").length;
  const downCount = uptimeChecks.filter((c) => c.status === "down").length;

  return (
    <>
      {/* Page Title Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-200">
                Monitoring Hub
              </h1>
              <p className="text-[10px] font-mono text-slate-500">
                System Resources & Uptime Monitoring
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4">
            {uptimeChecks.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">
                    {upCount} up
                  </span>
                </div>
                {downCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-red-400">
                      {downCount} down
                    </span>
                  </div>
                )}
                <div className="w-px h-4 bg-slate-700" />
              </>
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}
              />
              <span className="text-[10px] font-mono text-slate-500">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex flex-col gap-6 flex-1">
        <SystemMetricsPanel
          metrics={systemMetrics}
          isLoading={isLoadingSystem}
        />

        <UptimeChecksPanel
          checks={uptimeChecks}
          isLoading={isLoadingChecks}
          selectedCheckId={selectedCheckId}
          onSelect={setSelectedCheckId}
          onDelete={handleDeleteCheck}
          isDeletingCheck={isDeletingCheck}
          isAddCheckOpen={isAddCheckOpen}
          setIsAddCheckOpen={setIsAddCheckOpen}
          checkName={checkName}
          setCheckName={setCheckName}
          checkUrl={checkUrl}
          setCheckUrl={setCheckUrl}
          checkInterval={checkInterval}
          setCheckInterval={setCheckInterval}
          onCreateCheck={handleCreateCheck}
          isCreatingCheck={isCreatingCheck}
        />
      </div>
    </>

  );
}
