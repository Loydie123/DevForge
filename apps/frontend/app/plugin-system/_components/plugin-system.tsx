"use client";

import { usePluginSystem } from "@/hooks/use-plugin-system/use-plugin-system";
import PluginStats from "./plugin-stats";
import InstalledPanel from "./installed-panel";
import MarketplacePanel from "./marketplace-panel";
import HooksPanel from "./hooks-panel";
import type { PluginTab } from "@/hooks/use-plugin-system/use-plugin-system";

const tabs: { id: PluginTab; label: string }[] = [
  { id: "installed", label: "Installed" },
  { id: "marketplace", label: "Marketplace" },
  { id: "hooks", label: "Hook Logs" },
];

export default function PluginSystem() {
  const {
    activeTab, setActiveTab,
    stats,
    plugins, isLoading, isError,
    marketplace, marketplaceLoading,
    executions, executionsLoading,
    categoryFilter, setCategoryFilter, categories,
    selectedPluginId, setSelectedPluginId,
    install, isInstalling, installingId,
    uninstall,
    toggle, isToggling,
    testHook, setTestHook, hooks,
    triggerHook, isTriggeringHook, lastTriggerResult,
  } = usePluginSystem();

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load plugins. Is the backend running?
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plugin System</h1>
          <p className="text-sm text-gray-400 mt-1">
            Extensible hooks · Marketplace · onRequest · onResponse · onError · onLog · onMetric
          </p>
        </div>
        {isLoading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
      </div>

      {/* Stats */}
      <PluginStats stats={stats} />

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
            {t.id === "installed" && plugins.length > 0 && (
              <span className="ml-1.5 text-xs bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
                {plugins.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "installed" && (
        <InstalledPanel
          plugins={plugins}
          selectedId={selectedPluginId}
          onSelect={setSelectedPluginId}
          onToggle={toggle}
          onUninstall={uninstall}
          isToggling={isToggling}
        />
      )}

      {activeTab === "marketplace" && (
        <MarketplacePanel
          marketplace={marketplace}
          isLoading={marketplaceLoading}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          onInstall={install}
          isInstalling={isInstalling}
          installingId={installingId}
        />
      )}

      {activeTab === "hooks" && (
        <HooksPanel
          executions={executions}
          isLoading={executionsLoading}
          testHook={testHook}
          setTestHook={setTestHook}
          hooks={hooks}
          onTrigger={triggerHook}
          isTriggeringHook={isTriggeringHook}
          lastResult={lastTriggerResult}
        />
      )}
    </div>
  );
}
