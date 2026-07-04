"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Overview of all services", href: "/", icon: "🏠" },
  { id: "api-hub", label: "API Hub", description: "REST, GraphQL, WebSocket testing", href: "/api-hub", icon: "🌐" },
  { id: "db-hub", label: "DB Hub", description: "Database management", href: "/db-hub", icon: "🗄️" },
  { id: "logs-hub", label: "Logs Hub", description: "Backend and system logs", href: "/logs-hub", icon: "📄" },
  { id: "monitoring", label: "Monitoring Hub", description: "CPU, RAM, uptime metrics", href: "/monitoring-hub", icon: "📊" },
  { id: "error-tracker", label: "Error Tracker", description: "Exceptions and stack traces", href: "/error-tracker", icon: "🚨" },
  { id: "analytics", label: "Analytics Hub", description: "Page views, events, users", href: "/analytics-hub", icon: "📈" },
  { id: "performance", label: "Performance Hub", description: "API latency, slow queries", href: "/performance-hub", icon: "⚡" },
  { id: "security", label: "Security Center", description: "JWT, rate limits, audit logs", href: "/security-center", icon: "🔐" },
  { id: "ai-engine", label: "AI Engine", description: "Generate code, explain errors", href: "/ai-engine", icon: "🤖" },
  { id: "devops", label: "DevOps Hub", description: "Docker, Compose, Kubernetes", href: "/devops-hub", icon: "🐳" },
  { id: "generator", label: "Project Generator", description: "Bootstrap new projects", href: "/project-generator", icon: "📦" },
  { id: "cicd", label: "CI/CD Hub", description: "Pipelines, builds, deploys", href: "/cicd-hub", icon: "🚀" },
  { id: "seo", label: "SEO Engine", description: "Meta tags, sitemap, robots.txt", href: "/seo-engine", icon: "🔍" },
  { id: "env", label: "Environment Manager", description: "Secrets, configs, versioning", href: "/env-manager", icon: "🔑" },
  { id: "plugins", label: "Plugin System", description: "Hooks, marketplace, extensions", href: "/plugin-system", icon: "🧩" },
  { id: "admin", label: "Admin Panel", description: "Users, roles, system settings", href: "/admin", icon: "⚙️" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const filtered = query.trim()
    ? COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
      setSelected(0);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected]!.href);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, navigate]);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search pages…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <kbd className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => navigate(cmd.href)}
                onMouseEnter={() => setSelected(idx)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === selected ? "bg-indigo-600/20" : "hover:bg-gray-800/50"
                }`}
              >
                <span className="text-lg w-6 shrink-0 text-center">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{cmd.label}</div>
                  <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                </div>
                {idx === selected && (
                  <kbd className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 shrink-0">↵</kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-800 text-[10px] text-gray-600">
          <span><kbd className="bg-gray-800 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-800 px-1 rounded">↵</kbd> open</span>
          <span><kbd className="bg-gray-800 px-1 rounded">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteButton() {
  return (
    <button
      onClick={() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
      }}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
      title="Open command palette"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <span>Search</span>
      <kbd className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">⌘K</kbd>
    </button>
  );
}
