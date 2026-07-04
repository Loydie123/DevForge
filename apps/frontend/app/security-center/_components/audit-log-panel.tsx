"use client";

import { AuditEvent } from "../../../services/security-center/security-center-service";

interface Props {
  events: AuditEvent[];
  isLoading: boolean;
}

const METHOD_COLOR: Record<string, string> = {
  GET:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  POST:   "text-sky-400    bg-sky-500/10    border-sky-500/20",
  PUT:    "text-amber-400  bg-amber-500/10  border-amber-500/20",
  PATCH:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
  DELETE: "text-rose-400   bg-rose-500/10   border-rose-500/20",
};

const STATUS_COLOR = (code: number) => {
  if (code < 300) return "text-emerald-400";
  if (code < 400) return "text-amber-400";
  if (code < 500) return "text-orange-400";
  return "text-rose-400";
};

function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

export default function AuditLogPanel({ events, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg h-10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="text-slate-500 text-xs font-mono">No audit events yet. Requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-[520px] pr-1">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all group">
          <span className="text-[10px] font-mono text-slate-600 w-16 shrink-0">{timeStr(ev.timestamp)}</span>

          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono shrink-0 ${METHOD_COLOR[ev.method] ?? "text-slate-400 bg-slate-800 border-slate-700"}`}>
            {ev.method}
          </span>

          <span className={`text-[10px] font-mono font-bold shrink-0 w-8 ${STATUS_COLOR(ev.statusCode)}`}>
            {ev.statusCode}
          </span>

          <span className="text-[11px] font-mono text-slate-300 flex-1 truncate">{ev.path}</span>

          <span className="text-[10px] font-mono text-slate-600 shrink-0">{ev.ip}</span>

          {ev.userEmail && (
            <span className="text-[10px] font-mono text-violet-400 shrink-0 truncate max-w-[120px]">{ev.userEmail}</span>
          )}

          <span className="text-[10px] font-mono text-slate-600 shrink-0">{ev.durationMs}ms</span>
        </div>
      ))}
    </div>
  );
}
