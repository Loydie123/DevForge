"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  apiHubService, 
  SaveRequestDto, 
  HistoryItem, 
  SavedRequest 
} from "../../../services/api-hub/api-hub-service";
import { authService } from "../../../services/auth/auth-service";
import { TOKEN_KEY, DEFAULT_PROJECT_ID } from "../../../config/env";

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface ApiResponseData {
  status: number;
  statusText: string;
  latencyMs: number;
  sizeBytes: number;
  body: string;
  headers: Record<string, string>;
}

export default function useApiHub() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Active Composer State
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  
  // Execution Output states
  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // UI Tabs State
  const [composerTab, setComposerTab] = useState<"headers" | "body">("headers");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [sidebarTab, setSidebarTab] = useState<"collections" | "history">("collections");

  // Input states for creating entities
  const [newCollectionName, setNewCollectionName] = useState("");

  // 1. Fetch User Profile via React Query
  const { data: user, isLoading: isAuthLoading, error: authError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: Infinity,
  });

  // Handle auth redirection
  useEffect(() => {
    if (authError) {
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [authError, router]);

  // Check token presence on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // 2. Fetch Collections via React Query
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiHubService.getCollections(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  // 3. Fetch History via React Query
  const { data: historyList = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["api-history"],
    queryFn: () => apiHubService.getHistory(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  // Sort history: latest first
  const sortedHistory = [...historyList].sort(
    (a: HistoryItem, b: HistoryItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // 4. Create Collection Mutation
  const createColMutation = useMutation({
    mutationFn: () => apiHubService.createCollection(DEFAULT_PROJECT_ID, newCollectionName),
    onSuccess: () => {
      setNewCollectionName("");
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err) => {
      console.error("Failed to create collection:", err.message);
    }
  });

  // 5. Delete Collection Mutation
  const deleteColMutation = useMutation({
    mutationFn: (id: string) => apiHubService.deleteCollection(DEFAULT_PROJECT_ID, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err) => {
      console.error("Failed to delete collection:", err.message);
    }
  });

  // 6. Save Request Mutation
  const saveReqMutation = useMutation({
    mutationFn: ({ collectionId, name }: { collectionId: string; name: string }) => {
      const headersDict: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          headersDict[h.key.trim()] = h.value;
        }
      });

      const dto: SaveRequestDto = {
        collectionId,
        name: name || "New Saved Request",
        method,
        url,
        headers: JSON.stringify(headersDict),
        body: body || undefined
      };
      return apiHubService.saveRequest(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err) => {
      console.error("Failed to save request:", err.message);
    }
  });

  // 7. Delete Request Mutation
  const deleteReqMutation = useMutation({
    mutationFn: (id: string) => apiHubService.deleteRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err) => {
      console.error("Failed to delete request:", err.message);
    }
  });

  // 8. Clear History Mutation
  const clearHistoryMutation = useMutation({
    mutationFn: () => apiHubService.clearHistory(DEFAULT_PROJECT_ID),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-history"] });
    },
    onError: (err) => {
      console.error("Failed to clear history:", err.message);
    }
  });

  // 9. Execute Request Mutation
  const runReqMutation = useMutation({
    mutationFn: () => {
      const headersDict: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          headersDict[h.key.trim()] = h.value;
        }
      });

      let parsedBody: unknown = undefined;
      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body.trim());
        } catch {
          parsedBody = body; // fallback to raw string
        }
      }

      return apiHubService.execute({
        projectId: DEFAULT_PROJECT_ID,
        method,
        url,
        headers: headersDict,
        body: parsedBody
      });
    },
    onSuccess: (resData) => {
      setResponse({
        status: resData.status,
        statusText: getStatusText(resData.status),
        latencyMs: resData.latencyMs,
        sizeBytes: resData.sizeBytes || 0,
        body: typeof resData.body === 'object' ? JSON.stringify(resData.body, null, 2) : String(resData.body),
        headers: resData.headers || {}
      });
      void queryClient.invalidateQueries({ queryKey: ["api-history"] });
    },
    onError: (err) => {
      setExecutionError(err.message);
    }
  });

  const loadSavedRequestIntoComposer = (req: SavedRequest) => {
    setMethod(req.method);
    setUrl(req.url);
    setBody(req.body || "");
    
    // Load headers
    try {
      const parsedHeaders = JSON.parse(req.headers);
      const kvPairs = Object.entries(parsedHeaders).map(([key, value]) => ({
        key,
        value: value as string
      }));
      setHeaders(kvPairs.length > 0 ? kvPairs : [{ key: "", value: "" }]);
    } catch {
      setHeaders([{ key: "", value: "" }]);
    }
  };

  const loadHistoryItemIntoComposer = (historyItem: HistoryItem) => {
    setMethod(historyItem.method);
    setUrl(historyItem.url);
    setBody(historyItem.body || "");
    
    try {
      const parsedHeaders = JSON.parse(historyItem.headers);
      const kvPairs = Object.entries(parsedHeaders).map(([key, value]) => ({
        key,
        value: value as string
      }));
      setHeaders(kvPairs.length > 0 ? kvPairs : [{ key: "", value: "" }]);
    } catch {
      setHeaders([{ key: "", value: "" }]);
    }
  };

  const getStatusText = (code: number) => {
    const statuses: Record<number, string> = {
      200: "OK",
      201: "Created",
      202: "Accepted",
      204: "No Content",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout"
    };
    return statuses[code] || "Status";
  };

  return {
    user: user || null,
    isAuthLoading,
    collections,
    history: sortedHistory,
    isLoadingLists: isLoadingCollections || isLoadingHistory,
    
    // Request composer state
    method,
    setMethod,
    url,
    setUrl,
    headers,
    setHeaders,
    body,
    setBody,
    
    // Actions
    isExecuting: runReqMutation.isPending,
    response,
    executionError,
    handleSendRequest: () => {
      setResponse(null);
      setExecutionError(null);
      runReqMutation.mutate();
    },
    
    // UI tabs
    composerTab,
    setComposerTab,
    responseTab,
    setResponseTab,
    sidebarTab,
    setSidebarTab,

    // Collections Management
    newCollectionName,
    setNewCollectionName,
    isCreatingCollection: createColMutation.isPending,
    handleCreateCollection: () => {
      if (!newCollectionName.trim()) return;
      createColMutation.mutate();
    },
    handleDeleteCollection: (id: string) => {
      if (window.confirm("Are you sure you want to delete this collection and all its saved requests?")) {
        deleteColMutation.mutate(id);
      }
    },
    handleSaveRequest: (collectionId: string, name: string) => saveReqMutation.mutate({ collectionId, name }),
    handleDeleteRequest: (id: string) => {
      if (window.confirm("Are you sure you want to delete this saved request?")) {
        deleteReqMutation.mutate(id);
      }
    },
    
    // Loader actions
    loadSavedRequestIntoComposer,
    loadHistoryItemIntoComposer,
    handleClearHistory: () => {
      if (window.confirm("Are you sure you want to clear your entire API request history?")) {
        clearHistoryMutation.mutate();
      }
    },
  };
}
