import { EnvManagerService } from './env-manager.service';

describe('EnvManagerService', () => {
  let service: EnvManagerService;

  beforeEach(() => {
    service = new EnvManagerService();
    // Clear seeded data so tests start clean
    const svc = service as unknown as {
      configs: unknown[];
      versions: unknown[];
    };
    svc.configs = [];
    svc.versions = [];
  });

  // ── Config CRUD ────────────────────────────────────────────────────────────

  describe('createConfig()', () => {
    it('should create a config and return masked values', () => {
      const result = service.createConfig('API Keys', 'production', [
        {
          key: 'DB_PASSWORD',
          value: 'super-secret',
          masked: true,
          description: '',
        },
        { key: 'APP_NAME', value: 'DevForge', masked: false, description: '' },
      ]);

      expect(result.name).toBe('API Keys');
      expect(result.environment).toBe('production');
      expect(result.variables).toHaveLength(2);

      const dbPw = result.variables.find((v) => v.key === 'DB_PASSWORD');
      expect(dbPw?.value).toBe('••••••••'); // masked

      const appName = result.variables.find((v) => v.key === 'APP_NAME');
      expect(appName?.value).toBe('DevForge'); // not masked
    });

    it('should start at version 1', () => {
      const result = service.createConfig('Test', 'development', []);
      expect(result.version).toBe(1);
    });

    it('should snapshot on create', () => {
      service.createConfig('Test', 'development', []);
      const configs = service.listConfigs();
      const versions = service.getVersions(configs[0].id);
      expect(versions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('updateConfig()', () => {
    it('should update config name', () => {
      const cfg = service.createConfig('Old Name', 'staging', []);
      const updated = service.updateConfig(cfg.id, { name: 'New Name' });
      expect(updated?.name).toBe('New Name');
    });

    it('should return undefined for unknown id', () => {
      expect(
        service.updateConfig('nonexistent', { name: 'X' }),
      ).toBeUndefined();
    });
  });

  describe('deleteConfig()', () => {
    it('should delete config and its versions', () => {
      const cfg = service.createConfig('Temp', 'development', []);
      expect(service.deleteConfig(cfg.id)).toBe(true);
      expect(service.getConfig(cfg.id)).toBeUndefined();
      expect(service.getVersions(cfg.id)).toHaveLength(0);
    });

    it('should return false for unknown id', () => {
      expect(service.deleteConfig('nonexistent')).toBe(false);
    });
  });

  // ── Secret masking — critical security test ────────────────────────────────

  describe('secret masking', () => {
    it('should always mask secrets in listConfigs()', () => {
      service.createConfig('Secrets', 'production', [
        {
          key: 'JWT_SECRET',
          value: 'very-secret-value',
          masked: true,
          description: '',
        },
      ]);

      const configs = service.listConfigs();
      const v = configs[0].variables.find((x) => x.key === 'JWT_SECRET');
      expect(v?.value).toBe('••••••••');
      expect(v?.value).not.toBe('very-secret-value');
    });

    it('should always mask secrets in getConfig()', () => {
      const cfg = service.createConfig('Secrets', 'production', [
        {
          key: 'JWT_SECRET',
          value: 'very-secret-value',
          masked: true,
          description: '',
        },
      ]);

      const fetched = service.getConfig(cfg.id);
      const v = fetched?.variables.find((x) => x.key === 'JWT_SECRET');
      expect(v?.value).toBe('••••••••');
    });

    it('revealVariable() should return real value', () => {
      const cfg = service.createConfig('Secrets', 'production', [
        {
          key: 'JWT_SECRET',
          value: 'very-secret-value',
          masked: true,
          description: '',
        },
      ]);
      const rawConfig = service.listConfigs()[0];
      const varId = rawConfig.variables[0].id;

      const revealed = service.revealVariable(cfg.id, varId);
      expect(revealed).toBe('very-secret-value');
    });
  });

  // ── Variables ──────────────────────────────────────────────────────────────

  describe('addVariable()', () => {
    it('should add a variable and bump version', () => {
      const cfg = service.createConfig('Test', 'development', []);
      const updated = service.addVariable(cfg.id, {
        key: 'NEW_VAR',
        value: 'hello',
        masked: false,
        description: '',
      });
      expect(updated?.variables.find((v) => v.key === 'NEW_VAR')).toBeDefined();
      expect(updated?.version).toBe(2);
    });
  });

  describe('deleteVariable()', () => {
    it('should remove variable and bump version', () => {
      const cfg = service.createConfig('Test', 'development', [
        { key: 'TO_DELETE', value: 'bye', masked: false, description: '' },
      ]);
      const varId = service.listConfigs()[0].variables[0].id;
      const updated = service.deleteVariable(cfg.id, varId);
      expect(updated?.variables).toHaveLength(0);
      expect(updated?.version).toBe(2);
    });
  });

  // ── Versioning ─────────────────────────────────────────────────────────────

  describe('restoreVersion()', () => {
    it('should restore config to a previous snapshot', () => {
      const cfg = service.createConfig('Versioned', 'staging', [
        { key: 'API_KEY', value: 'v1-key', masked: true, description: '' },
      ]);

      // Add snapshot at v1
      const v1Versions = service.getVersions(cfg.id);
      const v1Id = v1Versions[v1Versions.length - 1].id;

      // Modify to v2
      const varId = service.listConfigs()[0].variables[0].id;
      service.updateVariable(cfg.id, varId, { value: 'v2-key' });

      // Restore to v1
      service.restoreVersion(cfg.id, v1Id);

      const revealed = service.revealVariable(cfg.id, varId);
      expect(revealed).toBe('v1-key');
    });
  });

  // ── Export .env ────────────────────────────────────────────────────────────

  describe('exportDotEnv()', () => {
    it('should export real (unmasked) values', () => {
      const cfg = service.createConfig('Export', 'production', [
        {
          key: 'DB_URL',
          value: 'postgres://localhost/dev',
          masked: false,
          description: 'Database',
        },
        { key: 'SECRET', value: 'my-secret', masked: true, description: '' },
      ]);
      const output = service.exportDotEnv(cfg.id);
      expect(output).toContain('DB_URL=postgres://localhost/dev');
      expect(output).toContain('SECRET=my-secret'); // real value, not ••••••••
    });

    it('should return undefined for unknown id', () => {
      expect(service.exportDotEnv('nonexistent')).toBeUndefined();
    });
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should count configs, variables, and secrets accurately', () => {
      service.createConfig('Dev', 'development', [
        { key: 'A', value: '1', masked: false, description: '' },
        { key: 'B', value: '2', masked: true, description: '' },
      ]);
      service.createConfig('Prod', 'production', [
        { key: 'C', value: '3', masked: true, description: '' },
      ]);

      const stats = service.getStats();
      expect(stats.totalConfigs).toBe(2);
      expect(stats.totalVariables).toBe(3);
      expect(stats.totalSecrets).toBe(2);
    });
  });
});
