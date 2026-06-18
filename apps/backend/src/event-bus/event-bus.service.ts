import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DevForgeEvents } from '@devforge/event-bus';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class EventBusService {
  constructor(
    private eventEmitter: EventEmitter2,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Emits an event to both the internal NestJS event emitter
   * and broadcasts it to the frontend via WebSockets.
   */
  emit(event: DevForgeEvents, payload: any) {
    // 1. Emit internally (for other NestJS modules/listeners)
    this.eventEmitter.emit(event, payload);

    // 2. Broadcast to all connected WebSocket clients (Frontend)
    this.eventsGateway.broadcast(event, payload);
  }
}
