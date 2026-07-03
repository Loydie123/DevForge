import { apiClient } from "../api-client";
import {
  LogSourceDto,
  LogSource,
  ErrorLogDto,
  ErrorLog,
} from "@devforge/logs-hub";

export type {
  LogSourceDto,
  LogSource,
  ErrorLogDto,
  ErrorLog,
};

export const logsHubService = {
  // --- Log Sources CRUD ---
  async getSources(projectId: string): Promise<LogSource[]> {
    const res = await apiClient.get<LogSource[]>(`/logs-hub/sources/${projectId}`);
    return res.data;
  },

  async addSource(dto: LogSourceDto): Promise<LogSource> {
    const res = await apiClient.post<LogSource>("/logs-hub/sources", dto);
    return res.data;
  },

  async deleteSource(id: string): Promise<void> {
    await apiClient.delete(`/logs-hub/sources/${id}`);
  },

  // --- Error Tracker CRUD ---
  async getErrorLogs(projectId: string): Promise<ErrorLog[]> {
    const res = await apiClient.get<ErrorLog[]>(`/logs-hub/errors/${projectId}`);
    return res.data;
  },

  async recordError(dto: ErrorLogDto): Promise<ErrorLog> {
    const res = await apiClient.post<ErrorLog>("/logs-hub/errors", dto);
    return res.data;
  },

  async deleteError(id: string): Promise<void> {
    await apiClient.delete(`/logs-hub/errors/${id}`);
  },

  async clearErrors(projectId: string): Promise<void> {
    await apiClient.delete(`/logs-hub/errors/clear/${projectId}`);
  },
};
