"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { DevForgeEvents, LogPayload, MetricPayload } from "@devforge/event-bus";

export default function Home() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogPayload[]>([]);
  const [metrics, setMetrics] = useState<MetricPayload | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    // Connect to NestJS WebSocket Gateway (port 4000)
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket Gateway");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket Gateway");
    });

    // Listen to real-time events
    socketInstance.on(DevForgeEvents.LOG_CREATED, (data: LogPayload) => {
      setLogs((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 logs
    });

    socketInstance.on(DevForgeEvents.METRIC_UPDATED, (data: MetricPayload) => {
      setMetrics(data);
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const triggerMockEvent = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch("http://localhost:4000/api/trigger-mock");
      const data = await res.json();
      console.log("Mock trigger response:", data);
    } catch (err) {
      console.error("Failed to trigger mock event", err);
    } finally {
      setTimeout(() => setIsTriggering(false), 300);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Banner / Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
              DevForge
            </span>
            <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-mono">
              DevOS v0.1.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status indicator */}
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3.5 py-1.5 rounded-full border border-zinc-700/50 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                  isConnected
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                }`}
              />
              <span className="font-mono text-zinc-300">
                Gateway: {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-zinc-900 to-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Event Bus & WebSocket Stream Board
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Listening in real-time to active process logs and resource metrics across the DevOS workspace.
            </p>
          </div>
          <button
            onClick={triggerMockEvent}
            disabled={isTriggering}
            className={`px-5 h-11 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 active:scale-95 text-white font-medium rounded-xl border border-violet-500/30 transition-all shadow-[0_0_20px_rgba(124,58,237,0.15)] flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isTriggering ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : null}
            Trigger Mock Event
          </button>
        </section>

        {/* Grid Layout for Metrics & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Metrics Display */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-zinc-200 border-l-2 border-violet-500 pl-3">
              Real-time Metrics
            </h2>

            {metrics ? (
              <div className="grid grid-cols-1 gap-4">
                {/* CPU Usage Card */}
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
                    <span>CPU Usage</span>
                    <span className="font-mono text-violet-400 font-bold">
                      {metrics.cpuUsage}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* Memory Usage Card */}
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
                    <span>Memory Usage</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {formatBytes(metrics.memoryUsageBytes)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Allocated Node process size
                  </div>
                </div>

                {/* Uptime Card */}
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-2">
                  <span className="text-zinc-400 text-sm font-medium">Server Uptime</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {metrics.uptimeSeconds}s
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/50 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
                <span>Waiting for system metrics event...</span>
              </div>
            )}
          </div>

          {/* Right Column: Live Logs Stream */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200 border-l-2 border-indigo-500 pl-3">
                Logs Event Stream
              </h2>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
              >
                Clear Screen
              </button>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 min-h-[400px] max-h-[550px] overflow-y-auto flex flex-col gap-2.5 font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log, index) => {
                  const levelColors = {
                    info: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    debug: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                  };

                  return (
                    <div
                      key={index}
                      className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 transition-all hover:border-zinc-700/50 animate-fade-in"
                    >
                      <div className="flex items-start md:items-center gap-3">
                        {/* Level Tag */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            levelColors[log.level] || levelColors.info
                          }`}
                        >
                          {log.level}
                        </span>
                        {/* Log Message */}
                        <span className="text-zinc-200">{log.message}</span>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-500 shrink-0 text-[10px]">
                        <span>[{log.service}]</span>
                        <span>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 py-20 text-center">
                  <span className="text-lg">📟</span>
                  <span>Console Stream is silent.</span>
                  <span className="text-[11px] text-zinc-600">
                    {'Click "Trigger Mock Event" above to dispatch test payloads.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
