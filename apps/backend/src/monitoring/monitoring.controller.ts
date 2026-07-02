import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { AuthGuard } from '../auth/auth.guard';
import * as MonitoringHub from '@devforge/monitoring-hub';

@UseGuards(AuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('system')
  async getSystemMetrics(): Promise<MonitoringHub.SystemMetrics> {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('uptime-checks/:projectId')
  async getUptimeChecks(@Param('projectId') projectId: string) {
    return this.monitoringService.getUptimeChecks(projectId);
  }

  @Post('uptime-checks')
  async createUptimeCheck(
    @Body()
    dto: MonitoringHub.CreateUptimeCheckDto,
  ) {
    return this.monitoringService.createUptimeCheck(dto);
  }

  @Delete('uptime-checks/:id')
  async deleteUptimeCheck(@Param('id') id: string) {
    return this.monitoringService.deleteUptimeCheck(id);
  }
}
