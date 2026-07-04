export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
export type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';
export type RunTrigger = 'manual' | 'webhook' | 'schedule';

export interface RunStage {
  name: string;
  status: StageStatus;
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
  status: PipelineStatus;
  createdAt: number;
  lastRunAt?: number;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  branch: string;
  trigger: RunTrigger;
  status: PipelineStatus;
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

export interface CreatePipelineDto {
  name: string;
  branch: string;
  stages?: string[];
}

export interface TriggerRunDto {
  pipelineId: string;
  branch?: string;
  trigger?: RunTrigger;
}
