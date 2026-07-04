"use client";

import { useSeoEngine } from "@/hooks/use-seo-engine/use-seo-engine";
import SeoStats from "./seo-stats";
import AuditPanel from "./audit-panel";
import MetaTagsPanel from "./meta-tags-panel";
import OgPreviewPanel from "./og-preview-panel";
import SitemapPanel from "./sitemap-panel";
import RobotsPanel from "./robots-panel";
import type { SeoTab } from "@/hooks/use-seo-engine/use-seo-engine";

const tabs: { id: SeoTab; label: string }[] = [
  { id: "audit", label: "SEO Audit" },
  { id: "meta-tags", label: "Meta Tags" },
  { id: "og-preview", label: "OG Preview" },
  { id: "sitemap", label: "Sitemap" },
  { id: "robots", label: "Robots.txt" },
];

export default function SeoEngine() {
  const {
    activeTab,
    setActiveTab,
    stats,
    statsLoading,
    auditUrl,
    setAuditUrl,
    auditHistory,
    auditLoading,
    auditResult,
    runAudit,
    metaParams,
    setMetaParams,
    metaResult,
    metaLoading,
    generateMeta,
    ogUrl,
    setOgUrl,
    ogPreview,
    ogLoading,
    fetchOgPreview,
    sitemapParams,
    setSitemapParams,
    sitemapResult,
    sitemapLoading,
    generateSitemap,
    robotsConfigs,
    setRobotsConfigs,
    robotsText,
    robotsLoading,
    generateRobots,
  } = useSeoEngine();

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Engine</h1>
          <p className="text-sm text-gray-400 mt-1">
            Audit · Meta Tags · Open Graph · Sitemap · Robots.txt
          </p>
        </div>
        {statsLoading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
      </div>

      {/* Stats */}
      <SeoStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "audit" && (
        <AuditPanel
          auditUrl={auditUrl}
          setAuditUrl={setAuditUrl}
          onRun={runAudit}
          isLoading={auditLoading}
          result={auditResult}
          history={auditHistory}
        />
      )}

      {activeTab === "meta-tags" && (
        <MetaTagsPanel
          params={metaParams}
          setParams={setMetaParams}
          result={metaResult}
          isLoading={metaLoading}
          onGenerate={generateMeta}
        />
      )}

      {activeTab === "og-preview" && (
        <OgPreviewPanel
          ogUrl={ogUrl}
          setOgUrl={setOgUrl}
          onFetch={fetchOgPreview}
          isLoading={ogLoading}
          preview={ogPreview}
        />
      )}

      {activeTab === "sitemap" && (
        <SitemapPanel
          params={sitemapParams}
          setParams={setSitemapParams}
          result={sitemapResult}
          isLoading={sitemapLoading}
          onGenerate={generateSitemap}
        />
      )}

      {activeTab === "robots" && (
        <RobotsPanel
          configs={robotsConfigs}
          setConfigs={setRobotsConfigs}
          robotsText={robotsText}
          isLoading={robotsLoading}
          onGenerate={generateRobots}
        />
      )}
    </div>
  );
}
