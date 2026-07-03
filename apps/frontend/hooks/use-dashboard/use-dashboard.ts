"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import {
  DevForgeEvents,
  LogPayload,
  MetricPayload,
  ApiRequestPayload,
  ApiResponsePayload,
} from "@devforge/event-bus";

import { useWorkspace } from "../../components/workspace-context";
import { apiService } from "../../services/dashboard/api-service";
import { WS_GATEWAY_URL, TOKEN_KEY } from "../../config/env";

export default function useDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthLoading } = useWorkspace();
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogPayload[]>([]);
  const [metrics, setMetrics] = useState<MetricPayload | null>(null);

  // 2. Manage WebSocket connection when auth resolves
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!user || !token) return;

    // Connect to NestJS WebSocket Gateway with auth token
    const socketInstance = io(WS_GATEWAY_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket Gateway");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket Gateway");
    });

    // Listen to real-time process events
    socketInstance.on(DevForgeEvents.LOG_CREATED, (data: LogPayload) => {
      setLogs((prev) => [data, ...prev].slice(0, 50));
    });

    socketInstance.on(DevForgeEvents.METRIC_UPDATED, (data: MetricPayload) => {
      setMetrics(data);
    });

    socketInstance.on(DevForgeEvents.API_REQUEST, (data: ApiRequestPayload) => {
      const requestLog: LogPayload = {
        service: "api-hub",
        level: "info",
        message: `📡 [API REQ] ${data.method} -> ${data.url} (ID: ${data.requestId})`,
        timestamp: data.timestamp,
      };
      setLogs((prev) => [requestLog, ...prev].slice(0, 50));
    });

    socketInstance.on(DevForgeEvents.API_RESPONSE, (data: ApiResponsePayload) => {
      const responseLog: LogPayload = {
        service: "api-hub",
        level: data.statusCode >= 400 ? "error" : "info",
        message: `📥 [API RES] Status: ${data.statusCode} | Latency: ${data.latencyMs}ms (ID: ${data.requestId})`,
        timestamp: data.timestamp,
      };
      setLogs((prev) => [responseLog, ...prev].slice(0, 50));
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

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

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    router.push("/login");
  };

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
    handleLogout
  };
}
