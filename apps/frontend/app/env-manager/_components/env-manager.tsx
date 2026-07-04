"use client";

import { useEnvManager } from "@/hooks/use-env-manager/use-env-manager";
import EnvStats from "./env-stats";
import ConfigList from "./config-list";
import VariablesPanel from "./variables-panel";
import VersionsPanel from "./versions-panel";
import type { EnvType } from "@/services/env-manager/env-manager-service";

const ENV_TYPES: EnvType[] = ["development", "staging", "production"];

export default function EnvManager() {
  const {
    stats,
    configs,
    isLoading,
    isError,
    activeConfigId,
    setActiveConfigId,
    activeConfig,
    activeTab,
    setActiveTab,
    showCreateConfig,
    setShowCreateConfig,
    newConfigName,
    setNewConfigName,
    newConfigEnv,
    setNewConfigEnv,
    createConfig,
    isCreating,
    deleteConfig,
    showAddVar,
    setShowAddVar,
    newVar,
    setNewVar,
    addVar,
    isAddingVar,
    deleteVar,
    revealedVarIds,
    revealedValues,
    revealVar,
    exportContent,
    setExportContent,
    exportConfig,
    versions,
    versionsLoading,
    restoreVersion,
    isRestoring,
    varTypeColor,
    envColor,
  } = useEnvManager();

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load environment configs. Is the backend running?
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Environment Manager</h1>
          <p className="text-sm text-gray-400 mt-1">
            Dev · Staging · Production configs · Secrets vault · Version history
          </p>
        </div>
        {isLoading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
      </div>

      {/* Stats */}
      <EnvStats stats={stats} />

      {/* Create config dialog */}
      {showCreateConfig && (
        <div className="bg-gray-900/90 border border-indigo-500/30 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-200">Create New Config</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Config Name</label>
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="My App Backend"
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Environment</label>
              <select
                value={newConfigEnv}
                onChange={(e) => setNewConfigEnv(e.target.value as EnvType)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                {ENV_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreateConfig(false)} className="text-xs px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg">
              Cancel
            </button>
            <button
              onClick={() => createConfig()}
              disabled={isCreating || !newConfigName}
              className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg"
            >
              {isCreating ? "Creating…" : "Create Config"}
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: config list */}
        <div className="w-60 shrink-0">
          <ConfigList
            configs={configs}
            activeId={activeConfigId}
            onSelect={setActiveConfigId}
            onDelete={deleteConfig}
            onCreateClick={() => setShowCreateConfig(true)}
            envColor={envColor}
          />
        </div>

        {/* Right: detail */}
        {activeConfig ? (
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Config header */}
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-white">{activeConfig.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded border font-mono ${envColor(activeConfig.environment)}`}>
                {activeConfig.environment}
              </span>
              <span className="text-xs text-gray-500">v{activeConfig.version}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg w-fit">
              {([
                { id: "configs", label: "Variables" },
                { id: "versions", label: "Version History" },
              ] as { id: typeof activeTab; label: string }[]).map((t) => (
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

            {activeTab === "configs" && (
              <VariablesPanel
                config={activeConfig}
                revealedVarIds={revealedVarIds}
                revealedValues={revealedValues}
                onReveal={revealVar}
                onDelete={deleteVar}
                showAddVar={showAddVar}
                setShowAddVar={setShowAddVar}
                newVar={newVar}
                setNewVar={setNewVar}
                onAddVar={addVar}
                isAddingVar={isAddingVar}
                onExport={exportConfig}
                varTypeColor={varTypeColor}
                exportContent={exportContent}
                setExportContent={setExportContent}
              />
            )}

            {activeTab === "versions" && (
              <VersionsPanel
                versions={versions}
                isLoading={versionsLoading}
                onRestore={restoreVersion}
                isRestoring={isRestoring}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            ← Select a config to view its variables
          </div>
        )}
      </div>
    </div>
  );
}
