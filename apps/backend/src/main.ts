import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventBusLogger } from './event-bus/event-bus-logger';
import { EventBusService } from './event-bus/event-bus.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up custom logger that pipes console logs to event bus / websocket gateway
  const logger = app.get(EventBusLogger);
  const eventBus = app.get(EventBusService);
  logger.setEventBus(eventBus);
  app.useLogger(logger);

  // Enable CORS for frontend requests
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
