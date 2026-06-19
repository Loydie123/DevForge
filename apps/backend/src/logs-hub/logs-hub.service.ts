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
import * as fs from 'fs';

@Injectable()
export class LogsHubService implements OnModuleInit, OnModuleDestroy {
  private watchers = new Map<
    string,
    { watcher: fs.FSWatcher; lastSize: number }
  >();

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    // Automatically start watching registered log files
    const sources = await this.prisma.logSource.findMany();
    for (const source of sources) {
      this.startWatching(source.id, source.filePath, source.name);
    }
  }

  onModuleDestroy() {
    // Clear and close all file watchers
    for (const item of this.watchers.values()) {
      item.watcher.close();
    }
    this.watchers.clear();
  }

  // --- Log Source Watcher Controls ---

  private startWatching(id: string, filePath: string, sourceName: string) {
    if (!fs.existsSync(filePath)) {
      console.warn(
        `[LogsHubService] Log file path does not exist: "${filePath}". Watcher skipped.`,
      );
      return;
    }

    try {
      const stats = fs.statSync(filePath);
      let lastSize = stats.size;

      const watcher = fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
          try {
            const currentStats = fs.statSync(filePath);
            if (currentStats.size > lastSize) {
              const stream = fs.createReadStream(filePath, {
                start: lastSize,
                end: currentStats.size - 1,
                encoding: 'utf8',
              });

              stream.on('data', (chunk: string | Buffer) => {
                const chunkStr =
                  typeof chunk === 'string' ? chunk : chunk.toString('utf8');
                const lines = chunkStr.split(/\r?\n/);
                for (const line of lines) {
                  if (line.trim()) {
                    this.eventBus.emit(DevForgeEvents.LOG_CREATED, {
                      service: sourceName,
                      level: 'info',
                      message: line,
                      timestamp: Date.now(),
                    });
                  }
                }
              });

              stream.on('error', (err) => {
                console.error(
                  `[LogsHubService] Error reading file stream: ${filePath}`,
                  err,
                );
              });
            }
            lastSize = currentStats.size;
          } catch (err) {
            console.error(
              `[LogsHubService] Error processing file updates: ${filePath}`,
              err,
            );
          }
        }
      });

      this.watchers.set(id, { watcher, lastSize });
      console.log(
        `[LogsHubService] Started active FS tailing watcher for: ${filePath}`,
      );
    } catch (err) {
      console.error(
        `[LogsHubService] Failed to establish file watcher for: ${filePath}`,
        err,
      );
    }
  }

  private stopWatching(id: string) {
    const item = this.watchers.get(id);
    if (item) {
      item.watcher.close();
      this.watchers.delete(id);
      console.log(`[LogsHubService] Closed watcher for log source ID: ${id}`);
    }
  }

  // --- Log Source CRUD ---

  async getSources(projectId: string) {
    return this.prisma.logSource.findMany({ where: { projectId } });
  }

  async addSource(projectId: string, name: string, filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `File path "${filePath}" does not exist on host file system.`,
      );
    }

    const source = await this.prisma.logSource.create({
      data: { name, filePath, projectId },
    });

    // Start tailing the new file immediately
    this.startWatching(source.id, source.filePath, source.name);
    return source;
  }

  async deleteSource(id: string) {
    const source = await this.prisma.logSource.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Log source with ID "${id}" not found.`);
    }

    this.stopWatching(id);
    return this.prisma.logSource.delete({ where: { id } });
  }

  // --- Error Tracker CRUD ---

  async getErrorLogs(projectId: string) {
    return this.prisma.errorLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordError(
    projectId: string,
    dto: {
      service: string;
      message: string;
      stack?: string;
      severity: string;
    },
  ) {
    const errorLog = await this.prisma.errorLog.create({
      data: {
        projectId,
        service: dto.service,
        message: dto.message,
        stack: dto.stack,
        severity: dto.severity,
      },
    });

    // Emit live error warning through event bus
    this.eventBus.emit(DevForgeEvents.ERROR_THROWN, {
      service: dto.service,
      message: dto.message,
      stack: dto.stack,
      severity: dto.severity as 'low' | 'medium' | 'high' | 'critical',
      timestamp: Date.now(),
    });

    return errorLog;
  }

  async deleteError(id: string) {
    const error = await this.prisma.errorLog.findUnique({ where: { id } });
    if (!error) {
      throw new NotFoundException(`Error log with ID "${id}" not found.`);
    }
    return this.prisma.errorLog.delete({ where: { id } });
  }

  async clearErrors(projectId: string) {
    return this.prisma.errorLog.deleteMany({ where: { projectId } });
  }
}
