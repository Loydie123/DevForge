import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ErrorTrackerService } from './error-tracker.service';
import { AuthGuard } from '../auth/auth.guard';
import type { RecordErrorDto } from '@devforge/error-tracker';

@UseGuards(AuthGuard)
@ApiTags('error-tracker')
@ApiBearerAuth()
@Controller('error-tracker')
export class ErrorTrackerController {
  constructor(private readonly errorTrackerService: ErrorTrackerService) {}

  @Get(':projectId')
  async getErrors(
    @Param('projectId') projectId: string,
    @Query('severity') severity?: string,
    @Query('service') service?: string,
    @Query('search') search?: string,
  ) {
    return this.errorTrackerService.getErrors(
      projectId,
      severity,
      service,
      search,
    );
  }

  @Get('stats/:projectId')
  async getStats(@Param('projectId') projectId: string) {
    return this.errorTrackerService.getStats(projectId);
  }

  @Get('services/:projectId')
  async getServices(@Param('projectId') projectId: string) {
    return this.errorTrackerService.getServices(projectId);
  }

  @Post()
  async recordError(@Body() dto: RecordErrorDto) {
    return this.errorTrackerService.recordError(dto);
  }

  @Delete('clear/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearErrors(@Param('projectId') projectId: string) {
    await this.errorTrackerService.clearErrors(projectId);
  }

  @Delete(':id')
  async deleteError(@Param('id') id: string) {
    return this.errorTrackerService.deleteError(id);
  }
}
