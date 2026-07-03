"use client";

import { useState } from "react";
import { useWorkspace } from "../../components/workspace-context";
import { projectGeneratorService } from "../../services";

export default function useProjectGenerator() {
  const { user, isAuthLoading } = useWorkspace();
  const [projectName, setProjectName] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("nestjs");
  
  // Feature flags
  const [includeAuth, setIncludeAuth] = useState(true);
  const [includeDb, setIncludeDb] = useState(true);
  const [includeDocker, setIncludeDocker] = useState(true);

  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateProject = async () => {
    setFormValidationError(null);
    setSuccessMessage(null);

    // Light Validation
    const cleanName = projectName.trim();
    if (!cleanName) {
      setFormValidationError("Project name is required.");
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(cleanName)) {
      setFormValidationError("Project name can only contain letters, numbers, dashes, and underscores.");
      return;
    }

    setIsGenerating(true);
    try {
      await projectGeneratorService.downloadProject({
        name: cleanName,
        framework: selectedFramework,
        features: {
          auth: includeAuth,
          database: includeDb,
          docker: includeDocker,
        },
      });
      setSuccessMessage(`Successfully generated ${selectedFramework.toUpperCase()} boilerplate!`);
      // Keep message for 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate boilerplate project.";
      setFormValidationError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    user: user || null,
    isAuthLoading,
    projectName,
    setProjectName,
    selectedFramework,
    setSelectedFramework,
    
    // Feature presets
    includeAuth,
    setIncludeAuth,
    includeDb,
    setIncludeDb,
    includeDocker,
    setIncludeDocker,

    // Statuses
    isGenerating,
    formValidationError,
    successMessage,
    handleGenerateProject,
  };
}
