import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 }, // 10 req/sec
      { name: 'medium', ttl: 60_000, limit: 200 }, // 200 req/min
    ]),
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
