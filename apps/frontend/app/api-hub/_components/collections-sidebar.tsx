"use client";

import { useState } from "react";
import { Collection, HistoryItem, SavedRequest } from "../../../services/api-hub/api-hub-service";

interface CollectionsSidebarProps {
  collections: Collection[];
  history: HistoryItem[];
  sidebarTab: "collections" | "history";
  setSidebarTab: (tab: "collections" | "history") => void;
  isLoadingLists: boolean;
  newCollectionName: string;
  setNewCollectionName: (name: string) => void;
  isCreatingCollection: boolean;
  handleCreateCollection: () => void;
  handleDeleteCollection: (id: string) => void;
  handleSaveRequest: (collectionId: string, name: string) => void;
  handleDeleteRequest: (id: string) => void;
  loadSavedRequestIntoComposer: (req: SavedRequest) => void;
  loadHistoryItemIntoComposer: (item: HistoryItem) => void;
  handleClearHistory: () => void;
}

export default function CollectionsSidebar({
  collections,
  history,
  sidebarTab,
  setSidebarTab,
  isLoadingLists,
  newCollectionName,
  setNewCollectionName,
  isCreatingCollection,
  handleCreateCollection,
  handleDeleteCollection,
  handleSaveRequest,
  handleDeleteRequest,
  loadSavedRequestIntoComposer,
  loadHistoryItemIntoComposer,
  handleClearHistory,
}: CollectionsSidebarProps) {
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getMethodBadgeClass = (method: string) => {
    const methods: Record<string, string> = {
      GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      POST: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      PATCH: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    };
    return methods[method] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shrink-0 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
        <button
          onClick={() => setSidebarTab("collections")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            sidebarTab === "collections"
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setSidebarTab("history")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            sidebarTab === "history"
              ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          History
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isLoadingLists ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20 text-center">
            <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
            <span className="font-mono text-[11px]">Loading...</span>
          </div>
        ) : sidebarTab === "collections" ? (
          <>
            {/* Create Collection Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New collection name..."
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateCollection()}
                className="flex-1 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600 transition-all font-mono"
              />
              <button
                onClick={handleCreateCollection}
                disabled={isCreatingCollection || !newCollectionName.trim()}
                className="h-9 w-9 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 disabled:bg-slate-900 disabled:text-slate-700 rounded-xl text-xs text-white font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Collections Tree List */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              {collections.length > 0 ? (
                collections.map((col) => {
                  const isExpanded = !!expandedCollections[col.id];
                  return (
                    <div key={col.id} className="border border-slate-800/40 rounded-xl overflow-hidden bg-slate-950/20">
                      {/* Collection Header */}
                      <div className="flex items-center justify-between p-3 hover:bg-slate-800/20 transition-all group">
                        <button
                          onClick={() => toggleCollection(col.id)}
                          className="flex items-center gap-2 text-slate-200 hover:text-white font-bold text-left flex-1"
                        >
                          <span className="text-[10px] text-slate-500">
                            {isExpanded ? "▼" : "▶"}
                          </span>
                          <span>📁 {col.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({col.requests?.length || 0})
                          </span>
                        </button>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          {/* Save Current Request to Collection */}
                          <button
                            onClick={() => {
                              const name = prompt("Enter a name for this request:");
                              if (name) handleSaveRequest(col.id, name);
                            }}
                            title="Save current request here"
                            className="h-6 w-6 text-[11px] bg-slate-850 hover:bg-slate-750 text-emerald-400 rounded flex items-center justify-center cursor-pointer border border-slate-800"
                          >
                            +
                          </button>
                          {/* Delete Collection */}
                          <button
                            onClick={() => confirm(`Delete collection "${col.name}"?`) && handleDeleteCollection(col.id)}
                            title="Delete Collection"
                            className="h-6 w-6 text-[10px] bg-slate-850 hover:bg-slate-750 text-rose-400 rounded flex items-center justify-center cursor-pointer border border-slate-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Collection Requests Body */}
                      {isExpanded && (
                        <div className="border-t border-slate-800/30 bg-slate-950/40 flex flex-col p-1 gap-1 pl-4">
                          {col.requests && col.requests.length > 0 ? (
                            col.requests.map((req: SavedRequest) => (
                              <div
                                key={req.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 transition-all group"
                              >
                                <button
                                  onClick={() => loadSavedRequestIntoComposer(req)}
                                  className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-200 text-left flex-1"
                                >
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getMethodBadgeClass(req.method)}`}>
                                    {req.method}
                                  </span>
                                  <span className="truncate max-w-[120px]" title={req.name}>
                                    {req.name}
                                  </span>
                                </button>
                                <button
                                  onClick={() => confirm(`Delete saved request "${req.name}"?`) && handleDeleteRequest(req.id)}
                                  className="opacity-0 group-hover:opacity-100 h-5 w-5 text-[9px] text-rose-400 bg-slate-850 hover:bg-slate-750 border border-slate-850 hover:border-slate-800 rounded flex items-center justify-center cursor-pointer transition-all"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-600 p-3 italic text-center">
                              No requests saved yet.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 py-10">
                  No collections yet. Create one above!
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* History Feed panel */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Recent Executions
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => confirm("Clear request history?") && handleClearHistory()}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              {history.length > 0 ? (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItemIntoComposer(item)}
                    className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-slate-700 hover:bg-slate-800/10 flex flex-col gap-1.5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${getMethodBadgeClass(item.method)}`}>
                        {item.method}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-300 truncate w-full" title={item.url}>
                      {item.url}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center text-slate-500 py-10">
                  Request history is empty.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
