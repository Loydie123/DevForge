export type PluginHook =
  | 'onRequest'
  | 'onResponse'
  | 'onError'
  | 'onLog'
  | 'onMetric';

export type PluginCategory =
  | 'monitoring'
  | 'security'
  | 'analytics'
  | 'logging'
  | 'devops'
  | 'ai'
  | 'utility';

export type PluginStatus = 'active' | 'inactive' | 'error';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  hooks: PluginHook[];
  configSchema?: Record<string, { type: string; description: string; default?: unknown }>;
}

export interface Plugin {
  id: string;
  manifest: PluginManifest;
  status: PluginStatus;
  enabled: boolean;
  config: Record<string, unknown>;
  installedAt: number;
  lastTriggeredAt?: number;
  triggerCount: number;
  errorCount: number;
}

export interface HookExecution {
  id: string;
  pluginId: string;
  pluginName: string;
  hook: PluginHook;
  triggeredAt: number;
  durationMs: number;
  success: boolean;
  payload?: unknown;
  error?: string;
}

export interface PluginStats {
  totalPlugins: number;
  activePlugins: number;
  totalTriggers: number;
  totalErrors: number;
  hookUsage: Record<PluginHook, number>;
}

export interface MarketplacePlugin {
  id: string;
  manifest: PluginManifest;
  downloads: number;
  rating: number;
  installed: boolean;
}
