import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: { projects: number };
}

export interface PlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalDevelopers: number;
  totalProjects: number;
  totalApiRequests: number;
  totalDbConnections: number;
  totalErrorLogs: number;
  recentUsers: AdminUser[];
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns all users with project counts.
   */
  async getAllUsers(): Promise<AdminUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates a user's role.
   */
  async updateUserRole(
    userId: string,
    role: 'admin' | 'developer',
  ): Promise<AdminUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User "${userId}" not found.`);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
    });
  }

  /**
   * Deletes a user and all their associated data (cascade).
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User "${userId}" not found.`);

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  /**
   * Aggregate platform-wide statistics.
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const [
      totalUsers,
      totalAdmins,
      totalDevelopers,
      totalProjects,
      totalApiRequests,
      totalDbConnections,
      totalErrorLogs,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.user.count({ where: { role: 'developer' } }),
      this.prisma.project.count(),
      this.prisma.history.count(),
      this.prisma.dbConnection.count(),
      this.prisma.errorLog.count(),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { projects: true } },
        },
      }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalDevelopers,
      totalProjects,
      totalApiRequests,
      totalDbConnections,
      totalErrorLogs,
      recentUsers,
    };
  }
}
