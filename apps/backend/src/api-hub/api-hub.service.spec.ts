import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiHubService } from './api-hub.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

const mockPrisma = {
  history: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  collection: { findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
  savedRequest: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  environment: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockEventBus = { emit: jest.fn() };

describe('ApiHubService', () => {
  let service: ApiHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiHubService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ApiHubService>(ApiHubService);
    jest.clearAllMocks();
  });

  // ── executeRequest ─────────────────────────────────────────────────────────

  describe('executeRequest()', () => {
    it('should execute GET request and return status + latency', async () => {
      mockedAxios.mockResolvedValue({ status: 200, data: { ok: true } });
      mockPrisma.history.create.mockResolvedValue({});

      const result = await service.executeRequest({
        projectId: 'proj-1',
        method: 'GET',
        url: 'https://example.com/api',
        headers: {},
      });

      expect(result.statusCode).toBe(200);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.response).toEqual({ ok: true });
    });

    it('should return statusCode 500 on network error', async () => {
      mockedAxios.mockRejectedValue(new Error('Network error'));
      mockPrisma.history.create.mockResolvedValue({});

      const result = await service.executeRequest({
        projectId: 'proj-1',
        method: 'GET',
        url: 'https://unreachable.test',
        headers: {},
      });

      expect(result.statusCode).toBe(500);
      expect((result.response as Record<string, unknown>)['error']).toBe(
        'Network error',
      );
    });

    it('should save request to history after execution', async () => {
      mockedAxios.mockResolvedValue({ status: 201, data: {} });
      mockPrisma.history.create.mockResolvedValue({});

      await service.executeRequest({
        projectId: 'proj-1',
        method: 'POST',
        url: 'https://api.example.com/items',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'test' },
      });

      expect(mockPrisma.history.create).toHaveBeenCalledTimes(1);
      const call = mockPrisma.history.create.mock.calls[0][0];
      expect(call.data.method).toBe('POST');
      expect(call.data.url).toBe('https://api.example.com/items');
      expect(call.data.statusCode).toBe(201);
    });

    it('should emit API_REQUEST and API_RESPONSE events', async () => {
      mockedAxios.mockResolvedValue({ status: 200, data: {} });
      mockPrisma.history.create.mockResolvedValue({});

      await service.executeRequest({
        projectId: 'proj-1',
        method: 'GET',
        url: 'https://example.com',
        headers: {},
      });

      expect(mockEventBus.emit).toHaveBeenCalledTimes(2);
      const [firstCall, secondCall] = mockEventBus.emit.mock.calls;
      expect(firstCall[0]).toContain('api.request');
      expect(secondCall[0]).toContain('api.response');
    });

    it('should pass non-2xx responses without throwing', async () => {
      mockedAxios.mockResolvedValue({
        status: 404,
        data: { message: 'Not found' },
      });
      mockPrisma.history.create.mockResolvedValue({});

      const result = await service.executeRequest({
        projectId: 'proj-1',
        method: 'GET',
        url: 'https://example.com/missing',
        headers: {},
      });

      expect(result.statusCode).toBe(404);
    });
  });

  // ── getCollectionsCached ───────────────────────────────────────────────────

  describe('getCollectionsCached()', () => {
    it('should return cached data on cache hit', async () => {
      const cached = [{ id: 'col-1', name: 'My API', requests: [] }];
      mockCache.get.mockResolvedValue(cached);

      const result = await service.getCollectionsCached('proj-1');

      expect(result).toBe(cached);
      expect(mockPrisma.collection.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and cache result on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      const dbData = [{ id: 'col-1', name: 'My API', requests: [] }];
      mockPrisma.collection.findMany.mockResolvedValue(dbData);

      const result = await service.getCollectionsCached('proj-1');

      expect(result).toEqual(dbData);
      expect(mockPrisma.collection.findMany).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(
        'collections:project:proj-1',
        dbData,
        60000,
      );
    });
  });

  // ── createCollection ───────────────────────────────────────────────────────

  describe('createCollection()', () => {
    it('should create a collection and invalidate cache', async () => {
      mockPrisma.collection.create.mockResolvedValue({
        id: 'col-1',
        name: 'Tests',
        projectId: 'proj-1',
      });

      await service.createCollection('proj-1', 'Tests');

      expect(mockPrisma.collection.create).toHaveBeenCalledTimes(1);
      expect(mockCache.del).toHaveBeenCalledWith('collections:project:proj-1');
    });
  });

  // ── clearHistory ───────────────────────────────────────────────────────────

  describe('clearHistory()', () => {
    it('should delete all history for a project', async () => {
      mockPrisma.history.deleteMany.mockResolvedValue({ count: 5 });

      await service.clearHistory('proj-1');

      expect(mockPrisma.history.deleteMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
      });
    });
  });
});
