import { apiClient } from "../api-client";

export interface RouteStat {
  path: string;
  method: string;
  count: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
  errorRate: number;
}

export interface SlowQuery {
  id: string;
  sql: string;
  latencyMs: number;
  timestamp: number;
  params?: unknown[];
}

export interface PerformanceStats {
  avgResponseMs: number;
  p95ResponseMs: number;
  slowQueriesCount: number;
  totalRequests: number;
  errorRate: number;
  memoryUsageMb: number;
  cpuPercent: number;
}

export const performanceHubService = {
  async getStats(): Promise<PerformanceStats> {
    const res = await apiClient.get("/performance/stats");
    return res.data;
  },

  async getRouteStats(): Promise<RouteStat[]> {
    const res = await apiClient.get("/performance/routes");
    return res.data;
  },

  async getSlowQueries(limit = 50): Promise<SlowQuery[]> {
    const res = await apiClient.get(`/performance/slow-queries?limit=${limit}`);
    return res.data;
  },
};
