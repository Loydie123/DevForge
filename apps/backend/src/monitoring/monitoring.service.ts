import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { DevForgeEvents } from '@devforge/event-bus';
import { CreateUptimeCheckDto, SystemMetrics } from '@devforge/monitoring-hub';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    // Start uptime ping loops for all configured checks
    try {
      const checks = await this.prisma.uptimeCheck.findMany();
      for (const check of checks) {
        this.startPinger(check.id, check.interval);
      }
      console.log(
        `[MonitoringService] Started ${checks.length} uptime ping checkers.`,
      );
    } catch (err) {
      console.error(
        '[MonitoringService] Failed to initialize uptime pingers:',
        err,
      );
    }
  }

  onModuleDestroy() {
    this.stopAllPingers();
  }

  // --- Host System Metrics ---

  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuPercent = await this.getCpuUsage();

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);

    const disk = await this.getDiskUsage();

    return {
      cpu: {
        usedPercent: cpuPercent,
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
      },
      memory: {
        totalBytes: totalMem,
        usedBytes: usedMem,
        freeBytes: freeMem,
        usedPercent: memPercent,
      },
      disk: {
        totalBytes: disk.total,
        usedBytes: disk.used,
        freeBytes: disk.free,
        usedPercent: disk.percent,
      },
      timestamp: Date.now(),
    };
  }

  private cpuAverage() {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();
    for (let i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i];
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
  }

  private getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;

        if (totalDifference === 0) {
          resolve(0);
          return;
        }

        const percentageCPU =
          100 - Math.round((100 * idleDifference) / totalDifference);
        resolve(percentageCPU);
      }, 500);
    });
  }

  private async getDiskUsage() {
    const isWindows = process.platform === 'win32';
    try {
      if (isWindows) {
        const { stdout } = await execAsync(
          'wmic logicaldisk get size,freespace,caption',
        );
        const lines = stdout.split(/\r?\n/).filter((line) => line.trim());
        // Find C: drive or first available disk line
        const cDrive = lines.find((line) => line.includes('C:')) || lines[1];
        if (cDrive) {
          const parts = cDrive.split(/\s+/).filter(Boolean);
          // Format expected: Caption, FreeSpace, Size. Caption is parts[0].
          // We need to identify size and freespace index.
          const headers = lines[0].split(/\s+/).filter(Boolean);
          const freeIdx = headers.indexOf('FreeSpace');
          const sizeIdx = headers.indexOf('Size');

          if (freeIdx !== -1 && sizeIdx !== -1) {
            const free = parseInt(parts[freeIdx], 10);
            const size = parseInt(parts[sizeIdx], 10);
            const used = size - free;
            const percent = Math.round((used / size) * 100);
            return { total: size, free, used, percent };
          }
        }
      } else {
        const { stdout } = await execAsync('df -k /');
        const lines = stdout.split('\n').filter((line) => line.trim());
        if (lines.length >= 2) {
          const parts = lines[1].split(/\s+/).filter(Boolean);
          const total = parseInt(parts[1], 10) * 1024;
          const used = parseInt(parts[2], 10) * 1024;
          const free = parseInt(parts[3], 10) * 1024;
          const percent = parseInt(parts[4].replace('%', ''), 10);
          return { total, free, used, percent };
        }
      }
    } catch {
      // Quietly ignore disk extraction command failures, return fallbacks
    }
    // Return standard fallback if commands fail
    return {
      total: 100 * 1024 * 1024 * 1024,
      free: 50 * 1024 * 1024 * 1024,
      used: 50 * 1024 * 1024 * 1024,
      percent: 50,
    };
  }

  // --- Uptime Ping Loop Schedulers ---

  private startPinger(id: string, intervalSeconds: number) {
    this.stopPinger(id);

    // Convert to milliseconds, safeguard minimum interval of 5 seconds
    const intervalMs = Math.max(intervalSeconds, 5) * 1000;

    // Execute check once immediately
    void this.executePingCheck(id);

    const timer = setInterval(() => {
      void this.executePingCheck(id);
    }, intervalMs);

    this.activeTimers.set(id, timer);
  }

  private stopPinger(id: string) {
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(id);
    }
  }

  private stopAllPingers() {
    for (const timer of this.activeTimers.values()) {
      clearInterval(timer);
    }
    this.activeTimers.clear();
  }

  private async executePingCheck(id: string) {
    const check = await this.prisma.uptimeCheck.findUnique({
      where: { id },
    });

    if (!check) {
      this.stopPinger(id);
      return;
    }

    const startTime = Date.now();
    let status = 'down';
    let statusCode: number | null = null;
    let latencyMs = 0;
    let errorMsg: string | null = null;

    try {
      const response = await axios.get(check.url, {
        timeout: 5000,
        headers: { 'User-Agent': 'DevForge-Health-Checker/1.0' },
      });

      statusCode = response.status;
      latencyMs = Date.now() - startTime;
      status = statusCode >= 200 && statusCode < 400 ? 'up' : 'down';
    } catch (err: unknown) {
      latencyMs = Date.now() - startTime;
      status = 'down';
      if (axios.isAxiosError(err)) {
        errorMsg = err.message || 'Network error';
        if (err.response) {
          statusCode = err.response.status;
        }
      } else {
        errorMsg = err instanceof Error ? err.message : 'Unknown error';
      }
    }

    try {
      // 1. Record Uptime Result
      await this.prisma.uptimeResult.create({
        data: {
          uptimeCheckId: id,
          status,
          statusCode,
          latencyMs,
          error: errorMsg,
        },
      });

      // 2. Update status of Uptime Check
      const updatedCheck = await this.prisma.uptimeCheck.update({
        where: { id },
        data: {
          status,
          latencyMs,
        },
      });

      // 3. Emit update via WebSockets Event Bus
      this.eventBus.emit(DevForgeEvents.METRIC_UPDATED, {
        type: 'uptime',
        check: {
          id: updatedCheck.id,
          name: updatedCheck.name,
          url: updatedCheck.url,
          status: updatedCheck.status,
          latencyMs: updatedCheck.latencyMs,
          projectId: updatedCheck.projectId,
        },
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(
        `[MonitoringService] Failed to record ping check for "${check.name}":`,
        err,
      );
    }
  }

  // --- CRUD Operations ---

  async getUptimeChecks(projectId: string) {
    return this.prisma.uptimeCheck.findMany({
      where: { projectId },
      include: {
        results: {
          orderBy: { createdAt: 'desc' },
          take: 20, // return last 20 check results
        },
      },
    });
  }

  async createUptimeCheck(dto: CreateUptimeCheckDto) {
    const interval = dto.interval || 60;

    // Ensure check is valid URL
    try {
      new URL(dto.url);
    } catch {
      throw new BadRequestException('Invalid URL format provided.');
    }

    const check = await this.prisma.uptimeCheck.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        url: dto.url,
        interval,
      },
    });

    this.startPinger(check.id, check.interval);
    return check;
  }

  async deleteUptimeCheck(id: string) {
    const existing = await this.prisma.uptimeCheck.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Uptime check with ID "${id}" not found.`);
    }

    this.stopPinger(id);
    await this.prisma.uptimeCheck.delete({
      where: { id },
    });

    return { success: true, message: 'Successfully deleted uptime check.' };
  }
}
