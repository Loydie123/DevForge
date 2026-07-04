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
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
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
  type: 'error' | 'warning' | 'info';
  category: 'meta' | 'performance' | 'content' | 'technical' | 'accessibility';
  message: string;
  recommendation: string;
}

export interface SeoAuditResult {
  url: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
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
