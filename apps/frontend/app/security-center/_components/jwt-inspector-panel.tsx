"use client";

import { JwtInspectResult } from "../../../services/security-center/security-center-service";

interface Props {
  jwtInput: string;
  setJwtInput: (v: string) => void;
  verifySignature: boolean;
  setVerifySignature: (v: boolean) => void;
  jwtResult: JwtInspectResult | null;
  onInspect: () => void;
  isInspecting: boolean;
}

function JsonBlock({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return <span className="text-slate-600 font-mono text-xs">null</span>;
  return (
    <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap break-words">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function JwtInspectorPanel({
  jwtInput, setJwtInput,
  verifySignature, setVerifySignature,
  jwtResult, onInspect, isInspecting,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">JWT Token</label>
          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            rows={4}
            placeholder="Paste your JWT token here..."
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-slate-600 resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setVerifySignature(!verifySignature)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${verifySignature ? "bg-sky-500" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifySignature ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-xs font-mono text-slate-400">Verify signature against server secret</span>
          </label>

          <button
            onClick={onInspect}
            disabled={isInspecting || !jwtInput.trim()}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold font-mono rounded-lg transition-all"
          >
            {isInspecting ? "Inspecting..." : "Inspect Token"}
          </button>
        </div>
      </div>

      {/* Result */}
      {jwtResult && (
        <div className="flex flex-col gap-4">
          {/* Status banner */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            jwtResult.valid && !jwtResult.isExpired
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}>
            {jwtResult.valid && !jwtResult.isExpired ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            <span className="text-xs font-bold font-mono">
              {jwtResult.isExpired
                ? "Token EXPIRED"
                : jwtResult.valid
                ? "Token is VALID"
                : `Invalid — ${jwtResult.error}`}
            </span>
            {jwtResult.expiresAt && (
              <span className="ml-auto text-[10px] font-mono opacity-70">
                Expires: {new Date(jwtResult.expiresAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Header + Payload side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Header</span>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto max-h-64">
                <JsonBlock data={jwtResult.header} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Payload</span>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto max-h-64">
                <JsonBlock data={jwtResult.payload} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
