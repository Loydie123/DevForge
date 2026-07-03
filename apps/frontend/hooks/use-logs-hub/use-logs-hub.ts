"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DevForgeEvents, LogPayload } from "@devforge/event-bus";
import { logsHubService, ErrorLog } from "../../services/logs-hub/logs-hub-service";
import { useWorkspace } from "../../components/workspace-context";
import { DEFAULT_PROJECT_ID } from "../../config/env";

export default function useLogsHub() {
  const queryClient = useQueryClient();
  const { user, isAuthLoading, isConnected, socket } = useWorkspace();

  const [logsList, setLogsList] = useState<LogPayload[]>([]);

  // Console Filters
  const [serviceFilter, setServiceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  // Form inputs
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [sourcePath, setSourcePath] = useState("");

  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  // 2. Fetch log sources list (poll every 10s)
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ["log-sources"],
    queryFn: () => logsHubService.getSources(DEFAULT_PROJECT_ID),
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // 3. Fetch error logs list (poll every 10s)
  const { data: errorLogs = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ["error-logs"],
    queryFn: () => logsHubService.getErrorLogs(DEFAULT_PROJECT_ID),
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // 4. WebSocket log listener on the global socket
  useEffect(() => {
    if (!socket) return;

    const handleLogCreated = (data: LogPayload) => {
      setLogsList((prev) => [data, ...prev].slice(0, 200));
    };

    socket.on(DevForgeEvents.LOG_CREATED, handleLogCreated);

    return () => {
      socket.off(DevForgeEvents.LOG_CREATED, handleLogCreated);
    };
  }, [socket]);

  // 5. Add Log Source Mutation
  const addSourceMutation = useMutation({
    mutationFn: () => logsHubService.addSource({
      projectId: DEFAULT_PROJECT_ID,
      name: sourceName,
      filePath: sourcePath,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["log-sources"] });
      setIsAddSourceOpen(false);
      setSourceName("");
      setSourcePath("");
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

  // 7. Delete Error Mutation
  const deleteErrorMutation = useMutation({
    mutationFn: (id: string) => logsHubService.deleteError(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["error-logs"] });
      setSelectedError(null);
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 8. Clear Errors Mutation
  const clearErrorsMutation = useMutation({
    mutationFn: () => logsHubService.clearErrors(DEFAULT_PROJECT_ID),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["error-logs"] });
      setSelectedError(null);
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // Filter logs logic
  const filteredLogs = logsList.filter((log) => {
    const matchesService = serviceFilter === "all" || log.service.toLowerCase() === serviceFilter.toLowerCase();
    const matchesLevel = levelFilter === "all" || log.level.toLowerCase() === levelFilter.toLowerCase();
    const matchesSearch = !searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesLevel && matchesSearch;
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
  };
}
