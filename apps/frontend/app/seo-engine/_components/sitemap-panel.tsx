"use client";

import { useState } from "react";
import type { GenerateSitemapParams, SitemapEntry } from "@/services/seo-engine/seo-engine-service";

interface Props {
  params: GenerateSitemapParams;
  setParams: (p: GenerateSitemapParams) => void;
  result: { xml: string; entries: SitemapEntry[] } | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const CHANGEFREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-gray-950 rounded-lg p-4 text-xs text-blue-300 overflow-x-auto leading-relaxed max-h-80">
        {code}
      </pre>
      <button
        onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded"
      >
        {copied ? "Copied!" : "Copy XML"}
      </button>
    </div>
  );
}

export default function SitemapPanel({ params, setParams, result, isLoading, onGenerate }: Props) {
  const addPage = () =>
    setParams({ ...params, pages: [...params.pages, { path: "/new-page", priority: 0.5, changefreq: "weekly" }] });

  const removePage = (idx: number) =>
    setParams({ ...params, pages: params.pages.filter((_, i) => i !== idx) });

  const updatePage = (idx: number, updates: Partial<GenerateSitemapParams["pages"][0]>) =>
    setParams({ ...params, pages: params.pages.map((p, i) => (i === idx ? { ...p, ...updates } : p)) });

  return (
    <div className="flex flex-col gap-6">
      {/* Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">Sitemap Generator</h2>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Generating…" : "Generate XML"}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Base URL</label>
          <input
            type="url"
            value={params.baseUrl}
            onChange={(e) => setParams({ ...params, baseUrl: e.target.value })}
            placeholder="https://myapp.com"
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Pages</label>
            <button onClick={addPage} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add Page</button>
          </div>
          <div className="flex flex-col gap-2">
            {params.pages.map((page, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-900/50 rounded-lg p-2">
                <input
                  type="text"
                  value={page.path}
                  onChange={(e) => updatePage(idx, { path: e.target.value })}
                  placeholder="/path"
                  className="col-span-5 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={page.changefreq ?? "weekly"}
                  onChange={(e) => updatePage(idx, { changefreq: e.target.value as SitemapEntry["changefreq"] })}
                  className="col-span-4 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {CHANGEFREQS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={page.priority ?? 0.7}
                  onChange={(e) => updatePage(idx, { priority: Number(e.target.value) })}
                  className="col-span-2 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <button onClick={() => removePage(idx)} className="col-span-1 text-red-400 hover:text-red-300 text-xs text-center">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* Entries table */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Sitemap Entries <span className="text-gray-500">({result.entries.length})</span>
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2 pr-4">URL</th>
                  <th className="pb-2 pr-4">Last Modified</th>
                  <th className="pb-2 pr-4">Change Freq</th>
                  <th className="pb-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {result.entries.map((e, i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="py-2 pr-4 text-blue-400 font-mono truncate max-w-[240px]">{e.loc}</td>
                    <td className="py-2 pr-4 text-gray-400">{e.lastmod}</td>
                    <td className="py-2 pr-4">{e.changefreq}</td>
                    <td className="py-2">{e.priority.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* XML output */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Generated XML</h3>
            <CodeBlock code={result.xml} />
          </div>
        </>
      )}
    </div>
  );
}
