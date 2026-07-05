"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "../../../../config/env";

export default function GitHubCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Read directly from window.location to avoid useSearchParams timing issues
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = "devforge_session=1; path=/; SameSite=Strict; max-age=604800";
      // Brief success flash before hard redirect so middleware always sees the fresh cookie
      startTransition(() => setStatus("success"));
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } else {
      startTransition(() => {
        setStatus("error");
        setErrorMsg("No token received from GitHub. Please try again.");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — window.location is always available

  if (status === "error") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 font-mono">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="h-9 w-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <p className="text-xs text-rose-400">{errorMsg}</p>
          <a href="/login" className="text-xs text-emerald-400 hover:underline">Back to login</a>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-300">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-slate-100">GitHub sign-in successful</p>
            <p className="text-[10px] text-slate-500">Redirecting to your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
        </div>
        <p className="text-xs text-slate-400">Completing GitHub sign-in...</p>
      </div>
    </div>
  );
}
