"use client";

import type { AnalyticsEvent } from "../../../services/analytics-hub/analytics-hub-service";

interface Props {
  events: AnalyticsEvent[];
  isLoading: boolean;
}

const EVENT_COLOR: Record<string, string> = {
  "page.view":      "text-sky-400    bg-sky-500/10    border-sky-500/20",
  "error.thrown":   "text-rose-400   bg-rose-500/10   border-rose-500/20",
  "db.slow_query":  "text-amber-400  bg-amber-500/10  border-amber-500/20",
  "login":          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "logout":         "text-slate-400  bg-slate-800     border-slate-700",
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 10000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function EventsFeed({ events, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-900/60 border border-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <p className="text-slate-500 text-xs font-mono">No events yet. Use the app to generate events.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto pr-1">
      {events.map((ev) => {
        const style = EVENT_COLOR[ev.name] ?? "text-violet-400 bg-violet-500/10 border-violet-500/20";
        const propsStr = Object.keys(ev.properties).length
          ? Object.entries(ev.properties).map(([k, v]) => `${k}=${String(v)}`).join(" ")
          : null;
        return (
          <div key={ev.id} className="flex items-start gap-3 px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 rounded-lg transition-all">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono shrink-0 mt-0.5 ${style}`}>
              {ev.name}
            </span>
            {propsStr && (
              <span className="text-[10px] font-mono text-slate-500 flex-1 truncate">{propsStr}</span>
            )}
            <span className="text-[10px] font-mono text-slate-600 shrink-0 ml-auto">{timeAgo(ev.timestamp)}</span>
          </div>
        );
      })}
    </div>
  );
}
