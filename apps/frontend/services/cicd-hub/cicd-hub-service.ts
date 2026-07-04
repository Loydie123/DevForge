import { apiClient } from "../api-client";

export interface RunStage {
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  logs: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  branch: string;
  stages: string[];
  status: "idle" | "running" | "success" | "failed" | "cancelled";
  createdAt: number;
  lastRunAt?: number;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  branch: string;
  trigger: "manual" | "webhook" | "schedule";
  status: "idle" | "running" | "success" | "failed" | "cancelled";
  stages: RunStage[];
  startedAt: number;
  finishedAt?: number;
  durationMs?: number;
}

export interface CicdStats {
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  activeRuns: number;
  totalPipelines: number;
  failedToday: number;
}

export const cicdHubService = {
  async getStats(): Promise<CicdStats> {
    const res = await apiClient.get("/cicd/stats");
    return res.data;
  },

  async getPipelines(): Promise<Pipeline[]> {
    const res = await apiClient.get("/cicd/pipelines");
    return res.data;
  },

  async createPipeline(name: string, branch: string, stages?: string[]): Promise<Pipeline> {
    const res = await apiClient.post("/cicd/pipelines", { name, branch, stages });
    return res.data;
  },

  async getRuns(limit = 50): Promise<PipelineRun[]> {
    const res = await apiClient.get(`/cicd/runs?limit=${limit}`);
    return res.data;
  },

  async getRun(id: string): Promise<PipelineRun> {
    const res = await apiClient.get(`/cicd/runs/${id}`);
    return res.data;
  },

  async triggerRun(pipelineId: string, branch?: string): Promise<PipelineRun> {
    const res = await apiClient.post("/cicd/runs/trigger", {
      pipelineId,
      branch,
      trigger: "manual",
    });
    return res.data;
  },
};
