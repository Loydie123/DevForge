import { Module } from '@nestjs/common';
import { DbHubController } from './db-hub.controller';
import { DbHubService } from './db-hub.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [DbHubController],
  providers: [DbHubService],
  exports: [DbHubService],
})
export class DbHubModule {}
