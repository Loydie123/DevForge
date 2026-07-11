import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard, ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { Redis as IORedis } from 'ioredis';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventBusModule } from './event-bus/event-bus.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { ApiHubModule } from './api-hub/api-hub.module';
import { DbHubModule } from './db-hub/db-hub.module';
import { LogsHubModule } from './logs-hub/logs-hub.module';
import { DevOpsModule } from './devops/devops.module';
import { AuthModule } from './auth/auth.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AdminModule } from './admin/admin.module';
import { ProjectGeneratorModule } from './project-generator/project-generator.module';
import { AiEngineModule } from './ai-engine/ai-engine.module';
import { ErrorTrackerModule } from './error-tracker/error-tracker.module';
import { SecurityCenterModule } from './security-center/security-center.module';
import { SecurityMiddleware } from './security-center/security.middleware';
import { AnalyticsHubModule } from './analytics-hub/analytics-hub.module';
import { PerformanceHubModule } from './performance-hub/performance-hub.module';
import { CicdHubModule } from './cicd-hub/cicd-hub.module';
import { SeoEngineModule } from './seo-engine/seo-engine.module';
import { EnvManagerModule } from './env-manager/env-manager.module';
import { PluginSystemModule } from './plugin-system/plugin-system.module';

class SafeThrottlerStorage implements ThrottlerStorage {
  private memoryStorage = new ThrottlerStorageService();
  constructor(private readonly redisStorage?: any) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    if (this.redisStorage) {
      try {
        return await this.redisStorage.increment(key, ttl, limit, blockDuration, throttlerName);
      } catch (err: any) {
        console.warn(`[Throttler] Redis storage query failed, falling back to memory: ${err.message}`);
      }
    }
    return this.memoryStorage.increment(key, ttl, limit, blockDuration, throttlerName);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT ?? 6379;

        const redisOptions: any = {
          maxRetriesPerRequest: 1, // stop retrying fast on failures to prevent request hanging
          retryStrategy: (times: number) => {
            if (times > 1) {
              return null; // stop retrying quickly
            }
            return 500;
          },
        };

        let storage: any;
        if (redisUrl) {
          console.log('[Throttler] Connecting to Redis for rate limiting...');
          const client = new IORedis(redisUrl, redisOptions);
          client.on('error', (err) => {
            console.warn('[Throttler] Redis rate-limiter connection error:', err.message);
          });
          storage = new SafeThrottlerStorage(new ThrottlerStorageRedisService(client));
        } else if (redisHost) {
          console.log(`[Throttler] Connecting to Redis for rate limiting (${redisHost}:${redisPort})...`);
          const client = new IORedis({
            host: redisHost,
            port: Number(redisPort),
            ...redisOptions,
          });
          client.on('error', (err) => {
            console.warn('[Throttler] Redis rate-limiter connection error:', err.message);
          });
          storage = new SafeThrottlerStorage(new ThrottlerStorageRedisService(client));
        } else {
          console.log('[Throttler] No Redis configured — using in-memory storage for rate limiting');
          storage = new SafeThrottlerStorage();
        }

        return {
          throttlers: [
            { name: 'short', ttl: 1000, limit: 10 }, // 10 req/sec
            { name: 'medium', ttl: 60_000, limit: 200 }, // 200 req/min
          ],
          storage,
        };
      },
    }),
    EventBusModule,
    PrismaModule,
    CacheModule,
    ApiHubModule,
    DbHubModule,
    LogsHubModule,
    DevOpsModule,
    AuthModule,
    MonitoringModule,
    AdminModule,
    ProjectGeneratorModule,
    AiEngineModule,
    ErrorTrackerModule,
    SecurityCenterModule,
    AnalyticsHubModule,
    PerformanceHubModule,
    CicdHubModule,
    SeoEngineModule,
    EnvManagerModule,
    PluginSystemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // global rate limit
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
