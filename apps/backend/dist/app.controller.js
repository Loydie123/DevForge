"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const event_bus_service_1 = require("./event-bus/event-bus.service");
const event_bus_1 = require("@devforge/event-bus");
let AppController = class AppController {
    appService;
    eventBusService;
    constructor(appService, eventBusService) {
        this.appService = appService;
        this.eventBusService = eventBusService;
    }
    getHello() {
        return this.appService.getHello();
    }
    triggerMock() {
        const mockLog = {
            service: 'api-gateway',
            level: 'info',
            message: `User triggered a mock log event! Random value: ${Math.floor(Math.random() * 100)}`,
            timestamp: Date.now(),
        };
        const mockMetric = {
            cpuUsage: Math.floor(Math.random() * 30) + 10,
            memoryUsageBytes: 150 * 1024 * 1024 + Math.floor(Math.random() * 50 * 1024 * 1024),
            uptimeSeconds: Math.floor(process.uptime()),
            timestamp: Date.now(),
        };
        this.eventBusService.emit(event_bus_1.DevForgeEvents.LOG_CREATED, mockLog);
        this.eventBusService.emit(event_bus_1.DevForgeEvents.METRIC_UPDATED, mockMetric);
        return {
            status: 'success',
            message: 'Mock events emitted successfully!',
            emitted: {
                log: mockLog,
                metric: mockMetric,
            },
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('trigger-mock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "triggerMock", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        event_bus_service_1.EventBusService])
], AppController);
//# sourceMappingURL=app.controller.js.map