"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-6">
      <div className="text-center flex flex-col items-center gap-6 max-w-md">
        {/* Logo */}
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
        </div>

        {/* 404 */}
        <div className="flex flex-col gap-2">
          <span className="text-8xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text leading-none">
            404
          </span>
          <h1 className="text-xl font-bold text-white">Page not found</h1>
          <p className="text-sm text-gray-500">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
