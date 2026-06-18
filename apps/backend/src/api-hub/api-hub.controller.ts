import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiHubService } from './api-hub.service';

@Controller('api-hub')
export class ApiHubController {
  constructor(private readonly apiHubService: ApiHubService) {}

  @Post('execute')
  async executeRequest(
    @Body()
    dto: {
      projectId: string;
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: unknown;
    },
  ) {
    return this.apiHubService.executeRequest(dto);
  }

  @Get('collections/:projectId')
  async getCollections(@Param('projectId') projectId: string) {
    return this.apiHubService.getCollectionsCached(projectId);
  }
}
