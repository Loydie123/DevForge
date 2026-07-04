import { apiClient } from "../api-client";

export interface AuditEvent {
  id: string;
  timestamp: number;
  ip: string;
  method: string;
  path: string;
  statusCode: number;
  userId?: string;
  userEmail?: string;
  durationMs: number;
}

export interface IpStat {
  ip: string;
  requestCount: number;
  lastSeen: number;
  isSuspicious: boolean;
  paths: string[];
}

export interface SecurityStats {
  totalRequests: number;
  requestsLastMinute: number;
  suspiciousIps: number;
  uniqueIps: number;
  auditEventsToday: number;
  topPaths: Array<{ path: string; count: number }>;
}

export interface JwtInspectResult {
  valid: boolean;
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  expiresAt: string | null;
  isExpired: boolean;
  error: string | null;
}

export const securityCenterService = {
  async getStats(): Promise<SecurityStats> {
    const res = await apiClient.get<SecurityStats>("/security/stats");
    return res.data;
  },

  async getAuditLog(limit = 100): Promise<AuditEvent[]> {
    const res = await apiClient.get<AuditEvent[]>("/security/audit-log", { params: { limit } });
    return res.data;
  },

  async getIpStats(): Promise<IpStat[]> {
    const res = await apiClient.get<IpStat[]>("/security/ip-stats");
    return res.data;
  },

  async inspectJwt(token: string, verify = false): Promise<JwtInspectResult> {
    const res = await apiClient.post<JwtInspectResult>("/security/jwt/inspect", { token, verify });
    return res.data;
  },
};
