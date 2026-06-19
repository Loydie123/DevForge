import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevOpsService, DockerContainer, DockerStats } from './devops.service';

@Controller('devops')
export class DevOpsController {
  constructor(private readonly devOpsService: DevOpsService) {}

  @Get('containers')
  async getContainers(): Promise<DockerContainer[]> {
    return this.devOpsService.getContainers();
  }

  @Get('containers/:id/stats')
  async getContainerStats(@Param('id') id: string): Promise<DockerStats> {
    return this.devOpsService.getContainerStats(id);
  }

  @Post('containers/:id/action')
  @HttpCode(HttpStatus.OK)
  async controlContainer(
    @Param('id') id: string,
    @Body() dto: { action: 'start' | 'stop' | 'restart' },
  ): Promise<{ success: boolean; message: string }> {
    return this.devOpsService.controlContainer(id, dto.action);
  }
}
