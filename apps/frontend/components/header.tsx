"use client";

import Link from "next/link";

interface HeaderProps {
  isConnected: boolean;
  user: { email: string; role: string; name?: string } | null;
  onLogout: () => void;
}

export default function Header({ isConnected, user, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <span className="text-2xl font-mono font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              DevForge
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              DevOS v0.1.0
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold text-slate-400 border-l border-slate-800 pl-6 h-6">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/api-hub" className="hover:text-emerald-400 transition-colors">
              API Hub
            </Link>
          </nav>
        </div>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono">
              <span>Logged in as:</span>
              <span className="text-white font-semibold">{user.email}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">
                {user.role}
              </span>
            </div>
          ) : null}

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 bg-slate-800/50 px-3.5 py-1.5 rounded-full border border-slate-700/50 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                isConnected
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`}
            />
            <span className="font-mono text-slate-300">
              Gateway: {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
