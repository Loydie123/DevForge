"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  errorTrackerService,
  ErrorLog,
  RecordErrorDto,
} from "../../services/error-tracker/error-tracker-service";
import { useWorkspace } from "../../components/workspace-context";
import { DEFAULT_PROJECT_ID } from "../../config/env";

export default function useErrorTracker() {
  const queryClient = useQueryClient();
  const { user, isAuthLoading } = useWorkspace();

  const [severityFilter, setSeverityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const [formService, setFormService] = useState("backend");
  const [formMessage, setFormMessage] = useState("");
  const [formStack, setFormStack] = useState("");
  const [formSeverity, setFormSeverity] = useState<RecordErrorDto["severity"]>("medium");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["error-tracker-stats", DEFAULT_PROJECT_ID],
    queryFn: () => errorTrackerService.getStats(DEFAULT_PROJECT_ID),
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const { data: errors = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ["error-tracker-errors", DEFAULT_PROJECT_ID, severityFilter, serviceFilter, searchQuery],
    queryFn: () =>
      errorTrackerService.getErrors(DEFAULT_PROJECT_ID, {
        severity: severityFilter !== "all" ? severityFilter : undefined,
        service: serviceFilter !== "all" ? serviceFilter : undefined,
        search: searchQuery || undefined,
      }),
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["error-tracker-services", DEFAULT_PROJECT_ID],
    queryFn: () => errorTrackerService.getServices(DEFAULT_PROJECT_ID),
    enabled: !!user,
  });

  const recordMutation = useMutation({
    mutationFn: (dto: RecordErrorDto) => errorTrackerService.recordError(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-errors"] });
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-services"] });
      setIsRecordOpen(false);
      setFormService("backend");
      setFormMessage("");
      setFormStack("");
      setFormSeverity("medium");
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => errorTrackerService.deleteError(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-errors"] });
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-stats"] });
      setSelectedError(null);
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => errorTrackerService.clearErrors(DEFAULT_PROJECT_ID),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-errors"] });
      void queryClient.invalidateQueries({ queryKey: ["error-tracker-stats"] });
      setSelectedError(null);
    },
  });

  const handleRecord = () => {
    setFormError(null);
    if (!formMessage.trim()) { setFormError("Error message is required."); return; }
    if (!formService.trim()) { setFormError("Service name is required."); return; }
    recordMutation.mutate({
      projectId: DEFAULT_PROJECT_ID,
      service: formService.trim(),
      message: formMessage.trim(),
      stack: formStack.trim() || undefined,
      severity: formSeverity,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this error log?")) deleteMutation.mutate(id);
  };

  const handleClear = () => {
    if (window.confirm("Clear all error logs for this project?")) clearMutation.mutate();
  };

  return {
    user,
    isAuthLoading,
    stats,
    isLoadingStats,
    errors,
    isLoadingErrors,
    services,
    severityFilter,
    setSeverityFilter,
    serviceFilter,
    setServiceFilter,
    searchQuery,
    setSearchQuery,
    selectedError,
    setSelectedError,
    isRecordOpen,
    setIsRecordOpen: (open: boolean) => { setIsRecordOpen(open); setFormError(null); },
    formService,
    setFormService,
    formMessage,
    setFormMessage,
    formStack,
    setFormStack,
    formSeverity,
    setFormSeverity,
    formError,
    handleRecord,
    isRecording: recordMutation.isPending,
    handleDelete,
    handleClear,
    isClearing: clearMutation.isPending,
  };
}
