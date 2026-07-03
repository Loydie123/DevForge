"use client";

import { useProjectGenerator } from "../../../hooks";

const FRAMEWORKS = [
  { id: "nestjs", name: "NestJS", lang: "TypeScript", desc: "Progressive Node.js framework for efficient APIs.", badge: "⚡ Backend API" },
  { id: "nextjs", name: "Next.js", lang: "React", desc: "Fullstack React framework for production-grade apps.", badge: "🌐 Fullstack" },
  { id: "express", name: "Express.js", lang: "JavaScript", desc: "Fast, unopinionated, minimalist web server.", badge: "⚡ Backend API" },
  { id: "fastify", name: "Fastify", lang: "JavaScript", desc: "Highly efficient developer-friendly framework.", badge: "⚡ Backend API" },
  { id: "gofiber", name: "Go Fiber", lang: "GoLang", desc: "Express-inspired micro framework written in Go.", badge: "⚡ Backend API" },
  { id: "django", name: "Django", lang: "Python", desc: "High-level Python web framework for clean design.", badge: "🌐 Fullstack" },
  { id: "laravel", name: "Laravel", lang: "PHP", desc: "Web application framework with expressive syntax.", badge: "🌐 Fullstack" },
  { id: "springboot", name: "Spring Boot", lang: "Java", desc: "Create stand-alone production-grade Spring apps.", badge: "⚡ Backend API" },
  { id: "aspnet", name: "ASP.NET Core", lang: "C#", desc: "Microsoft framework for cloud-connected services.", badge: "⚡ Backend API" },
  { id: "angular", name: "Angular", lang: "TypeScript", desc: "Google suite platform for building scalable client apps.", badge: "🖥️ Frontend" },
];

export default function GeneratorForm() {
  const {
    projectName,
    setProjectName,
    selectedFramework,
    setSelectedFramework,
    includeAuth,
    setIncludeAuth,
    includeDb,
    setIncludeDb,
    includeDocker,
    setIncludeDocker,
    isGenerating,
    formValidationError,
    successMessage,
    handleGenerateProject,
  } = useProjectGenerator();

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col gap-8">
      {/* Title & Description */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
          Configure Project Boilerplate
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Specify your repository parameters, select framework presets, and setup system defaults.
        </p>
      </div>

      {/* Project Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Project Repository Name
          </label>
          <input
            type="text"
            placeholder="e.g. devforge-ecommerce-api"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isGenerating}
            className="h-10 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-white placeholder-slate-750 font-mono transition-all"
          />
        </div>

        {/* Feature Checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Features & Presets
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Auth */}
            <label className={`flex flex-col p-3 border rounded-xl items-center justify-center gap-2 cursor-pointer transition-all ${
              includeAuth 
                ? "bg-emerald-500/5 border-emerald-500/35 text-emerald-400" 
                : "bg-slate-950/20 border-slate-800/80 text-slate-500 hover:border-slate-700"
            }`}>
              <input
                type="checkbox"
                checked={includeAuth}
                onChange={(e) => setIncludeAuth(e.target.checked)}
                disabled={isGenerating}
                className="sr-only"
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Auth (JWT)</span>
            </label>

            {/* DB */}
            <label className={`flex flex-col p-3 border rounded-xl items-center justify-center gap-2 cursor-pointer transition-all ${
              includeDb 
                ? "bg-emerald-500/5 border-emerald-500/35 text-emerald-400" 
                : "bg-slate-950/20 border-slate-800/80 text-slate-500 hover:border-slate-700"
            }`}>
              <input
                type="checkbox"
                checked={includeDb}
                onChange={(e) => setIncludeDb(e.target.checked)}
                disabled={isGenerating}
                className="sr-only"
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Database</span>
            </label>

            {/* Docker */}
            <label className={`flex flex-col p-3 border rounded-xl items-center justify-center gap-2 cursor-pointer transition-all ${
              includeDocker 
                ? "bg-emerald-500/5 border-emerald-500/35 text-emerald-400" 
                : "bg-slate-950/20 border-slate-800/80 text-slate-500 hover:border-slate-700"
            }`}>
              <input
                type="checkbox"
                checked={includeDocker}
                onChange={(e) => setIncludeDocker(e.target.checked)}
                disabled={isGenerating}
                className="sr-only"
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Docker</span>
            </label>
          </div>
        </div>
      </div>

      {/* Framework Selector Section */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Select Framework Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FRAMEWORKS.map((fw) => {
            const isSelected = selectedFramework === fw.id;
            return (
              <div
                key={fw.id}
                onClick={() => !isGenerating && setSelectedFramework(fw.id)}
                className={`p-4 border rounded-2xl flex flex-col gap-3 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(163,230,53,0.01)] ${
                  isSelected
                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.02)]"
                    : "bg-slate-950/25 border-slate-800/80 text-slate-300 hover:bg-slate-800/10 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{fw.name}</span>
                  <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {fw.lang}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500 font-mono flex-1">
                  {fw.desc}
                </p>
                <span className="text-[8px] tracking-wider uppercase font-mono font-bold text-slate-600">
                  {fw.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors & Success Feedback Banners */}
      {formValidationError && (
        <div className="p-3 border bg-rose-500/5 border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono leading-relaxed">
          🔴 Error: {formValidationError}
        </div>
      )}

      {successMessage && (
        <div className="p-3 border bg-emerald-500/5 border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono leading-relaxed">
          🟢 Success: {successMessage}
        </div>
      )}

      {/* Action Footer Button */}
      <div className="border-t border-slate-800/60 pt-6 flex justify-end">
        <button
          onClick={handleGenerateProject}
          disabled={isGenerating || !projectName.trim()}
          className="h-10 px-8 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 disabled:cursor-not-allowed font-mono font-bold text-slate-950 text-xs rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
              <span>Generating Boilerplate...</span>
            </>
          ) : (
            <span>Download Configured ZIP Boilerplate</span>
          )}
        </button>
      </div>
    </div>
  );
}
