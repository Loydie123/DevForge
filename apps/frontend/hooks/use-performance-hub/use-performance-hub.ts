"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { performanceHubService } from "../../services/performance-hub/performance-hub-service";
import { useWorkspace } from "../../components/workspace-context";

export type PerformanceTab = "overview" | "routes" | "slow-queries";

export default function usePerformanceHub() {
  const { isAuthLoading } = useWorkspace();
  const [activeTab, setActiveTab] = useState<PerformanceTab>("overview");

  const statsQuery = useQuery({
    queryKey: ["performance-stats"],
    queryFn: () => performanceHubService.getStats(),
    enabled: !isAuthLoading,
    refetchInterval: 10_000,
  });

  const routesQuery = useQuery({
    queryKey: ["performance-routes"],
    queryFn: () => performanceHubService.getRouteStats(),
    enabled: !isAuthLoading,
    refetchInterval: 15_000,
  });

  const slowQueriesQuery = useQuery({
    queryKey: ["performance-slow-queries"],
    queryFn: () => performanceHubService.getSlowQueries(50),
    enabled: !isAuthLoading,
    refetchInterval: 15_000,
  });

  return {
    activeTab,
    setActiveTab,
    stats: statsQuery.data ?? null,
    routes: routesQuery.data ?? [],
    slowQueries: slowQueriesQuery.data ?? [],
    isLoading: statsQuery.isLoading || routesQuery.isLoading,
    isError: statsQuery.isError,
  };
}
