import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventBusService } from './event-bus/event-bus.service';
import { DevForgeEvents, LogPayload, MetricPayload } from '@devforge/event-bus';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventBusService: EventBusService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      app: 'DevForge',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('trigger-mock')
  triggerMock() {
    const mockLog: LogPayload = {
      service: 'api-gateway',
      level: 'info',
      message: `User triggered a mock log event! Random value: ${Math.floor(Math.random() * 100)}`,
      timestamp: Date.now(),
    };

    const mockMetric: MetricPayload = {
      cpuUsage: Math.floor(Math.random() * 30) + 10, // 10% - 40%
      memoryUsageBytes:
        150 * 1024 * 1024 + Math.floor(Math.random() * 50 * 1024 * 1024), // ~150-200MB
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: Date.now(),
    };

    // Emit logs and metrics
    this.eventBusService.emit(DevForgeEvents.LOG_CREATED, mockLog);
    this.eventBusService.emit(DevForgeEvents.METRIC_UPDATED, mockMetric);

    return {
      status: 'success',
      message: 'Mock events emitted successfully!',
      emitted: {
        log: mockLog,
        metric: mockMetric,
      },
    };
  }
}
