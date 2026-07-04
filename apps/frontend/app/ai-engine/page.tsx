import type { Metadata } from "next";
import AiConsole from "./_components/ai-console";

export const metadata: Metadata = {
  title: "AI Engine",
  description: "Generate CRUD APIs, SQL schemas, explain errors and refactor code using AI.",
};


export default function AiEnginePage() {
  return (
    <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-h-0">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
          🤖 AI Engine
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Interactive developer assistant playground for schemas, CRUD boilerplate, and query bug explanations.
        </p>
      </div>

      {/* AI Playground Console */}
      <AiConsole />

    </main>
  );
}
