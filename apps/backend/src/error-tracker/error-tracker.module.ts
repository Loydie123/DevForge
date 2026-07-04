import { Module } from '@nestjs/common';
import { ErrorTrackerController } from './error-tracker.controller';
import { ErrorTrackerService } from './error-tracker.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [ErrorTrackerController],
  providers: [ErrorTrackerService],
  exports: [ErrorTrackerService],
})
export class ErrorTrackerModule {}
