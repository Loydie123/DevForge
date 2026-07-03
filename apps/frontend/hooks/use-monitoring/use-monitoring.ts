"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DevForgeEvents } from "@devforge/event-bus";
import {
  monitoringService,
  SystemMetrics,
  UptimeCheck,
} from "../../services/monitoring/monitoring-service";
import { useWorkspace } from "../../components/workspace-context";
import { DEFAULT_PROJECT_ID } from "../../config/env";

interface LiveUptimeUpdate {
  type: "uptime";
  check: {
    id: string;
    name: string;
    url: string;
    status: string;
    latencyMs: number | null;
    projectId: string;
  };
  timestamp: number;
}

export default function useMonitoring() {
  const queryClient = useQueryClient();
  const { user, isAuthLoading, isConnected, socket } = useWorkspace();

  // Add check form
  const [isAddCheckOpen, setIsAddCheckOpen] = useState(false);
  const [checkName, setCheckName] = useState("");
  const [checkUrl, setCheckUrl] = useState("");
  const [checkInterval, setCheckInterval] = useState("60");

  // Selected check for detail view
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  // 2. System metrics (poll every 10s)
  const { data: systemMetrics, isLoading: isLoadingSystem } =
    useQuery<SystemMetrics>({
      queryKey: ["system-metrics"],
      queryFn: () => monitoringService.getSystemMetrics(),
      enabled: !!user,
      refetchInterval: 10_000,
    });

  // 3. Uptime checks list (poll every 10s)
  const { data: uptimeChecks = [], isLoading: isLoadingChecks } = useQuery<
    UptimeCheck[]
  >({
    queryKey: ["uptime-checks"],
    queryFn: () => monitoringService.getUptimeChecks(DEFAULT_PROJECT_ID),
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // 4. Create uptime check mutation
  const createCheckMutation = useMutation({
    mutationFn: () =>
      monitoringService.createUptimeCheck({
        projectId: DEFAULT_PROJECT_ID,
        name: checkName,
        url: checkUrl,
        interval: parseInt(checkInterval, 10) || 60,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["uptime-checks"] });
      setIsAddCheckOpen(false);
      setCheckName("");
      setCheckUrl("");
      setCheckInterval("60");
    },
  });

  // 5. Delete uptime check mutation
  const deleteCheckMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteUptimeCheck(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["uptime-checks"] });
      setSelectedCheckId(null);
    },
  });

  // 6. WebSocket — listen for live uptime updates on the global socket
  useEffect(() => {
    if (!socket) return;

    const handleMetricUpdated = (payload: LiveUptimeUpdate) => {
      if (payload.type === "uptime") {
        // Invalidate to refetch fresh results
        void queryClient.invalidateQueries({ queryKey: ["uptime-checks"] });
      }
    };

    socket.on(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);

    return () => {
      socket.off(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);
    };
  }, [socket, queryClient]);

  // Selected check details
  const selectedCheck = uptimeChecks.find((c) => c.id === selectedCheckId);

  return {
    // Auth
    user,
    isAuthLoading,
    isConnected,

    // System metrics
    systemMetrics,
    isLoadingSystem,

    // Uptime checks
    uptimeChecks,
    isLoadingChecks,
    selectedCheckId,
    setSelectedCheckId,
    selectedCheck,

    // Add check form
    isAddCheckOpen,
    setIsAddCheckOpen,
    checkName,
    setCheckName,
    checkUrl,
    setCheckUrl,
    checkInterval,
    setCheckInterval,
    handleCreateCheck: () => createCheckMutation.mutate(),
    isCreatingCheck: createCheckMutation.isPending,

    // Delete check
    handleDeleteCheck: (id: string) => deleteCheckMutation.mutate(id),
    isDeletingCheck: deleteCheckMutation.isPending,
  };
}
