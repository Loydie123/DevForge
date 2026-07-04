import { apiClient } from "../api-client";

export interface MetaTagResult {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  keywords: string[];
}

export interface OpenGraphPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  type: string;
  twitterCard: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

export interface RobotsTxtConfig {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  sitemap?: string;
}

export interface SeoIssue {
  type: "error" | "warning" | "info";
  category: "meta" | "performance" | "content" | "technical" | "accessibility";
  message: string;
  recommendation: string;
}

export interface SeoAuditResult {
  url: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  auditedAt: string;
  issues: SeoIssue[];
  breakdown: {
    meta: number;
    performance: number;
    content: number;
    technical: number;
    accessibility: number;
  };
  meta: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: string;
    hasOgTags: boolean;
    hasTwitterCards: boolean;
    hasStructuredData: boolean;
  };
}

export interface SeoStats {
  totalAudits: number;
  avgScore: number;
  issuesFound: number;
  issuesByType: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

export interface GenerateMetaParams {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export interface GenerateSitemapParams {
  baseUrl: string;
  pages: Array<{ path: string; priority?: number; changefreq?: string }>;
}

export const seoEngineService = {
  async getStats(): Promise<SeoStats> {
    const res = await apiClient.get<SeoStats>("/seo-engine/stats");
    return res.data;
  },

  async getAuditHistory(): Promise<SeoAuditResult[]> {
    const res = await apiClient.get<SeoAuditResult[]>("/seo-engine/audit/history");
    return res.data;
  },

  async auditUrl(url: string): Promise<SeoAuditResult> {
    const res = await apiClient.post<SeoAuditResult>("/seo-engine/audit", { url });
    return res.data;
  },

  async generateMetaTags(params: GenerateMetaParams): Promise<MetaTagResult> {
    const res = await apiClient.post<MetaTagResult>("/seo-engine/meta-tags", params);
    return res.data;
  },

  async previewOpenGraph(url: string): Promise<OpenGraphPreview> {
    const res = await apiClient.get<OpenGraphPreview>(`/seo-engine/og-preview?url=${encodeURIComponent(url)}`);
    return res.data;
  },

  async generateSitemap(params: GenerateSitemapParams): Promise<{ xml: string; entries: SitemapEntry[] }> {
    const res = await apiClient.post<{ xml: string; entries: SitemapEntry[] }>("/seo-engine/sitemap", params);
    return res.data;
  },

  async generateRobotsTxt(configs: RobotsTxtConfig[]): Promise<{ text: string }> {
    const res = await apiClient.post<{ text: string }>("/seo-engine/robots", { configs });
    return res.data;
  },

  async parseRobotsTxt(text: string): Promise<RobotsTxtConfig[]> {
    const res = await apiClient.post<RobotsTxtConfig[]>("/seo-engine/robots/parse", { text });
    return res.data;
  },
};
