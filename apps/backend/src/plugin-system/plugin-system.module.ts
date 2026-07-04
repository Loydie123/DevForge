import { Module } from '@nestjs/common';
import { PluginSystemService } from './plugin-system.service';
import { PluginSystemController } from './plugin-system.controller';

@Module({
  providers: [PluginSystemService],
  controllers: [PluginSystemController],
  exports: [PluginSystemService],
})
export class PluginSystemModule {}
