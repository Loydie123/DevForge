"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DevForgeEvents } from "@devforge/event-bus";
import {
  devopsHubService,
  DockerContainer,
  DockerStats,
  ContainerAction,
} from "../../services/devops-hub/devops-hub-service";
import { useWorkspace } from "../../components/workspace-context";

export interface LiveContainerMetric {
  Container: string;
  Name: string;
  CPUPerc: string;
  MemUsage: string;
  MemPerc: string;
  NetIO: string;
  BlockIO: string;
}

export default function useDevopsHub() {
  const queryClient = useQueryClient();
  const { user, isAuthLoading, isConnected, socket } = useWorkspace();

  const [liveMetrics, setLiveMetrics] = useState<
    Record<string, LiveContainerMetric>
  >({});
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    message: string;
    success: boolean;
  } | null>(null);

  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null
  );

  // 2. Fetch containers list (poll every 10s for state changes)
  const {
    data: containers = [],
    isLoading: isLoadingContainers,
    refetch: refetchContainers,
  } = useQuery({
    queryKey: ["docker-containers"],
    queryFn: () => devopsHubService.getContainers(),
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // 3. Fetch stats for selected container
  const { data: selectedStats, isLoading: isLoadingStats } =
    useQuery<DockerStats>({
      queryKey: ["container-stats", selectedContainerId],
      queryFn: () =>
        devopsHubService.getContainerStats(selectedContainerId!),
      enabled: !!user && !!selectedContainerId,
      refetchInterval: 5_000,
    });

  // 4. Container action mutation (start / stop / restart)
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: ContainerAction;
    }) => devopsHubService.controlContainer(id, action),
    onSuccess: (result, variables) => {
      setActionFeedback({
        id: variables.id,
        message: result.message,
        success: result.success,
      });
      // Invalidate containers list to refresh state
      void queryClient.invalidateQueries({
        queryKey: ["docker-containers"],
      });
      setTimeout(() => setActionFeedback(null), 3000);
    },
    onError: (err: Error, variables) => {
      setActionFeedback({
        id: variables.id,
        message: err.message ?? "Action failed",
        success: false,
      });
      setTimeout(() => setActionFeedback(null), 3000);
    },
  });

  const handleAction = useCallback(
    (id: string, action: ContainerAction) => {
      actionMutation.mutate({ id, action });
    },
    [actionMutation]
  );

  // 5. WebSocket — listen for live METRIC_UPDATED events
  useEffect(() => {
    if (!socket) return;

    const handleMetricUpdated = (payload: { containers: LiveContainerMetric[]; timestamp: number }) => {
      const metricMap: Record<string, LiveContainerMetric> = {};
      payload.containers.forEach((m) => {
        metricMap[m.Container] = m;
      });
      setLiveMetrics(metricMap);
    };

    socket.on(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);

    return () => {
      socket.off(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);
    };
  }, [socket]);

  // Helper: merge live metrics into containers
  const enrichedContainers = containers.map((c: DockerContainer) => ({
    ...c,
    live: liveMetrics[c.ID] ?? null,
  }));

  return {
    // Auth
    user,
    isAuthLoading,

    // Containers
    enrichedContainers,
    isLoadingContainers,
    refetchContainers,

    // Selected container stats
    selectedContainerId,
    setSelectedContainerId,
    selectedStats,
    isLoadingStats,

    // Container actions
    handleAction,
    isActioning: actionMutation.isPending,
    actionFeedback,

    // WebSocket
    isConnected,
  };
}
