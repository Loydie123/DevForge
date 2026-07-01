"use client";

import { useEffect, useRef } from "react";
import { LogPayload } from "@devforge/event-bus";

interface LogsConsoleProps {
  logs: LogPayload[];
  rawLogsLength: number;

  serviceFilter: string;
  setServiceFilter: (service: string) => void;
  levelFilter: string;
  setLevelFilter: (level: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  autoScroll: boolean;
  setAutoScroll: (scroll: boolean) => void;

  handleClearConsole: () => void;
  handleDownloadLogs: () => void;
}

export default function LogsConsole({
  logs,
  rawLogsLength,
  serviceFilter,
  setServiceFilter,
  levelFilter,
  setLevelFilter,
  searchQuery,
  setSearchQuery,
  autoScroll,
  setAutoScroll,
  handleClearConsole,
  handleDownloadLogs,
}: LogsConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logic to snap scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const getLineColorClass = (level: string) => {
    if (level === "error" || level === "fatal") return "text-rose-400";
    if (level === "warn" || level === "warning") return "text-amber-400";
    return "text-slate-400";
  };

  const getLevelBadge = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl === "error" || lvl === "fatal") return "[ERR]";
    if (lvl === "warn" || lvl === "warning") return "[WRN]";
    return "[INF]";
  };

  // Compile list of unique services for filter dropdown
  // Add fallback static defaults (auth-service, gateway, api-hub, db-hub)
  const uniqueServices = ["auth-service", "gateway", "api-hub", "db-hub"];

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-[700px]">
      
      {/* Controls Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-slate-800 pb-4 shrink-0 font-mono text-xs">
        
        {/* Dropdowns & Filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white font-bold rounded-lg cursor-pointer"
          >
            <option value="all">All Services</option>
            {uniqueServices.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white font-bold rounded-lg cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>

          {/* Keyword Search */}
          <input
            type="text"
            placeholder="Search query logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 px-3 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white rounded-lg placeholder-slate-600 transition-all max-w-[150px]"
          />
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          
          {/* Auto Scroll Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Auto-Scroll</span>
          </label>

          {/* Clear Console */}
          <button
            onClick={handleClearConsole}
            className="h-8 px-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
          >
            Clear
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
            className="h-8 px-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 disabled:cursor-not-allowed font-bold text-slate-950 rounded-lg transition-all cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 bg-[#0b0d16] border border-slate-800/80 rounded-xl p-4 overflow-y-auto min-h-0 flex flex-col font-mono text-[11px] leading-relaxed">
        {logs.length > 0 ? (
          <div className="flex flex-col gap-1.5 select-text">
            {logs.map((log, index) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString();
              return (
                <div key={index} className={`flex items-start gap-2.5 ${getLineColorClass(log.level)}`}>
                  {/* Timestamp */}
                  <span className="text-slate-650 shrink-0 select-none">
                    [{dateStr}]
                  </span>
                  
                  {/* Badge & Service Info */}
                  <span className="text-emerald-500/85 shrink-0 select-none font-bold">
                    {getLevelBadge(log.level)} [{log.service}]
                  </span>

                  {/* Message body */}
                  <span className="break-all whitespace-pre-wrap flex-1">
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-650 text-center select-none">
            <span className="text-2xl animate-pulse">📟</span>
            <span className="text-xs font-semibold text-slate-550">Terminal console is empty.</span>
            <span className="text-[10px] text-slate-700">
              {rawLogsLength > 0 
                ? "No logs match current filters. Try widening search query."
                : "Waiting for process socket logs or file watcher updates..."
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
