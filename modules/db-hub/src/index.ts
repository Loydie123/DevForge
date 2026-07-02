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

export interface ExecuteQueryDto {
  connectionId: string;
  query: string;
}
