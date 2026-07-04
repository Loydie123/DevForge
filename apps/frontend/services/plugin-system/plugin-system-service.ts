import { apiClient } from "../api-client";

export type PluginHook = "onRequest" | "onResponse" | "onError" | "onLog" | "onMetric";
export type PluginCategory = "monitoring" | "security" | "analytics" | "logging" | "devops" | "ai" | "utility";
export type PluginStatus = "active" | "inactive" | "error";

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

export const pluginSystemService = {
  async getStats(): Promise<PluginStats> {
    const res = await apiClient.get<PluginStats>("/plugin-system/stats");
    return res.data;
  },

  async listPlugins(): Promise<Plugin[]> {
    const res = await apiClient.get<Plugin[]>("/plugin-system/plugins");
    return res.data;
  },

  async getMarketplace(): Promise<MarketplacePlugin[]> {
    const res = await apiClient.get<MarketplacePlugin[]>("/plugin-system/marketplace");
    return res.data;
  },

  async installPlugin(marketplaceId: string): Promise<Plugin> {
    const res = await apiClient.post<Plugin>(`/plugin-system/marketplace/${marketplaceId}/install`, {});
    return res.data;
  },

  async uninstallPlugin(pluginId: string): Promise<void> {
    await apiClient.delete(`/plugin-system/plugins/${pluginId}`);
  },

  async togglePlugin(pluginId: string): Promise<Plugin> {
    const res = await apiClient.post<Plugin>(`/plugin-system/plugins/${pluginId}/toggle`, {});
    return res.data;
  },

  async updateConfig(pluginId: string, config: Record<string, unknown>): Promise<Plugin> {
    const res = await apiClient.post<Plugin>(`/plugin-system/plugins/${pluginId}/config`, config);
    return res.data;
  },

  async getExecutions(limit = 100): Promise<HookExecution[]> {
    const res = await apiClient.get<HookExecution[]>(`/plugin-system/executions?limit=${limit}`);
    return res.data;
  },

  async triggerHook(hook: PluginHook, payload?: unknown): Promise<HookExecution[]> {
    const res = await apiClient.post<HookExecution[]>("/plugin-system/hooks/trigger", { hook, payload });
    return res.data;
  },
};
