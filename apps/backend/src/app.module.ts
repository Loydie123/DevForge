import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
