import { Module } from '@nestjs/common';
import { LogsHubController } from './logs-hub.controller';
import { LogsHubService } from './logs-hub.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [LogsHubController],
  providers: [LogsHubService],
  exports: [LogsHubService],
})
export class LogsHubModule {}
