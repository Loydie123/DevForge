import { apiClient } from "./api-client";
import {
  DbConnectionDto,
  DbConnection,
  QueryResultDto,
  DbQueryHistoryItem,
} from "@devforge/db-hub";

export type {
  DbConnectionDto,
  DbConnection,
  QueryResultDto,
  DbQueryHistoryItem,
};

export const dbHubService = {
  async getConnections(projectId: string): Promise<DbConnection[]> {
    const res = await apiClient.get<DbConnection[]>(`/db-hub/connections/${projectId}`);
    return res.data;
  },

  async createConnection(dto: DbConnectionDto): Promise<DbConnection> {
    const res = await apiClient.post<DbConnection>("/db-hub/connections", dto);
    return res.data;
  },

  async deleteConnection(id: string): Promise<void> {
    await apiClient.delete(`/db-hub/connections/${id}`);
  },

  async testConnection(
    dto: Omit<DbConnectionDto, "projectId" | "name">
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>("/db-hub/connections/test", dto);
    return res.data;
  },

  async executeQuery(
    connectionId: string,
    query: string
  ): Promise<QueryResultDto> {
    const res = await apiClient.post<QueryResultDto>("/db-hub/query", { connectionId, query });
    return res.data;
  },

  async getHistory(connectionId: string): Promise<DbQueryHistoryItem[]> {
    const res = await apiClient.get<DbQueryHistoryItem[]>(`/db-hub/history/${connectionId}`);
    return res.data;
  },

  async clearHistory(connectionId: string): Promise<void> {
    await apiClient.delete(`/db-hub/history/clear/${connectionId}`);
  },
};
