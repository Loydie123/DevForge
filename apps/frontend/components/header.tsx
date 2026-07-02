import { UserProfile } from "@devforge/auth";

interface HeaderProps {
  isConnected: boolean;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Header({ isConnected, user, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 shrink-0 select-none">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Page context — left side stays empty for page-level breadcrumbs */}
        <div />

        {/* User Stats & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 border border-slate-800 px-3 py-1.5 rounded-xl font-mono whitespace-nowrap">
              <span className="text-white font-semibold">👤 {user.email}</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">
                {user.role}
              </span>
            </div>
          ) : null}

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 text-xs whitespace-nowrap">
            <span
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                isConnected
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"
                  : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`}
            />
            <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
