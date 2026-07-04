import { apiClient } from "../api-client";

export type EnvType = "development" | "staging" | "production";
export type SecretType = "plain" | "secret" | "api_key" | "connection_string";

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  type: SecretType;
  masked: boolean;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnvConfig {
  id: string;
  name: string;
  environment: EnvType;
  variables: EnvVariable[];
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface EnvVersion {
  id: string;
  configId: string;
  version: number;
  snapshot: EnvVariable[];
  changedBy: string;
  changedAt: number;
  note?: string;
}

export interface EnvStats {
  totalConfigs: number;
  totalVariables: number;
  totalSecrets: number;
  totalVersions: number;
  byEnvironment: Record<EnvType, number>;
}

export const envManagerService = {
  async getStats(): Promise<EnvStats> {
    const res = await apiClient.get<EnvStats>("/env-manager/stats");
    return res.data;
  },

  async listConfigs(): Promise<EnvConfig[]> {
    const res = await apiClient.get<EnvConfig[]>("/env-manager/configs");
    return res.data;
  },

  async getConfig(id: string): Promise<EnvConfig> {
    const res = await apiClient.get<EnvConfig>(`/env-manager/configs/${id}`);
    return res.data;
  },

  async createConfig(name: string, environment: EnvType): Promise<EnvConfig> {
    const res = await apiClient.post<EnvConfig>("/env-manager/configs", { name, environment, variables: [] });
    return res.data;
  },

  async deleteConfig(id: string): Promise<void> {
    await apiClient.delete(`/env-manager/configs/${id}`);
  },

  async addVariable(configId: string, variable: Omit<EnvVariable, "id" | "createdAt" | "updatedAt">): Promise<EnvConfig> {
    const res = await apiClient.post<EnvConfig>(`/env-manager/configs/${configId}/variables`, variable);
    return res.data;
  },

  async updateVariable(configId: string, varId: string, updates: Partial<Omit<EnvVariable, "id" | "createdAt">>): Promise<EnvConfig> {
    const res = await apiClient.put<EnvConfig>(`/env-manager/configs/${configId}/variables/${varId}`, updates);
    return res.data;
  },

  async deleteVariable(configId: string, varId: string): Promise<EnvConfig> {
    const res = await apiClient.delete<EnvConfig>(`/env-manager/configs/${configId}/variables/${varId}`);
    return res.data;
  },

  async revealVariable(configId: string, varId: string): Promise<string> {
    const res = await apiClient.get<{ value: string }>(`/env-manager/configs/${configId}/variables/${varId}/reveal`);
    return res.data.value;
  },

  async exportDotEnv(configId: string): Promise<string> {
    const res = await apiClient.get<{ content: string }>(`/env-manager/configs/${configId}/export`);
    return res.data.content;
  },

  async getVersions(configId: string): Promise<EnvVersion[]> {
    const res = await apiClient.get<EnvVersion[]>(`/env-manager/configs/${configId}/versions`);
    return res.data;
  },

  async restoreVersion(configId: string, versionId: string): Promise<EnvConfig> {
    const res = await apiClient.post<EnvConfig>(`/env-manager/configs/${configId}/versions/${versionId}/restore`, {});
    return res.data;
  },
};
