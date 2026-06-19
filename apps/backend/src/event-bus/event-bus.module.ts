import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import { EventsGateway } from '../events/events.gateway';
import { EventBusLogger } from './event-bus-logger';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
  ],
  providers: [EventBusService, EventsGateway, EventBusLogger],
  exports: [EventBusService, EventsGateway, EventBusLogger],
})
export class EventBusModule {}
