import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { PluginSystemService } from './plugin-system.service';
import type { PluginHook } from '@devforge/plugin-engine';

@UseGuards(AuthGuard)
@ApiTags('plugin-system')
@ApiBearerAuth()
@Controller('plugin-system')
export class PluginSystemController {
  constructor(private readonly pluginService: PluginSystemService) {}

  @Get('stats')
  getStats() {
    return this.pluginService.getStats();
  }

  @Get('plugins')
  listPlugins() {
    return this.pluginService.listPlugins();
  }

  @Get('marketplace')
  getMarketplace() {
    return this.pluginService.getMarketplace();
  }

  @Post('marketplace/:id/install')
  installPlugin(@Param('id') id: string) {
    return this.pluginService.installPlugin(id);
  }

  @Delete('plugins/:id')
  uninstallPlugin(@Param('id') id: string) {
    return { success: this.pluginService.uninstallPlugin(id) };
  }

  @Post('plugins/:id/toggle')
  togglePlugin(@Param('id') id: string) {
    return this.pluginService.togglePlugin(id);
  }

  @Post('plugins/:id/config')
  updateConfig(
    @Param('id') id: string,
    @Body() config: Record<string, unknown>,
  ) {
    return this.pluginService.updatePluginConfig(id, config);
  }

  @Get('executions')
  getExecutions(@Query('limit') limit?: string) {
    return this.pluginService.getExecutions(limit ? Number(limit) : 100);
  }

  @Post('hooks/trigger')
  triggerHook(@Body() body: { hook: PluginHook; payload?: unknown }) {
    return this.pluginService.triggerHook(body.hook, body.payload);
  }
}
