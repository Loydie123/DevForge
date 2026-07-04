import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CicdHubService } from './cicd-hub.service';
import { AuthGuard } from '../auth/auth.guard';
import type { CreatePipelineDto, TriggerRunDto } from '@devforge/cicd-hub';

@UseGuards(AuthGuard)
@Controller('cicd')
export class CicdHubController {
  constructor(private readonly cicd: CicdHubService) {}

  @Get('stats')
  getStats() {
    return this.cicd.getStats();
  }

  @Get('pipelines')
  getPipelines() {
    return this.cicd.getPipelines();
  }

  @Post('pipelines')
  createPipeline(@Body() dto: CreatePipelineDto) {
    return this.cicd.createPipeline(dto.name, dto.branch, dto.stages);
  }

  @Get('runs')
  getRuns(@Query('limit') limit?: string) {
    return this.cicd.getRuns(limit ? parseInt(limit, 10) : 50);
  }

  @Get('runs/:id')
  getRun(@Param('id') id: string) {
    return this.cicd.getRun(id);
  }

  @Post('runs/trigger')
  triggerRun(@Body() dto: TriggerRunDto) {
    return this.cicd.triggerRun(
      dto.pipelineId,
      dto.branch,
      dto.trigger ?? 'manual',
    );
  }

  // Webhook endpoint — no auth guard, uses pipeline ID as identifier
  @Post('webhook/:pipelineId')
  webhookTrigger(@Param('pipelineId') pipelineId: string) {
    return this.cicd.triggerRun(pipelineId, undefined, 'webhook');
  }
}
