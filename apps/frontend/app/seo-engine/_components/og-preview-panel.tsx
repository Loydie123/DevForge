"use client";

import Image from "next/image";
import type { OpenGraphPreview } from "@/services/seo-engine/seo-engine-service";

interface Props {
  ogUrl: string;
  setOgUrl: (url: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  preview?: OpenGraphPreview;
}

export default function OgPreviewPanel({ ogUrl, setOgUrl, onFetch, isLoading, preview }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Open Graph Preview</h2>
        <p className="text-xs text-gray-400 mb-4">
          Paste any URL to see how it looks when shared on social media (Facebook, LinkedIn, Twitter/X, Slack, etc.)
        </p>
        <div className="flex gap-3">
          <input
            type="url"
            value={ogUrl}
            onChange={(e) => setOgUrl(e.target.value)}
            placeholder="https://github.com/vercel/next.js"
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={onFetch}
            disabled={isLoading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Fetching…" : "Preview"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Facebook / LinkedIn */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Facebook / LinkedIn</span>
            <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
              <div className="relative h-36 bg-gray-700 flex items-center justify-center">
                {preview.image ? (
                  <Image src={preview.image} alt="OG" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-gray-500 text-xs">No image</span>
                )}
              </div>
              <div className="p-3 border-t border-gray-700">
                <div className="text-xs text-gray-500 uppercase">{preview.siteName}</div>
                <div className="text-sm font-semibold text-white mt-0.5 line-clamp-2">{preview.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{preview.description}</div>
              </div>
            </div>
          </div>

          {/* Twitter / X */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Twitter / X</span>
            <div className="border border-gray-600 rounded-xl overflow-hidden bg-gray-900">
              <div className="relative h-36 bg-gray-700 flex items-center justify-center">
                {preview.image ? (
                  <Image src={preview.image} alt="Twitter OG" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-gray-500 text-xs">No image</span>
                )}
              </div>
              <div className="p-3 border-t border-gray-700">
                <div className="text-sm font-semibold text-white line-clamp-1">{preview.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{preview.description}</div>
                <div className="text-xs text-gray-600 mt-1">{preview.siteName}</div>
              </div>
            </div>
          </div>

          {/* Slack / Discord */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Slack / Discord</span>
            <div className="border-l-4 border-indigo-500 bg-gray-800/80 rounded-r-lg p-3 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-indigo-300 truncate">{preview.siteName}</div>
                <div className="text-sm text-white mt-0.5 line-clamp-2">{preview.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-3">{preview.description}</div>
                <div className="text-xs text-blue-400 mt-1 truncate">{preview.url}</div>
              </div>
              {preview.image && (
                <div className="relative w-16 h-16 rounded overflow-hidden shrink-0 bg-gray-700">
                  <Image src={preview.image} alt="thumb" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>

          {/* Raw data */}
          <div className="md:col-span-2 lg:col-span-3 bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Raw OG Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(preview).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-gray-500">{key}</span>
                  <span className="text-gray-300 truncate">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!preview && !isLoading && (
        <div className="text-center py-16 text-gray-500 text-sm">
          Enter a URL above and click Preview to see its social media card
        </div>
      )}
    </div>
  );
}
