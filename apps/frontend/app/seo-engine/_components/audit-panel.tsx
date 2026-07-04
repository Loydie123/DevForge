"use client";

import type { SeoAuditResult } from "@/services/seo-engine/seo-engine-service";

const gradeColor: Record<string, string> = {
  A: "text-green-400 bg-green-400/10 border-green-400/30",
  B: "text-lime-400 bg-lime-400/10 border-lime-400/30",
  C: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  D: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  F: "text-red-400 bg-red-400/10 border-red-400/30",
};

const issueColor: Record<string, string> = {
  error: "text-red-400 bg-red-400/10",
  warning: "text-yellow-400 bg-yellow-400/10",
  info: "text-blue-400 bg-blue-400/10",
};

interface Props {
  auditUrl: string;
  setAuditUrl: (url: string) => void;
  onRun: () => void;
  isLoading: boolean;
  result?: SeoAuditResult;
  history: SeoAuditResult[];
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-300 w-8 text-right">{value}</span>
    </div>
  );
}

export default function AuditPanel({ auditUrl, setAuditUrl, onRun, isLoading, result, history }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">SEO Audit Tool</h2>
        <div className="flex gap-3">
          <input
            type="url"
            value={auditUrl}
            onChange={(e) => setAuditUrl(e.target.value)}
            placeholder="https://yoursite.com/page"
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={onRun}
            disabled={isLoading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Auditing…" : "Run Audit"}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col items-center justify-center gap-3">
            <span className={`text-6xl font-black border rounded-2xl w-24 h-24 flex items-center justify-center ${gradeColor[result.grade] ?? "text-gray-400"}`}>
              {result.grade}
            </span>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{result.score}<span className="text-sm text-gray-400">/100</span></div>
              <div className="text-xs text-gray-400 mt-1 truncate max-w-[180px]">{result.url}</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-200">Score Breakdown</h3>
            <div className="flex flex-col gap-3">
              <ScoreBar label="Meta Tags" value={result.breakdown.meta} />
              <ScoreBar label="Performance" value={result.breakdown.performance} />
              <ScoreBar label="Content" value={result.breakdown.content} />
              <ScoreBar label="Technical" value={result.breakdown.technical} />
              <ScoreBar label="Accessibility" value={result.breakdown.accessibility} />
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-200">Meta Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">OG Tags</span>
                <span className={result.meta.hasOgTags ? "text-green-400" : "text-red-400"}>
                  {result.meta.hasOgTags ? "✓ Present" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Twitter Cards</span>
                <span className={result.meta.hasTwitterCards ? "text-green-400" : "text-red-400"}>
                  {result.meta.hasTwitterCards ? "✓ Present" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Structured Data</span>
                <span className={result.meta.hasStructuredData ? "text-green-400" : "text-red-400"}>
                  {result.meta.hasStructuredData ? "✓ Present" : "✗ Missing"}
                </span>
              </div>
              {result.meta.robots && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Robots</span>
                  <span className="text-gray-300 font-mono text-xs">{result.meta.robots}</span>
                </div>
              )}
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="lg:col-span-3 bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                Issues <span className="text-gray-500">({result.issues.length})</span>
              </h3>
              <div className="flex flex-col gap-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex gap-3 items-start bg-gray-900/50 rounded-lg p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${issueColor[issue.type]}`}>
                      {issue.type}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm text-white">{issue.message}</span>
                      <span className="text-xs text-gray-400">{issue.recommendation}</span>
                    </div>
                    <span className="text-xs text-gray-600 shrink-0 ml-auto">{issue.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Audit History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                  <th className="pb-2 pr-4">URL</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Grade</th>
                  <th className="pb-2 pr-4">Issues</th>
                  <th className="pb-2">Audited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {history.slice(0, 10).map((a, i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="py-2 pr-4 max-w-[200px] truncate text-xs text-gray-400">{a.url}</td>
                    <td className="py-2 pr-4 font-mono">{a.score}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gradeColor[a.grade] ?? ""}`}>{a.grade}</span>
                    </td>
                    <td className="py-2 pr-4 text-orange-400">{a.issues.length}</td>
                    <td className="py-2 text-xs text-gray-500">{new Date(a.auditedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
