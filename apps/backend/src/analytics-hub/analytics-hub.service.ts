import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsGateway } from '../events/events.gateway';
import {
  PageView,
  AnalyticsEvent,
  AnalyticsStats,
  TopPage,
  HourlyBucket,
  RecordPageViewDto,
  RecordEventDto,
} from '@devforge/analytics-hub';
import { DevForgeEvents } from '@devforge/event-bus';

const MAX_PAGE_VIEWS = 2000;
const MAX_EVENTS = 1000;

@Injectable()
export class AnalyticsHubService {
  private pageViews: PageView[] = [];
  private events: AnalyticsEvent[] = [];

  constructor(private readonly eventsGateway: EventsGateway) {}

  private uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  private startOfDay(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  recordPageView(dto: RecordPageViewDto): PageView {
    const pv: PageView = { id: this.uid(), timestamp: Date.now(), ...dto };
    this.pageViews.unshift(pv);
    if (this.pageViews.length > MAX_PAGE_VIEWS) {
      this.pageViews = this.pageViews.slice(0, MAX_PAGE_VIEWS);
    }
    this.eventsGateway.broadcast('analytics.page_view', pv);
    return pv;
  }

  recordEvent(dto: RecordEventDto): AnalyticsEvent {
    const ev: AnalyticsEvent = {
      id: this.uid(),
      name: dto.name,
      properties: dto.properties ?? {},
      userId: dto.userId,
      sessionId: dto.sessionId,
      timestamp: Date.now(),
    };
    this.events.unshift(ev);
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(0, MAX_EVENTS);
    }
    this.eventsGateway.broadcast('analytics.event', ev);
    return ev;
  }

  // Auto-capture backend events into analytics stream
  @OnEvent(DevForgeEvents.ERROR_THROWN)
  onError(payload: { service: string; severity: string }) {
    this.recordEvent({
      name: 'error.thrown',
      properties: { service: payload.service, severity: payload.severity },
    });
  }

  @OnEvent(DevForgeEvents.DB_QUERY)
  onDbQuery(payload: { latencyMs: number }) {
    if (payload.latencyMs > 500) {
      this.recordEvent({
        name: 'db.slow_query',
        properties: { latencyMs: payload.latencyMs },
      });
    }
  }

  getStats(): AnalyticsStats {
    const sod = this.startOfDay();
    const todayPvs = this.pageViews.filter((p) => p.timestamp >= sod);
    const todayEvs = this.events.filter((e) => e.timestamp >= sod);
    const uniqueVisitors = new Set(todayPvs.map((p) => p.sessionId)).size;
    const activeUsers = this.eventsGateway.server?.engine?.clientsCount ?? 0;

    return {
      pageViewsToday: todayPvs.length,
      uniqueVisitorsToday: uniqueVisitors,
      activeUsers,
      eventsToday: todayEvs.length,
      totalPageViews: this.pageViews.length,
      totalEvents: this.events.length,
    };
  }

  getTopPages(limit = 10): TopPage[] {
    const counts = new Map<string, number>();
    for (const pv of this.pageViews) {
      counts.set(pv.path, (counts.get(pv.path) ?? 0) + 1);
    }
    const total = this.pageViews.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path, count]) => ({
        path,
        count,
        pct: Math.round((count / total) * 100),
      }));
  }

  getRecentEvents(limit = 50): AnalyticsEvent[] {
    return this.events.slice(0, limit);
  }

  getPageViewsOverTime(): HourlyBucket[] {
    const now = Date.now();
    const hours: HourlyBucket[] = [];

    for (let i = 23; i >= 0; i--) {
      const start = now - i * 3600_000;
      const end = start + 3600_000;
      const label = new Date(start).toLocaleTimeString('en-US', {
        hour: '2-digit',
        hour12: false,
      });
      const count = this.pageViews.filter(
        (p) => p.timestamp >= start && p.timestamp < end,
      ).length;
      hours.push({ hour: label, count });
    }

    return hours;
  }
}
