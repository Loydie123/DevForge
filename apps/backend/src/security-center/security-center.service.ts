import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  AuditEvent,
  IpStat,
  SecurityStats,
  JwtInspectResult,
} from '@devforge/security-center';

const MAX_AUDIT_SIZE = 500;
const SUSPICIOUS_THRESHOLD = 100;
const WINDOW_MS = 60_000;

@Injectable()
export class SecurityCenterService {
  private auditLog: AuditEvent[] = [];
  private ipMap = new Map<
    string,
    { count: number; lastSeen: number; paths: string[] }
  >();

  private readonly jwtSecret =
    process.env.JWT_SECRET || 'devforge-super-secret-key-2026';

  // Called by the middleware on every request
  recordRequest(event: Omit<AuditEvent, 'id'>) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.auditLog.unshift({ ...event, id });
    if (this.auditLog.length > MAX_AUDIT_SIZE) {
      this.auditLog = this.auditLog.slice(0, MAX_AUDIT_SIZE);
    }

    const entry = this.ipMap.get(event.ip) ?? {
      count: 0,
      lastSeen: 0,
      paths: [],
    };
    entry.count++;
    entry.lastSeen = event.timestamp;
    if (!entry.paths.includes(event.path))
      entry.paths = [event.path, ...entry.paths].slice(0, 10);
    this.ipMap.set(event.ip, entry);
  }

  getAuditLog(limit = 100): AuditEvent[] {
    return this.auditLog.slice(0, limit);
  }

  getIpStats(): IpStat[] {
    const now = Date.now();
    const stats: IpStat[] = [];

    for (const [ip, data] of this.ipMap.entries()) {
      const recentRequests = this.auditLog.filter(
        (e) => e.ip === ip && now - e.timestamp < WINDOW_MS,
      ).length;

      stats.push({
        ip,
        requestCount: data.count,
        lastSeen: data.lastSeen,
        isSuspicious: recentRequests >= SUSPICIOUS_THRESHOLD,
        paths: data.paths,
      });
    }

    return stats.sort((a, b) => b.requestCount - a.requestCount);
  }

  getStats(): SecurityStats {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const requestsLastMinute = this.auditLog.filter(
      (e) => now - e.timestamp < WINDOW_MS,
    ).length;

    const auditEventsToday = this.auditLog.filter(
      (e) => e.timestamp >= startOfDay.getTime(),
    ).length;

    const ipStats = this.getIpStats();
    const suspiciousIps = ipStats.filter((s) => s.isSuspicious).length;

    const pathCounts = new Map<string, number>();
    for (const event of this.auditLog) {
      const base = event.path.split('?')[0];
      pathCounts.set(base, (pathCounts.get(base) ?? 0) + 1);
    }
    const topPaths = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    return {
      totalRequests: this.auditLog.length,
      requestsLastMinute,
      suspiciousIps,
      uniqueIps: this.ipMap.size,
      auditEventsToday,
      topPaths,
    };
  }

  inspectJwt(token: string, verify = false): JwtInspectResult {
    try {
      let header: Record<string, unknown> | null = null;
      let payload: Record<string, unknown> | null = null;
      let isExpired = false;
      let expiresAt: string | null = null;

      const decoded = jwt.decode(token, { complete: true });

      if (!decoded) {
        return {
          valid: false,
          header: null,
          payload: null,
          expiresAt: null,
          isExpired: false,
          error: 'Invalid JWT format.',
        };
      }

      header = decoded.header as unknown as Record<string, unknown>;
      payload = decoded.payload as Record<string, unknown>;

      if (payload['exp']) {
        const expMs = (payload['exp'] as number) * 1000;
        expiresAt = new Date(expMs).toISOString();
        isExpired = Date.now() > expMs;
      }

      if (verify) {
        jwt.verify(token, this.jwtSecret);
      }

      return {
        valid: true,
        header,
        payload,
        expiresAt,
        isExpired,
        error: null,
      };
    } catch (err) {
      const e = err as Error;
      const isExpiredErr = e.name === 'TokenExpiredError';
      try {
        const decoded = jwt.decode(token, { complete: true });
        const payload = decoded?.payload as Record<string, unknown> | null;
        const exp = payload?.['exp'] as number | undefined;
        return {
          valid: false,
          header: (decoded?.header as unknown as Record<string, unknown>) ?? null,
          payload,
          expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
          isExpired: isExpiredErr,
          error: e.message,
        };
      } catch {
        return {
          valid: false,
          header: null,
          payload: null,
          expiresAt: null,
          isExpired: false,
          error: e.message,
        };
      }
    }
  }
}
