"use client";

import useLogsHub from "../../../hooks/use-logs-hub/use-logs-hub";
import Header from "../../../components/header";
import SourcesSidebar from "./sources-sidebar";
import LogsConsole from "./logs-console";

export default function LogsHub() {
  const {
    user,
    isAuthLoading,
    isConnected,
    logs,
    rawLogsLength,

    sources,
    isLoadingSources,
    errorLogs,
    isLoadingErrors,
    selectedError,
    setSelectedError,

    serviceFilter,
    setServiceFilter,
    levelFilter,
    setLevelFilter,
    searchQuery,
    setSearchQuery,
    autoScroll,
    setAutoScroll,

    isAddSourceOpen,
    setIsAddSourceOpen,
    sourceName,
    setSourceName,
    sourcePath,
    setSourcePath,

    handleAddSource,
    handleDeleteSource,
    handleDeleteError,
    handleClearErrors,
    handleClearConsole,
    handleDownloadLogs,
    handleLogout,
  } = useLogsHub();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="font-mono text-xs text-slate-400">Authenticating log session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
      {/* Navigation Header */}
      <Header user={user} isConnected={isConnected} onLogout={handleLogout} />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-h-0">
        
        {/* Title Telemetry Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
              📟 Logs Hub
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Inspect application processes, error telemetry logs, and custom file streams.
            </p>
          </div>
        </div>

        {/* Double-Panel Workspace Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-start">
          <SourcesSidebar
            sources={sources}
            isLoadingSources={isLoadingSources}
            errorLogs={errorLogs}
            isLoadingErrors={isLoadingErrors}
            isAddSourceOpen={isAddSourceOpen}
            setIsAddSourceOpen={setIsAddSourceOpen}
            sourceName={sourceName}
            setSourceName={setSourceName}
            sourcePath={sourcePath}
            setSourcePath={setSourcePath}
            handleAddSource={handleAddSource}
            handleDeleteSource={handleDeleteSource}
            handleDeleteError={handleDeleteError}
            handleClearErrors={handleClearErrors}
            setSelectedError={setSelectedError}
          />

          <LogsConsole
            logs={logs}
            rawLogsLength={rawLogsLength}
            serviceFilter={serviceFilter}
            setServiceFilter={setServiceFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
            handleClearConsole={handleClearConsole}
            handleDownloadLogs={handleDownloadLogs}
          />
        </div>
      </main>

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">⚠️ CRASH LOG</span>
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                  {selectedError.severity}
                </span>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-base"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto min-h-0">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4 text-[10px]">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-bold">SERVICE ORIGIN</span>
                  <span className="text-white font-bold">{selectedError.service}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-bold">TIMESTAMP DETECTED</span>
                  <span className="text-white font-bold">{new Date(selectedError.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Error Message */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold">MESSAGE</span>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-rose-300 font-bold select-text break-all">
                  {selectedError.message}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedError.stack && (
                <div className="flex flex-col gap-1.5 min-h-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-bold">STACK TRACE</span>
                  <pre className="flex-1 p-3.5 bg-slate-950 border border-slate-850 rounded-xl overflow-auto text-emerald-400 font-mono text-[10px] leading-relaxed whitespace-pre select-text min-h-[150px]">
                    {selectedError.stack}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  if (confirm("Delete this log?")) {
                    handleDeleteError(selectedError.id);
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/50 text-rose-400 font-bold rounded-lg transition-all cursor-pointer"
              >
                Delete Log
              </button>
              <button
                onClick={() => setSelectedError(null)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
