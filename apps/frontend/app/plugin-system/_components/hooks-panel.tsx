"use client";

import type { HookExecution, PluginHook } from "@/services/plugin-system/plugin-system-service";

const hookColor: Record<string, string> = {
  onRequest: "text-blue-400 bg-blue-400/10",
  onResponse: "text-green-400 bg-green-400/10",
  onError: "text-red-400 bg-red-400/10",
  onLog: "text-yellow-400 bg-yellow-400/10",
  onMetric: "text-purple-400 bg-purple-400/10",
};

interface Props {
  executions: HookExecution[];
  isLoading: boolean;
  testHook: PluginHook;
  setTestHook: (h: PluginHook) => void;
  hooks: PluginHook[];
  onTrigger: () => void;
  isTriggeringHook: boolean;
  lastResult?: HookExecution[];
}

export default function HooksPanel({ executions, isLoading, testHook, setTestHook, hooks, onTrigger, isTriggeringHook, lastResult }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Manual trigger */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Manual Hook Trigger</h2>
        <p className="text-xs text-gray-400 mb-4">
          Manually fire a hook to test which plugins respond and how fast they execute.
        </p>
        <div className="flex gap-3 flex-wrap">
          <select
            value={testHook}
            onChange={(e) => setTestHook(e.target.value as PluginHook)}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
          >
            {hooks.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <button
            onClick={onTrigger}
            disabled={isTriggeringHook}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isTriggeringHook ? "Firing…" : "Trigger Hook"}
          </button>
        </div>

        {lastResult && lastResult.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs text-gray-500">Last trigger result ({lastResult.length} plugin{lastResult.length !== 1 ? "s" : ""} responded):</p>
            {lastResult.map((r) => (
              <div key={r.id} className={`flex items-center gap-3 text-xs rounded-lg px-3 py-2 ${r.success ? "bg-green-400/5 border border-green-400/20" : "bg-red-400/5 border border-red-400/20"}`}>
                <span className={r.success ? "text-green-400" : "text-red-400"}>{r.success ? "✓" : "✗"}</span>
                <span className="text-white font-medium">{r.pluginName}</span>
                <span className={`font-mono px-1.5 py-0.5 rounded ${hookColor[r.hook] ?? "text-gray-400 bg-gray-400/10"}`}>{r.hook}</span>
                <span className="text-gray-400 ml-auto">{r.durationMs}ms</span>
                {r.error && <span className="text-red-400">{r.error}</span>}
              </div>
            ))}
          </div>
        )}

        {lastResult && lastResult.length === 0 && (
          <p className="mt-3 text-xs text-gray-500">No active plugins are subscribed to <span className="font-mono text-indigo-300">{testHook}</span>.</p>
        )}
      </div>

      {/* Execution log */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">Hook Execution Log</span>
          {isLoading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
        </div>
        {executions.length === 0 ? (
          <p className="text-xs text-gray-500 p-6 text-center">No hook executions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-2.5">Plugin</th>
                  <th className="px-4 py-2.5">Hook</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Duration</th>
                  <th className="px-4 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-white">{exec.pluginName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded font-mono ${hookColor[exec.hook] ?? "text-gray-400 bg-gray-400/10"}`}>
                        {exec.hook}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {exec.success ? (
                        <span className="text-green-400">✓ ok</span>
                      ) : (
                        <span className="text-red-400" title={exec.error}>✗ error</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">
                      {exec.durationMs}<span className="text-gray-600 text-[10px]">ms</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {new Date(exec.triggeredAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
