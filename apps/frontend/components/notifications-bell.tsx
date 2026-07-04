"use client";

import { useState } from "react";

interface Notification {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "error", title: "High Error Rate", message: "Error rate exceeded 5% on /api/auth", time: "2m ago", read: false },
  { id: "2", type: "warning", title: "High CPU Usage", message: "CPU at 87% for the last 5 minutes", time: "8m ago", read: false },
  { id: "3", type: "success", title: "Pipeline Passed", message: "main branch build deployed to staging", time: "15m ago", read: false },
  { id: "4", type: "info", title: "New Plugin Available", message: "DataDog Exporter v1.2.0 released", time: "1h ago", read: true },
  { id: "5", type: "warning", title: "Slow Query Detected", message: "Query took 1.8s on users table", time: "2h ago", read: true },
];

const typeStyles: Record<string, { icon: string; color: string; dot: string }> = {
  error: { icon: "!", color: "text-red-400", dot: "bg-red-500" },
  warning: { icon: "⚠", color: "text-yellow-400", dot: "bg-yellow-500" },
  success: { icon: "✓", color: "text-green-400", dot: "bg-green-500" },
  info: { icon: "i", color: "text-blue-400", dot: "bg-blue-500" },
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        title="Notifications"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-xs font-semibold text-gray-200">
                Notifications {unread > 0 && <span className="text-red-400">({unread} new)</span>}
              </span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-800">
              {notifications.map((n) => {
                const style = typeStyles[n.type]!;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${style.color} bg-gray-800`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{n.title}</span>
                        {!n.read && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-gray-600 mt-1">{n.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-700 text-center">
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View all notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
