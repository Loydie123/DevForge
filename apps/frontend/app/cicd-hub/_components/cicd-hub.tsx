"use client";

import useCicdHub from "../../../hooks/use-cicd-hub/use-cicd-hub";
import CicdStats from "./cicd-stats";
import PipelinesPanel from "./pipelines-panel";
import RunsPanel from "./runs-panel";
import LogsPanel from "./logs-panel";

type Tab = "overview" | "pipelines" | "runs" | "logs";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pipelines", label: "Pipelines" },
  { id: "runs", label: "Run History" },
  { id: "logs", label: "Live Logs" },
];

export default function CicdHub() {
  const {
    activeTab, setActiveTab,
    stats, pipelines, runs, selectedRun,
    selectRun,
    isLoading, isError,
    triggerRun, isTriggeringId,
    newPipelineName, setNewPipelineName,
    newPipelineBranch, setNewPipelineBranch,
    showCreateForm, setShowCreateForm,
    createPipeline, isCreating,
  } = useCicdHub();

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        Failed to load CI/CD data. Is the backend running?
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CI/CD Hub</h1>
          <p className="text-sm text-gray-400 mt-1">
            Pipelines · builds · deploys · webhook triggers
          </p>
        </div>
        {isLoading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
      </div>

      {/* Stats */}
      <CicdStats stats={stats} />

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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Pipelines</h2>
            <PipelinesPanel
              pipelines={pipelines}
              onTrigger={triggerRun}
              triggeringId={isTriggeringId}
              showCreateForm={false}
              setShowCreateForm={() => {}}
              newName="" setNewName={() => {}}
              newBranch="main" setNewBranch={() => {}}
              onCreate={() => {}}
              isCreating={false}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Runs</h2>
            <RunsPanel runs={runs.slice(0, 8)} onSelectRun={selectRun} />
          </div>
        </div>
      )}

      {activeTab === "pipelines" && (
        <PipelinesPanel
          pipelines={pipelines}
          onTrigger={triggerRun}
          triggeringId={isTriggeringId}
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          newName={newPipelineName}
          setNewName={setNewPipelineName}
          newBranch={newPipelineBranch}
          setNewBranch={setNewPipelineBranch}
          onCreate={createPipeline}
          isCreating={isCreating}
        />
      )}

      {activeTab === "runs" && (
        <RunsPanel runs={runs} onSelectRun={selectRun} />
      )}

      {activeTab === "logs" && (
        <LogsPanel run={selectedRun} onBack={() => setActiveTab("runs")} />
      )}
    </div>
  );
}
