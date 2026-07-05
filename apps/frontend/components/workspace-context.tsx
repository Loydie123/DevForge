"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { authService } from "../services/auth/auth-service";
import { UserProfile } from "@devforge/auth";
import { TOKEN_KEY, WS_GATEWAY_URL } from "../config/env";
import AppShell from "./app-shell";

interface WorkspaceContextType {
  user: UserProfile | null;
  isAuthLoading: boolean;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  socket: Socket | null;
  logout: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/auth/"); // OAuth callback routes (/auth/github/callback, etc.)

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

  // Manage global socket connection based on user auth status
  useEffect(() => {
    if (isAuthRoute) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!user || !token) return;

    const socketInstance = io(WS_GATEWAY_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Global Socket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Global Socket disconnected");
    });

    Promise.resolve().then(() => {
      setSocket(socketInstance);
    });

    return () => {
      socketInstance.disconnect();
      Promise.resolve().then(() => {
        setSocket(null);
        setIsConnected(false);
      });
    };
  }, [user, isAuthRoute]);

  // Redirect to login if unauthenticated on protected routes
  useEffect(() => {
    if (!isAuthRoute && !isAuthLoading && !user) {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = "devforge_session=; path=/; max-age=0";
      router.push("/login");
    }
  }, [user, isAuthLoading, isAuthRoute, router]);

  const logout = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    const token = localStorage.getItem(TOKEN_KEY);
    // Revoke token server-side (blacklist the JTI in Redis) — fire and forget
    if (token) {
      void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = "devforge_session=; path=/; max-age=0";
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
          socket: null,
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
        socket,
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
