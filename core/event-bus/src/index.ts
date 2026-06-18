export enum DevForgeEvents {
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',
  DB_QUERY = 'db.query',
  ERROR_THROWN = 'error.thrown',
  LOG_CREATED = 'log.created',
  METRIC_UPDATED = 'metric.updated'
}

export interface ApiRequestPayload {
  requestId: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
}

export interface ApiResponsePayload {
  requestId: string;
  statusCode: number;
  latencyMs: number;
  body?: any;
  timestamp: number;
}

export interface DbQueryPayload {
  queryId: string;
  sql: string;
  params?: any[];
  latencyMs: number;
  affectedRows?: number;
  timestamp: number;
}

export interface ErrorPayload {
  service: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface LogPayload {
  service: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  timestamp: number;
}

export interface MetricPayload {
  cpuUsage: number;
  memoryUsageBytes: number;
  uptimeSeconds: number;
  timestamp: number;
}
