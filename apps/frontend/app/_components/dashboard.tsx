"use client";

// Custom Hook separating Business Logic
import { useDashboard } from "../../hooks";

import { useEffect } from "react";
import { useWorkspace } from "../../components/workspace-context";

// Colocated Page Components
import WelcomeBanner from "./welcome-banner";
import MetricsDisplay from "./metrics-display";
import LogsStream from "./logs-stream";

export default function Dashboard() {
  const {
    isConnected,
    logs,
    metrics,
    isTriggering,
    isExecuting,
    isAuthLoading,
    triggerMockEvent,
    executeApiHubRequest,
    clearLogs,
  } = useDashboard();

  const { setIsConnected } = useWorkspace();

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="text-sm font-mono">Initializing DevOS Workspace...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Welcome control triggers */}
      <WelcomeBanner
        isTriggering={isTriggering}
        isExecuting={isExecuting}
        onTriggerMock={triggerMockEvent}
        onExecuteRequest={executeApiHubRequest}
      />

      {/* Dashboard Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Real-time metric cards */}
        <MetricsDisplay metrics={metrics} />

        {/* Scrolling log cards */}
        <LogsStream logs={logs} onClear={clearLogs} />
      </div>
    </main>
  );
}

