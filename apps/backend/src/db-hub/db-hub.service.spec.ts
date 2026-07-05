import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DbHubService } from './db-hub.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';

const mockPrisma = {
  dbConnection: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};
const mockEventBus = { emit: jest.fn() };

describe('DbHubService — SQL Guard', () => {
  let service: DbHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbHubService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<DbHubService>(DbHubService);
    jest.clearAllMocks();
  });

  const dangerous = [
    'DROP TABLE users',
    'drop table users',
    'TRUNCATE TABLE users',
    'ALTER TABLE users ADD COLUMN x TEXT',
    'CREATE TABLE evil (id INT)',
    'GRANT ALL ON users TO hacker',
    'REVOKE SELECT ON users FROM developer',
    'SHUTDOWN',
    'LOAD DATA INFILE "/etc/passwd" INTO TABLE x',
    '   DROP TABLE users', // leading whitespace
    '\nTRUNCATE users', // newline prefix
  ];

  dangerous.forEach((sql) => {
    it(`should block: ${sql.trim().slice(0, 40)}`, async () => {
      // DbHubService.executeQuery requires a connectionId; mock connections map
      // so we test the assertSafeQuery path by checking ForbiddenException is thrown
      await expect(
        (
          service as unknown as {
            executeQuery: (id: string, q: string) => Promise<unknown>;
          }
        ).executeQuery('conn-1', sql),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  it('should allow safe SELECT queries', async () => {
    // "conn-1" is not registered, so it will throw NotFoundException — but NOT ForbiddenException
    // meaning the SQL guard passed (it did not block the query)
    await expect(
      (
        service as unknown as {
          executeQuery: (id: string, q: string) => Promise<unknown>;
        }
      ).executeQuery('no-such-conn', 'SELECT 1'),
    ).rejects.not.toThrow(ForbiddenException);
  });
});
