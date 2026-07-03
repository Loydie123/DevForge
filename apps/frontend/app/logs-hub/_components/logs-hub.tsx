"use client";

import useLogsHub from "../../../hooks/use-logs-hub/use-logs-hub";
import SourcesSidebar from "./sources-sidebar";
import LogsConsole from "./logs-console";

export default function LogsHub() {
  const {
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
  } = useLogsHub();

  return (
    <>
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

          {/* Quick connection indicator status */}
          <div className="flex items-center gap-3 text-xs font-mono select-none">
            <span className="text-slate-500">
              Total Stack Size:{" "}
              <b className="text-slate-350">{rawLogsLength} logs</b>
            </span>
          </div>
        </div>

        {/* Double-Panel Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          
          {/* Left panel: Sources List */}
          <SourcesSidebar
            sources={sources}
            isLoadingSources={isLoadingSources}
            errorLogs={errorLogs}
            isLoadingErrors={isLoadingErrors}
            setSelectedError={setSelectedError}
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
          />

          {/* Right panel: Live Logs Terminal View */}
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <LogsConsole
              logs={logs}
              serviceFilter={serviceFilter}
              setServiceFilter={setServiceFilter}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
              rawLogsLength={rawLogsLength}
              handleClearConsole={handleClearConsole}
              handleDownloadLogs={handleDownloadLogs}
            />
          </div>

        </div>

      </main>

      {/* Pop-up detail modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                  {selectedError.severity || "Error"}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selectedError.service} · {new Date(selectedError.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4 min-h-0">
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ERROR MESSAGE</span>
                <div className="text-xs text-slate-200 font-mono bg-slate-950 p-3 rounded-lg border border-slate-850 break-words select-text">
                  {selectedError.message}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedError.stack && (
                <div className="flex flex-col gap-1.5 min-h-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STACK TRACE</span>
                  <pre className="flex-1 p-3.5 bg-slate-950 border border-slate-850 rounded-lg overflow-auto text-emerald-400 font-mono text-[10px] leading-relaxed whitespace-pre select-text">
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
    </>
  );
}
