"use client";

interface WelcomeBannerProps {
  isTriggering: boolean;
  isExecuting: boolean;
  onTriggerMock: () => void;
  onExecuteRequest: () => void;
}

export default function WelcomeBanner({
  isTriggering,
  isExecuting,
  onTriggerMock,
  onExecuteRequest,
}: WelcomeBannerProps) {
  return (
    <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-slate-900 to-slate-900/50 p-6 rounded-2xl border border-slate-800">
      <div>
        <h1 className="text-2xl font-mono font-bold tracking-tight text-white">
          Event Bus & WebSocket Stream Board
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Listening in real-time to active process logs and resource metrics across the DevOps workspace.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onTriggerMock}
          disabled={isTriggering}
          className="px-5 h-11 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 active:scale-95 text-slate-200 font-mono font-semibold text-xs rounded-xl border border-slate-750 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {isTriggering ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent" />
          ) : null}
          Trigger Mock Event
        </button>
        <button
          onClick={onExecuteRequest}
          disabled={isExecuting}
          className="px-5 h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 active:scale-95 text-white font-mono font-semibold text-xs rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
          ) : null}
          Execute Real API Req (1s Delay)
        </button>
      </div>
    </section>
  );
}
