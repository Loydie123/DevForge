import { apiClient } from "../api-client";

export interface ErrorLog {
  id: string;
  projectId: string;
  service: string;
  message: string;
  stack: string | null;
  severity: string;
  createdAt: string;
}

export interface ErrorStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byService: Record<string, number>;
  recentCount: number;
}

export interface RecordErrorDto {
  projectId: string;
  service: string;
  message: string;
  stack?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export const errorTrackerService = {
  async getErrors(
    projectId: string,
    params?: { severity?: string; service?: string; search?: string }
  ): Promise<ErrorLog[]> {
    const res = await apiClient.get<ErrorLog[]>(`/error-tracker/${projectId}`, { params });
    return res.data;
  },

  async getStats(projectId: string): Promise<ErrorStats> {
    const res = await apiClient.get<ErrorStats>(`/error-tracker/stats/${projectId}`);
    return res.data;
  },

  async getServices(projectId: string): Promise<string[]> {
    const res = await apiClient.get<string[]>(`/error-tracker/services/${projectId}`);
    return res.data;
  },

  async recordError(dto: RecordErrorDto): Promise<ErrorLog> {
    const res = await apiClient.post<ErrorLog>("/error-tracker", dto);
    return res.data;
  },

  async deleteError(id: string): Promise<void> {
    await apiClient.delete(`/error-tracker/${id}`);
  },

  async clearErrors(projectId: string): Promise<void> {
    await apiClient.delete(`/error-tracker/clear/${projectId}`);
  },
};
