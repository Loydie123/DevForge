"use client";

import { ErrorLog } from "../../../services/error-tracker/error-tracker-service";

interface Props {
  errors: ErrorLog[];
  isLoading: boolean;
  severityFilter: string;
  setSeverityFilter: (v: string) => void;
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  services: string[];
  onSelect: (err: ErrorLog) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isClearing: boolean;
}

const SEVERITY_STYLE: Record<string, { badge: string; dot: string }> = {
  critical: { badge: "bg-red-500/10 text-red-400 border-red-500/25", dot: "bg-red-400" },
  high:     { badge: "bg-orange-500/10 text-orange-400 border-orange-500/25", dot: "bg-orange-400" },
  medium:   { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25", dot: "bg-yellow-400" },
  low:      { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ErrorsList({
  errors, isLoading,
  severityFilter, setSeverityFilter,
  serviceFilter, setServiceFilter,
  searchQuery, setSearchQuery,
  services,
  onSelect, onDelete, onClear, isClearing,
}: Props) {
  const sev = SEVERITY_STYLE;

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-600"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Service filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-600"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Clear all */}
        {errors.length > 0 && (
          <button
            onClick={onClear}
            disabled={isClearing}
            className="ml-auto px-3 py-2 text-xs font-mono font-bold text-rose-400 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 pr-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl h-16 animate-pulse" />
          ))
        ) : errors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-xs font-mono">No errors logged. System is clean.</p>
          </div>
        ) : (
          errors.map((err) => {
            const style = sev[err.severity] ?? sev.low;
            return (
              <div
                key={err.id}
                onClick={() => onSelect(err)}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4"
              >
                {/* Severity dot */}
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wide ${style.badge}`}>
                      {err.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{err.service}</span>
                    <span className="text-[10px] font-mono text-slate-600 ml-auto">{timeAgo(err.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono truncate">{err.message}</p>
                  {err.stack && (
                    <p className="text-[10px] text-slate-500 font-mono truncate">{err.stack.split("\n")[0]}</p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(err.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all shrink-0"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
