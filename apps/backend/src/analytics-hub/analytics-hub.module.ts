import { Module } from '@nestjs/common';
import { AnalyticsHubController } from './analytics-hub.controller';
import { AnalyticsHubService } from './analytics-hub.service';
import { AuthModule } from '../auth/auth.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [AuthModule, EventBusModule],
  controllers: [AnalyticsHubController],
  providers: [AnalyticsHubService],
  exports: [AnalyticsHubService],
})
export class AnalyticsHubModule {}
