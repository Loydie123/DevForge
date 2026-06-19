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
import { LogsHubService } from './logs-hub.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('logs-hub')
export class LogsHubController {
  constructor(private readonly logsHubService: LogsHubService) {}

  // --- Log Sources CRUD ---

  @Get('sources/:projectId')
  async getSources(@Param('projectId') projectId: string) {
    return this.logsHubService.getSources(projectId);
  }

  @Post('sources')
  async addSource(
    @Body()
    dto: {
      projectId: string;
      name: string;
      filePath: string;
    },
  ) {
    return this.logsHubService.addSource(dto.projectId, dto.name, dto.filePath);
  }

  @Delete('sources/:id')
  async deleteSource(@Param('id') id: string) {
    return this.logsHubService.deleteSource(id);
  }

  // --- Error Tracker CRUD ---

  @Get('errors/:projectId')
  async getErrorLogs(@Param('projectId') projectId: string) {
    return this.logsHubService.getErrorLogs(projectId);
  }

  @Post('errors')
  async recordError(
    @Body()
    dto: {
      projectId: string;
      service: string;
      message: string;
      stack?: string;
      severity: string;
    },
  ) {
    return this.logsHubService.recordError(dto.projectId, dto);
  }

  @Delete('errors/:id')
  async deleteError(@Param('id') id: string) {
    return this.logsHubService.deleteError(id);
  }

  @Delete('errors/clear/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearErrors(@Param('projectId') projectId: string) {
    await this.logsHubService.clearErrors(projectId);
  }
}
