import { AppService } from './app.service';
import { EventBusService } from './event-bus/event-bus.service';
import { LogPayload, MetricPayload } from '@devforge/event-bus';
export declare class AppController {
    private readonly appService;
    private readonly eventBusService;
    constructor(appService: AppService, eventBusService: EventBusService);
    getHello(): string;
    triggerMock(): {
        status: string;
        message: string;
        emitted: {
            log: LogPayload;
            metric: MetricPayload;
        };
    };
}
