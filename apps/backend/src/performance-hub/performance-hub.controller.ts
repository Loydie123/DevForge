import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PerformanceHubService } from './performance-hub.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('performance')
export class PerformanceHubController {
  constructor(private readonly performance: PerformanceHubService) {}

  @Get('stats')
  async getStats() {
    return this.performance.getStats();
  }

  @Get('routes')
  getRouteStats() {
    return this.performance.getRouteStats();
  }

  @Get('slow-queries')
  getSlowQueries(@Query('limit') limit?: string) {
    return this.performance.getSlowQueries(limit ? parseInt(limit, 10) : 50);
  }
}
