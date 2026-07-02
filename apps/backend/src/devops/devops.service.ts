import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
} from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { EventBusService } from '../event-bus/event-bus.service';
import { DevForgeEvents } from '@devforge/event-bus';
import {
  DockerContainer,
  DockerStats,
  ContainerAction,
} from '@devforge/devops-hub';

const execAsync = promisify(exec);

@Injectable()
export class DevOpsService implements OnModuleInit, OnModuleDestroy {
  private metricsInterval?: NodeJS.Timeout;

  constructor(private eventBus: EventBusService) {}

  onModuleInit() {
    // Start periodic background metrics collection every 5 seconds
    this.metricsInterval = setInterval(() => {
      void this.collectAndEmitMetrics();
    }, 5000);
  }

  onModuleDestroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  /**
   * Retrieves all Docker containers on the host (both running and stopped).
   */
  async getContainers(): Promise<DockerContainer[]> {
    try {
      const { stdout } = await execAsync('docker ps -a --format "{{json .}}"');
      const lines = stdout.split(/\r?\n/).filter((line) => line.trim());
      return lines.map((line) => JSON.parse(line) as DockerContainer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to retrieve Docker containers: ${msg}. Make sure Docker is running.`,
      );
    }
  }

  /**
   * Retrieves resource usage stats for a specific container.
   */
  async getContainerStats(id: string): Promise<DockerStats> {
    try {
      const { stdout } = await execAsync(
        `docker stats --no-stream --format "{{json .}}" ${id}`,
      );
      const cleaned = stdout.trim();
      if (!cleaned) {
        throw new Error(`No stats returned for container ID "${id}".`);
      }
      return JSON.parse(cleaned) as DockerStats;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to retrieve stats for container "${id}": ${msg}`,
      );
    }
  }

  /**
   * Controls container execution states (start, stop, restart).
   */
  async controlContainer(
    id: string,
    action: ContainerAction,
  ): Promise<{ success: boolean; message: string }> {
    if (!['start', 'stop', 'restart'].includes(action)) {
      throw new BadRequestException(`Invalid container action: ${action}`);
    }

    try {
      await execAsync(`docker ${action} ${id}`);
      return {
        success: true,
        message: `Successfully executed "${action}" on container "${id}".`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to execute "${action}" on container "${id}": ${msg}`,
      );
    }
  }

  /**
   * Background task that fetches stats for all active containers
   * and streams them through the event-bus (WebSocket Gateway).
   */
  private async collectAndEmitMetrics() {
    try {
      const { stdout } = await execAsync(
        'docker stats --no-stream --format "{{json .}}"',
      );
      const lines = stdout.split(/\r?\n/).filter((line) => line.trim());
      const statsList = lines.map((line) => JSON.parse(line) as DockerStats);

      if (statsList.length > 0) {
        // Emit system update metric via EventBus
        this.eventBus.emit(DevForgeEvents.METRIC_UPDATED, {
          containers: statsList,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Quietly ignore docker connection errors during background polling
    }
  }
}
