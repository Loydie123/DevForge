"use client";

import { useState } from "react";
import { LogSource, ErrorLog } from "../../../services/logs-hub/logs-hub-service";

interface SourcesSidebarProps {
  sources: LogSource[];
  isLoadingSources: boolean;
  errorLogs: ErrorLog[];
  isLoadingErrors: boolean;

  // Add Source Form states
  isAddSourceOpen: boolean;
  setIsAddSourceOpen: (open: boolean) => void;
  sourceName: string;
  setSourceName: (name: string) => void;
  sourcePath: string;
  setSourcePath: (path: string) => void;

  handleAddSource: () => void;
  handleDeleteSource: (id: string) => void;
  handleDeleteError: (id: string) => void;
  handleClearErrors: () => void;
  setSelectedError: (error: ErrorLog | null) => void;
  formError: string | null;
}

export default function SourcesSidebar({
  sources,
  isLoadingSources,
  errorLogs,
  isLoadingErrors,

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
  setSelectedError,
  formError,
}: SourcesSidebarProps) {
  const [activeTab, setActiveTab] = useState<"sources" | "errors">("sources");

  const getSeverityClass = (sev: string) => {
    if (sev === "critical" || sev === "error" || sev === "fatal") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shrink-0 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 shrink-0">
        <button
          onClick={() => { setActiveTab("sources"); setIsAddSourceOpen(false); }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "sources" && !isAddSourceOpen
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Watchers ({sources.length})
        </button>
        <button
          onClick={() => { setActiveTab("errors"); setIsAddSourceOpen(false); }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "errors"
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Crash Tracker ({errorLogs.length})
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isAddSourceOpen ? (
          /* Add Log Source Form */
          <div className="flex flex-col gap-3.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Log Source</span>
              <button
                onClick={() => setIsAddSourceOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Source Name */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">SOURCE NAME</span>
              <input
                type="text"
                placeholder="e.g. nginx-access"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {/* Source File Path */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">LOG FILE PATH</span>
              <input
                type="text"
                placeholder="e.g. /var/log/nginx/access.log"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {formError && (
              <div className="p-2 border bg-rose-500/5 text-rose-400 border-rose-500/25 text-[10px] rounded-lg leading-relaxed">
                🔴 Error: {formError}
              </div>
            )}

            <button
              onClick={handleAddSource}
              disabled={!sourceName.trim() || !sourcePath.trim()}
              className="h-8 w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 font-bold text-slate-950 transition-all cursor-pointer"
            >
              Add Source
            </button>
          </div>
        ) : activeTab === "sources" ? (
          /* Watched Log Sources List */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Log Watchers
              </span>
              <button
                onClick={() => setIsAddSourceOpen(true)}
                className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                + Add Source
              </button>
            </div>

            {isLoadingSources ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20 text-center">
                <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
                <span className="font-mono text-[11px]">Loading watchers...</span>
              </div>
            ) : sources.length > 0 ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 bg-slate-950/30 border border-slate-800/80 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-bold text-white truncate max-w-[170px]">📂 {src.name}</span>
                      <span className="text-[9px] text-slate-500 truncate max-w-[200px]" title={src.filePath}>
                        {src.filePath}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 font-mono text-xs">
                No custom log files watched. Add one above!
              </div>
            )}
          </>
        ) : (
          /* Crash Tracker recorded errors panel */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Error Logs
              </span>
              {errorLogs.length > 0 && (
                <button
                  onClick={() => confirm("Clear all recorded errors?") && handleClearErrors()}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {isLoadingErrors ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20 text-center">
                <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
                <span className="font-mono text-[11px]">Loading errors...</span>
              </div>
            ) : errorLogs.length > 0 ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {errorLogs.map((err) => (
                  <div
                    key={err.id}
                    onClick={() => setSelectedError(err)}
                    className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:border-slate-700 flex flex-col gap-2 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-white truncate max-w-[120px]">{err.service}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getSeverityClass(err.severity)}`}>
                          {err.severity}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this error log?")) {
                            handleDeleteError(err.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 h-5 w-5 text-[9px] text-rose-400 hover:bg-slate-800 rounded flex items-center justify-center cursor-pointer transition-all border border-transparent hover:border-slate-700"
                      >
                        ×
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate w-full" title={err.message}>
                      {err.message}
                    </span>
                    <span className="text-[8px] text-slate-650 self-end">
                      {new Date(err.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 font-mono text-xs">
                No recorded system crashes. Clean logs!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
