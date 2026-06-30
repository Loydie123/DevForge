"use client";

import { KeyValuePair } from "../_hooks/use-api-hub";

interface RequestPanelProps {
  method: string;
  setMethod: (method: string) => void;
  url: string;
  setUrl: (url: string) => void;
  headers: KeyValuePair[];
  setHeaders: (headers: KeyValuePair[]) => void;
  body: string;
  setBody: (body: string) => void;
  isExecuting: boolean;
  handleSendRequest: () => void;
  composerTab: "headers" | "body";
  setComposerTab: (tab: "headers" | "body") => void;
}

export default function RequestPanel({
  method,
  setMethod,
  url,
  setUrl,
  headers,
  setHeaders,
  body,
  setBody,
  isExecuting,
  handleSendRequest,
  composerTab,
  setComposerTab,
}: RequestPanelProps) {
  
  const handleHeaderChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...headers];
    updated[index][field] = val;
    
    // Auto-append row if typing in the last empty row
    if (index === headers.length - 1 && (updated[index].key || updated[index].value)) {
      updated.push({ key: "", value: "" });
    }
    
    setHeaders(updated);
  };

  const removeHeaderRow = (index: number) => {
    if (headers.length === 1) {
      setHeaders([{ key: "", value: "" }]);
      return;
    }
    const updated = headers.filter((_, i) => i !== index);
    setHeaders(updated);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 overflow-hidden">
      {/* Request Send Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="h-11 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-emerald-400 font-mono font-bold rounded-xl cursor-pointer shrink-0"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <input
          type="text"
          placeholder="Enter request URL..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSendRequest()}
          className="flex-1 h-11 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600 rounded-xl transition-all font-mono"
        />

        <button
          onClick={handleSendRequest}
          disabled={isExecuting || !url.trim()}
          className="h-11 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-900/60 font-mono font-bold text-slate-950 text-xs rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-w-[100px]"
        >
          {isExecuting ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>

      {/* Composer Parameters Configuration Pane */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 gap-6 text-xs font-mono font-bold pb-2">
          <button
            onClick={() => setComposerTab("headers")}
            className={`pb-2 border-b-2 transition-all cursor-pointer ${
              composerTab === "headers"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Headers ({headers.filter(h => h.key.trim()).length})
          </button>
          <button
            onClick={() => setComposerTab("body")}
            className={`pb-2 border-b-2 transition-all cursor-pointer ${
              composerTab === "body"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Body (JSON)
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto pt-4 flex flex-col">
          {composerTab === "headers" ? (
            <div className="flex flex-col gap-2.5 max-h-[170px] overflow-y-auto">
              <div className="flex gap-2 text-[9px] font-mono font-bold text-slate-500 px-1">
                <span className="w-1/2">KEY</span>
                <span className="w-1/2">VALUE</span>
                <span className="w-8 shrink-0" />
              </div>
              
              {headers.map((h, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key"
                    value={h.key}
                    onChange={e => handleHeaderChange(index, "key", e.target.value)}
                    className="w-1/2 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white placeholder-slate-600 transition-all font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={e => handleHeaderChange(index, "value", e.target.value)}
                    className="w-1/2 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white placeholder-slate-600 transition-all font-mono"
                  />
                  <button
                    onClick={() => removeHeaderRow(index)}
                    className="h-8 w-8 text-xs font-mono font-bold text-rose-400 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              placeholder={`{\n  "key": "value"\n}`}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="flex-1 min-h-[140px] p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-[11px] text-emerald-400 placeholder-slate-700 font-mono resize-none transition-all leading-relaxed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
