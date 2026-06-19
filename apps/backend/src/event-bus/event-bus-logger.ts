import { ConsoleLogger, Injectable } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { DevForgeEvents, LogPayload } from '@devforge/event-bus';

@Injectable()
export class EventBusLogger extends ConsoleLogger {
  private eventBusService?: EventBusService;

  /**
   * Sets the EventBusService instance dynamically to prevent
   * circular dependency issues during NestJS bootstrap.
   */
  setEventBus(eventBus: EventBusService) {
    this.eventBusService = eventBus;
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.emitLog('info', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.emitLog('error', message, context, stack);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.emitLog('warn', message, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.emitLog('debug', message, context);
  }

  private emitLog(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: any,
    context?: string,
    stack?: string,
  ) {
    if (this.eventBusService) {
      // Prevent infinite logging recursion loops
      if (context === 'EventBusService' || context === 'EventsGateway') {
        return;
      }

      const msgStr =
        typeof message === 'object' ? JSON.stringify(message) : String(message);

      const payload: LogPayload = {
        service: 'backend',
        level,
        message: context ? `[${context}] ${msgStr}` : msgStr,
        metadata: stack ? { stack } : undefined,
        timestamp: Date.now(),
      };

      this.eventBusService.emit(DevForgeEvents.LOG_CREATED, payload);
    }
  }
}
