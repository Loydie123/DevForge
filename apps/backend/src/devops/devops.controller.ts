import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DevOpsService } from './devops.service';
import { AuthGuard } from '../auth/auth.guard';
import * as DevOpsHub from '@devforge/devops-hub';

@UseGuards(AuthGuard)
@Controller('devops')
export class DevOpsController {
  constructor(private readonly devOpsService: DevOpsService) {}

  @Get('containers')
  async getContainers(): Promise<DevOpsHub.DockerContainer[]> {
    return this.devOpsService.getContainers();
  }

  @Get('containers/:id/stats')
  async getContainerStats(
    @Param('id') id: string,
  ): Promise<DevOpsHub.DockerStats> {
    return this.devOpsService.getContainerStats(id);
  }

  @Post('containers/:id/action')
  @HttpCode(HttpStatus.OK)
  async controlContainer(
    @Param('id') id: string,
    @Body() dto: DevOpsHub.ControlContainerDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.devOpsService.controlContainer(id, dto.action);
  }
}
