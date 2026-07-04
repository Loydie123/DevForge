import { Module } from '@nestjs/common';
import { SeoEngineService } from './seo-engine.service';
import { SeoEngineController } from './seo-engine.controller';

@Module({
  providers: [SeoEngineService],
  controllers: [SeoEngineController],
  exports: [SeoEngineService],
})
export class SeoEngineModule {}
