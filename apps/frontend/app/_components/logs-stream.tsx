"use client";

import { LogPayload } from "@devforge/event-bus";

interface LogsStreamProps {
  logs: LogPayload[];
  onClear: () => void;
}

export default function LogsStream({ logs, onClear }: LogsStreamProps) {
  const levelColors = {
    info: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    debug: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  return (
    <div className="flex flex-col gap-6 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-mono font-bold text-slate-200 border-l-2 border-teal-500 pl-3 uppercase tracking-wider">
          Logs Event Stream
        </h2>
        <button
          onClick={onClear}
          className="text-xs font-mono font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Clear Screen
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[400px] max-h-[550px] overflow-y-auto flex flex-col gap-2.5 font-mono text-xs">
        {logs.length > 0 ? (
          logs.map((log, index) => {
            return (
              <div
                key={index}
                className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 transition-all hover:border-slate-700/50"
              >
                <div className="flex items-start md:items-center gap-3">
                  {/* Level Tag */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      levelColors[log.level] || levelColors.info
                    }`}
                  >
                    {log.level}
                  </span>
                  {/* Log Message */}
                  <span className="text-slate-200">{log.message}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 shrink-0 text-[10px]">
                  <span>[{log.service}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 py-20 text-center">
            <span className="text-lg select-none">📟</span>
            <span className="font-semibold text-slate-400">Console Stream is silent.</span>
            <span className="text-[11px] text-slate-600">
              {'Click "Trigger Mock Event" above to dispatch test payloads.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
