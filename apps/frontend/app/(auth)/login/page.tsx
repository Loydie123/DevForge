"use client";

import Link from "next/link";
import { useLogin } from "../../../hooks";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  } = useLogin();

  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-100 font-sans relative overflow-hidden select-none">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-15 pointer-events-none" />

      {/* Ambient Glowing Light Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* 50/50 Layout Wrapper */}
      <div className="flex w-full h-full z-10">
        
        {/* Left Side: Auth Card Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 h-full bg-slate-950/20 backdrop-blur-sm border-r border-slate-900/60">
          <div className="w-full max-w-md flex flex-col gap-6">
            
            {/* Logo and Headings */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </div>
                <span className="text-2xl font-mono font-bold tracking-tight text-white">DevForge</span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">DevOS</span>
              </div>
              <h2 className="text-xl font-mono font-bold text-white mt-4">Welcome Back Developer</h2>
              <p className="text-xs text-slate-400">Access your universal developer workspace.</p>
            </div>

            {/* Auth Form Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-7 rounded-2xl shadow-xl flex flex-col gap-5">
              {(error ?? oauthError) ? (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3.5 py-2.5 rounded-xl font-mono">
                  {oauthError === "github_denied"
                    ? "GitHub sign-in was cancelled."
                    : (error ?? oauthError)}
                </div>
              ) : null}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 tracking-wider" htmlFor="email">EMAIL ADDRESS</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 tracking-wider" htmlFor="password">PASSWORD</label>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-white placeholder-slate-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:bg-emerald-600 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
                  ) : null}
                  Access Workspace
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-mono text-slate-600 tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* GitHub OAuth */}
              <a
                href={`${API_URL}/api/auth/github`}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 hover:border-slate-600 text-slate-200 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </a>
            </div>

            <p className="text-center text-xs text-slate-500">
              New developer on the platform?{" "}
              <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Mock IDE / Server Console (SVG Animated Interface) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-slate-950 select-none relative overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 opacity-40 pointer-events-none" />

          {/* Connection status header */}
          <div className="flex items-center justify-between z-10 text-[10px] font-mono text-slate-500">
            <span>PLATFORM: ACTIVE</span>
            <span>SYSTEM: SECURE</span>
          </div>

          {/* Mock Technical Window representation instead of unstable Lottie */}
          <div className="w-full max-w-lg mx-auto flex flex-col gap-6 z-10 my-auto">
            
            {/* Interactive Browser Window */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Window Title Bar */}
              <div className="bg-slate-950/80 px-4 h-9 flex items-center justify-between border-b border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">devforge.devos.logs</span>
                <div className="w-12" />
              </div>

              {/* Console Body */}
              <div className="p-5 flex flex-col gap-3 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>$</span>
                  <span>devforge init --workspace</span>
                </div>
                <div className="text-slate-500">Initializing core components...</div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>⚡ Event Bus Core Gateway</span>
                  <span className="text-emerald-400 font-bold">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>🗄️ PostgreSQL database</span>
                  <span className="text-emerald-400 font-bold">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>🐳 Docker containers daemon</span>
                  <span className="text-emerald-400 font-bold">4 RUNNING</span>
                </div>
                
                {/* Visual CLI pulse animation */}
                <div className="flex items-center gap-2 mt-2 text-emerald-500 animate-pulse">
                  <span>&gt;</span>
                  <span>System metrics streaming active. Monitoring port 4000...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div className="flex items-center justify-between z-10 text-[10px] font-mono text-slate-600">
            <span>© 2026 DEVFORGE INC.</span>
            <span>OS: DEVOS v0.1.0</span>
          </div>
        </div>

      </div>
    </div>
  );
}
