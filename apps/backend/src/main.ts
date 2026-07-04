import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EventBusLogger } from './event-bus/event-bus-logger';
import { EventBusService } from './event-bus/event-bus.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(helmet());

  // ── Custom logger ───────────────────────────────────────────────────────────
  const logger = app.get(EventBusLogger);
  const eventBus = app.get(EventBusService);
  logger.setEventBus(eventBus);
  app.useLogger(logger);

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // ── Global prefix ───────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global pipes ─────────────────────────────────────────────────────────────
  // Sanitize first, then validate
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true, // auto-transform primitives
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ──────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
