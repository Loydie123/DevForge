import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsHubService } from './analytics-hub.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  RecordPageViewDto,
  RecordEventDto,
} from '@devforge/analytics-hub';

@UseGuards(AuthGuard)
@ApiTags('analytics-hub')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsHubController {
  constructor(private readonly analytics: AnalyticsHubService) {}

  @Get('stats')
  getStats() {
    return this.analytics.getStats();
  }

  @Get('top-pages')
  getTopPages(@Query('limit') limit?: string) {
    return this.analytics.getTopPages(limit ? parseInt(limit, 10) : 10);
  }

  @Get('events')
  getRecentEvents(@Query('limit') limit?: string) {
    return this.analytics.getRecentEvents(limit ? parseInt(limit, 10) : 50);
  }

  @Get('page-views-over-time')
  getPageViewsOverTime() {
    return this.analytics.getPageViewsOverTime();
  }

  @Post('page-view')
  recordPageView(@Body() dto: RecordPageViewDto) {
    return this.analytics.recordPageView(dto);
  }

  @Post('event')
  recordEvent(@Body() dto: RecordEventDto) {
    return this.analytics.recordEvent(dto);
  }
}
