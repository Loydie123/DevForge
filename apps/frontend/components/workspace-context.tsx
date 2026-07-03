"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../services/auth/auth-service";
import { UserProfile } from "@devforge/auth";
import { TOKEN_KEY } from "../config/env";
import AppShell from "./app-shell";

interface WorkspaceContextType {
  user: UserProfile | null;
  isAuthLoading: boolean;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  logout: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Auth check query
  const {
    data: user = null,
    isLoading: isAuthLoading,
  } = useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      return authService.getProfile(token);
    },
    retry: false,
    staleTime: Infinity,
    enabled: !isAuthRoute,
  });

  // Redirect to login if unauthenticated on protected routes
  useEffect(() => {
    if (!isAuthRoute && !isAuthLoading && !user) {
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [user, isAuthLoading, isAuthRoute, router]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/login");
  };

  // If it's an auth page, render children directly without sidebar/header
  if (isAuthRoute) {
    return (
      <WorkspaceContext.Provider
        value={{
          user: null,
          isAuthLoading: false,
          isConnected: false,
          setIsConnected: () => {},
          logout,
        }}
      >
        {children}
      </WorkspaceContext.Provider>
    );
  }

  // If authenticating, show workspace setup spinner
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#07090e] text-slate-400 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <span className="text-sm font-mono">Initializing workspace layout...</span>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        isAuthLoading,
        isConnected,
        setIsConnected,
        logout,
      }}
    >
      <AppShell isConnected={isConnected} user={user} onLogout={logout}>
        {children}
      </AppShell>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
