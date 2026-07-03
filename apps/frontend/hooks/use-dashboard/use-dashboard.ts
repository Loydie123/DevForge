"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  DevForgeEvents,
  LogPayload,
  MetricPayload,
  ApiRequestPayload,
  ApiResponsePayload,
} from "@devforge/event-bus";

import { useWorkspace } from "../../components/workspace-context";
import { apiService } from "../../services/dashboard/api-service";

export default function useDashboard() {
  const { user, isAuthLoading, isConnected, socket } = useWorkspace();
  
  const [logs, setLogs] = useState<LogPayload[]>([]);
  const [metrics, setMetrics] = useState<MetricPayload | null>(null);

  // 2. Manage WebSocket listeners on the global socket
  useEffect(() => {
    if (!socket) return;

    const handleLogCreated = (data: LogPayload) => {
      setLogs((prev) => [data, ...prev].slice(0, 50));
    };

    const handleMetricUpdated = (data: MetricPayload) => {
      setMetrics(data);
    };

    const handleApiRequest = (data: ApiRequestPayload) => {
      const requestLog: LogPayload = {
        service: "api-hub",
        level: "info",
        message: `📡 [API REQ] ${data.method} -> ${data.url} (ID: ${data.requestId})`,
        timestamp: data.timestamp,
      };
      setLogs((prev) => [requestLog, ...prev].slice(0, 50));
    };

    const handleApiResponse = (data: ApiResponsePayload) => {
      const responseLog: LogPayload = {
        service: "api-hub",
        level: data.statusCode >= 400 ? "error" : "info",
        message: `📥 [API RES] Status: ${data.statusCode} | Latency: ${data.latencyMs}ms (ID: ${data.requestId})`,
        timestamp: data.timestamp,
      };
      setLogs((prev) => [responseLog, ...prev].slice(0, 50));
    };

    socket.on(DevForgeEvents.LOG_CREATED, handleLogCreated);
    socket.on(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);
    socket.on(DevForgeEvents.API_REQUEST, handleApiRequest);
    socket.on(DevForgeEvents.API_RESPONSE, handleApiResponse);

    return () => {
      socket.off(DevForgeEvents.LOG_CREATED, handleLogCreated);
      socket.off(DevForgeEvents.METRIC_UPDATED, handleMetricUpdated);
      socket.off(DevForgeEvents.API_REQUEST, handleApiRequest);
      socket.off(DevForgeEvents.API_RESPONSE, handleApiResponse);
    };
  }, [socket]);

  // 3. Trigger Mock Event Mutation
  const triggerMockMutation = useMutation({
    mutationFn: () => apiService.triggerMockEvent(),
    onError: (err) => {
      console.error("Failed to trigger mock event:", err.message);
    }
  });

  // 4. Execute Api Hub Request Mutation
  const executeApiMutation = useMutation({
    mutationFn: () => apiService.executeApiHubRequest(),
    onError: (err) => {
      console.error("Failed to execute api hub request:", err.message);
    }
  });

  return {
    user: user || null,
    isAuthLoading,
    isConnected,
    logs,
    clearLogs: () => setLogs([]),
    metrics,
    isTriggering: triggerMockMutation.isPending,
    isExecuting: executeApiMutation.isPending,
    triggerMockEvent: () => triggerMockMutation.mutate(),
    executeApiHubRequest: () => executeApiMutation.mutate(),
  };
}
