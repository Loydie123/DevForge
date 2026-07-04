import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DbHubService } from './db-hub.service';
import { AuthGuard } from '../auth/auth.guard';
import * as DbHub from '@devforge/db-hub';

@UseGuards(AuthGuard)
@ApiTags('db-hub')
@ApiBearerAuth()
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
    dto: DbHub.DbConnectionDto,
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
    dto: DbHub.DbConnectionDto,
  ) {
    return this.dbHubService.testConnection(dto);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async executeQuery(
    @Body()
    dto: DbHub.ExecuteQueryDto,
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
