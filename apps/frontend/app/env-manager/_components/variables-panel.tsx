"use client";

import { useState } from "react";
import type { EnvConfig, EnvVariable, SecretType } from "@/services/env-manager/env-manager-service";

const SECRET_TYPES: SecretType[] = ["plain", "secret", "api_key", "connection_string"];

interface Props {
  config: EnvConfig;
  revealedVarIds: Set<string>;
  revealedValues: Record<string, string>;
  onReveal: (configId: string, varId: string) => void;
  onDelete: (configId: string, varId: string) => void;
  showAddVar: boolean;
  setShowAddVar: (v: boolean) => void;
  newVar: Omit<EnvVariable, "id" | "createdAt" | "updatedAt">;
  setNewVar: (v: Omit<EnvVariable, "id" | "createdAt" | "updatedAt">) => void;
  onAddVar: () => void;
  isAddingVar: boolean;
  onExport: (id: string) => void;
  varTypeColor: (t: SecretType) => string;
  exportContent: string | null;
  setExportContent: (v: string | null) => void;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-gray-950 rounded-lg p-4 text-xs text-green-300 overflow-x-auto leading-relaxed max-h-64 whitespace-pre">
        {code}
      </pre>
      <button
        onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function VariablesPanel({
  config,
  revealedVarIds,
  revealedValues,
  onReveal,
  onDelete,
  showAddVar,
  setShowAddVar,
  newVar,
  setNewVar,
  onAddVar,
  isAddingVar,
  onExport,
  varTypeColor,
  exportContent,
  setExportContent,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 font-mono">v{config.version}</span>
          <span className="text-xs text-gray-600 ml-2">
            Updated {new Date(config.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onExport(config.id)}
            className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Export .env
          </button>
          <button
            onClick={() => setShowAddVar(!showAddVar)}
            className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            + Add Variable
          </button>
        </div>
      </div>

      {/* Add variable form */}
      {showAddVar && (
        <div className="bg-gray-900/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-gray-300">New Variable</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Key</label>
              <input
                type="text"
                value={newVar.key}
                onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                placeholder="MY_VARIABLE"
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Value</label>
              <input
                type={newVar.masked ? "password" : "text"}
                value={newVar.value}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                placeholder="value"
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Type</label>
              <select
                value={newVar.type}
                onChange={(e) => setNewVar({ ...newVar, type: e.target.value as SecretType })}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none"
              >
                {SECRET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Description</label>
              <input
                type="text"
                value={newVar.description ?? ""}
                onChange={(e) => setNewVar({ ...newVar, description: e.target.value })}
                placeholder="optional"
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={newVar.masked}
              onChange={(e) => setNewVar({ ...newVar, masked: e.target.checked })}
              className="accent-indigo-500"
            />
            Mask value (treated as secret)
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddVar(false)} className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg">Cancel</button>
            <button
              onClick={onAddVar}
              disabled={isAddingVar || !newVar.key}
              className="text-xs px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg"
            >
              {isAddingVar ? "Adding…" : "Add Variable"}
            </button>
          </div>
        </div>
      )}

      {/* Variables table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        {config.variables.length === 0 ? (
          <p className="text-xs text-gray-500 p-6 text-center">No variables yet. Add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-700 bg-gray-800/80">
                <th className="px-4 py-3 w-48">Key</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3 w-28">Type</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {config.variables.map((v) => {
                const isRevealed = revealedVarIds.has(v.id);
                const displayVal = isRevealed ? (revealedValues[v.id] ?? v.value) : v.value;
                return (
                  <tr key={v.id} className="hover:bg-gray-700/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs text-white">{v.key}</span>
                        {v.description && <span className="text-xs text-gray-500">{v.description}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${v.masked && !isRevealed ? "text-gray-600 tracking-widest" : "text-green-300"}`}>
                        {displayVal}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${varTypeColor(v.type)}`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {v.masked && (
                          <button
                            onClick={() => onReveal(config.id, v.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            {isRevealed ? "Hide" : "Show"}
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(config.id, v.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Export modal */}
      {exportContent && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">.env Export</h3>
            <button onClick={() => setExportContent(null)} className="text-gray-500 hover:text-white text-xs">Close</button>
          </div>
          <CodeBlock code={exportContent} />
        </div>
      )}
    </div>
  );
}
