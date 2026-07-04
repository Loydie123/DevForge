"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { envManagerService } from "@/services/env-manager/env-manager-service";
import type { EnvType, EnvVariable, SecretType } from "@/services/env-manager/env-manager-service";

export type EnvTab = "configs" | "versions";

const BLANK_VAR: Omit<EnvVariable, "id" | "createdAt" | "updatedAt"> = {
  key: "",
  value: "",
  type: "plain",
  masked: false,
  description: "",
};

export function useEnvManager() {
  const queryClient = useQueryClient();

  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EnvTab>("configs");
  const [showAddVar, setShowAddVar] = useState(false);
  const [newVar, setNewVar] = useState({ ...BLANK_VAR });
  const [revealedVarIds, setRevealedVarIds] = useState<Set<string>>(new Set());
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});
  const [exportContent, setExportContent] = useState<string | null>(null);

  // Create config dialog
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [newConfigName, setNewConfigName] = useState("My App");
  const [newConfigEnv, setNewConfigEnv] = useState<EnvType>("development");

  const statsQuery = useQuery({
    queryKey: ["env-manager", "stats"],
    queryFn: () => envManagerService.getStats(),
    refetchInterval: 30_000,
  });

  const configsQuery = useQuery({
    queryKey: ["env-manager", "configs"],
    queryFn: () => envManagerService.listConfigs(),
    refetchInterval: 30_000,
  });

  const versionsQuery = useQuery({
    queryKey: ["env-manager", "versions", activeConfigId],
    queryFn: () => (activeConfigId ? envManagerService.getVersions(activeConfigId) : Promise.resolve([])),
    enabled: !!activeConfigId && activeTab === "versions",
  });

  const createConfigMutation = useMutation({
    mutationFn: () => envManagerService.createConfig(newConfigName, newConfigEnv),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["env-manager"] });
      setActiveConfigId(created.id);
      setShowCreateConfig(false);
      setNewConfigName("My App");
      setNewConfigEnv("development");
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => envManagerService.deleteConfig(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["env-manager"] });
      setActiveConfigId(null);
    },
  });

  const addVarMutation = useMutation({
    mutationFn: (variable: typeof newVar) =>
      envManagerService.addVariable(activeConfigId!, variable),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["env-manager"] });
      setNewVar({ ...BLANK_VAR });
      setShowAddVar(false);
    },
  });

  const deleteVarMutation = useMutation({
    mutationFn: ({ configId, varId }: { configId: string; varId: string }) =>
      envManagerService.deleteVariable(configId, varId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["env-manager"] }),
  });

  const restoreVersionMutation = useMutation({
    mutationFn: ({ versionId }: { versionId: string }) =>
      envManagerService.restoreVersion(activeConfigId!, versionId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["env-manager"] }),
  });

  const revealVar = async (configId: string, varId: string) => {
    if (revealedVarIds.has(varId)) {
      // Toggle off
      const next = new Set(revealedVarIds);
      next.delete(varId);
      setRevealedVarIds(next);
      return;
    }
    const value = await envManagerService.revealVariable(configId, varId);
    setRevealedValues((prev) => ({ ...prev, [varId]: value }));
    setRevealedVarIds((prev) => new Set([...prev, varId]));
  };

  const exportConfig = async (configId: string) => {
    const content = await envManagerService.exportDotEnv(configId);
    setExportContent(content);
  };

  const activeConfig = configsQuery.data?.find((c) => c.id === activeConfigId) ?? null;

  return {
    stats: statsQuery.data,
    configs: configsQuery.data ?? [],
    isLoading: configsQuery.isLoading,
    isError: configsQuery.isError,

    activeConfigId,
    setActiveConfigId,
    activeConfig,
    activeTab,
    setActiveTab,

    // create config
    showCreateConfig,
    setShowCreateConfig,
    newConfigName,
    setNewConfigName,
    newConfigEnv,
    setNewConfigEnv,
    createConfig: () => createConfigMutation.mutate(),
    isCreating: createConfigMutation.isPending,

    deleteConfig: (id: string) => deleteConfigMutation.mutate(id),

    // add variable
    showAddVar,
    setShowAddVar,
    newVar,
    setNewVar: (v: typeof newVar) => setNewVar(v),
    addVar: () => addVarMutation.mutate(newVar),
    isAddingVar: addVarMutation.isPending,

    deleteVar: (configId: string, varId: string) => deleteVarMutation.mutate({ configId, varId }),

    // reveal
    revealedVarIds,
    revealedValues,
    revealVar,

    // export
    exportContent,
    setExportContent,
    exportConfig,

    // versions
    versions: versionsQuery.data ?? [],
    versionsLoading: versionsQuery.isLoading,
    restoreVersion: (versionId: string) => restoreVersionMutation.mutate({ versionId }),
    isRestoring: restoreVersionMutation.isPending,

    // helpers
    varTypeColor: (type: SecretType) => {
      const map: Record<SecretType, string> = {
        plain: "text-gray-400 bg-gray-400/10",
        secret: "text-red-400 bg-red-400/10",
        api_key: "text-yellow-400 bg-yellow-400/10",
        connection_string: "text-blue-400 bg-blue-400/10",
      };
      return map[type] ?? "text-gray-400 bg-gray-400/10";
    },
    envColor: (env: EnvType) => {
      const map: Record<EnvType, string> = {
        development: "text-green-400 bg-green-400/10 border-green-400/30",
        staging: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        production: "text-red-400 bg-red-400/10 border-red-400/30",
      };
      return map[env] ?? "text-gray-400";
    },
  };
}
