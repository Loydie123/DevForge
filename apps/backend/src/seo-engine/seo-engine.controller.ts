import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SeoEngineService } from './seo-engine.service';
import type { RobotsTxtConfig, SitemapEntry } from '@devforge/seo-engine';

interface GenerateMetaDto {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string[];
  noIndex?: boolean;
}

interface GenerateSitemapDto {
  baseUrl: string;
  pages: Array<{
    path: string;
    priority?: number;
    changefreq?: SitemapEntry['changefreq'];
  }>;
}

interface GenerateRobotsDto {
  configs: RobotsTxtConfig[];
}

interface ParseRobotsDto {
  text: string;
}

@UseGuards(AuthGuard)
@Controller('seo-engine')
export class SeoEngineController {
  constructor(private readonly seoService: SeoEngineService) {}

  @Get('stats')
  getStats() {
    return this.seoService.getStats();
  }

  @Get('audit/history')
  getAuditHistory() {
    return this.seoService.getAuditHistory();
  }

  @Post('audit')
  auditUrl(@Body() body: { url: string }) {
    return this.seoService.auditUrl(body.url);
  }

  @Post('meta-tags')
  generateMetaTags(@Body() body: GenerateMetaDto) {
    return this.seoService.generateMetaTags(body);
  }

  @Get('og-preview')
  previewOpenGraph(@Query('url') url: string) {
    return this.seoService.previewOpenGraph(url ?? 'https://example.com');
  }

  @Post('sitemap')
  generateSitemap(@Body() body: GenerateSitemapDto) {
    return this.seoService.generateSitemap(body.baseUrl, body.pages);
  }

  @Post('robots')
  generateRobotsTxt(@Body() body: GenerateRobotsDto) {
    return { text: this.seoService.generateRobotsTxt(body.configs) };
  }

  @Post('robots/parse')
  parseRobotsTxt(@Body() body: ParseRobotsDto) {
    return this.seoService.parseRobotsTxt(body.text);
  }
}
