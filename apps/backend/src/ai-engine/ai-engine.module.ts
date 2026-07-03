import { Module } from '@nestjs/common';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AiEngineController],
  providers: [AiEngineService],
  exports: [AiEngineService],
})
export class AiEngineModule {}
