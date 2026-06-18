import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import {
  DevForgeEvents,
  ApiRequestPayload,
  ApiResponsePayload,
} from '@devforge/event-bus';

@Injectable()
export class ApiHubService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Executes a custom HTTP REST request, measures response latency,
   * emits WebSocket events, and records the request details to the DB.
   */
  async executeRequest(dto: {
    projectId: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  }) {
    const { projectId, method, url, headers = {}, body } = dto;
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    // 1. Emit Event Bus API_REQUEST
    const requestPayload: ApiRequestPayload = {
      requestId,
      method,
      url,
      headers,
      body,
      timestamp,
    };
    this.eventBus.emit(DevForgeEvents.API_REQUEST, requestPayload);

    const startTime = Date.now();
    let statusCode = 500;
    let responseBody: unknown = null;
    let latencyMs = 0;

    try {
      // 2. Perform Request
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        validateStatus: () => true, // Don't throw exception on error status codes
      });

      statusCode = response.status;
      responseBody = response.data as unknown;
    } catch (error: unknown) {
      statusCode = 500;
      responseBody = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      latencyMs = Date.now() - startTime;
    }

    // 3. Emit Event Bus API_RESPONSE
    const responsePayload: ApiResponsePayload = {
      requestId,
      statusCode,
      latencyMs,
      body: responseBody,
      timestamp: Date.now(),
    };
    this.eventBus.emit(DevForgeEvents.API_RESPONSE, responsePayload);

    // 4. Save to Request History in Database
    await this.prisma.history.create({
      data: {
        method,
        url,
        statusCode,
        latencyMs,
        headers: JSON.stringify(headers),
        body: body ? JSON.stringify(body) : null,
        projectId,
      },
    });

    return {
      statusCode,
      latencyMs,
      response: responseBody,
    };
  }

  /**
   * Fetches the request collections for a project, caching the output
   * to avoid querying the DB multiple times.
   */
  async getCollectionsCached(projectId: string) {
    const cacheKey = `collections:project:${projectId}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      console.log(`[Cache Hit] Serving collections for project: ${projectId}`);
      return cachedData;
    }

    console.log(
      `[Cache Miss] Fetching collections from DB for project: ${projectId}`,
    );
    const collections = await this.prisma.collection.findMany({
      where: { projectId },
      include: { requests: true },
    });

    // Cache the result for 60 seconds (60000ms)
    await this.cacheManager.set(cacheKey, collections, 60000);

    return collections;
  }
}
