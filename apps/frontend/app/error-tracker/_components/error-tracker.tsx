"use client";

import useErrorTracker from "../../../hooks/use-error-tracker/use-error-tracker";
import ErrorStatsPanel from "./error-stats";
import ErrorsList from "./errors-list";

const SEVERITY_STYLE: Record<string, { badge: string }> = {
  critical: { badge: "bg-red-500/10 text-red-400 border-red-500/25" },
  high:     { badge: "bg-orange-500/10 text-orange-400 border-orange-500/25" },
  medium:   { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
  low:      { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
};

export default function ErrorTracker() {
  const {
    stats, isLoadingStats,
    errors, isLoadingErrors,
    services,
    severityFilter, setSeverityFilter,
    serviceFilter, setServiceFilter,
    searchQuery, setSearchQuery,
    selectedError, setSelectedError,
    isRecordOpen, setIsRecordOpen,
    formService, setFormService,
    formMessage, setFormMessage,
    formStack, setFormStack,
    formSeverity, setFormSeverity,
    formError,
    handleRecord, isRecording,
    handleDelete,
    handleClear, isClearing,
  } = useErrorTracker();

  return (
    <>
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-h-0">

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
              🚨 Error Tracker
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Exception logging, stack traces, severity classification, and error grouping.
            </p>
          </div>

          <button
            onClick={() => setIsRecordOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Record Error
          </button>
        </div>

        {/* Stats */}
        <ErrorStatsPanel stats={stats} isLoading={isLoadingStats} />

        {/* Errors list */}
        <ErrorsList
          errors={errors}
          isLoading={isLoadingErrors}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          services={services}
          onSelect={setSelectedError}
          onDelete={handleDelete}
          onClear={handleClear}
          isClearing={isClearing}
        />
      </main>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wide ${SEVERITY_STYLE[selectedError.severity]?.badge ?? ""}`}>
                  {selectedError.severity}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selectedError.service} · {new Date(selectedError.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedError(null)} className="text-slate-500 hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4 min-h-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Error Message</span>
                <div className="text-xs text-slate-200 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 break-words select-text">
                  {selectedError.message}
                </div>
              </div>
              {selectedError.stack && (
                <div className="flex flex-col gap-1.5 min-h-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stack Trace</span>
                  <pre className="flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-lg overflow-auto text-emerald-400 font-mono text-[10px] leading-relaxed whitespace-pre select-text max-h-64">
                    {selectedError.stack}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
              <button
                onClick={() => { handleDelete(selectedError.id); }}
                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/50 text-rose-400 font-bold text-xs rounded-lg transition-all"
              >
                Delete Log
              </button>
              <button
                onClick={() => setSelectedError(null)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Error Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40">
              <span className="font-mono text-sm font-bold text-white">Record Error</span>
              <button onClick={() => setIsRecordOpen(false)} className="text-slate-500 hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 font-mono">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Service</label>
                  <input
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    placeholder="e.g. backend"
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as "low" | "medium" | "high" | "critical")}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Error Message *</label>
                <input
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="TypeError: Cannot read properties of undefined"
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Stack Trace (optional)</label>
                <textarea
                  value={formStack}
                  onChange={(e) => setFormStack(e.target.value)}
                  rows={5}
                  placeholder={"at Object.<anonymous> (/app/index.js:12:5)\n    at Module._compile (node:internal/modules/cjs/loader:1364:14)"}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsRecordOpen(false)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecord}
                disabled={isRecording}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold font-mono rounded-lg transition-all"
              >
                {isRecording ? "Recording..." : "Record Error"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

