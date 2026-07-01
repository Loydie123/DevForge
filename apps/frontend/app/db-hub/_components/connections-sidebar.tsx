"use client";

import { useState } from "react";
import { DbConnection, DbQueryHistoryItem } from "../../../services/db-hub-service";

interface ConnectionsSidebarProps {
  connections: DbConnection[];
  activeConnection: DbConnection | null;
  setActiveConnection: (conn: DbConnection) => void;
  history: DbQueryHistoryItem[];
  isLoadingConnections: boolean;
  isLoadingHistory: boolean;

  // Add Connection states & handlers
  isAddFormOpen: boolean;
  setIsAddFormOpen: (open: boolean) => void;
  formName: string;
  setFormName: (name: string) => void;
  formType: string;
  handleTypeChange: (type: string) => void;
  formHost: string;
  setFormHost: (host: string) => void;
  formPort: number;
  setFormPort: (port: number) => void;
  formDatabase: string;
  setFormDatabase: (db: string) => void;
  formUsername: string;
  setFormUsername: (user: string) => void;
  formPassword: string;
  setFormPassword: (pass: string) => void;

  isTestingConnection: boolean;
  isSavingConnection: boolean;
  testFeedback: { success: boolean; message: string } | null;
  setTestFeedback: (feedback: { success: boolean; message: string } | null) => void;
  handleTestConnection: () => void;
  handleSaveConnection: () => void;
  handleDeleteConnection: (id: string) => void;
  handleClearHistory: () => void;
}

export default function ConnectionsSidebar({
  connections,
  activeConnection,
  setActiveConnection,
  history,
  isLoadingConnections,
  isLoadingHistory,

  isAddFormOpen,
  setIsAddFormOpen,
  formName,
  setFormName,
  formType,
  handleTypeChange,
  formHost,
  setFormHost,
  formPort,
  setFormPort,
  formDatabase,
  setFormDatabase,
  formUsername,
  setFormUsername,
  formPassword,
  setFormPassword,

  isTestingConnection,
  isSavingConnection,
  testFeedback,
  setTestFeedback,
  handleTestConnection,
  handleSaveConnection,
  handleDeleteConnection,
  handleClearHistory,
}: ConnectionsSidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<"connections" | "history">("connections");

  const getTypeBadgeColor = (type: string) => {
    if (type === "postgres") return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (type === "mysql") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shrink-0 overflow-hidden">
      {/* Tab Switcher Headers */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 shrink-0">
        <button
          onClick={() => { setSidebarTab("connections"); setIsAddFormOpen(false); }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            sidebarTab === "connections" && !isAddFormOpen
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Connections
        </button>
        <button
          onClick={() => { setSidebarTab("history"); setIsAddFormOpen(false); }}
          disabled={!activeConnection}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
            sidebarTab === "history"
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Query Logs ({history.length})
        </button>
      </div>

      {/* Main Sidebar Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isAddFormOpen ? (
          /* Add Connection Form Panel */
          <div className="flex flex-col gap-3.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Connection</span>
              <button
                onClick={() => { setIsAddFormOpen(false); setTestFeedback(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Connection Name */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">NAME</span>
              <input
                type="text"
                placeholder="e.g. Local Postgres"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {/* Database Engine Type */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">TYPE</span>
              <select
                value={formType}
                onChange={e => handleTypeChange(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-emerald-400 cursor-pointer"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>

            {/* Host & Port grid */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold">HOST</span>
                <input
                  type="text"
                  placeholder="localhost"
                  value={formHost}
                  onChange={e => setFormHost(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
                />
              </div>
              <div className="w-20 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold">PORT</span>
                <input
                  type="number"
                  placeholder="5432"
                  value={formPort}
                  onChange={e => setFormPort(Number(e.target.value))}
                  className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
                />
              </div>
            </div>

            {/* Database Name */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">DATABASE</span>
              <input
                type="text"
                placeholder="devforge"
                value={formDatabase}
                onChange={e => setFormDatabase(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">USERNAME</span>
              <input
                type="text"
                placeholder="root"
                value={formUsername}
                onChange={e => setFormUsername(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold">PASSWORD</span>
              <input
                type="password"
                placeholder="••••••••"
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:outline-none text-[11px] text-white"
              />
            </div>

            {/* Test Connection feedback block */}
            {testFeedback && (
              <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed ${
                testFeedback.success 
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25" 
                  : "bg-rose-500/5 text-rose-400 border-rose-500/25"
              }`}>
                {testFeedback.success ? "🟢 Success: " : "🔴 Failed: "} {testFeedback.message}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex-1 h-8 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 disabled:opacity-40 font-bold transition-all text-slate-300 cursor-pointer"
              >
                {isTestingConnection ? "Testing..." : "Test"}
              </button>
              <button
                onClick={handleSaveConnection}
                disabled={isSavingConnection || !formName.trim() || !formHost.trim() || !formDatabase.trim()}
                className="flex-1 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 font-bold text-slate-950 transition-all cursor-pointer"
              >
                {isSavingConnection ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : sidebarTab === "connections" ? (
          /* Database Connections Directory List */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Saved Databases
              </span>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                + Add New
              </button>
            </div>

            {isLoadingConnections ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20 text-center">
                <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
                <span className="font-mono text-[11px]">Loading list...</span>
              </div>
            ) : connections.length > 0 ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {connections.map((conn) => {
                  const isActive = activeConnection?.id === conn.id;
                  return (
                    <div
                      key={conn.id}
                      className={`p-3 border rounded-xl hover:border-slate-700 flex items-center justify-between group transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-800 border-slate-700 shadow-[0_0_12px_rgba(163,230,53,0.04)]"
                          : "bg-slate-950/30 border-slate-800/80 hover:bg-slate-800/10"
                      }`}
                      onClick={() => setActiveConnection(conn)}
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate max-w-[130px]">{conn.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getTypeBadgeColor(conn.type)}`}>
                            {conn.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          📂 {conn.database} ({conn.host}:{conn.port})
                        </span>
                      </div>

                      {/* Delete Connection Profile */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete connection "${conn.name}"?`)) {
                            handleDeleteConnection(conn.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 font-mono text-xs">
                No connections saved yet. Add one above!
              </div>
            )}
          </>
        ) : (
          /* Query logs history panel */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Query Logs
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => confirm("Clear query logs?") && handleClearHistory()}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {isLoadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20 text-center">
                <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
                <span className="font-mono text-[11px]">Loading logs...</span>
              </div>
            ) : history.length > 0 ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {history.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex flex-col gap-1.5 text-left"
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className={log.status === "success" ? "text-emerald-400" : "text-rose-400"}>
                        {log.status === "success" ? "🟢 OK" : "🔴 Error"}
                      </span>
                      <span>{log.latencyMs}ms</span>
                    </div>
                    <pre className="text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-900 overflow-x-auto select-text leading-tight max-h-[80px] whitespace-pre-wrap font-mono">
                      {log.query}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 font-mono text-xs">
                Query logs are empty. Run a query!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
