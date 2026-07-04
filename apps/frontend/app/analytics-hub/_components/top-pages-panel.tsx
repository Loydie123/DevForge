"use client";

import type { TopPage } from "../../../services/analytics-hub/analytics-hub-service";

interface Props {
  topPages: TopPage[];
  isLoading: boolean;
}

export default function TopPagesPanel({ topPages, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-900/60 border border-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!topPages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-slate-500 text-xs font-mono">No page views recorded yet. Navigate around the app to populate this.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {topPages.map((page, idx) => (
        <div key={page.path} className="flex items-center gap-4 px-4 py-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
          <span className="text-[10px] font-mono text-slate-600 w-5 shrink-0 text-right">{idx + 1}</span>
          <span className="text-xs font-mono text-slate-200 flex-1 truncate">{page.path}</span>
          <div className="w-32 bg-slate-800 rounded-full h-1.5">
            <div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: `${page.pct}%` }} />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12 text-right shrink-0">{page.count}</span>
          <span className="text-[10px] font-mono text-slate-600 w-8 text-right shrink-0">{page.pct}%</span>
        </div>
      ))}
    </div>
  );
}
