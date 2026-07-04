"use client";

import { UserProfile } from "@devforge/auth";
import NotificationsBell from "./notifications-bell";
import { CommandPaletteButton, CommandPalette } from "./command-palette";

interface HeaderProps {
  isConnected: boolean;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Header({ isConnected, user, onLogout }: HeaderProps) {
  return (
    <>
      <CommandPalette />
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 shrink-0 select-none">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          {/* Left — command palette search */}
          <CommandPaletteButton />

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-full border border-slate-700/50 text-xs whitespace-nowrap">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                  isConnected
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse"
                    : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                }`}
              />
              <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wide hidden sm:block">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Notifications */}
            <NotificationsBell />

            {/* User + logout */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/30 border border-slate-800 px-2.5 py-1.5 rounded-xl font-mono">
                  <span className="text-white font-semibold truncate max-w-[140px]">{user.email}</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider shrink-0">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="text-xs font-mono font-bold text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
