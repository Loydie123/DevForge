export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AiEngineMode = "schema" | "crud" | "refactor" | "explain" | "test" | "general";

export interface AiRequestDto {
  prompt: string;
  context?: string;
  mode: AiEngineMode;
  provider: "gemini" | "openai" | "claude" | "openrouter";
  apiKey?: string;
  openRouterModel?: string;
}

export interface AiResponseDto {
  response: string;
  provider: string;
}
