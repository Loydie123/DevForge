import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
