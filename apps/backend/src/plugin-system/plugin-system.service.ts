import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DevForgeEvents } from '@devforge/event-bus';
import type {
  Plugin,
  PluginManifest,
  HookExecution,
  PluginStats,
  MarketplacePlugin,
  PluginHook,
  PluginCategory,
} from '@devforge/plugin-engine';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MAX_EXECUTIONS = 500;

@Injectable()
export class PluginSystemService {
  private plugins: Plugin[] = [];
  private executions: HookExecution[] = [];
  private marketplace: MarketplacePlugin[] = [];

  constructor() {
    this.seedMarketplace();
    this.seedInstalledPlugins();
  }

  // ─── Registry ──────────────────────────────────────────────────────────────

  listPlugins(): Plugin[] {
    return this.plugins;
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.find((p) => p.id === id);
  }

  installPlugin(marketplaceId: string): Plugin | null {
    const mp = this.marketplace.find((m) => m.id === marketplaceId);
    if (!mp) return null;

    const existing = this.plugins.find(
      (p) => p.manifest.name === mp.manifest.name,
    );
    if (existing) return existing;

    const plugin: Plugin = {
      id: uid(),
      manifest: { ...mp.manifest },
      status: 'active',
      enabled: true,
      config: this.buildDefaultConfig(mp.manifest),
      installedAt: Date.now(),
      triggerCount: 0,
      errorCount: 0,
    };

    this.plugins.push(plugin);
    mp.installed = true;
    return plugin;
  }

  uninstallPlugin(id: string): boolean {
    const idx = this.plugins.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const name = this.plugins[idx].manifest.name;
    this.plugins.splice(idx, 1);
    this.executions = this.executions.filter((e) => e.pluginId !== id);
    const mp = this.marketplace.find((m) => m.manifest.name === name);
    if (mp) mp.installed = false;
    return true;
  }

  togglePlugin(id: string): Plugin | undefined {
    const plugin = this.plugins.find((p) => p.id === id);
    if (!plugin) return undefined;
    plugin.enabled = !plugin.enabled;
    plugin.status = plugin.enabled ? 'active' : 'inactive';
    return plugin;
  }

  updatePluginConfig(
    id: string,
    config: Record<string, unknown>,
  ): Plugin | undefined {
    const plugin = this.plugins.find((p) => p.id === id);
    if (!plugin) return undefined;
    plugin.config = { ...plugin.config, ...config };
    return plugin;
  }

  // ─── Hooks ─────────────────────────────────────────────────────────────────

  getExecutions(limit = 100): HookExecution[] {
    return this.executions.slice(0, limit);
  }

  triggerHook(hook: PluginHook, payload?: unknown): HookExecution[] {
    const activePlugins = this.plugins.filter(
      (p) => p.enabled && p.manifest.hooks.includes(hook),
    );
    const results: HookExecution[] = [];

    for (const plugin of activePlugins) {
      const success = Math.random() > 0.05; // 95% success rate
      const durationMs = Math.floor(Math.random() * 80) + 2;
      const exec: HookExecution = {
        id: uid(),
        pluginId: plugin.id,
        pluginName: plugin.manifest.name,
        hook,
        triggeredAt: Date.now(),
        durationMs,
        success,
        payload,
        error: success ? undefined : 'Plugin execution timeout',
      };
      results.push(exec);
      this.executions.unshift(exec);
      plugin.triggerCount++;
      plugin.lastTriggeredAt = Date.now();
      if (!success) plugin.errorCount++;
    }

    if (this.executions.length > MAX_EXECUTIONS) {
      this.executions = this.executions.slice(0, MAX_EXECUTIONS);
    }

    return results;
  }

  // ─── Marketplace ───────────────────────────────────────────────────────────

  getMarketplace(): MarketplacePlugin[] {
    return this.marketplace;
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  getStats(): PluginStats {
    const hookUsage: Record<PluginHook, number> = {
      onRequest: 0,
      onResponse: 0,
      onError: 0,
      onLog: 0,
      onMetric: 0,
    };
    for (const exec of this.executions) {
      hookUsage[exec.hook]++;
    }
    return {
      totalPlugins: this.plugins.length,
      activePlugins: this.plugins.filter((p) => p.enabled).length,
      totalTriggers: this.executions.length,
      totalErrors: this.executions.filter((e) => !e.success).length,
      hookUsage,
    };
  }

  // ─── Event Bus integration ─────────────────────────────────────────────────

  @OnEvent(DevForgeEvents.API_REQUEST)
  onRequest(payload: unknown) {
    this.triggerHook('onRequest', payload);
  }

  @OnEvent(DevForgeEvents.API_RESPONSE)
  onResponse(payload: unknown) {
    this.triggerHook('onResponse', payload);
  }

  @OnEvent(DevForgeEvents.ERROR_THROWN)
  onError(payload: unknown) {
    this.triggerHook('onError', payload);
  }

  @OnEvent(DevForgeEvents.LOG_CREATED)
  onLog(payload: unknown) {
    this.triggerHook('onLog', payload);
  }

  @OnEvent(DevForgeEvents.METRIC_UPDATED)
  onMetric(payload: unknown) {
    this.triggerHook('onMetric', payload);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private buildDefaultConfig(
    manifest: PluginManifest,
  ): Record<string, unknown> {
    if (!manifest.configSchema) return {};
    return Object.fromEntries(
      Object.entries(manifest.configSchema).map(([k, v]) => [
        k,
        v.default ?? null,
      ]),
    );
  }

  private makeMarketplace(
    name: string,
    description: string,
    author: string,
    category: PluginCategory,
    hooks: PluginHook[],
    downloads: number,
    rating: number,
    configSchema?: PluginManifest['configSchema'],
  ): MarketplacePlugin {
    return {
      id: uid(),
      manifest: {
        name,
        version: '1.0.0',
        description,
        author,
        category,
        hooks,
        configSchema,
      },
      downloads,
      rating,
      installed: false,
    };
  }

  private seedMarketplace(): void {
    this.marketplace = [
      this.makeMarketplace(
        'Slack Notifier',
        'Send alerts to Slack channels on errors and metric spikes.',
        'DevForge Team',
        'monitoring',
        ['onError', 'onMetric'],
        12_430,
        4.8,
        {
          webhookUrl: {
            type: 'string',
            description: 'Slack Incoming Webhook URL',
            default: '',
          },
          channel: {
            type: 'string',
            description: 'Target channel',
            default: '#alerts',
          },
        },
      ),
      this.makeMarketplace(
        'Rate Limiter',
        'Block or throttle suspicious IPs automatically.',
        'SecureForge',
        'security',
        ['onRequest'],
        8_920,
        4.6,
        {
          maxRpm: {
            type: 'number',
            description: 'Max requests per minute per IP',
            default: 60,
          },
        },
      ),
      this.makeMarketplace(
        'DataDog Exporter',
        'Stream metrics and logs to DataDog in real-time.',
        'DataDog',
        'analytics',
        ['onMetric', 'onLog'],
        21_050,
        4.9,
        {
          apiKey: {
            type: 'string',
            description: 'DataDog API key',
            default: '',
          },
        },
      ),
      this.makeMarketplace(
        'PagerDuty Alerts',
        'Create PagerDuty incidents on critical errors.',
        'PagerDuty Inc.',
        'monitoring',
        ['onError'],
        5_340,
        4.5,
        {
          integrationKey: {
            type: 'string',
            description: 'PagerDuty integration key',
            default: '',
          },
        },
      ),
      this.makeMarketplace(
        'Request Logger',
        'Log all incoming requests with full headers and body to a separate sink.',
        'DevForge Team',
        'logging',
        ['onRequest', 'onResponse'],
        15_780,
        4.7,
        {
          logLevel: {
            type: 'string',
            description: 'Log level (debug|info|warn)',
            default: 'info',
          },
        },
      ),
      this.makeMarketplace(
        'AI Error Explainer',
        'Automatically explain errors using OpenAI and attach explanations to logs.',
        'AI Labs',
        'ai',
        ['onError'],
        3_210,
        4.3,
        {
          openaiKey: {
            type: 'string',
            description: 'OpenAI API key',
            default: '',
          },
          model: {
            type: 'string',
            description: 'Model to use',
            default: 'gpt-4o-mini',
          },
        },
      ),
      this.makeMarketplace(
        'Prometheus Exporter',
        'Expose /metrics endpoint compatible with Prometheus scraping.',
        'CloudOps',
        'devops',
        ['onMetric'],
        18_900,
        4.8,
        {
          port: { type: 'number', description: 'Metrics port', default: 9090 },
        },
      ),
      this.makeMarketplace(
        'Request Sanitizer',
        'Strip sensitive fields (passwords, tokens) from logs automatically.',
        'SecureForge',
        'security',
        ['onRequest', 'onLog'],
        7_650,
        4.6,
        {
          fields: {
            type: 'string',
            description: 'Comma-separated field names to redact',
            default: 'password,token,secret',
          },
        },
      ),
    ];
  }

  private seedInstalledPlugins(): void {
    const toInstall = ['Slack Notifier', 'Request Logger', 'Rate Limiter'];
    for (const name of toInstall) {
      const mp = this.marketplace.find((m) => m.manifest.name === name);
      if (mp) this.installPlugin(mp.id);
    }

    // Seed some historical executions
    const hooks: PluginHook[] = [
      'onRequest',
      'onResponse',
      'onError',
      'onLog',
      'onMetric',
    ];
    for (let i = 0; i < 40; i++) {
      const plugin = this.plugins[i % this.plugins.length];
      if (!plugin) continue;
      const hook = hooks[i % hooks.length];
      if (!plugin.manifest.hooks.includes(hook)) continue;
      const success = Math.random() > 0.08;
      this.executions.push({
        id: uid(),
        pluginId: plugin.id,
        pluginName: plugin.manifest.name,
        hook,
        triggeredAt: Date.now() - (40 - i) * 60_000,
        durationMs: Math.floor(Math.random() * 60) + 3,
        success,
        error: success ? undefined : 'Execution timeout',
      });
      plugin.triggerCount++;
      if (!success) plugin.errorCount++;
    }
  }
}
