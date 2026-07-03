import { Module } from '@nestjs/common';
import { ProjectGeneratorController } from './project-generator.controller';
import { ProjectGeneratorService } from './project-generator.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProjectGeneratorController],
  providers: [ProjectGeneratorService],
  exports: [ProjectGeneratorService],
})
export class ProjectGeneratorModule {}
