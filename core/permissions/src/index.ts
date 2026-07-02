export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date | string;
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

export interface UpdateUserRoleDto {
  role: "admin" | "developer";
}
