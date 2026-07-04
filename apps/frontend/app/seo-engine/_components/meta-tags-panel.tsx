"use client";

import { useState } from "react";
import type { MetaTagResult, GenerateMetaParams } from "@/services/seo-engine/seo-engine-service";

interface Props {
  params: GenerateMetaParams;
  setParams: (p: GenerateMetaParams) => void;
  result: MetaTagResult | null;
  isLoading: boolean;
  onGenerate: () => void;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-gray-950 rounded-lg p-4 text-xs text-green-300 overflow-x-auto leading-relaxed">
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

function metaToHtml(m: MetaTagResult): string {
  const lines = [
    `<!-- Primary Meta Tags -->`,
    `<title>${m.title}</title>`,
    `<meta name="description" content="${m.description}" />`,
    `<meta name="robots" content="${m.robots}" />`,
    m.keywords.length ? `<meta name="keywords" content="${m.keywords.join(", ")}" />` : null,
    `<link rel="canonical" href="${m.canonical}" />`,
    ``,
    `<!-- Open Graph -->`,
    `<meta property="og:title" content="${m.ogTitle}" />`,
    `<meta property="og:description" content="${m.ogDescription}" />`,
    `<meta property="og:url" content="${m.ogUrl}" />`,
    `<meta property="og:type" content="${m.ogType}" />`,
    m.ogImage ? `<meta property="og:image" content="${m.ogImage}" />` : null,
    ``,
    `<!-- Twitter Card -->`,
    `<meta name="twitter:card" content="${m.twitterCard}" />`,
    `<meta name="twitter:title" content="${m.twitterTitle}" />`,
    `<meta name="twitter:description" content="${m.twitterDescription}" />`,
    m.twitterImage ? `<meta name="twitter:image" content="${m.twitterImage}" />` : null,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

export default function MetaTagsPanel({ params, setParams, result, isLoading, onGenerate }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-200">Meta Tag Generator</h2>

          {(
            [
              { key: "title", label: "Page Title", placeholder: "My Awesome App" },
              { key: "description", label: "Description", placeholder: "A short, compelling description…" },
              { key: "url", label: "Canonical URL", placeholder: "https://myapp.com/page" },
              { key: "image", label: "OG Image URL", placeholder: "https://myapp.com/og.png" },
            ] as { key: keyof GenerateMetaParams; label: string; placeholder: string }[]
          ).map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">{label}</label>
              <input
                type="text"
                value={(params[key] as string) ?? ""}
                onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                placeholder={placeholder}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Keywords (comma-separated)</label>
            <input
              type="text"
              value={params.keywords?.join(", ") ?? ""}
              onChange={(e) =>
                setParams({ ...params, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })
              }
              placeholder="seo, tools, next.js"
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.noIndex ?? false}
              onChange={(e) => setParams({ ...params, noIndex: e.target.checked })}
              className="accent-indigo-500"
            />
            <span className="text-xs text-gray-400">noindex (exclude from search engines)</span>
          </label>

          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Generating…" : "Generate Meta Tags"}
          </button>
        </div>

        {/* Preview */}
        {result && (
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-200">Preview</h2>
            {/* SERP preview */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-blue-700 text-base font-medium truncate">{result.title}</div>
              <div className="text-green-700 text-xs mt-0.5 truncate">{result.canonical}</div>
              <div className="text-gray-600 text-xs mt-1 line-clamp-2">{result.description}</div>
            </div>
            <div className="text-xs text-gray-500">↑ Google SERP preview</div>

            {/* OG card preview */}
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              {result.ogImage && (
                <div className="h-32 bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                  OG Image: {result.ogImage}
                </div>
              )}
              <div className="p-3 bg-gray-900">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{new URL(result.ogUrl.startsWith("http") ? result.ogUrl : `https://${result.ogUrl}`).hostname}</div>
                <div className="text-sm font-medium text-white mt-0.5">{result.ogTitle}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{result.ogDescription}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">↑ Social card preview</div>
          </div>
        )}
      </div>

      {/* Generated HTML */}
      {result && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-200">Generated HTML</h2>
          <CodeBlock code={metaToHtml(result)} />
        </div>
      )}
    </div>
  );
}
