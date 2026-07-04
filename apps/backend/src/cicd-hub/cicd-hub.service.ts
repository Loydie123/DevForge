import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Pipeline,
  PipelineRun,
  RunStage,
  CicdStats,
  PipelineStatus,
  RunTrigger,
} from '@devforge/cicd-hub';

const DEFAULT_STAGES = ['install', 'build', 'test', 'deploy'];
const MAX_RUNS = 200;

const STAGE_LOGS: Record<string, string[]> = {
  install: [
    '📦 Installing dependencies...',
    '✓ Resolving packages',
    '✓ Fetching packages',
    '✓ Linking dependencies',
    '✓ Build fresh packages',
    '✅ Done in 4.2s',
  ],
  build: [
    '🔨 Building project...',
    '✓ Compiling TypeScript',
    '✓ Bundling assets',
    '✓ Optimizing output',
    '✅ Build successful (dist/ 2.4MB)',
  ],
  test: [
    '🧪 Running test suite...',
    '✓ Unit tests: 42 passed, 0 failed',
    '✓ Integration tests: 12 passed, 0 failed',
    '✓ Coverage: 87.4%',
    '✅ All tests passed',
  ],
  deploy: [
    '🚀 Deploying to production...',
    '✓ Pushing Docker image',
    '✓ Rolling update (3/3 replicas healthy)',
    '✓ Health checks passing',
    '✅ Deployment complete',
  ],
};

const FAIL_LOGS: Record<string, string[]> = {
  install: ['📦 Installing dependencies...', '❌ Error: ERESOLVE unable to resolve dependency tree', 'npm ERR! Conflicting peer dependency'],
  build: ['🔨 Building project...', '✓ Compiling TypeScript', '❌ Error TS2307: Cannot find module', '✗ Build failed'],
  test: ['🧪 Running test suite...', '✓ Unit tests: 38 passed', '✗ Integration tests: 2 failed', '❌ Test suite failed'],
  deploy: ['🚀 Deploying to production...', '✓ Pushing Docker image', '❌ Health check timed out after 30s', '✗ Rollback initiated'],
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable()
export class CicdHubService {
  private pipelines: Pipeline[] = [];
  private runs: PipelineRun[] = [];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.seedDefaults();
  }

  private seedDefaults() {
    const now = Date.now();

    const p1 = this.createPipelineSync('devforge-backend', 'main', DEFAULT_STAGES);
    const p2 = this.createPipelineSync('devforge-frontend', 'main', ['install', 'build', 'deploy']);
    const p3 = this.createPipelineSync('devforge-api-tests', 'develop', ['install', 'test']);

    // Seed historical runs so dashboard has data immediately
    this.seedHistoricalRun(p1.id, p1.name, 'main', 'schedule', 'success', now - 3_600_000);
    this.seedHistoricalRun(p2.id, p2.name, 'main', 'webhook', 'success', now - 7_200_000);
    this.seedHistoricalRun(p3.id, p3.name, 'develop', 'manual', 'failed', now - 10_800_000);
    this.seedHistoricalRun(p1.id, p1.name, 'main', 'manual', 'success', now - 86_400_000);
  }

  private createPipelineSync(name: string, branch: string, stages: string[]): Pipeline {
    const p: Pipeline = {
      id: uid(),
      name,
      branch,
      stages,
      status: 'idle',
      createdAt: Date.now(),
    };
    this.pipelines.push(p);
    return p;
  }

  private seedHistoricalRun(
    pipelineId: string,
    pipelineName: string,
    branch: string,
    trigger: RunTrigger,
    outcome: 'success' | 'failed',
    startedAt: number,
  ) {
    const pipeline = this.pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return;

    const failStageIdx = outcome === 'failed' ? Math.floor(Math.random() * pipeline.stages.length) : -1;
    const stages: RunStage[] = pipeline.stages.map((name, idx) => {
      const isFail = idx === failStageIdx;
      const isSkipped = failStageIdx !== -1 && idx > failStageIdx;
      const stageStart = startedAt + idx * 6000;
      const stageDur = 4000 + Math.random() * 4000;
      return {
        name,
        status: isSkipped ? 'skipped' : isFail ? 'failed' : 'success',
        startedAt: stageStart,
        finishedAt: isSkipped ? undefined : stageStart + stageDur,
        durationMs: isSkipped ? undefined : stageDur,
        logs: isSkipped ? [] : (isFail ? FAIL_LOGS[name] ?? [] : STAGE_LOGS[name] ?? []),
      };
    });

    const dur = pipeline.stages.length * 8000;
    const run: PipelineRun = {
      id: uid(),
      pipelineId,
      pipelineName,
      branch,
      trigger,
      status: outcome,
      stages,
      startedAt,
      finishedAt: startedAt + dur,
      durationMs: dur,
    };
    this.runs.unshift(run);
    pipeline.status = 'idle';
    pipeline.lastRunAt = startedAt + dur;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getPipelines(): Pipeline[] {
    return this.pipelines;
  }

  getRuns(limit = 50): PipelineRun[] {
    return this.runs.slice(0, limit);
  }

  getRun(id: string): PipelineRun {
    const run = this.runs.find((r) => r.id === id);
    if (!run) throw new NotFoundException(`Run ${id} not found`);
    return run;
  }

  createPipeline(name: string, branch: string, stages?: string[]): Pipeline {
    const p = this.createPipelineSync(name, branch, stages ?? DEFAULT_STAGES);
    return p;
  }

  async triggerRun(pipelineId: string, branch?: string, trigger: RunTrigger = 'manual'): Promise<PipelineRun> {
    const pipeline = this.pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) throw new NotFoundException(`Pipeline ${pipelineId} not found`);

    const runBranch = branch ?? pipeline.branch;
    const stages: RunStage[] = pipeline.stages.map((name) => ({
      name,
      status: 'pending',
      logs: [],
    }));

    const run: PipelineRun = {
      id: uid(),
      pipelineId,
      pipelineName: pipeline.name,
      branch: runBranch,
      trigger,
      status: 'running',
      stages,
      startedAt: Date.now(),
    };

    this.runs.unshift(run);
    if (this.runs.length > MAX_RUNS) this.runs = this.runs.slice(0, MAX_RUNS);

    pipeline.status = 'running';
    this.eventEmitter.emit('cicd.run.started', { runId: run.id, pipelineName: pipeline.name });

    // Simulate async execution (non-blocking)
    void this.simulateExecution(run, pipeline);

    return run;
  }

  private async simulateExecution(run: PipelineRun, pipeline: Pipeline) {
    const shouldFail = Math.random() < 0.2; // 20% chance of failure
    const failAtIdx = shouldFail ? Math.floor(Math.random() * run.stages.length) : -1;

    for (let i = 0; i < run.stages.length; i++) {
      const stage = run.stages[i];
      const isFail = i === failAtIdx;

      stage.status = 'running';
      stage.startedAt = Date.now();

      const logs = isFail ? (FAIL_LOGS[stage.name] ?? []) : (STAGE_LOGS[stage.name] ?? []);
      const delay = 1500 + Math.random() * 2000;

      await new Promise((r) => setTimeout(r, delay));

      for (const log of logs) {
        stage.logs.push(log);
        await new Promise((r) => setTimeout(r, 100));
      }

      stage.finishedAt = Date.now();
      stage.durationMs = stage.finishedAt - (stage.startedAt ?? stage.finishedAt);

      if (isFail) {
        stage.status = 'failed';
        // Mark remaining as skipped
        for (let j = i + 1; j < run.stages.length; j++) {
          run.stages[j].status = 'skipped';
        }
        run.status = 'failed';
        run.finishedAt = Date.now();
        run.durationMs = run.finishedAt - run.startedAt;
        pipeline.status = 'failed';
        pipeline.lastRunAt = run.finishedAt;
        this.eventEmitter.emit('cicd.run.failed', { runId: run.id, pipelineName: pipeline.name });
        return;
      }

      stage.status = 'success';
    }

    run.status = 'success';
    run.finishedAt = Date.now();
    run.durationMs = run.finishedAt - run.startedAt;
    pipeline.status = 'success';
    pipeline.lastRunAt = run.finishedAt;
    this.eventEmitter.emit('cicd.run.completed', { runId: run.id, pipelineName: pipeline.name });
  }

  getStats(): CicdStats {
    const today = Date.now() - 86_400_000;
    const finished = this.runs.filter((r) => r.status === 'success' || r.status === 'failed');
    const successCount = finished.filter((r) => r.status === 'success').length;
    const durations = finished.filter((r) => r.durationMs).map((r) => r.durationMs!);
    const avgDur = durations.length ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length) : 0;

    return {
      totalRuns: this.runs.length,
      successRate: finished.length ? Math.round((successCount / finished.length) * 100) : 0,
      avgDurationMs: avgDur,
      activeRuns: this.runs.filter((r) => r.status === 'running').length,
      totalPipelines: this.pipelines.length,
      failedToday: this.runs.filter((r) => r.status === 'failed' && r.startedAt >= today).length,
    };
  }
}
