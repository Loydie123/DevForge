"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  analyticsHubService,
  AnalyticsEvent,
} from "../../services/analytics-hub/analytics-hub-service";
import { useWorkspace } from "../../components/workspace-context";

export type AnalyticsTab = "overview" | "top-pages" | "events" | "page-views";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("devforge_session");
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("devforge_session", sid);
  }
  return sid;
}

export default function useAnalyticsHub() {
  const { user, isAuthLoading, socket } = useWorkspace();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [liveEvents, setLiveEvents] = useState<AnalyticsEvent[]>([]);
  const trackedPaths = useRef(new Set<string>());

  // Auto-track page views on route change
  useEffect(() => {
    if (!user || trackedPaths.current.has(pathname)) return;
    trackedPaths.current.add(pathname);
    analyticsHubService.recordPageView(pathname, getSessionId()).catch(() => null);
  }, [pathname, user]);

  // Live analytics events via WebSocket
  useEffect(() => {
    if (!socket) return;
    const handler = (ev: AnalyticsEvent) => {
      setLiveEvents((prev) => [ev, ...prev].slice(0, 100));
    };
    socket.on("analytics.event", handler);
    socket.on("analytics.page_view", (pv: { path: string; timestamp: number; id: string }) => {
      setLiveEvents((prev) => [{
        id: pv.id,
        name: "page.view",
        properties: { path: pv.path },
        timestamp: pv.timestamp,
      }, ...prev].slice(0, 100));
    });
    return () => {
      socket.off("analytics.event", handler);
      socket.off("analytics.page_view");
    };
  }, [socket]);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["analytics-stats"],
    queryFn: () => analyticsHubService.getStats(),
    enabled: !!user,
    refetchInterval: 8_000,
  });

  const { data: topPages = [], isLoading: isLoadingPages } = useQuery({
    queryKey: ["analytics-top-pages"],
    queryFn: () => analyticsHubService.getTopPages(),
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const { data: recentEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["analytics-events"],
    queryFn: () => analyticsHubService.getRecentEvents(),
    enabled: !!user && activeTab === "events",
    refetchInterval: 10_000,
  });

  const { data: hourlyData = [], isLoading: isLoadingHourly } = useQuery({
    queryKey: ["analytics-hourly"],
    queryFn: () => analyticsHubService.getPageViewsOverTime(),
    enabled: !!user && activeTab === "page-views",
    refetchInterval: 30_000,
  });

  const allEvents = liveEvents.length > 0 ? liveEvents : recentEvents;

  return {
    user,
    isAuthLoading,
    activeTab,
    setActiveTab,
    stats,
    isLoadingStats,
    topPages,
    isLoadingPages,
    allEvents,
    isLoadingEvents,
    hourlyData,
    isLoadingHourly,
  };
}
