import { apiClient } from "./api-client";
import {
  SystemMetrics,
  UptimeResult,
  UptimeCheck,
  CreateUptimeCheckDto,
} from "@devforge/monitoring-hub";

export type {
  SystemMetrics,
  UptimeResult,
  UptimeCheck,
  CreateUptimeCheckDto,
};

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
