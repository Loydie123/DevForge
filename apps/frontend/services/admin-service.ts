import { apiClient } from "./api-client";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
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

export const adminService = {
  async getStats(): Promise<PlatformStats> {
    const res = await apiClient.get<PlatformStats>("/admin/stats");
    return res.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<AdminUser[]>("/admin/users");
    return res.data;
  },

  async updateUserRole(
    id: string,
    role: "admin" | "developer"
  ): Promise<AdminUser> {
    const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, {
      role,
    });
    return res.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(
      `/admin/users/${id}`
    );
    return res.data;
  },
};
