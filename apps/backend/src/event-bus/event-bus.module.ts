import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import { EventsGateway } from '../events/events.gateway';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
  ],
  providers: [EventBusService, EventsGateway],
  exports: [EventBusService, EventsGateway],
})
export class EventBusModule {}
