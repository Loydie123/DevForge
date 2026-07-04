import { Injectable } from '@nestjs/common';
import type {
  MetaTagResult,
  OpenGraphPreview,
  SitemapEntry,
  RobotsTxtConfig,
  SeoAuditResult,
  SeoIssue,
  SeoStats,
} from '@devforge/seo-engine';

const AUDIT_HISTORY_LIMIT = 100;

@Injectable()
export class SeoEngineService {
  private auditHistory: SeoAuditResult[] = [];

  // ─── Meta Tag Generator ────────────────────────────────────────────────────

  generateMetaTags(params: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: string;
    keywords?: string[];
    noIndex?: boolean;
  }): MetaTagResult {
    const {
      title,
      description,
      url,
      image = '',
      type = 'website',
      keywords = [],
      noIndex = false,
    } = params;

    return {
      title,
      description,
      canonical: url,
      robots: noIndex ? 'noindex, nofollow' : 'index, follow',
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogUrl: url,
      ogType: type,
      twitterCard: image ? 'summary_large_image' : 'summary',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: image,
      keywords,
    };
  }

  // ─── Open Graph Preview ────────────────────────────────────────────────────

  previewOpenGraph(url: string): OpenGraphPreview {
    // In production this would fetch and parse real OG tags from the URL.
    // For the demo we synthesise a realistic mock from the URL itself.
    const parsed = this.parseUrl(url);
    const siteName = parsed.hostname.replace(/^www\./, '');
    const slug = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
    const title = slug
      ? slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : siteName;

    return {
      url,
      title,
      description: `${title} — ${siteName}`,
      image: `https://via.placeholder.com/1200x630?text=${encodeURIComponent(title)}`,
      siteName,
      type: 'website',
      twitterCard: 'summary_large_image',
    };
  }

  // ─── Sitemap Generator ─────────────────────────────────────────────────────

  generateSitemap(
    baseUrl: string,
    pages: Array<{ path: string; priority?: number; changefreq?: SitemapEntry['changefreq'] }>,
  ): { xml: string; entries: SitemapEntry[] } {
    const entries: SitemapEntry[] = pages.map((p) => ({
      loc: `${baseUrl.replace(/\/$/, '')}${p.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: p.changefreq ?? 'weekly',
      priority: p.priority ?? 0.7,
    }));

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map(
        (e) =>
          `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
      ),
      '</urlset>',
    ].join('\n');

    return { xml, entries };
  }

  // ─── Robots.txt Manager ────────────────────────────────────────────────────

  generateRobotsTxt(configs: RobotsTxtConfig[]): string {
    return configs
      .map((c) => {
        const lines: string[] = [`User-agent: ${c.userAgent}`];
        c.allow.forEach((a) => lines.push(`Allow: ${a}`));
        c.disallow.forEach((d) => lines.push(`Disallow: ${d}`));
        if (c.crawlDelay !== undefined) lines.push(`Crawl-delay: ${c.crawlDelay}`);
        if (c.sitemap) lines.push(`Sitemap: ${c.sitemap}`);
        return lines.join('\n');
      })
      .join('\n\n');
  }

  parseRobotsTxt(text: string): RobotsTxtConfig[] {
    const blocks = text.split(/\n\s*\n/);
    return blocks
      .map((block) => {
        const lines = block.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
        const cfg: RobotsTxtConfig = { userAgent: '*', allow: [], disallow: [] };
        for (const line of lines) {
          const [key, ...rest] = line.split(':');
          const val = rest.join(':').trim();
          switch (key?.trim().toLowerCase()) {
            case 'user-agent': cfg.userAgent = val; break;
            case 'allow': cfg.allow.push(val); break;
            case 'disallow': cfg.disallow.push(val); break;
            case 'crawl-delay': cfg.crawlDelay = Number(val); break;
            case 'sitemap': cfg.sitemap = val; break;
          }
        }
        return cfg;
      })
      .filter((c) => c.userAgent);
  }

  // ─── SEO Audit ─────────────────────────────────────────────────────────────

  auditUrl(url: string): SeoAuditResult {
    const issues: SeoIssue[] = this.runChecks(url);

    const errorCount = issues.filter((i) => i.type === 'error').length;
    const warnCount = issues.filter((i) => i.type === 'warning').length;

    // Score: start 100, deduct per issue
    const rawScore = Math.max(0, 100 - errorCount * 15 - warnCount * 5);
    const score = rawScore + Math.floor(Math.random() * 5 - 2); // slight variation
    const clampedScore = Math.min(100, Math.max(0, score));

    const grade =
      clampedScore >= 90 ? 'A' :
      clampedScore >= 75 ? 'B' :
      clampedScore >= 60 ? 'C' :
      clampedScore >= 45 ? 'D' : 'F';

    const breakdown = {
      meta: this.scoreCategory(issues, 'meta'),
      performance: this.scoreCategory(issues, 'performance'),
      content: this.scoreCategory(issues, 'content'),
      technical: this.scoreCategory(issues, 'technical'),
      accessibility: this.scoreCategory(issues, 'accessibility'),
    };

    const result: SeoAuditResult = {
      url,
      score: clampedScore,
      grade,
      auditedAt: new Date().toISOString(),
      issues,
      breakdown,
      meta: {
        title: this.extractTitle(url),
        description: `Auto-generated description for ${url}`,
        canonical: url,
        robots: 'index, follow',
        hasOgTags: Math.random() > 0.3,
        hasTwitterCards: Math.random() > 0.5,
        hasStructuredData: Math.random() > 0.6,
      },
    };

    this.auditHistory.unshift(result);
    if (this.auditHistory.length > AUDIT_HISTORY_LIMIT) {
      this.auditHistory = this.auditHistory.slice(0, AUDIT_HISTORY_LIMIT);
    }

    return result;
  }

  getAuditHistory(): SeoAuditResult[] {
    return this.auditHistory;
  }

  getStats(): SeoStats {
    const audits = this.auditHistory;
    const allIssues = audits.flatMap((a) => a.issues);
    return {
      totalAudits: audits.length,
      avgScore: audits.length
        ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)
        : 0,
      issuesFound: allIssues.length,
      issuesByType: {
        errors: allIssues.filter((i) => i.type === 'error').length,
        warnings: allIssues.filter((i) => i.type === 'warning').length,
        infos: allIssues.filter((i) => i.type === 'info').length,
      },
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private runChecks(url: string): SeoIssue[] {
    const issues: SeoIssue[] = [];
    const parsed = this.parseUrl(url);

    if (!parsed.pathname || parsed.pathname === '/') {
      issues.push({
        type: 'warning',
        category: 'technical',
        message: 'URL is the root path — consider auditing specific pages',
        recommendation: 'Audit individual page URLs for more accurate results.',
      });
    }

    if (!url.startsWith('https://')) {
      issues.push({
        type: 'error',
        category: 'technical',
        message: 'URL does not use HTTPS',
        recommendation: 'Migrate to HTTPS. Google uses HTTPS as a ranking signal.',
      });
    }

    if (parsed.pathname.includes('_')) {
      issues.push({
        type: 'warning',
        category: 'technical',
        message: 'URL contains underscores — prefer hyphens',
        recommendation: 'Replace underscores with hyphens in URL slugs for better crawlability.',
      });
    }

    const titleLen = this.extractTitle(url).length;
    if (titleLen < 30) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: `Title tag is too short (${titleLen} chars)`,
        recommendation: 'Aim for 50–60 characters. Include your primary keyword.',
      });
    } else if (titleLen > 60) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: `Title tag is too long (${titleLen} chars)`,
        recommendation: 'Keep title under 60 characters to prevent truncation in SERPs.',
      });
    }

    // Simulated checks with deterministic randomness based on URL
    const seed = url.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (seed % 3 === 0) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'Meta description may be missing or too short',
        recommendation: 'Write a unique meta description of 120–160 characters.',
      });
    }
    if (seed % 5 === 0) {
      issues.push({
        type: 'error',
        category: 'content',
        message: 'No H1 tag detected on the page',
        recommendation: 'Every page should have exactly one H1 tag with your primary keyword.',
      });
    }
    if (seed % 7 === 0) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'Large render-blocking resources detected',
        recommendation: 'Defer non-critical JS and inline critical CSS.',
      });
    }
    if (seed % 11 === 0) {
      issues.push({
        type: 'info',
        category: 'accessibility',
        message: 'Some images may lack alt attributes',
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO.',
      });
    }
    if (seed % 4 === 0) {
      issues.push({
        type: 'info',
        category: 'technical',
        message: 'Structured data (JSON-LD) not detected',
        recommendation: 'Add schema.org markup to improve rich snippets in search results.',
      });
    }
    if (seed % 6 === 0) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: 'Low keyword density detected',
        recommendation: 'Ensure your target keyword appears naturally 2–3× per 100 words.',
      });
    }

    return issues;
  }

  private scoreCategory(issues: SeoIssue[], category: SeoIssue['category']): number {
    const relevant = issues.filter((i) => i.category === category);
    const errors = relevant.filter((i) => i.type === 'error').length;
    const warnings = relevant.filter((i) => i.type === 'warning').length;
    return Math.max(0, 100 - errors * 20 - warnings * 8);
  }

  private extractTitle(url: string): string {
    try {
      const parsed = this.parseUrl(url);
      const slug = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
      if (!slug) return parsed.hostname;
      return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      return url;
    }
  }

  private parseUrl(url: string): URL {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return new URL('https://example.com');
    }
  }
}
