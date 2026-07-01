"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, AdminUser } from "../../services/admin-service";
import { authService } from "../../services/auth-service";
import { TOKEN_KEY } from "../../config/env";

export default function useAdmin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // 1. Auth guard — admin only
  const {
    data: user,
    isLoading: isAuthLoading,
    error: authError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (authError) {
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [authError, router]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) router.push("/login");
  }, [router]);

  // Redirect non-admins after user loads
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  // 2. Platform stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats(),
    enabled: !!user && user.role === "admin",
    refetchInterval: 30_000,
  });

  // 3. Users list
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
    enabled: !!user && user.role === "admin",
  });

  // 4. Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "developer" }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  // 5. Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    },
  });

  const handleRoleToggle = (u: AdminUser) => {
    const newRole = u.role === "admin" ? "developer" : "admin";
    updateRoleMutation.mutate({ id: u.id, role: newRole });
  };

  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) deleteUserMutation.mutate(deleteTargetId);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteTargetId(null);
  };

  return {
    // Auth
    user,
    isAuthLoading,

    // Stats
    stats,
    isLoadingStats,

    // Users
    users,
    isLoadingUsers,

    // Actions
    handleRoleToggle,
    isUpdatingRole: updateRoleMutation.isPending,

    // Delete flow
    requestDelete,
    confirmDelete,
    cancelDelete,
    confirmDeleteOpen,
    deleteTargetId,
    isDeletingUser: deleteUserMutation.isPending,
  };
}
