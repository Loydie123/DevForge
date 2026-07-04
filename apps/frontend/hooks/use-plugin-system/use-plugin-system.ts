"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pluginSystemService } from "@/services/plugin-system/plugin-system-service";
import type { PluginHook, PluginCategory, MarketplacePlugin } from "@/services/plugin-system/plugin-system-service";

export type PluginTab = "installed" | "marketplace" | "hooks";

const HOOKS: PluginHook[] = ["onRequest", "onResponse", "onError", "onLog", "onMetric"];
const CATEGORIES: Array<PluginCategory | "all"> = ["all", "monitoring", "security", "analytics", "logging", "devops", "ai", "utility"];

export function usePluginSystem() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PluginTab>("installed");
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory | "all">("all");
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [testHook, setTestHook] = useState<PluginHook>("onRequest");

  const statsQuery = useQuery({
    queryKey: ["plugin-system", "stats"],
    queryFn: () => pluginSystemService.getStats(),
    refetchInterval: 15_000,
  });

  const pluginsQuery = useQuery({
    queryKey: ["plugin-system", "plugins"],
    queryFn: () => pluginSystemService.listPlugins(),
    refetchInterval: 15_000,
  });

  const marketplaceQuery = useQuery({
    queryKey: ["plugin-system", "marketplace"],
    queryFn: () => pluginSystemService.getMarketplace(),
  });

  const executionsQuery = useQuery({
    queryKey: ["plugin-system", "executions"],
    queryFn: () => pluginSystemService.getExecutions(80),
    refetchInterval: 10_000,
  });

  const installMutation = useMutation({
    mutationFn: (id: string) => pluginSystemService.installPlugin(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["plugin-system"] }),
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => pluginSystemService.uninstallPlugin(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plugin-system"] });
      setSelectedPluginId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => pluginSystemService.togglePlugin(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["plugin-system"] }),
  });

  const triggerMutation = useMutation({
    mutationFn: (hook: PluginHook) => pluginSystemService.triggerHook(hook, { test: true, ts: Date.now() }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["plugin-system"] }),
  });

  const filteredMarketplace = (marketplaceQuery.data ?? []).filter(
    (p: MarketplacePlugin) => categoryFilter === "all" || p.manifest.category === categoryFilter,
  );

  const selectedPlugin = pluginsQuery.data?.find((p) => p.id === selectedPluginId) ?? null;

  return {
    activeTab,
    setActiveTab,
    stats: statsQuery.data,
    plugins: pluginsQuery.data ?? [],
    isLoading: pluginsQuery.isLoading,
    isError: pluginsQuery.isError,
    marketplace: filteredMarketplace,
    marketplaceLoading: marketplaceQuery.isLoading,
    executions: executionsQuery.data ?? [],
    executionsLoading: executionsQuery.isLoading,

    categoryFilter,
    setCategoryFilter,
    categories: CATEGORIES,

    selectedPluginId,
    setSelectedPluginId,
    selectedPlugin,

    install: (id: string) => installMutation.mutate(id),
    isInstalling: installMutation.isPending,
    installingId: installMutation.variables,

    uninstall: (id: string) => uninstallMutation.mutate(id),
    isUninstalling: uninstallMutation.isPending,

    toggle: (id: string) => toggleMutation.mutate(id),
    isToggling: toggleMutation.isPending,

    testHook,
    setTestHook,
    hooks: HOOKS,
    triggerHook: () => triggerMutation.mutate(testHook),
    isTriggeringHook: triggerMutation.isPending,
    lastTriggerResult: triggerMutation.data,
  };
}
