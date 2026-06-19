import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DbHubService } from './db-hub.service';

@Controller('db-hub')
export class DbHubController {
  constructor(private readonly dbHubService: DbHubService) {}

  @Get('connections/:projectId')
  async getConnections(@Param('projectId') projectId: string) {
    return this.dbHubService.getConnections(projectId);
  }

  @Post('connections')
  async createConnection(
    @Body()
    dto: {
      projectId: string;
      name: string;
      type: string;
      host: string;
      port: number;
      database: string;
      username: string;
      password?: string;
    },
  ) {
    return this.dbHubService.createConnection(dto.projectId, dto);
  }

  @Delete('connections/:id')
  async deleteConnection(@Param('id') id: string) {
    return this.dbHubService.deleteConnection(id);
  }

  @Post('connections/test')
  @HttpCode(HttpStatus.OK)
  async testConnection(
    @Body()
    dto: {
      type: string;
      host: string;
      port: number;
      database: string;
      username: string;
      password?: string;
    },
  ) {
    return this.dbHubService.testConnection(dto);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async executeQuery(
    @Body()
    dto: {
      connectionId: string;
      query: string;
    },
  ) {
    return this.dbHubService.executeQuery(dto.connectionId, dto.query);
  }

  @Get('history/:connectionId')
  async getHistory(@Param('connectionId') connectionId: string) {
    return this.dbHubService.getHistory(connectionId);
  }

  @Delete('history/clear/:connectionId')
  async clearHistory(@Param('connectionId') connectionId: string) {
    return this.dbHubService.clearHistory(connectionId);
  }
}
