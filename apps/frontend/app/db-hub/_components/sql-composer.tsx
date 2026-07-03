"use client";

import { DbConnection } from "../../../services/db-hub/db-hub-service";

interface SqlComposerProps {
  activeConnection: DbConnection | null;
  query: string;
  setQuery: (q: string) => void;
  isExecutingQuery: boolean;
  handleRunQuery: () => void;
}

export default function SqlComposer({
  activeConnection,
  query,
  setQuery,
  isExecutingQuery,
  handleRunQuery,
}: SqlComposerProps) {
  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-[330px]">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">Query Console</span>
          {activeConnection && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              📡 Active: {activeConnection.name} ({activeConnection.type})
            </span>
          )}
        </div>

        <button
          onClick={handleRunQuery}
          disabled={isExecutingQuery || !activeConnection || !query.trim()}
          className="h-9 px-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 disabled:cursor-not-allowed font-mono font-bold text-slate-950 text-xs rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isExecutingQuery ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
          ) : (
            <span>Execute Query</span>
          )}
        </button>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 min-h-0 relative">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={!activeConnection}
          placeholder={
            activeConnection
              ? activeConnection.type === "mongodb"
                ? `{ "find": "collectionName", "filter": {} }`
                : "SELECT * FROM TableName LIMIT 10;"
              : "Select a database connection from the sidebar to activate the console..."
          }
          className="w-full h-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-[11px] text-emerald-400 placeholder-slate-700 font-mono resize-none transition-all leading-relaxed"
        />
        {!activeConnection && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-center p-6 text-slate-500 font-mono text-xs select-none">
            Choose a database connection from the sidebar to write and run queries.
          </div>
        )}
      </div>
    </div>
  );
}
