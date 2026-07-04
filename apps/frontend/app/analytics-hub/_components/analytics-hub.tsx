"use client";

import useAnalyticsHub, { AnalyticsTab } from "../../../hooks/use-analytics-hub/use-analytics-hub";
import AnalyticsStats from "./analytics-stats";
import TopPagesPanel from "./top-pages-panel";
import EventsFeed from "./events-feed";
import PageViewsChart from "./page-views-chart";

const TABS: { id: AnalyticsTab; label: string; icon: string }[] = [
  { id: "overview",   label: "Overview",    icon: "📊" },
  { id: "top-pages",  label: "Top Pages",   icon: "📄" },
  { id: "events",     label: "Event Feed",  icon: "⚡" },
  { id: "page-views", label: "Views Chart", icon: "📈" },
];

export default function AnalyticsHub() {
  const ctx = useAnalyticsHub();

  return (
    <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
            📈 Analytics Hub
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Page views, user behavior, event tracking, and real-time active users.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono select-none">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{ctx.stats?.activeUsers ?? 0} active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>{ctx.stats?.totalPageViews ?? 0} total views</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => ctx.setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 -mb-px ${
              ctx.activeTab === tab.id
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {ctx.activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <AnalyticsStats stats={ctx.stats} isLoading={ctx.isLoadingStats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Top Pages</span>
                <TopPagesPanel topPages={ctx.topPages.slice(0, 5)} isLoading={ctx.isLoadingPages} />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Recent Events</span>
                <EventsFeed events={ctx.allEvents.slice(0, 10)} isLoading={false} />
              </div>
            </div>
          </div>
        )}
        {ctx.activeTab === "top-pages" && (
          <TopPagesPanel topPages={ctx.topPages} isLoading={ctx.isLoadingPages} />
        )}
        {ctx.activeTab === "events" && (
          <EventsFeed events={ctx.allEvents} isLoading={ctx.isLoadingEvents} />
        )}
        {ctx.activeTab === "page-views" && (
          <PageViewsChart hourlyData={ctx.hourlyData} isLoading={ctx.isLoadingHourly} />
        )}
      </div>
    </main>
  );
}
