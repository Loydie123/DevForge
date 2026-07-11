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
  isBanned: boolean;
  banReason?: string;
  lastAttackSignature?: string;
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

export interface JwtInspectDto {
  token: string;
  verify?: boolean;
}

export interface JwtInspectResult {
  valid: boolean;
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  expiresAt: string | null;
  isExpired: boolean;
  error: string | null;
}
