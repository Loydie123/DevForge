import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { DevForgeEvents } from '@devforge/event-bus';
import { RecordErrorDto, ErrorStats } from '@devforge/error-tracker';

@Injectable()
export class ErrorTrackerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async getErrors(
    projectId: string,
    severity?: string,
    service?: string,
    search?: string,
  ) {
    return this.prisma.errorLog.findMany({
      where: {
        projectId,
        ...(severity && severity !== 'all' ? { severity } : {}),
        ...(service && service !== 'all' ? { service } : {}),
        ...(search
          ? {
              OR: [
                { message: { contains: search, mode: 'insensitive' } },
                { service: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(projectId: string): Promise<ErrorStats> {
    const [all, recent] = await Promise.all([
      this.prisma.errorLog.findMany({ where: { projectId } }),
      this.prisma.errorLog.count({
        where: {
          projectId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
    ]);

    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byService: Record<string, number> = {};

    for (const err of all) {
      const sev = err.severity as keyof typeof bySeverity;
      if (sev in bySeverity) bySeverity[sev]++;

      byService[err.service] = (byService[err.service] ?? 0) + 1;
    }

    return {
      total: all.length,
      bySeverity,
      byService,
      recentCount: recent,
    };
  }

  async recordError(dto: RecordErrorDto) {
    const errorLog = await this.prisma.errorLog.create({
      data: {
        projectId: dto.projectId,
        service: dto.service,
        message: dto.message,
        stack: dto.stack,
        severity: dto.severity,
      },
    });

    this.eventBus.emit(DevForgeEvents.ERROR_THROWN, {
      service: dto.service,
      message: dto.message,
      stack: dto.stack,
      severity: dto.severity,
      timestamp: Date.now(),
    });

    return errorLog;
  }

  async deleteError(id: string) {
    const error = await this.prisma.errorLog.findUnique({ where: { id } });
    if (!error) throw new NotFoundException(`Error log "${id}" not found.`);
    return this.prisma.errorLog.delete({ where: { id } });
  }

  async clearErrors(projectId: string) {
    return this.prisma.errorLog.deleteMany({ where: { projectId } });
  }

  async getServices(projectId: string): Promise<string[]> {
    const rows = await this.prisma.errorLog.findMany({
      where: { projectId },
      select: { service: true },
      distinct: ['service'],
    });
    return rows.map((r: { service: string }) => r.service);
  }
}
