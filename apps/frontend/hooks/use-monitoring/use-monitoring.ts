"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { DevForgeEvents } from "@devforge/event-bus";
import {
  monitoringService,
  SystemMetrics,
  UptimeCheck,
} from "../../services/monitoring-service";
import { authService } from "../../services/auth-service";
import { TOKEN_KEY, WS_GATEWAY_URL } from "../../config/env";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000000";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  // Add check form
  const [isAddCheckOpen, setIsAddCheckOpen] = useState(false);
  const [checkName, setCheckName] = useState("");
  const [checkUrl, setCheckUrl] = useState("");
  const [checkInterval, setCheckInterval] = useState("60");

  // Selected check for detail view
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  // 1. Auth guard
  const {
    data: user,
    isLoading: isAuthLoading,
    error: authError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (authError) {
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [authError, router]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) router.push("/login");
  }, [router]);

  // 2. System metrics (poll every 5s)
  const { data: systemMetrics, isLoading: isLoadingSystem } =
    useQuery<SystemMetrics>({
      queryKey: ["system-metrics"],
      queryFn: () => monitoringService.getSystemMetrics(),
      enabled: !!user,
      refetchInterval: 5_000,
    });

  // 3. Uptime checks list (poll every 15s)
  const { data: uptimeChecks = [], isLoading: isLoadingChecks } = useQuery<
    UptimeCheck[]
  >({
    queryKey: ["uptime-checks"],
    queryFn: () => monitoringService.getUptimeChecks(DEFAULT_PROJECT_ID),
    enabled: !!user,
    refetchInterval: 15_000,
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

  // 6. WebSocket — listen for live uptime updates
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!user || !token) return;

    const socketInstance = io(WS_GATEWAY_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));

    socketInstance.on(
      DevForgeEvents.METRIC_UPDATED,
      (payload: LiveUptimeUpdate) => {
        if (payload.type === "uptime") {
          // Invalidate to refetch fresh results
          void queryClient.invalidateQueries({ queryKey: ["uptime-checks"] });
        }
      }
    );

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [user, queryClient]);

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
