// ─── App Metadata ─────────────────────────────────────────────────────────────

export const APP_NAME = 'DevForge';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Universal Developer Operating System (DevOS)';

// ─── Default Ports ────────────────────────────────────────────────────────────

export const PORTS = {
  BACKEND: 4000,
  FRONTEND: 3000,
  METRICS: 9090,
  REDIS: 6379,
  POSTGRES: 5433,
} as const;

// ─── Environment Keys ─────────────────────────────────────────────────────────

export const ENV_KEYS = {
  DATABASE_URL: 'DATABASE_URL',
  REDIS_URL: 'REDIS_URL',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENROUTER_API_KEY: 'OPENROUTER_API_KEY',
  SENTRY_DSN: 'SENTRY_DSN',
} as const;

// ─── Environment Types ────────────────────────────────────────────────────────

export type NodeEnv = 'development' | 'staging' | 'production' | 'test';

export const NODE_ENVS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const satisfies Record<string, NodeEnv>;

// ─── JWT Defaults ─────────────────────────────────────────────────────────────

export const JWT_DEFAULTS = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256',
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 500,
} as const;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export const RATE_LIMIT = {
  WINDOW_MS: 60_000,
  MAX_REQUESTS: 100,
  BLOCK_DURATION_MS: 300_000,
} as const;

// ─── Cache TTLs (milliseconds) ────────────────────────────────────────────────

export const CACHE_TTL = {
  SHORT: 30_000,
  MEDIUM: 300_000,
  LONG: 3_600_000,
  DAY: 86_400_000,
} as const;

// ─── Log Levels ───────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const satisfies Record<string, LogLevel>;

// ─── Feature Flags ────────────────────────────────────────────────────────────

export interface FeatureFlags {
  analyticsEnabled: boolean;
  aiEngineEnabled: boolean;
  pluginSystemEnabled: boolean;
  securityCenterEnabled: boolean;
  cicdHubEnabled: boolean;
  seoEngineEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  analyticsEnabled: true,
  aiEngineEnabled: true,
  pluginSystemEnabled: true,
  securityCenterEnabled: true,
  cicdHubEnabled: true,
  seoEngineEnabled: true,
};

// ─── API Routes ───────────────────────────────────────────────────────────────

export const API_PREFIX = 'api' as const;

export const API_ROUTES = {
  AUTH: 'auth',
  API_HUB: 'api-hub',
  DB_HUB: 'db-hub',
  LOGS_HUB: 'logs-hub',
  MONITORING: 'monitoring',
  ERROR_TRACKER: 'error-tracker',
  ANALYTICS_HUB: 'analytics-hub',
  PERFORMANCE_HUB: 'performance-hub',
  SECURITY_CENTER: 'security-center',
  AI_ENGINE: 'ai-engine',
  PROJECT_GENERATOR: 'project-generator',
  SEO_ENGINE: 'seo-engine',
  ENV_MANAGER: 'env-manager',
  PLUGIN_SYSTEM: 'plugin-system',
  CICD_HUB: 'cicd-hub',
  DEVOPS: 'devops',
} as const;

// ─── Supported Frameworks (Project Generator) ─────────────────────────────────

export const SUPPORTED_FRAMEWORKS = [
  'nestjs',
  'express',
  'fastify',
  'laravel',
  'django',
  'spring-boot',
  'aspnet-core',
  'go-fiber',
  'nextjs',
  'angular',
] as const;

export type SupportedFramework = typeof SUPPORTED_FRAMEWORKS[number];

// ─── AI Providers ─────────────────────────────────────────────────────────────

export const AI_PROVIDERS = ['openai', 'openrouter', 'claude', 'gemini'] as const;
export type AiProvider = typeof AI_PROVIDERS[number];

// ─── Severity Levels (Error Tracker) ─────────────────────────────────────────

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const satisfies Record<string, Severity>;
