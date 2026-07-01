import { apiClient } from "./api-client";

export interface DbConnectionDto {
  projectId: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
}

export interface DbConnection {
  id: string;
  projectId: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  createdAt: string;
}

export interface QueryResultDto {
  status: "success" | "error";
  latencyMs: number;
  rowsCount: number;
  error: string | null;
  result: unknown;
}

export interface DbQueryHistoryItem {
  id: string;
  connectionId: string;
  query: string;
  latencyMs: number;
  status: string;
  error: string | null;
  rowsCount: number;
  createdAt: string;
}

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
