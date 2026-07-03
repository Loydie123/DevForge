"use client";

// Custom Hook separating Business Logic
import { useDashboard } from "../../hooks";

// Colocated Page Components
import WelcomeBanner from "./welcome-banner";
import MetricsDisplay from "./metrics-display";
import LogsStream from "./logs-stream";

export default function Dashboard() {
  const {
    logs,
    metrics,
    isTriggering,
    isExecuting,
    triggerMockEvent,
    executeApiHubRequest,
    clearLogs,
  } = useDashboard();

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

