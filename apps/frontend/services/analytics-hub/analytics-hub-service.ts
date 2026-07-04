import { apiClient } from "../api-client";

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

export const analyticsHubService = {
  async getStats(): Promise<AnalyticsStats> {
    const res = await apiClient.get<AnalyticsStats>("/analytics/stats");
    return res.data;
  },

  async getTopPages(limit = 10): Promise<TopPage[]> {
    const res = await apiClient.get<TopPage[]>("/analytics/top-pages", { params: { limit } });
    return res.data;
  },

  async getRecentEvents(limit = 50): Promise<AnalyticsEvent[]> {
    const res = await apiClient.get<AnalyticsEvent[]>("/analytics/events", { params: { limit } });
    return res.data;
  },

  async getPageViewsOverTime(): Promise<HourlyBucket[]> {
    const res = await apiClient.get<HourlyBucket[]>("/analytics/page-views-over-time");
    return res.data;
  },

  async recordPageView(path: string, sessionId: string): Promise<void> {
    await apiClient.post("/analytics/page-view", { path, sessionId });
  },

  async recordEvent(name: string, properties?: Record<string, unknown>): Promise<void> {
    await apiClient.post("/analytics/event", { name, properties });
  },
};
