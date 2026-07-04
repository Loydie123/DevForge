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
