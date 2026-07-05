import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogsHubService } from './logs-hub.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';

const mockPrisma = {
  logSource: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  errorLog: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
};
const mockEventBus = { emit: jest.fn() };

describe('LogsHubService — Path Traversal Guard', () => {
  let service: LogsHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsHubService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<LogsHubService>(LogsHubService);
    jest.clearAllMocks();
  });

  const traversalAttempts = [
    '/etc/passwd',
    '/etc/shadow',
    '/root/.ssh/id_rsa',
    '../../etc/passwd',
    '/var/log/../../etc/passwd',
    '/tmp/logs/../../etc/shadow',
    '/proc/self/environ',
    '/sys/class/net/eth0/address',
    '../../../../../../../../etc/hosts',
  ];

  traversalAttempts.forEach((filePath) => {
    it(`should block path traversal: ${filePath}`, async () => {
      await expect(
        service.addSource('proj-1', 'evil-source', filePath),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should allow valid /var/log path (path guard passes, may fail on file-not-found)', async () => {
    // Path guard passes → next check is "file exists on disk" → throws different message
    // We verify the error is NOT a path traversal rejection
    try {
      await service.addSource('proj-1', 'app-log', '/var/log/app.log');
    } catch (err) {
      expect((err as Error).message).not.toMatch(/outside allowed directories/);
    }
  });

  it('should allow cwd-relative log path (path guard passes)', async () => {
    const cwdPath = process.cwd() + '/logs/app.log';
    try {
      await service.addSource('proj-1', 'cwd-log', cwdPath);
    } catch (err) {
      expect((err as Error).message).not.toMatch(/outside allowed directories/);
    }
  });
});
