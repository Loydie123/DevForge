"use client";

import { ApiResponseData } from "../_hooks/use-api-hub";

interface ResponsePanelProps {
  response: ApiResponseData | null;
  executionError: string | null;
  isExecuting: boolean;
  responseTab: "body" | "headers";
  setResponseTab: (tab: "body" | "headers") => void;
}

export default function ResponsePanel({
  response,
  executionError,
  isExecuting,
  responseTab,
  setResponseTab,
}: ResponsePanelProps) {
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColorClass = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (status >= 300 && status < 400) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 overflow-hidden h-[330px]">
      {/* Response Panel Header / Metrics Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Response Inspector
        </span>
        
        {response && !isExecuting && (
          <div className="flex items-center gap-4 text-[10px] font-mono">
            {/* Status Code badge */}
            <div className={`px-2.5 py-1 rounded-lg border font-bold ${getStatusColorClass(response.status)}`}>
              {response.status} {response.statusText}
            </div>
            
            {/* Latency */}
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-semibold">
              ⏱️ {response.latencyMs}ms
            </div>
            
            {/* Size */}
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
              📦 {formatBytes(response.sizeBytes)}
            </div>
          </div>
        )}
      </div>

      {/* Main Response Output area */}
      <div className="flex-1 flex flex-col min-h-0">
        {isExecuting ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 text-center">
            <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
            <span className="font-mono text-xs">Waiting for target server response...</span>
          </div>
        ) : executionError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-rose-500/20 bg-rose-500/5 rounded-xl font-mono text-xs text-rose-400 gap-2 overflow-y-auto">
            <span className="text-lg">⚠️ Request Failed</span>
            <p className="text-center">{executionError}</p>
          </div>
        ) : response ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Selectors */}
            <div className="flex gap-4 text-xs font-mono font-bold border-b border-slate-800/50 pb-2">
              <button
                onClick={() => setResponseTab("body")}
                className={`pb-1 border-b-2 transition-all cursor-pointer ${
                  responseTab === "body"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Pretty Body
              </button>
              <button
                onClick={() => setResponseTab("headers")}
                className={`pb-1 border-b-2 transition-all cursor-pointer ${
                  responseTab === "headers"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Headers ({Object.keys(response.headers).length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto pt-3 min-h-0">
              {responseTab === "body" ? (
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed select-text max-h-[170px]">
                  {response.body}
                </pre>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[170px] overflow-y-auto font-mono text-[10px]">
                  <div className="flex border-b border-slate-850 pb-1.5 font-bold text-slate-500 px-1">
                    <span className="w-1/3">HEADER</span>
                    <span className="w-2/3">VALUE</span>
                  </div>
                  {Object.entries(response.headers).map(([key, val]) => (
                    <div key={key} className="flex border-b border-slate-900/40 py-1 hover:bg-slate-800/10 rounded px-1">
                      <span className="w-1/3 text-emerald-500 font-semibold truncate" title={key}>{key}</span>
                      <span className="w-2/3 text-slate-300 break-all select-text" title={val}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
            <span className="text-2xl select-none">📡</span>
            <span className="font-mono text-xs font-semibold text-slate-400">Response Inspector is idle.</span>
            <span className="text-[10px] text-slate-600 font-mono">
              Enter a URL above and click &quot;Send&quot; to execute request.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
