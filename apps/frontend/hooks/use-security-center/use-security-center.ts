"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  securityCenterService,
  JwtInspectResult,
} from "../../services/security-center/security-center-service";
import { useWorkspace } from "../../components/workspace-context";

export type ActiveTab = "overview" | "audit-log" | "ip-monitor" | "jwt-inspector";

export default function useSecurityCenter() {
  const { user, isAuthLoading } = useWorkspace();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const queryClient = useQueryClient();

  // JWT Inspector
  const [jwtInput, setJwtInput] = useState("");
  const [verifySignature, setVerifySignature] = useState(false);
  const [jwtResult, setJwtResult] = useState<JwtInspectResult | null>(null);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["security-stats"],
    queryFn: () => securityCenterService.getStats(),
    enabled: !!user,
    refetchInterval: 10_000,
  });

  const { data: auditLog = [], isLoading: isLoadingAudit } = useQuery({
    queryKey: ["security-audit-log"],
    queryFn: () => securityCenterService.getAuditLog(200),
    enabled: !!user && activeTab === "audit-log",
    refetchInterval: 10_000,
  });

  const { data: ipStats = [], isLoading: isLoadingIps } = useQuery({
    queryKey: ["security-ip-stats"],
    queryFn: () => securityCenterService.getIpStats(),
    enabled: !!user && activeTab === "ip-monitor",
    refetchInterval: 10_000,
  });

  const inspectMutation = useMutation({
    mutationFn: () => securityCenterService.inspectJwt(jwtInput.trim(), verifySignature),
    onSuccess: (data) => setJwtResult(data),
  });

  const blockIpMutation = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason?: string }) =>
      securityCenterService.blockIp(ip, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-ip-stats"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
  });

  const unblockIpMutation = useMutation({
    mutationFn: (ip: string) => securityCenterService.unblockIp(ip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-ip-stats"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
  });

  const handleInspect = () => {
    if (!jwtInput.trim()) return;
    setJwtResult(null);
    inspectMutation.mutate();
  };

  return {
    user,
    isAuthLoading,
    activeTab,
    setActiveTab,
    stats,
    isLoadingStats,
    auditLog,
    isLoadingAudit,
    ipStats,
    isLoadingIps,
    jwtInput,
    setJwtInput,
    verifySignature,
    setVerifySignature,
    jwtResult,
    handleInspect,
    isInspecting: inspectMutation.isPending,
    inspectError: inspectMutation.error as Error | null,
    blockIp: (ip: string, reason?: string) => blockIpMutation.mutate({ ip, reason }),
    unblockIp: (ip: string) => unblockIpMutation.mutate(ip),
    isBlockingIp: blockIpMutation.isPending,
    isUnblockingIp: unblockIpMutation.isPending,
  };
}
