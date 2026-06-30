"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  DevForgeEvents,
  LogPayload,
  MetricPayload,
  ApiRequestPayload,
  ApiResponsePayload,
} from "@devforge/event-bus";

import { authService } from "../../services/auth-service";
import { apiService } from "../../services/api-service";
import { WS_GATEWAY_URL, TOKEN_KEY } from "../../config/env";

export default function useDashboard() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogPayload[]>([]);
  const [metrics, setMetrics] = useState<MetricPayload | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; name?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    const loadProfileAndSockets = async () => {
      try {
        const profile = await authService.getProfile(token);
        setUser(profile);
        setIsAuthLoading(false);

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
      } catch (err) {
        console.error("Auth initialization failed:", err);
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    };

    void loadProfileAndSockets();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [router]);

  const triggerMockEvent = async () => {
    setIsTriggering(true);
    try {
      await apiService.triggerMockEvent();
    } catch (err) {
      console.error("Failed to trigger mock event", err);
    } finally {
      setTimeout(() => setIsTriggering(false), 300);
    }
  };

  const executeApiHubRequest = async () => {
    setIsExecuting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || "";
      await apiService.executeApiHubRequest(token);
    } catch (err) {
      console.error("Failed to execute request", err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/login");
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    isConnected,
    logs,
    metrics,
    isTriggering,
    isExecuting,
    user,
    isAuthLoading,
    triggerMockEvent,
    executeApiHubRequest,
    handleLogout,
    clearLogs,
  };
}
