"use client";

import type { IpStat } from "../../../services/security-center/security-center-service";

interface Props {
  ipStats: IpStat[];
  isLoading: boolean;
  onBlock: (ip: string, reason?: string) => void;
  onUnblock: (ip: string) => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function IpMonitorPanel({ ipStats, isLoading, onBlock, onUnblock }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!ipStats.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        <p className="text-slate-500 text-xs font-mono">No IP data yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
      {ipStats.map((stat) => (
        <div
          key={stat.ip}
          className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
            stat.isBanned
              ? "bg-rose-500/10 border-rose-500/30"
              : stat.isSuspicious
              ? "bg-amber-500/5 border-amber-500/25"
              : "bg-slate-900/60 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stat.isBanned ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-rose-500/20 text-rose-400 border-rose-500/30 uppercase tracking-wide select-none">
                  Blocked / Banned
                </span>
              ) : stat.isSuspicious ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wide select-none">
                  Suspicious
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wide select-none">
                  Active
                </span>
              )}
              <span className="font-mono text-sm font-bold text-slate-200">{stat.ip}</span>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">Requests</span>
                <span className={`text-lg font-black font-mono ${stat.isBanned ? "text-rose-400" : stat.isSuspicious ? "text-amber-400" : "text-white"}`}>
                  {stat.requestCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">Last seen</span>
                <span className="text-xs font-mono text-slate-400">{timeAgo(stat.lastSeen)}</span>
              </div>

              {/* Block/Unblock actions */}
              <div className="pl-2 select-none">
                {stat.isBanned ? (
                  <button
                    onClick={() => onUnblock(stat.ip)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    🔓 Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const reason = prompt(`Reason for blocking ${stat.ip}:`, "Suspicious bot activity");
                      if (reason !== null) onBlock(stat.ip, reason);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    🛡️ Block IP
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Show Ban Reason & Attack Signature if present */}
          {stat.isBanned && (
            <div className="bg-rose-950/20 border border-rose-500/10 rounded-lg p-2.5 flex flex-col gap-1 text-xs font-mono">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <span>⚠️</span> Reason: {stat.banReason || 'Manual administrative ban'}
              </div>
              {stat.lastAttackSignature && (
                <div className="text-slate-400 text-[10px]">
                  Detected Signature: <span className="text-rose-300 bg-rose-900/30 px-1 py-0.5 rounded">{stat.lastAttackSignature}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {stat.paths.slice(0, 6).map((p) => (
              <span key={p} className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded truncate max-w-[200px]">
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
