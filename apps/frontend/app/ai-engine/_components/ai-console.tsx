"use client";

import { useAiEngine } from "../../../hooks";
import { AiEngineMode } from "@devforge/ai-engine";

const ASSISTANT_MODES = [
  { id: "general", name: "AI Assistant", desc: "General coding help, query assistance, & tips.", emoji: "🤖" },
  { id: "schema", name: "Schema Builder", desc: "Generate database schemas (Postgres, Mongo, etc).", emoji: "🗄️" },
  { id: "crud", name: "CRUD Generator", desc: "Write clean API services and routing boilerplates.", emoji: "⚡" },
  { id: "refactor", name: "Code Optimizer", desc: "Refactor code for performance and readability.", emoji: "🧹" },
  { id: "explain", name: "Error Explainer", desc: "Understand logs and fix compiler or database errors.", emoji: "🚨" },
  { id: "test", name: "Test Writer", desc: "Generate unit tests and coverage cases automatically.", emoji: "🧪" },
];

export default function AiConsole() {
  const {
    selectedProvider,
    setSelectedProvider,
    selectedMode,
    setSelectedMode,
    contextText,
    setContextText,
    inputMessage,
    setInputMessage,
    geminiKey,
    openaiKey,
    claudeKey,
    openrouterKey,
    openRouterModel,
    saveApiKey,
    saveOpenRouterModel,
    chatHistory,
    isGenerating,
    handleSendMessage,
    handleClearHistory,
  } = useAiEngine();

  const activeKey = 
    selectedProvider === "gemini" ? geminiKey :
    selectedProvider === "openai" ? openaiKey :
    selectedProvider === "claude" ? claudeKey :
    openrouterKey;

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9+#-_]+/)?.[0] || "";
        const code = language ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div key={index} className="my-3 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px]">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
              <span>{language || "code"}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-emerald-400 font-bold cursor-pointer transition-colors"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-4 bg-slate-950/80 overflow-x-auto text-emerald-400 select-text leading-relaxed font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
      {/* Left panel: Configurator & Credentials */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Setup Config Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            Assistant Settings
          </span>

          {/* Provider Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold">AI PROVIDER</span>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as "gemini" | "openai" | "claude" | "openrouter")}
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="gemini">Google Gemini (Default)</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
              <option value="claude">Anthropic Claude 3.5</option>
              <option value="openrouter">OpenRouter.ai</option>
            </select>
          </div>

          {/* OpenRouter Model ID Input (only shown when selectedProvider === 'openrouter') */}
          {selectedProvider === "openrouter" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">OPENROUTER MODEL</span>
                <span className="text-slate-600 font-mono">ID</span>
              </div>
              <input
                type="text"
                placeholder="e.g. google/gemini-2.5-flash"
                value={openRouterModel}
                onChange={(e) => saveOpenRouterModel(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs text-white font-mono transition-colors"
              />
            </div>
          )}

          {/* Private API Key Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">PRIVATE API KEY</span>
              <span className="text-slate-600 font-mono">browser-local</span>
            </div>
            <input
              type="password"
              placeholder={`Enter ${selectedProvider.toUpperCase()} Key...`}
              value={activeKey}
              onChange={(e) => saveApiKey(selectedProvider, e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs text-white font-mono placeholder-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Mode Selector list */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 overflow-y-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            Helper Engines
          </span>
          <div className="flex flex-col gap-2">
            {ASSISTANT_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id as AiEngineMode)}
                  className={`p-3 border rounded-xl text-left transition-all flex gap-3 items-start group cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/5 border-emerald-500/35 text-emerald-400"
                      : "bg-slate-950/20 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-lg leading-none pt-0.5">{mode.emoji}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {mode.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono leading-relaxed">
                      {mode.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right panel: Chat Terminal & Context Box */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        
        {/* Context Editor Textarea */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
              Code or Logs Context (Optional)
            </span>
            {contextText && (
              <button
                onClick={() => setContextText("")}
                className="text-[9px] font-mono text-rose-400 hover:text-rose-300 transition-colors font-bold cursor-pointer"
              >
                Clear Context
              </button>
            )}
          </div>
          <textarea
            placeholder="Paste raw compiler errors, SQL queries, database credentials structure, or source code block here to supply context for the prompt..."
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            disabled={isGenerating}
            className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs text-white placeholder-slate-700 font-mono resize-none transition-colors"
          />
        </div>

        {/* Chat Terminal Console */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 min-h-0 overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between shrink-0 select-none">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Terminal Log Feed
            </span>
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-mono font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear Console
            </button>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 font-mono text-xs select-text">
            {chatHistory.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={i}
                  className={`flex gap-3 items-start max-w-[85%] ${
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar bubble */}
                  <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs select-none ${
                    isUser 
                      ? "bg-slate-800 text-slate-350 border border-slate-700/50" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {isUser ? "U" : "AI"}
                  </div>

                  {/* Message Bubble Content */}
                  <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed ${
                    isUser
                      ? "bg-slate-950/60 border-slate-800/80 text-white rounded-tr-none"
                      : "bg-slate-950 border-slate-800/60 text-slate-300 rounded-tl-none shadow-[0_0_12px_rgba(163,230,53,0.01)]"
                  }`}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}
            
            {/* Thinking status */}
            {isGenerating && (
              <div className="flex gap-3 items-start mr-auto max-w-[85%] animate-pulse">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs select-none">
                  AI
                </div>
                <div className="p-3 rounded-2xl border bg-slate-950 border-slate-800/60 text-slate-500 rounded-tl-none flex items-center gap-2 select-none">
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-slate-600 border-t-emerald-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Prompt bar */}
          <div className="border-t border-slate-800/60 pt-4 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                placeholder="Ask AI assistant to write code, explain context, or refactor schemas..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isGenerating}
                className="flex-1 h-10 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs text-white placeholder-slate-700 transition-colors"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputMessage.trim()}
                className="h-10 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 disabled:text-slate-950/60 disabled:cursor-not-allowed font-bold text-slate-950 text-xs rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_20px_rgba(163,230,53,0.25)] transition-all cursor-pointer select-none"
              >
                Send
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
