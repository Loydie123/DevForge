"use client";

import { useState } from "react";
import type { RobotsTxtConfig } from "@/services/seo-engine/seo-engine-service";

interface Props {
  configs: RobotsTxtConfig[];
  setConfigs: (c: RobotsTxtConfig[]) => void;
  robotsText: string | null;
  isLoading: boolean;
  onGenerate: () => void;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-gray-950 rounded-lg p-4 text-xs text-yellow-300 overflow-x-auto leading-relaxed whitespace-pre">
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

function TagList({
  label,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  onAdd: (val: string) => void;
  onRemove: (idx: number) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex flex-wrap gap-1 mb-1">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 bg-gray-700 rounded px-2 py-0.5 text-xs text-gray-200">
            {item}
            <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-400">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { onAdd(input.trim()); setInput(""); } }}
          placeholder="/path (press Enter)"
          className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}

export default function RobotsPanel({ configs, setConfigs, robotsText, isLoading, onGenerate }: Props) {
  const updateConfig = (idx: number, updates: Partial<RobotsTxtConfig>) =>
    setConfigs(configs.map((c, i) => (i === idx ? { ...c, ...updates } : c)));

  const addConfig = () =>
    setConfigs([...configs, { userAgent: "Botname", allow: ["/"], disallow: [] }]);

  const removeConfig = (idx: number) =>
    setConfigs(configs.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-200">Robots.txt Manager</h2>
            <p className="text-xs text-gray-500 mt-0.5">Control which bots can crawl your site and which paths to block</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addConfig} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors">
              + Add Block
            </button>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Generating…" : "Generate robots.txt"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {configs.map((cfg, idx) => (
            <div key={idx} className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 flex-1 mr-4">
                  <label className="text-xs text-gray-400">User-agent</label>
                  <input
                    type="text"
                    value={cfg.userAgent}
                    onChange={(e) => updateConfig(idx, { userAgent: e.target.value })}
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button onClick={() => removeConfig(idx)} className="text-red-400 hover:text-red-300 text-xs mt-4">Remove</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TagList
                  label="Allow"
                  items={cfg.allow}
                  onAdd={(v) => updateConfig(idx, { allow: [...cfg.allow, v] })}
                  onRemove={(i) => updateConfig(idx, { allow: cfg.allow.filter((_, j) => j !== i) })}
                />
                <TagList
                  label="Disallow"
                  items={cfg.disallow}
                  onAdd={(v) => updateConfig(idx, { disallow: [...cfg.disallow, v] })}
                  onRemove={(i) => updateConfig(idx, { disallow: cfg.disallow.filter((_, j) => j !== i) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Crawl-delay (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={cfg.crawlDelay ?? ""}
                    onChange={(e) => updateConfig(idx, { crawlDelay: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="optional"
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Sitemap URL</label>
                  <input
                    type="text"
                    value={cfg.sitemap ?? ""}
                    onChange={(e) => updateConfig(idx, { sitemap: e.target.value || undefined })}
                    placeholder="https://site.com/sitemap.xml"
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {robotsText && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Generated robots.txt</h3>
          <CodeBlock code={robotsText} />
        </div>
      )}
    </div>
  );
}
