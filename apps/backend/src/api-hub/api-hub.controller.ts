import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
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

  // Collections
  @Post('collections')
  createCollection(@Body() dto: { projectId: string; name: string }) {
    return this.apiHubService.createCollection(dto.projectId, dto.name);
  }

  @Delete('collections/:projectId/:id')
  deleteCollection(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.apiHubService.deleteCollection(projectId, id);
  }

  // Saved Requests
  @Post('requests')
  saveRequest(
    @Body()
    dto: {
      collectionId: string;
      name: string;
      method: string;
      url: string;
      headers: string;
      body?: string;
    },
  ) {
    return this.apiHubService.saveRequest(dto);
  }

  @Put('requests/:id')
  updateSavedRequest(
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      method?: string;
      url?: string;
      headers?: string;
      body?: string;
    },
  ) {
    return this.apiHubService.updateSavedRequest(id, dto);
  }

  @Delete('requests/:id')
  deleteSavedRequest(@Param('id') id: string) {
    return this.apiHubService.deleteSavedRequest(id);
  }

  // History
  @Get('history/:projectId')
  getHistory(@Param('projectId') projectId: string) {
    return this.apiHubService.getHistory(projectId);
  }

  @Delete('history/:id')
  deleteHistoryItem(@Param('id') id: string) {
    return this.apiHubService.deleteHistoryItem(id);
  }

  @Delete('history/clear/:projectId')
  clearHistory(@Param('projectId') projectId: string) {
    return this.apiHubService.clearHistory(projectId);
  }

  // Environments
  @Get('environments/:projectId')
  getEnvironments(@Param('projectId') projectId: string) {
    return this.apiHubService.getEnvironments(projectId);
  }

  @Post('environments')
  createEnvironment(
    @Body()
    dto: {
      projectId: string;
      name: string;
      variables: Record<string, string>;
    },
  ) {
    return this.apiHubService.createEnvironment(
      dto.projectId,
      dto.name,
      dto.variables,
    );
  }

  @Put('environments/:id')
  updateEnvironment(
    @Param('id') id: string,
    @Body() dto: { name?: string; variables?: Record<string, string> },
  ) {
    return this.apiHubService.updateEnvironment(id, dto.name, dto.variables);
  }

  @Delete('environments/:id')
  deleteEnvironment(@Param('id') id: string) {
    return this.apiHubService.deleteEnvironment(id);
  }
}
