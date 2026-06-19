import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventBusModule } from './event-bus/event-bus.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { ApiHubModule } from './api-hub/api-hub.module';
import { DbHubModule } from './db-hub/db-hub.module';

@Module({
  imports: [
    EventBusModule,
    PrismaModule,
    CacheModule,
    ApiHubModule,
    DbHubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
