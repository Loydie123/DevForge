import { apiClient } from "./api-client";

export interface SystemMetrics {
  cpu: { usedPercent: number; cores: number; model: string };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usedPercent: number;
  };
  disk: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usedPercent: number;
  };
  timestamp: number;
}

export interface UptimeResult {
  id: string;
  statusCode: number | null;
  latencyMs: number;
  status: string;
  error: string | null;
  createdAt: string;
}

export interface UptimeCheck {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: string;
  latencyMs: number | null;
  projectId: string;
  createdAt: string;
  results: UptimeResult[];
}

export interface CreateUptimeCheckDto {
  projectId: string;
  name: string;
  url: string;
  interval?: number;
}

export const monitoringService = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const res = await apiClient.get<SystemMetrics>("/monitoring/system");
    return res.data;
  },

  async getUptimeChecks(projectId: string): Promise<UptimeCheck[]> {
    const res = await apiClient.get<UptimeCheck[]>(
      `/monitoring/uptime-checks/${projectId}`
    );
    return res.data;
  },

  async createUptimeCheck(dto: CreateUptimeCheckDto): Promise<UptimeCheck> {
    const res = await apiClient.post<UptimeCheck>(
      "/monitoring/uptime-checks",
      dto
    );
    return res.data;
  },

  async deleteUptimeCheck(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/monitoring/uptime-checks/${id}`
    );
    return res.data;
  },
};
