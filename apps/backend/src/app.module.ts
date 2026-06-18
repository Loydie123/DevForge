import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventBusModule } from './event-bus/event-bus.module';

@Module({
  imports: [EventBusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
