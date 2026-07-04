import { Injectable } from '@nestjs/common';
import type {
  EnvConfig,
  EnvVariable,
  EnvVersion,
  EnvStats,
  EnvType,
  SecretType,
} from '@devforge/env-manager';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MASK = '••••••••';

@Injectable()
export class EnvManagerService {
  private configs: EnvConfig[] = [];
  private versions: EnvVersion[] = [];

  constructor() {
    this.seed();
  }

  // ─── Configs ───────────────────────────────────────────────────────────────

  listConfigs(): EnvConfig[] {
    return this.configs.map((c) => this.maskConfig(c));
  }

  getConfig(id: string): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === id);
    return cfg ? this.maskConfig(cfg) : undefined;
  }

  createConfig(
    name: string,
    environment: EnvType,
    variables: Omit<EnvVariable, 'id' | 'createdAt' | 'updatedAt'>[],
  ): EnvConfig {
    const now = Date.now();
    const cfg: EnvConfig = {
      id: uid(),
      name,
      environment,
      variables: variables.map((v) => ({
        ...v,
        id: uid(),
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    this.configs.push(cfg);
    this.snapshotVersion(cfg, 'system', 'Initial config created');
    return this.maskConfig(cfg);
  }

  updateConfig(
    id: string,
    updates: Partial<Pick<EnvConfig, 'name' | 'environment'>>,
  ): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === id);
    if (!cfg) return undefined;
    Object.assign(cfg, updates, { updatedAt: Date.now() });
    return this.maskConfig(cfg);
  }

  deleteConfig(id: string): boolean {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.configs.splice(idx, 1);
    this.versions = this.versions.filter((v) => v.configId !== id);
    return true;
  }

  // ─── Variables ─────────────────────────────────────────────────────────────

  addVariable(
    configId: string,
    variable: Omit<EnvVariable, 'id' | 'createdAt' | 'updatedAt'>,
    changedBy = 'user',
  ): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    if (!cfg) return undefined;
    const now = Date.now();
    cfg.variables.push({
      ...variable,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    });
    cfg.updatedAt = now;
    cfg.version++;
    this.snapshotVersion(cfg, changedBy, `Added variable: ${variable.key}`);
    return this.maskConfig(cfg);
  }

  updateVariable(
    configId: string,
    variableId: string,
    updates: Partial<Omit<EnvVariable, 'id' | 'createdAt'>>,
    changedBy = 'user',
  ): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    if (!cfg) return undefined;
    const varIdx = cfg.variables.findIndex((v) => v.id === variableId);
    if (varIdx === -1) return undefined;
    Object.assign(cfg.variables[varIdx], updates, { updatedAt: Date.now() });
    cfg.updatedAt = Date.now();
    cfg.version++;
    const key = cfg.variables[varIdx].key;
    this.snapshotVersion(cfg, changedBy, `Updated variable: ${key}`);
    return this.maskConfig(cfg);
  }

  deleteVariable(
    configId: string,
    variableId: string,
    changedBy = 'user',
  ): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    if (!cfg) return undefined;
    const varIdx = cfg.variables.findIndex((v) => v.id === variableId);
    if (varIdx === -1) return undefined;
    const key = cfg.variables[varIdx].key;
    cfg.variables.splice(varIdx, 1);
    cfg.updatedAt = Date.now();
    cfg.version++;
    this.snapshotVersion(cfg, changedBy, `Deleted variable: ${key}`);
    return this.maskConfig(cfg);
  }

  // Reveal unmasked value for a specific variable (in production, decryption would happen here)
  revealVariable(configId: string, variableId: string): string | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    if (!cfg) return undefined;
    return cfg.variables.find((v) => v.id === variableId)?.value;
  }

  // Export config as .env file string
  exportDotEnv(configId: string): string | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    if (!cfg) return undefined;
    const lines = [
      `# ${cfg.name} — ${cfg.environment.toUpperCase()} (v${cfg.version})`,
      `# Exported: ${new Date().toISOString()}`,
      '',
      ...cfg.variables.map((v) => {
        const comment = v.description ? `# ${v.description}\n` : '';
        return `${comment}${v.key}=${v.value}`;
      }),
    ];
    return lines.join('\n');
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  getVersions(configId: string): EnvVersion[] {
    return this.versions
      .filter((v) => v.configId === configId)
      .sort((a, b) => b.version - a.version);
  }

  restoreVersion(
    configId: string,
    versionId: string,
    changedBy = 'user',
  ): EnvConfig | undefined {
    const cfg = this.configs.find((c) => c.id === configId);
    const ver = this.versions.find(
      (v) => v.id === versionId && v.configId === configId,
    );
    if (!cfg || !ver) return undefined;
    const now = Date.now();
    cfg.variables = ver.snapshot.map((sv) => ({ ...sv, updatedAt: now }));
    cfg.updatedAt = now;
    cfg.version++;
    this.snapshotVersion(cfg, changedBy, `Restored to v${ver.version}`);
    return this.maskConfig(cfg);
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  getStats(): EnvStats {
    const allVars = this.configs.flatMap((c) => c.variables);
    const byEnv: Record<EnvType, number> = {
      development: 0,
      staging: 0,
      production: 0,
    };
    for (const c of this.configs) byEnv[c.environment]++;
    return {
      totalConfigs: this.configs.length,
      totalVariables: allVars.length,
      totalSecrets: allVars.filter((v) => v.masked).length,
      totalVersions: this.versions.length,
      byEnvironment: byEnv,
    };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private maskConfig(cfg: EnvConfig): EnvConfig {
    return {
      ...cfg,
      variables: cfg.variables.map((v) => ({
        ...v,
        value: v.masked ? MASK : v.value,
      })),
    };
  }

  private snapshotVersion(
    cfg: EnvConfig,
    changedBy: string,
    note?: string,
  ): void {
    this.versions.push({
      id: uid(),
      configId: cfg.id,
      version: cfg.version,
      snapshot: cfg.variables.map((v) => ({ ...v })),
      changedBy,
      changedAt: Date.now(),
      note,
    });
  }

  private seed(): void {
    const now = Date.now();

    const devCfg: EnvConfig = {
      id: uid(),
      name: 'DevForge Backend',
      environment: 'development',
      variables: [
        this.makeVar(
          'DATABASE_URL',
          'postgresql://devforge:pass@localhost:5433/devforge',
          'connection_string',
          true,
          'Main Postgres DB',
        ),
        this.makeVar(
          'REDIS_URL',
          'redis://localhost:6379',
          'connection_string',
          false,
          'Redis cache',
        ),
        this.makeVar(
          'JWT_SECRET',
          'devforge-jwt-secret-dev-2026',
          'secret',
          true,
          'JWT signing key',
        ),
        this.makeVar('PORT', '4000', 'plain', false, 'Backend port'),
        this.makeVar(
          'NODE_ENV',
          'development',
          'plain',
          false,
          'Runtime environment',
        ),
      ],
      createdAt: now - 86_400_000 * 7,
      updatedAt: now - 3600_000,
      version: 3,
    };

    const stagingCfg: EnvConfig = {
      id: uid(),
      name: 'DevForge Backend',
      environment: 'staging',
      variables: [
        this.makeVar(
          'DATABASE_URL',
          'postgresql://devforge:staging_pass@staging-db:5432/devforge_staging',
          'connection_string',
          true,
          'Staging Postgres DB',
        ),
        this.makeVar(
          'REDIS_URL',
          'redis://staging-redis:6379',
          'connection_string',
          false,
          'Staging Redis',
        ),
        this.makeVar(
          'JWT_SECRET',
          'staging-super-secret-key-2026',
          'secret',
          true,
          'JWT signing key',
        ),
        this.makeVar('PORT', '4000', 'plain', false, 'Backend port'),
        this.makeVar(
          'NODE_ENV',
          'staging',
          'plain',
          false,
          'Runtime environment',
        ),
        this.makeVar(
          'SENTRY_DSN',
          'https://abc123@o123.ingest.sentry.io/456',
          'api_key',
          true,
          'Sentry error tracking',
        ),
      ],
      createdAt: now - 86_400_000 * 5,
      updatedAt: now - 86_400_000,
      version: 2,
    };

    const prodCfg: EnvConfig = {
      id: uid(),
      name: 'DevForge Backend',
      environment: 'production',
      variables: [
        this.makeVar(
          'DATABASE_URL',
          'postgresql://devforge:prod_pass_s3cr3t@prod-db:5432/devforge_prod',
          'connection_string',
          true,
          'Production Postgres DB',
        ),
        this.makeVar(
          'REDIS_URL',
          'redis://:prod_redis_pass@prod-redis:6379',
          'connection_string',
          true,
          'Production Redis',
        ),
        this.makeVar(
          'JWT_SECRET',
          'prod-ultra-secret-key-never-share-2026',
          'secret',
          true,
          'JWT signing key',
        ),
        this.makeVar('PORT', '4000', 'plain', false, 'Backend port'),
        this.makeVar(
          'NODE_ENV',
          'production',
          'plain',
          false,
          'Runtime environment',
        ),
        this.makeVar(
          'SENTRY_DSN',
          'https://xyz789@o123.ingest.sentry.io/789',
          'api_key',
          true,
          'Sentry error tracking',
        ),
        this.makeVar(
          'OPENAI_API_KEY',
          'sk-prod-xxxxxxxxxxxxxxxxxxxx',
          'api_key',
          true,
          'OpenAI API key',
        ),
        this.makeVar(
          'STRIPE_SECRET_KEY',
          'sk_live_xxxxxxxxxxxxxxxxxxxx',
          'api_key',
          true,
          'Stripe payment key',
        ),
      ],
      createdAt: now - 86_400_000 * 3,
      updatedAt: now - 3600_000 * 2,
      version: 4,
    };

    this.configs = [devCfg, stagingCfg, prodCfg];

    // Seed versions for devCfg
    for (let v = 1; v <= devCfg.version; v++) {
      this.versions.push({
        id: uid(),
        configId: devCfg.id,
        version: v,
        snapshot: devCfg.variables
          .slice(0, 3 + v)
          .map((variable) => ({ ...variable })),
        changedBy: v === 1 ? 'system' : 'admin@devforge.com',
        changedAt: now - 86_400_000 * (devCfg.version - v + 1),
        note:
          v === 1
            ? 'Initial config'
            : v === 2
              ? 'Added REDIS_URL'
              : 'Updated JWT_SECRET',
      });
    }
  }

  private makeVar(
    key: string,
    value: string,
    type: SecretType,
    masked: boolean,
    description?: string,
  ): EnvVariable {
    const now = Date.now();
    return {
      id: uid(),
      key,
      value,
      type,
      masked,
      description,
      createdAt: now,
      updatedAt: now,
    };
  }
}
