import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EventBusLogger } from './event-bus/event-bus-logger';
import { EventBusService } from './event-bus/event-bus.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

console.log('[Bootstrap] Starting backend bootstrap process...');

async function bootstrap() {
  console.log('[Bootstrap] NestJS bootstrap function initiated...');
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

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────────
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
      persistAuthorization: true, // remember token across refreshes
      docExpansion: 'none', // collapse all by default for readability
      filter: true, // show search bar
      tryItOutEnabled: true, // enable "Try it out" by default
    },
    customSiteTitle: 'DevForge API Docs',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Bootstrap] Backend is successfully listening on port ${port} (0.0.0.0)`);
}

void bootstrap();
