import { Module } from '@nestjs/common';
import { DevOpsController } from './devops.controller';
import { DevOpsService } from './devops.service';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [EventBusModule],
  controllers: [DevOpsController],
  providers: [DevOpsService],
  exports: [DevOpsService],
})
export class DevOpsModule {}
