import { Module } from '@nestjs/common';
import { PerformanceHubController } from './performance-hub.controller';
import { PerformanceHubService } from './performance-hub.service';
import { AuthModule } from '../auth/auth.module';
import { SecurityCenterModule } from '../security-center/security-center.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [AuthModule, SecurityCenterModule, MonitoringModule],
  controllers: [PerformanceHubController],
  providers: [PerformanceHubService],
  exports: [PerformanceHubService],
})
export class PerformanceHubModule {}
