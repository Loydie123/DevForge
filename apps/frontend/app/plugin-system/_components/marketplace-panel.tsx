"use client";

import type { MarketplacePlugin, PluginCategory } from "@/services/plugin-system/plugin-system-service";

const categoryIcon: Record<string, string> = {
  monitoring: "📊", security: "🔐", analytics: "📈",
  logging: "📄", devops: "🐳", ai: "🤖", utility: "🔧",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span className="text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface Props {
  marketplace: MarketplacePlugin[];
  isLoading: boolean;
  categoryFilter: PluginCategory | "all";
  setCategoryFilter: (c: PluginCategory | "all") => void;
  categories: Array<PluginCategory | "all">;
  onInstall: (id: string) => void;
  isInstalling: boolean;
  installingId?: string;
}

export default function MarketplacePanel({
  marketplace,
  isLoading,
  categoryFilter,
  setCategoryFilter,
  categories,
  onInstall,
  isInstalling,
  installingId,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            {cat === "all" ? "All" : `${categoryIcon[cat] ?? ""} ${cat}`}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-xs text-gray-500 animate-pulse text-center py-8">Loading marketplace…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {marketplace.map((mp) => (
          <div key={mp.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{categoryIcon[mp.manifest.category] ?? "🔌"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{mp.manifest.name}</span>
                  {mp.installed && (
                    <span className="text-xs px-1.5 py-0.5 bg-green-400/10 text-green-400 rounded-full border border-green-400/20">
                      Installed
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">by {mp.manifest.author}</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 line-clamp-2">{mp.manifest.description}</p>

            <div className="flex flex-wrap gap-1">
              {mp.manifest.hooks.map((h) => (
                <span key={h} className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded font-mono">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
              <div className="flex flex-col gap-0.5">
                <Stars rating={mp.rating} />
                <span className="text-xs text-gray-500">{mp.downloads.toLocaleString()} installs</span>
              </div>
              <button
                onClick={() => onInstall(mp.id)}
                disabled={mp.installed || (isInstalling && installingId === mp.id)}
                className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                  mp.installed
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {mp.installed ? "Installed" : isInstalling && installingId === mp.id ? "Installing…" : "Install"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
