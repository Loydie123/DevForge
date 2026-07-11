"use client";

import useSecurityCenter, { ActiveTab } from "../../../hooks/use-security-center/use-security-center";
import SecurityStatsPanel from "./security-stats";
import AuditLogPanel from "./audit-log-panel";
import IpMonitorPanel from "./ip-monitor-panel";
import JwtInspectorPanel from "./jwt-inspector-panel";

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: "overview",      label: "Overview",      icon: "🛡️" },
  { id: "audit-log",    label: "Audit Log",     icon: "📋" },
  { id: "ip-monitor",   label: "IP Monitor",    icon: "🌐" },
  { id: "jwt-inspector",label: "JWT Inspector", icon: "🔑" },
];

export default function SecurityCenter() {
  const ctx = useSecurityCenter();

  return (
    <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
            🔐 Security Center
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            JWT inspection, rate limiting, IP monitoring, and audit logs.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live monitoring
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

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {ctx.activeTab === "overview" && (
          <SecurityStatsPanel stats={ctx.stats} isLoading={ctx.isLoadingStats} />
        )}
        {ctx.activeTab === "audit-log" && (
          <AuditLogPanel events={ctx.auditLog} isLoading={ctx.isLoadingAudit} />
        )}
        {ctx.activeTab === "ip-monitor" && (
          <IpMonitorPanel
            ipStats={ctx.ipStats}
            isLoading={ctx.isLoadingIps}
            onBlock={ctx.blockIp}
            onUnblock={ctx.unblockIp}
          />
        )}
        {ctx.activeTab === "jwt-inspector" && (
          <JwtInspectorPanel
            jwtInput={ctx.jwtInput}
            setJwtInput={ctx.setJwtInput}
            verifySignature={ctx.verifySignature}
            setVerifySignature={ctx.setVerifySignature}
            jwtResult={ctx.jwtResult}
            onInspect={ctx.handleInspect}
            isInspecting={ctx.isInspecting}
          />
        )}
      </div>
    </main>
  );
}
