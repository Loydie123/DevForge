"use client";

import usePerformanceHub from "../../../hooks/use-performance-hub/use-performance-hub";
import PerformanceStats from "./performance-stats";
import RouteAnalysisPanel from "./route-analysis-panel";
import SlowQueriesPanel from "./slow-queries-panel";

type Tab = "overview" | "routes" | "slow-queries";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "routes", label: "Route Analysis" },
  { id: "slow-queries", label: "Slow Queries" },
];

export default function PerformanceHub() {
  const { activeTab, setActiveTab, stats, routes, slowQueries, isLoading, isError } =
    usePerformanceHub();

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        Failed to load performance data. Is the backend running?
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Hub</h1>
          <p className="text-sm text-gray-400 mt-1">
            API latency · slow queries · memory · bottleneck detection
          </p>
        </div>
        {isLoading && (
          <span className="text-xs text-gray-500 animate-pulse">Loading…</span>
        )}
      </div>

      {/* Stats row — always visible */}
      <PerformanceStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Top Routes by P95</h2>
            <RouteAnalysisPanel routes={routes.slice(0, 10)} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Slow Queries</h2>
            <SlowQueriesPanel queries={slowQueries.slice(0, 5)} />
          </div>
        </div>
      )}

      {activeTab === "routes" && (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">All Routes</h2>
          <RouteAnalysisPanel routes={routes} />
        </div>
      )}

      {activeTab === "slow-queries" && (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Slow Queries{" "}
            <span className="text-gray-500 font-normal">
              ({slowQueries.length} captured · threshold 200 ms)
            </span>
          </h2>
          <SlowQueriesPanel queries={slowQueries} />
        </div>
      )}
    </div>
  );
}
