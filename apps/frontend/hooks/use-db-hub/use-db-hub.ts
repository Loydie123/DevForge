"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  dbHubService, 
  DbConnection, 
  QueryResultDto 
} from "../../services/db-hub-service";
import { useWorkspace } from "../../components/workspace-context";
import { TOKEN_KEY } from "../../config/env";

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000000";

export default function useDbHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthLoading } = useWorkspace();

  // Active Connection ID state
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  // Query Editor input state
  const [queryInput, setQueryInput] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResultDto | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // New Connection Form states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("postgres"); // postgres, mysql, mongodb
  const [formHost, setFormHost] = useState("localhost");
  const [formPort, setFormPort] = useState(5432);
  const [formDatabase, setFormDatabase] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // 2. Fetch Connection Profiles
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery({
    queryKey: ["db-connections"],
    queryFn: () => dbHubService.getConnections(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  // Derive active connection from ID state (falls back to first in list)
  const activeConnection = connections.find(c => c.id === activeConnectionId) || connections[0] || null;

  // Derive query string from input (falls back to database type templates)
  const query = queryInput !== null
    ? queryInput
    : (activeConnection?.type === "mongodb"
        ? JSON.stringify({ find: "User", filter: {} }, null, 2)
        : "SELECT * FROM \"User\" LIMIT 10;");

  // Selection Handler
  const handleSelectConnection = (conn: DbConnection) => {
    setActiveConnectionId(conn.id);
    setQueryInput(null);
    setQueryResult(null);
    setExecutionError(null);
  };

  // 3. Fetch History Timeline for active connection
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["db-history", activeConnection?.id],
    queryFn: () => dbHubService.getHistory(activeConnection!.id),
    enabled: !!activeConnection,
  });

  // Form Port Helper
  const handleTypeChange = (type: string) => {
    setFormType(type);
    if (type === "postgres") setFormPort(5432);
    else if (type === "mysql") setFormPort(3306);
    else if (type === "mongodb") setFormPort(27017);
  };

  // 4. Test Connection Mutation
  const testConnMutation = useMutation({
    mutationFn: () => dbHubService.testConnection({
      type: formType,
      host: formHost,
      port: Number(formPort),
      database: formDatabase,
      username: formUsername,
      password: formPassword,
    }),
    onSuccess: (data) => {
      setTestFeedback(data);
    },
    onError: (err) => {
      setTestFeedback({ success: false, message: err.message });
    }
  });

  // 5. Save Connection Mutation
  const saveConnMutation = useMutation({
    mutationFn: () => dbHubService.createConnection({
      projectId: DEFAULT_PROJECT_ID,
      name: formName,
      type: formType,
      host: formHost,
      port: Number(formPort),
      database: formDatabase,
      username: formUsername,
      password: formPassword,
    }),
    onSuccess: (newConn) => {
      setFormName("");
      setFormDatabase("");
      setFormUsername("");
      setFormPassword("");
      setTestFeedback(null);
      setIsAddFormOpen(false);

      // Invalidate connection list to refetch
      void queryClient.invalidateQueries({ queryKey: ["db-connections"] });
      setActiveConnectionId(newConn.id);
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 6. Delete Connection Mutation
  const deleteConnMutation = useMutation({
    mutationFn: (id: string) => dbHubService.deleteConnection(id),
    onSuccess: (_, deletedId) => {
      if (activeConnectionId === deletedId) {
        setActiveConnectionId(null);
      }
      void queryClient.invalidateQueries({ queryKey: ["db-connections"] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 7. Run SQL Query Mutation
  const runQueryMutation = useMutation({
    mutationFn: () => dbHubService.executeQuery(activeConnection!.id, query),
    onSuccess: (output) => {
      setQueryResult(output);
      if (output.status === "error") {
        setExecutionError(output.error || "Query execution failed.");
      }
      void queryClient.invalidateQueries({ queryKey: ["db-history", activeConnection?.id] });
    },
    onError: (err) => {
      setExecutionError(err.message);
    }
  });

  // 8. Clear Query History Mutation
  const clearHistoryMutation = useMutation({
    mutationFn: () => dbHubService.clearHistory(activeConnection!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["db-history", activeConnection?.id] });
    },
    onError: (err) => {
      alert(err.message);
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
    connections,
    activeConnection,
    setActiveConnection: handleSelectConnection,
    history,
    isLoadingConnections,
    isLoadingHistory,

    // Query triggers
    query,
    setQuery: setQueryInput,
    isExecutingQuery: runQueryMutation.isPending,
    queryResult,
    executionError,
    handleRunQuery: () => runQueryMutation.mutate(),

    // Connections UI state
    isAddFormOpen,
    setIsAddFormOpen,
    formName,
    setFormName,
    formType,
    handleTypeChange,
    formHost,
    setFormHost,
    formPort,
    setFormPort,
    formDatabase,
    setFormDatabase,
    formUsername,
    setFormUsername,
    formPassword,
    setFormPassword,
    
    // Testing & Saving Mutations
    isTestingConnection: testConnMutation.isPending,
    isSavingConnection: saveConnMutation.isPending,
    testFeedback,
    setTestFeedback,
    handleTestConnection: () => testConnMutation.mutate(),
    handleSaveConnection: () => saveConnMutation.mutate(),
    handleDeleteConnection: (id: string) => deleteConnMutation.mutate(id),
    handleClearHistory: () => clearHistoryMutation.mutate(),
    handleLogout
  };
}
