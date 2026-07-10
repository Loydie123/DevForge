import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EventBusLogger } from './event-bus/event-bus-logger';
import { EventBusService } from './event-bus/event-bus.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import {
  swaggerAuthGuard,
} from './common/middleware/swagger-auth.middleware';
import { PrismaClient } from '@prisma/client';

import { execSync } from 'child_process';

console.log('[Bootstrap] Starting backend bootstrap process...');

async function bootstrap() {
  console.log('[Bootstrap] NestJS bootstrap function initiated...');

  // Run database migrations programmatically on startup
  try {
    console.log('[Bootstrap] Running database migrations...');
    execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', { stdio: 'inherit' });
    console.log('[Bootstrap] Database migrations completed successfully.');

    // Check if database needs seeding
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    // Seed only in development — never auto-create default admin in production
    if (userCount === 0 && process.env.NODE_ENV !== 'production') {
      console.log('[Bootstrap] Database is empty. Running database seed...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('[Bootstrap] Database seeding completed successfully.');
    }
    await prisma.$disconnect();
  } catch (error) {
    console.error('[Bootstrap] Database setup failed:', error);
    process.exit(1);
  }

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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const cleanAllowed = allowedUrl.replace(/\/$/, '');
      const cleanOrigin = origin ? origin.replace(/\/$/, '') : '';

      if (!origin || cleanOrigin === cleanAllowed || cleanOrigin === 'http://localhost:3000') {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: "${origin}" | Cleaned: "${cleanOrigin}" does not match Allowed: "${allowedUrl}" | Cleaned: "${cleanAllowed}"`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPass = process.env.SWAGGER_PASSWORD;
  const enableSwagger = !isProd || (Boolean(swaggerUser) && Boolean(swaggerPass));

  if (enableSwagger) {
    if (isProd && swaggerUser && swaggerPass) {
      app.use(swaggerAuthGuard(swaggerUser, swaggerPass));
      console.log('[Swagger] Protected with basic auth (production)');
    }

    const swaggerConfig = new DocumentBuilder()
    .setTitle('DevForge API')
    .setDescription(
      'Universal Developer Operating System — REST API documentation.\n\n' +
        '**Auth:** Use `POST /api/auth/login` to get a JWT token, then click **Authorize** and enter `Bearer <token>`.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication — login, register, logout')
    .addTag('api-hub', 'API Hub — REST/GraphQL/WebSocket testing')
    .addTag('db-hub', 'DB Hub — Database management')
    .addTag('logs-hub', 'Logs Hub — Log sources and error tracking')
    .addTag('monitoring', 'Monitoring Hub — CPU, RAM, uptime metrics')
    .addTag('error-tracker', 'Error Tracker — Exceptions and stack traces')
    .addTag('analytics-hub', 'Analytics Hub — Page views and events')
    .addTag('performance-hub', 'Performance Hub — API latency and slow queries')
    .addTag('security', 'Security Center — JWT inspection and audit logs')
    .addTag('seo-engine', 'SEO Engine — Meta tags, sitemap, robots.txt')
    .addTag('env-manager', 'Environment Manager — Configs and secrets')
    .addTag('cicd-hub', 'CI/CD Hub — Pipelines and deployments')
    .addTag('plugin-system', 'Plugin System — Registry and marketplace')
    .addTag('ai-engine', 'AI Engine — Code generation and analysis')
    .addTag('devops', 'DevOps Hub — Docker and Kubernetes')
    .addTag('project-generator', 'Project Generator — Boilerplate scaffolding')
    .addTag('admin', 'Admin Panel — User and system management')
    .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'DevForge API Docs',
    });
  } else if (isProd) {
    console.log('[Swagger] Disabled — set SWAGGER_USER and SWAGGER_PASSWORD to enable');
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Bootstrap] Backend is successfully listening on port ${port} (0.0.0.0)`);
} // Trigger Railway rebuild

void bootstrap();
