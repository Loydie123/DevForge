import GeneratorForm from "./_components/generator-form";

export default function ProjectGeneratorPage() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 min-h-0">
      
      {/* Page Title Header */}
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
          📦 Project Generator
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Bootstrap multi-framework project codebases with authentication, DB config, and container files.
        </p>
      </div>

      {/* Generator Form Configurator */}
      <div className="flex-1 flex flex-col min-h-0">
        <GeneratorForm />
      </div>

    </main>
  );
}
