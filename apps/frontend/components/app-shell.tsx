"use client";

import Sidebar from "./sidebar";
import Header from "./header";
import { UserProfile } from "@devforge/auth";

interface AppShellProps {
  children: React.ReactNode;
  isConnected: boolean;
  user: UserProfile | null;
  onLogout: () => void;
}

/**
 * Shared layout shell for authenticated pages.
 * Provides collapsible sidebar + slim header + scrollable content area.
 */
export default function AppShell({
  children,
  isConnected,
  user,
  onLogout,
}: AppShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#07090e] text-white flex select-none">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header isConnected={isConnected} user={user} onLogout={onLogout} />
        <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
