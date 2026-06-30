"use client";

// Custom Hook separating Business Logic
import { useDashboard } from "../../hooks";

// Global Shared Components
import Header from "../../components/header";

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
    user,
    isAuthLoading,
    triggerMockEvent,
    executeApiHubRequest,
    handleLogout,
    clearLogs,
  } = useDashboard();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="text-sm font-mono">Initializing DevOS Workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Navigation Bar */}
      <Header isConnected={isConnected} user={user} onLogout={handleLogout} />

      {/* Main Dashboard Panel */}
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
    </div>
  );
}
