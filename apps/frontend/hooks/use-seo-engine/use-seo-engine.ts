"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seoEngineService } from "@/services/seo-engine/seo-engine-service";
import type {
  GenerateMetaParams,
  GenerateSitemapParams,
  RobotsTxtConfig,
  MetaTagResult,
  SitemapEntry,
} from "@/services/seo-engine/seo-engine-service";

export type SeoTab = "audit" | "meta-tags" | "og-preview" | "sitemap" | "robots";

export function useSeoEngine() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SeoTab>("audit");

  // ─── Audit ────────────────────────────────────────────────────────────────
  const [auditUrl, setAuditUrl] = useState("https://example.com");

  const statsQuery = useQuery({
    queryKey: ["seo-engine", "stats"],
    queryFn: () => seoEngineService.getStats(),
    refetchInterval: 30_000,
  });

  const auditHistoryQuery = useQuery({
    queryKey: ["seo-engine", "audit-history"],
    queryFn: () => seoEngineService.getAuditHistory(),
    refetchInterval: 30_000,
  });

  const auditMutation = useMutation({
    mutationFn: (url: string) => seoEngineService.auditUrl(url),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seo-engine"] });
    },
  });

  // ─── Meta Tags ────────────────────────────────────────────────────────────
  const [metaParams, setMetaParams] = useState<GenerateMetaParams>({
    title: "My Awesome App",
    description: "The best app for developers worldwide.",
    url: "https://myapp.com",
    image: "https://myapp.com/og-image.png",
    type: "website",
    keywords: ["developer", "tools", "app"],
    noIndex: false,
  });
  const [metaResult, setMetaResult] = useState<MetaTagResult | null>(null);

  const metaMutation = useMutation({
    mutationFn: (params: GenerateMetaParams) => seoEngineService.generateMetaTags(params),
    onSuccess: (data) => setMetaResult(data),
  });

  // ─── OG Preview ───────────────────────────────────────────────────────────
  const [ogUrl, setOgUrl] = useState("https://github.com");

  const ogPreviewQuery = useQuery({
    queryKey: ["seo-engine", "og-preview", ogUrl],
    queryFn: () => seoEngineService.previewOpenGraph(ogUrl),
    enabled: false,
  });

  // ─── Sitemap ──────────────────────────────────────────────────────────────
  const [sitemapParams, setSitemapParams] = useState<GenerateSitemapParams>({
    baseUrl: "https://myapp.com",
    pages: [
      { path: "/", priority: 1.0, changefreq: "daily" },
      { path: "/about", priority: 0.8, changefreq: "monthly" },
      { path: "/blog", priority: 0.9, changefreq: "weekly" },
      { path: "/contact", priority: 0.6, changefreq: "yearly" },
    ],
  });
  const [sitemapResult, setSitemapResult] = useState<{ xml: string; entries: SitemapEntry[] } | null>(null);

  const sitemapMutation = useMutation({
    mutationFn: (params: GenerateSitemapParams) => seoEngineService.generateSitemap(params),
    onSuccess: (data) => setSitemapResult(data),
  });

  // ─── Robots ───────────────────────────────────────────────────────────────
  const [robotsConfigs, setRobotsConfigs] = useState<RobotsTxtConfig[]>([
    {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/private", "/api"],
      sitemap: "https://myapp.com/sitemap.xml",
    },
    {
      userAgent: "Googlebot",
      allow: ["/"],
      disallow: [],
      crawlDelay: 1,
    },
  ]);
  const [robotsText, setRobotsText] = useState<string | null>(null);

  const robotsMutation = useMutation({
    mutationFn: (configs: RobotsTxtConfig[]) => seoEngineService.generateRobotsTxt(configs),
    onSuccess: (data) => setRobotsText(data.text),
  });

  return {
    activeTab,
    setActiveTab,

    // stats
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,

    // audit
    auditUrl,
    setAuditUrl,
    auditHistory: auditHistoryQuery.data ?? [],
    auditLoading: auditMutation.isPending,
    auditResult: auditMutation.data,
    runAudit: () => auditMutation.mutate(auditUrl),

    // meta tags
    metaParams,
    setMetaParams,
    metaResult,
    metaLoading: metaMutation.isPending,
    generateMeta: () => metaMutation.mutate(metaParams),

    // og preview
    ogUrl,
    setOgUrl,
    ogPreview: ogPreviewQuery.data,
    ogLoading: ogPreviewQuery.isFetching,
    fetchOgPreview: () => void ogPreviewQuery.refetch(),

    // sitemap
    sitemapParams,
    setSitemapParams,
    sitemapResult,
    sitemapLoading: sitemapMutation.isPending,
    generateSitemap: () => sitemapMutation.mutate(sitemapParams),

    // robots
    robotsConfigs,
    setRobotsConfigs,
    robotsText,
    robotsLoading: robotsMutation.isPending,
    generateRobots: () => robotsMutation.mutate(robotsConfigs),
  };
}
