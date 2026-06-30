"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  apiHubService, 
  SaveRequestDto, 
  Collection, 
  HistoryItem, 
  SavedRequest 
} from "../../../services/api-hub-service";
import { authService } from "../../../services/auth-service";
import { TOKEN_KEY } from "../../../config/env";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000000";

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
  const [user, setUser] = useState<{ email: string; role: string; name?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Lists
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // Active Composer State
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  
  // Execution & Response State
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // UI Tabs State
  const [composerTab, setComposerTab] = useState<"headers" | "body">("headers");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [sidebarTab, setSidebarTab] = useState<"collections" | "history">("collections");

  // Input states for creating entities
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const refreshSidebar = async (authToken: string) => {
    setIsLoadingLists(true);
    try {
      const fetchedCollections = await apiHubService.getCollections(DEFAULT_PROJECT_ID, authToken);
      setCollections(fetchedCollections);
      
      const fetchedHistory = await apiHubService.getHistory(DEFAULT_PROJECT_ID, authToken);
      // Sort history: latest first
      fetchedHistory.sort((a: HistoryItem, b: HistoryItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(fetchedHistory);
    } catch (err) {
      console.error("Failed to load sidebar lists:", err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      router.push("/login");
      return;
    }

    const initializeData = async () => {
      try {
        const profile = await authService.getProfile(activeToken);
        setUser(profile);
        setIsAuthLoading(false);
        
        // Load collections and history
        await refreshSidebar(activeToken);
      } catch (err) {
        console.error("Initialization error:", err);
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    };

    void initializeData();
  }, [router]);

  const handleCreateCollection = async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!newCollectionName.trim() || !activeToken) return;
    setIsCreatingCollection(true);
    try {
      await apiHubService.createCollection(DEFAULT_PROJECT_ID, newCollectionName, activeToken);
      setNewCollectionName("");
      await refreshSidebar(activeToken);
    } catch (err) {
      console.error("Failed to create collection:", err);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return;
    try {
      await apiHubService.deleteCollection(DEFAULT_PROJECT_ID, id, activeToken);
      await refreshSidebar(activeToken);
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const handleSaveRequest = async (collectionId: string, name: string) => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return;
    
    // Parse headers key-value array into JSON string
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

    try {
      await apiHubService.saveRequest(dto, activeToken);
      await refreshSidebar(activeToken);
    } catch (err) {
      console.error("Failed to save request:", err);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return;
    try {
      await apiHubService.deleteRequest(id, activeToken);
      await refreshSidebar(activeToken);
    } catch (err) {
      console.error("Failed to delete request:", err);
    }
  };

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

  const handleClearHistory = async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return;
    try {
      await apiHubService.clearHistory(DEFAULT_PROJECT_ID, activeToken);
      await refreshSidebar(activeToken);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleSendRequest = async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!url.trim() || !activeToken) return;
    setIsExecuting(true);
    setResponse(null);
    setExecutionError(null);

    // Convert key-value headers to Record dictionary
    const headersDict: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key.trim()) {
        headersDict[h.key.trim()] = h.value;
      }
    });

    // Parse body if it exists
    let parsedBody: unknown = undefined;
    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body.trim());
      } catch {
        parsedBody = body; // fallback to raw string if not JSON
      }
    }

    try {
      const resData = await apiHubService.execute({
        projectId: DEFAULT_PROJECT_ID,
        method,
        url,
        headers: headersDict,
        body: parsedBody
      }, activeToken);

      setResponse({
        status: resData.status,
        statusText: getStatusText(resData.status),
        latencyMs: resData.latencyMs,
        sizeBytes: resData.sizeBytes || 0,
        body: typeof resData.body === 'object' ? JSON.stringify(resData.body, null, 2) : String(resData.body),
        headers: resData.headers || {}
      });

      // Reload sidebar to reflect new history item
      await refreshSidebar(activeToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setExecutionError(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/login");
  };

  // Helper status texts
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
    user,
    isAuthLoading,
    collections,
    history,
    isLoadingLists,
    
    // Request composer state
    method,
    setMethod,
    url,
    setUrl,
    headers,
    setHeaders,
    body,
    setBody,
    
    // Actions & Senders
    isExecuting,
    response,
    executionError,
    handleSendRequest,
    
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
    isCreatingCollection,
    handleCreateCollection,
    handleDeleteCollection,
    handleSaveRequest,
    handleDeleteRequest,
    
    // Loader actions
    loadSavedRequestIntoComposer,
    loadHistoryItemIntoComposer,
    handleClearHistory,
    handleLogout
  };
}
