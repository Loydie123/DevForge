"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { DevForgeEvents, LogPayload } from "@devforge/event-bus";
import { logsHubService, ErrorLog } from "../../services/logs-hub/logs-hub-service";
import { useWorkspace } from "../../components/workspace-context";
import { TOKEN_KEY, WS_GATEWAY_URL } from "../../config/env";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000000";

export default function useLogsHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthLoading } = useWorkspace();

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logsList, setLogsList] = useState<LogPayload[]>([]);

  // Console Filters
  const [serviceFilter, setServiceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  // Add Source Form states
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [sourcePath, setSourcePath] = useState("");

  // Detailed error modal
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  // 2. Fetch Watched Log Sources
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ["log-sources"],
    queryFn: () => logsHubService.getSources(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  // 3. Fetch Recorded Errors list
  const { data: errorLogs = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ["error-logs"],
    queryFn: () => logsHubService.getErrorLogs(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  // 4. WebSocket log listener
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!user || !token) return;

    const socketInstance = io(WS_GATEWAY_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Logs Hub: Connected to WebSocket Gateway");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Logs Hub: Disconnected from WebSocket Gateway");
    });

    // Listen to live logs stream
    socketInstance.on(DevForgeEvents.LOG_CREATED, (data: LogPayload) => {
      setLogsList((prev) => [data, ...prev].slice(0, 200));
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  // 5. Add Log Source Mutation
  const addSourceMutation = useMutation({
    mutationFn: () => logsHubService.addSource({
      projectId: DEFAULT_PROJECT_ID,
      name: sourceName,
      filePath: sourcePath,
    }),
    onSuccess: () => {
      setSourceName("");
      setSourcePath("");
      setIsAddSourceOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["log-sources"] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 6. Delete Log Source Mutation
  const deleteSourceMutation = useMutation({
    mutationFn: (id: string) => logsHubService.deleteSource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["log-sources"] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 7. Delete Single Error Mutation
  const deleteErrorMutation = useMutation({
    mutationFn: (id: string) => logsHubService.deleteError(id),
    onSuccess: () => {
      setSelectedError(null);
      void queryClient.invalidateQueries({ queryKey: ["error-logs"] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 8. Clear All Errors Mutation
  const clearErrorsMutation = useMutation({
    mutationFn: () => logsHubService.clearErrors(DEFAULT_PROJECT_ID),
    onSuccess: () => {
      setSelectedError(null);
      void queryClient.invalidateQueries({ queryKey: ["error-logs"] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // Derived filtered logs
  const filteredLogs = logsList.filter((log) => {
    const serviceMatch = serviceFilter === "all" || log.service.toLowerCase() === serviceFilter.toLowerCase();
    const levelMatch = levelFilter === "all" || log.level.toLowerCase() === levelFilter.toLowerCase();
    const textMatch = !searchQuery.trim() || log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return serviceMatch && levelMatch && textMatch;
  });

  // Download filtered logs stream
  const handleDownloadLogs = () => {
    if (filteredLogs.length === 0) return;
    const text = filteredLogs
      .map((log) => `[${new Date(log.timestamp).toISOString()}] [${log.service.toUpperCase()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n");
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devforge-logs-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    router.push("/login");
  };

  return {
    user: user || null,
    isAuthLoading,
    isConnected,
    logs: filteredLogs,
    rawLogsLength: logsList.length,

    // Sources & Errors CRUD
    sources,
    isLoadingSources,
    errorLogs,
    isLoadingErrors,
    selectedError,
    setSelectedError,

    // Controls
    serviceFilter,
    setServiceFilter,
    levelFilter,
    setLevelFilter,
    searchQuery,
    setSearchQuery,
    autoScroll,
    setAutoScroll,

    // Form inputs
    isAddSourceOpen,
    setIsAddSourceOpen,
    sourceName,
    setSourceName,
    sourcePath,
    setSourcePath,

    // Mutate triggers
    handleAddSource: () => addSourceMutation.mutate(),
    handleDeleteSource: (id: string) => deleteSourceMutation.mutate(id),
    handleDeleteError: (id: string) => deleteErrorMutation.mutate(id),
    handleClearErrors: () => clearErrorsMutation.mutate(),

    // Console trigger actions
    handleClearConsole: () => setLogsList([]),
    handleDownloadLogs,
    handleLogout
  };
}
