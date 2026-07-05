import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';

const mockPrisma = {
  uptimeCheck: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  metricSnapshot: { create: jest.fn(), findMany: jest.fn() },
  alert: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
};
const mockEventBus = { emit: jest.fn() };

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    jest.clearAllMocks();
  });

  // ── getSystemMetrics ───────────────────────────────────────────────────────

  describe('getSystemMetrics()', () => {
    it('should return valid system metrics structure', async () => {
      const metrics = await service.getSystemMetrics();

      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('disk');
      expect(metrics).toHaveProperty('timestamp');

      // Validate shape — numeric values may be 0/NaN in sandboxed/CI environments
      // (os.cpus() returns [] when host CPU info is restricted)
      expect(metrics.cpu).toHaveProperty('cores');
      expect(metrics.cpu).toHaveProperty('usedPercent');
      expect(metrics.cpu).toHaveProperty('model');
      expect(metrics.memory).toHaveProperty('totalBytes');
      expect(metrics.memory).toHaveProperty('usedBytes');
      expect(metrics.memory).toHaveProperty('usedPercent');
      expect(metrics.disk).toHaveProperty('totalBytes');
      expect(metrics.disk).toHaveProperty('usedBytes');
      expect(metrics.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should have cpu model string', async () => {
      const metrics = await service.getSystemMetrics();
      expect(typeof metrics.cpu.model).toBe('string');
      expect(metrics.cpu.model.length).toBeGreaterThan(0);
    });
  });

  // ── createUptimeCheck ──────────────────────────────────────────────────────

  describe('createUptimeCheck()', () => {
    it('should create uptime check via Prisma', async () => {
      mockPrisma.uptimeCheck.create.mockResolvedValue({
        id: 'check-1',
        projectId: 'proj-1',
        name: 'API Health',
        url: 'https://example.com/health',
        interval: 60,
        status: 'unknown',
        lastCheckedAt: null,
        lastResponseMs: null,
      });

      const result = await service.createUptimeCheck({
        projectId: 'proj-1',
        name: 'API Health',
        url: 'https://example.com/health',
        interval: 60,
      });

      expect(result.name).toBe('API Health');
      expect(mockPrisma.uptimeCheck.create).toHaveBeenCalledTimes(1);
    });

    it('should reject empty URL', async () => {
      await expect(
        service.createUptimeCheck({
          projectId: 'proj-1',
          name: 'Test',
          url: '',
          interval: 60,
        }),
      ).rejects.toThrow();
    });
  });

  // ── onModuleInit (startup) ─────────────────────────────────────────────────

  describe('onModuleInit()', () => {
    it('should query existing uptime checks on startup', async () => {
      mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
      await service.onModuleInit();
      expect(mockPrisma.uptimeCheck.findMany).toHaveBeenCalledTimes(1);
    });

    it('should not crash if DB is unavailable on startup', async () => {
      mockPrisma.uptimeCheck.findMany.mockRejectedValue(
        new Error('DB connection failed'),
      );
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });
});
