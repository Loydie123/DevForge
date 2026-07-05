import { AnalyticsHubService } from './analytics-hub.service';
import { EventsGateway } from '../events/events.gateway';

const mockGateway = { broadcast: jest.fn(), server: null };

describe('AnalyticsHubService', () => {
  let service: AnalyticsHubService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnalyticsHubService(mockGateway as unknown as EventsGateway);
  });

  // ── recordPageView ─────────────────────────────────────────────────────────

  describe('recordPageView()', () => {
    it('should record a page view and return it', () => {
      const pv = service.recordPageView({
        path: '/dashboard',
        sessionId: 'sess-1',
      });
      expect(pv.path).toBe('/dashboard');
      expect(pv.sessionId).toBe('sess-1');
      expect(pv.id).toBeDefined();
      expect(pv.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should broadcast to WebSocket', () => {
      service.recordPageView({ path: '/api-hub', sessionId: 'sess-1' });
      expect(mockGateway.broadcast).toHaveBeenCalledWith(
        'analytics.page_view',
        expect.objectContaining({ path: '/api-hub' }),
      );
    });

    it('should cap buffer at 2000 page views', () => {
      for (let i = 0; i < 2100; i++) {
        service.recordPageView({ path: `/page-${i}`, sessionId: 'sess-1' });
      }
      const stats = service.getStats();
      expect(stats.totalPageViews).toBe(2000);
    });
  });

  // ── recordEvent ────────────────────────────────────────────────────────────

  describe('recordEvent()', () => {
    it('should record an event', () => {
      const ev = service.recordEvent({
        name: 'button.click',
        properties: { id: 'btn-1' },
      });
      expect(ev.name).toBe('button.click');
      expect(ev.properties).toEqual({ id: 'btn-1' });
    });

    it('should default properties to empty object', () => {
      const ev = service.recordEvent({ name: 'page.exit' });
      expect(ev.properties).toEqual({});
    });

    it('should cap buffer at 1000 events', () => {
      for (let i = 0; i < 1100; i++) {
        service.recordEvent({ name: `event-${i}` });
      }
      const stats = service.getStats();
      expect(stats.totalEvents).toBe(1000);
    });
  });

  // ── getStats ───────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should return zero stats on fresh instance', () => {
      const stats = service.getStats();
      expect(stats.pageViewsToday).toBe(0);
      expect(stats.totalPageViews).toBe(0);
      expect(stats.totalEvents).toBe(0);
    });

    it('should count unique visitors by sessionId', () => {
      service.recordPageView({ path: '/a', sessionId: 'alice' });
      service.recordPageView({ path: '/b', sessionId: 'alice' }); // same session
      service.recordPageView({ path: '/a', sessionId: 'bob' });

      const stats = service.getStats();
      expect(stats.uniqueVisitorsToday).toBe(2); // alice + bob
    });
  });

  // ── getTopPages ────────────────────────────────────────────────────────────

  describe('getTopPages()', () => {
    it('should rank pages by visit count', () => {
      service.recordPageView({ path: '/dashboard', sessionId: 's1' });
      service.recordPageView({ path: '/dashboard', sessionId: 's2' });
      service.recordPageView({ path: '/api-hub', sessionId: 's1' });

      const top = service.getTopPages(5);
      expect(top[0].path).toBe('/dashboard');
      expect(top[0].count).toBe(2);
      expect(top[1].path).toBe('/api-hub');
    });

    it('should respect the limit parameter', () => {
      ['/a', '/b', '/c', '/d', '/e'].forEach((p) =>
        service.recordPageView({ path: p, sessionId: 's' }),
      );
      expect(service.getTopPages(3)).toHaveLength(3);
    });
  });

  // ── getPageViewsOverTime ───────────────────────────────────────────────────

  describe('getPageViewsOverTime()', () => {
    it('should return 24 hourly buckets', () => {
      const buckets = service.getPageViewsOverTime();
      expect(buckets).toHaveLength(24);
    });

    it('current-hour bucket should reflect recent page views', () => {
      service.recordPageView({ path: '/test', sessionId: 's1' });
      const buckets = service.getPageViewsOverTime();
      const total = buckets.reduce((sum, b) => sum + b.count, 0);
      expect(total).toBeGreaterThanOrEqual(1);
    });
  });
});
