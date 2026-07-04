"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07090e] flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center gap-6 max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-white">Critical error</h1>
            <p className="text-sm text-gray-500">DevForge crashed unexpectedly. Please try again.</p>
            {error.digest && (
              <p className="text-xs text-gray-600 font-mono">Error ID: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Reload App
          </button>
        </div>
      </body>
    </html>
  );
}
