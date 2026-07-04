export interface PageView {
  id: string;
  path: string;
  userId?: string;
  sessionId: string;
  ip?: string;
  timestamp: number;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

export interface HourlyBucket {
  hour: string;
  count: number;
}

export interface AnalyticsStats {
  pageViewsToday: number;
  uniqueVisitorsToday: number;
  activeUsers: number;
  eventsToday: number;
  totalPageViews: number;
  totalEvents: number;
}

export interface TopPage {
  path: string;
  count: number;
  pct: number;
}

export interface RecordPageViewDto {
  path: string;
  userId?: string;
  sessionId: string;
  ip?: string;
}

export interface RecordEventDto {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}
