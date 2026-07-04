import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DevForgeEvents } from '@devforge/event-bus';
import type { DbQueryPayload } from '@devforge/event-bus';
import { SecurityCenterService } from '../security-center/security-center.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import {
  RouteStat,
  SlowQuery,
  PerformanceStats,
} from '@devforge/performance-hub';

const SLOW_QUERY_THRESHOLD_MS = 200;
const MAX_SLOW_QUERIES = 200;

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

@Injectable()
export class PerformanceHubService {
  private slowQueries: SlowQuery[] = [];

  constructor(
    private readonly security: SecurityCenterService,
    private readonly monitoring: MonitoringService,
  ) {}

  @OnEvent(DevForgeEvents.DB_QUERY)
  onDbQuery(payload: DbQueryPayload) {
    if (payload.latencyMs >= SLOW_QUERY_THRESHOLD_MS) {
      const entry: SlowQuery = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sql: payload.sql,
        latencyMs: payload.latencyMs,
        timestamp: payload.timestamp,
        params: payload.params,
      };
      this.slowQueries.unshift(entry);
      if (this.slowQueries.length > MAX_SLOW_QUERIES) {
        this.slowQueries = this.slowQueries.slice(0, MAX_SLOW_QUERIES);
      }
    }
  }

  getRouteStats(): RouteStat[] {
    const auditLog = this.security.getAuditLog(500);
    const routeMap = new Map<string, { durations: number[]; errors: number }>();

    for (const entry of auditLog) {
      // Normalise dynamic segments like /api/users/123 → /api/users/:id
      const normPath = entry.path
        .replace(/\/[0-9a-f-]{8,}/gi, '/:id')
        .split('?')[0];
      const key = `${entry.method} ${normPath}`;
      const existing = routeMap.get(key) ?? { durations: [], errors: 0 };
      existing.durations.push(entry.durationMs);
      if (entry.statusCode >= 400) existing.errors++;
      routeMap.set(key, existing);
    }

    return [...routeMap.entries()]
      .map(([key, data]) => {
        const [method, ...pathParts] = key.split(' ');
        const sorted = [...data.durations].sort((a, b) => a - b);
        return {
          path: pathParts.join(' '),
          method,
          count: sorted.length,
          avgMs: Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length),
          p50Ms: percentile(sorted, 50),
          p95Ms: percentile(sorted, 95),
          p99Ms: percentile(sorted, 99),
          minMs: sorted[0],
          maxMs: sorted[sorted.length - 1],
          errorRate: Math.round((data.errors / sorted.length) * 100),
        };
      })
      .sort((a, b) => b.p95Ms - a.p95Ms);
  }

  getSlowQueries(limit = 50): SlowQuery[] {
    return this.slowQueries.slice(0, limit);
  }

  async getStats(): Promise<PerformanceStats> {
    const auditLog = this.security.getAuditLog(500);
    const durations = auditLog.map((e) => e.durationMs).sort((a, b) => a - b);
    const errors = auditLog.filter((e) => e.statusCode >= 400).length;

    const sysMetrics = await this.monitoring.getSystemMetrics();

    return {
      avgResponseMs: durations.length
        ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length)
        : 0,
      p95ResponseMs: percentile(durations, 95),
      slowQueriesCount: this.slowQueries.length,
      totalRequests: auditLog.length,
      errorRate: durations.length
        ? Math.round((errors / durations.length) * 100)
        : 0,
      memoryUsageMb: Math.round(sysMetrics.memory.usedBytes / 1024 / 1024),
      cpuPercent: sysMetrics.cpu.usedPercent,
    };
  }
}
