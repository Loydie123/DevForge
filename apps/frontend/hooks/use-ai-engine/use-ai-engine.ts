"use client";

import { useState } from "react";
import { useWorkspace } from "../../components/workspace-context";
import { aiEngineService } from "../../services";
import { ChatMessage, AiEngineMode } from "@devforge/ai-engine";

const STORAGE_KEYS = {
  gemini: "devforge-ai-key-gemini",
  openai: "devforge-ai-key-openai",
  claude: "devforge-ai-key-claude",
  openrouter: "devforge-ai-key-openrouter",
  openrouterModel: "devforge-ai-model-openrouter",
};

export default function useAiEngine() {
  const { user, isAuthLoading } = useWorkspace();

  // Chat settings & credentials
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "openai" | "claude" | "openrouter">("gemini");
  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.gemini) || "";
    }
    return "";
  });
  const [openaiKey, setOpenaiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.openai) || "";
    }
    return "";
  });
  const [claudeKey, setClaudeKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.claude) || "";
    }
    return "";
  });
  const [openrouterKey, setOpenrouterKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.openrouter) || "";
    }
    return "";
  });
  const [openRouterModel, setOpenRouterModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.openrouterModel) || "google/gemini-2.5-flash";
    }
    return "google/gemini-2.5-flash";
  });

  // Input states
  const [selectedMode, setSelectedMode] = useState<AiEngineMode>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam) return modeParam as AiEngineMode;
    }
    return "general";
  });
  const [contextText, setContextText] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const contextParam = params.get("context");
      if (contextParam) return contextParam;
    }
    return "";
  });
  const [inputMessage, setInputMessage] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const contextParam = params.get("context");
      if (contextParam) return "Explain this error and suggest a fix.";
    }
    return "";
  });

  // Chat conversation
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your DevForge AI Assistant. Select a workspace helper mode on the left and let's get coding! 🚀",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const saveApiKey = (provider: "gemini" | "openai" | "claude" | "openrouter", value: string) => {
    if (provider === "gemini") {
      setGeminiKey(value);
      localStorage.setItem(STORAGE_KEYS.gemini, value);
    } else if (provider === "openai") {
      setOpenaiKey(value);
      localStorage.setItem(STORAGE_KEYS.openai, value);
    } else if (provider === "claude") {
      setClaudeKey(value);
      localStorage.setItem(STORAGE_KEYS.claude, value);
    } else if (provider === "openrouter") {
      setOpenrouterKey(value);
      localStorage.setItem(STORAGE_KEYS.openrouter, value);
    }
  };

  const saveOpenRouterModel = (value: string) => {
    setOpenRouterModel(value);
    localStorage.setItem(STORAGE_KEYS.openrouterModel, value);
  };

  const handleSendMessage = async () => {
    setErrorFeedback(null);
    const text = inputMessage.trim();
    if (!text) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    const activeApiKey = 
      selectedProvider === "gemini" ? geminiKey :
      selectedProvider === "openai" ? openaiKey :
      selectedProvider === "claude" ? claudeKey :
      openrouterKey;

    try {
      const responseData = await aiEngineService.chat({
        prompt: text,
        context: contextText.trim() || undefined,
        mode: selectedMode,
        provider: selectedProvider,
        apiKey: activeApiKey.trim() || undefined,
        openRouterModel: selectedProvider === "openrouter" ? openRouterModel : undefined,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseData.response,
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to get AI response.";
      setErrorFeedback(errMsg);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${errMsg}`,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([
      {
        role: "assistant",
        content: "Console history cleared. What should we build next? 🚀",
      },
    ]);
    setErrorFeedback(null);
  };

  return {
    user: user || null,
    isAuthLoading,
    
    // Inputs & Selection
    selectedProvider,
    setSelectedProvider,
    selectedMode,
    setSelectedMode,
    contextText,
    setContextText,
    inputMessage,
    setInputMessage,

    // Credentials
    geminiKey,
    openaiKey,
    claudeKey,
    openrouterKey,
    openRouterModel,
    saveApiKey,
    saveOpenRouterModel,

    // Chat
    chatHistory,
    isGenerating,
    errorFeedback,
    handleSendMessage,
    handleClearHistory,
  };
}

