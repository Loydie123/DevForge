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
