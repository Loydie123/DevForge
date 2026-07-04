"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cicdHubService } from "../../services/cicd-hub/cicd-hub-service";
import type { Pipeline } from "../../services/cicd-hub/cicd-hub-service";
import { useWorkspace } from "../../components/workspace-context";

export type CicdTab = "overview" | "pipelines" | "runs" | "logs";

export default function useCicdHub() {
  const { isAuthLoading } = useWorkspace();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CicdTab>("overview");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newPipelineBranch, setNewPipelineBranch] = useState("main");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const statsQuery = useQuery({
    queryKey: ["cicd-stats"],
    queryFn: () => cicdHubService.getStats(),
    enabled: !isAuthLoading,
    refetchInterval: 5_000,
  });

  const pipelinesQuery = useQuery({
    queryKey: ["cicd-pipelines"],
    queryFn: () => cicdHubService.getPipelines(),
    enabled: !isAuthLoading,
    refetchInterval: 5_000,
  });

  const runsQuery = useQuery({
    queryKey: ["cicd-runs"],
    queryFn: () => cicdHubService.getRuns(50),
    enabled: !isAuthLoading,
    refetchInterval: 3_000,
  });

  const selectedRunQuery = useQuery({
    queryKey: ["cicd-run", selectedRunId],
    queryFn: () => cicdHubService.getRun(selectedRunId!),
    enabled: !!selectedRunId && !isAuthLoading,
    refetchInterval: 2_000,
  });

  const triggerMutation = useMutation({
    mutationFn: (pipeline: Pipeline) => cicdHubService.triggerRun(pipeline.id, pipeline.branch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cicd-runs"] });
      void queryClient.invalidateQueries({ queryKey: ["cicd-pipelines"] });
      void queryClient.invalidateQueries({ queryKey: ["cicd-stats"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      cicdHubService.createPipeline(newPipelineName.trim(), newPipelineBranch.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cicd-pipelines"] });
      setNewPipelineName("");
      setNewPipelineBranch("main");
      setShowCreateForm(false);
    },
  });

  function selectRun(id: string) {
    setSelectedRunId(id);
    setActiveTab("logs");
  }

  return {
    activeTab,
    setActiveTab,
    stats: statsQuery.data ?? null,
    pipelines: pipelinesQuery.data ?? [],
    runs: runsQuery.data ?? [],
    selectedRun: selectedRunQuery.data ?? null,
    selectedRunId,
    selectRun,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    triggerRun: (p: Pipeline) => triggerMutation.mutate(p),
    isTriggeringId: triggerMutation.isPending ? (triggerMutation.variables as Pipeline)?.id : null,
    newPipelineName,
    setNewPipelineName,
    newPipelineBranch,
    setNewPipelineBranch,
    showCreateForm,
    setShowCreateForm,
    createPipeline: () => createMutation.mutate(),
    isCreating: createMutation.isPending,
  };
}
