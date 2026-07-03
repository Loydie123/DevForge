import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { AiRequestDto, AiResponseDto } from '@devforge/ai-engine';

@Injectable()
export class AiEngineService {
  /**
   * Router to call LLM providers (Gemini, OpenAI, Claude) dynamically using Axios.
   */
  async chat(dto: AiRequestDto): Promise<AiResponseDto> {
    const { prompt, context, mode, provider, apiKey, openRouterModel } = dto;

    // 1. Resolve API Key (frontend override or backend env variables)
    const key = apiKey || this.getDefaultApiKey(provider);
    if (!key) {
      throw new BadRequestException(
        `API Key for provider "${provider}" is missing. Please supply one in your profile settings or backend configuration.`,
      );
    }

    // 2. Build system and user prompt based on mode
    const systemPrompt = this.getSystemPrompt(mode);
    const userPrompt = context
      ? `[Context/Code block]:\n${context}\n\n[Instructions/Prompt]:\n${prompt}`
      : prompt;

    // 3. Dispatch to correct provider
    switch (provider) {
      case 'gemini':
        return this.callGemini(systemPrompt, userPrompt, key);
      case 'openai':
        return this.callOpenAi(systemPrompt, userPrompt, key);
      case 'claude':
        return this.callClaude(systemPrompt, userPrompt, key);
      case 'openrouter':
        return this.callOpenRouter(
          systemPrompt,
          userPrompt,
          key,
          openRouterModel,
        );
      default:
        throw new BadRequestException(
          `Unsupported AI provider: ${provider as string}`,
        );
    }
  }

  private getDefaultApiKey(provider: string): string | undefined {
    if (provider === 'gemini') return process.env.GEMINI_API_KEY;
    if (provider === 'openai') return process.env.OPENAI_API_KEY;
    if (provider === 'claude') return process.env.CLAUDE_API_KEY;
    if (provider === 'openrouter') return process.env.OPENROUTER_API_KEY;
    return undefined;
  }

  private getSystemPrompt(mode: string): string {
    const prompts: Record<string, string> = {
      schema: `
You are an expert Database Administrator.
Generate a clean, optimized database schema (PostgreSQL, MySQL, MongoDB, or Prisma schema) based on the user request.
Provide comments explaining primary/foreign keys and indexes.
Output only the schema code block with a short summary.
`,
      crud: `
You are a senior Software Engineer.
Generate a clean CRUD API boilerplate (controller, service, repository, routing) using best practices.
Prefer modular architectures, clean abstractions, and proper error handling.
Include comments and specify which language/framework is used.
`,
      refactor: `
You are a senior Code Reviewer.
Refactor and optimize the provided code block for performance, readability, and security.
Provide a clear breakdown of the changes made, explaining why they improve the code.
`,
      explain: `
You are a senior Debugging Assistant.
Analyze the provided compiler, database, or runtime error log.
Explain the root cause of the error in simple terms and provide clear, step-by-step code fixes.
`,
      test: `
You are a professional QA Engineer.
Write comprehensive unit/integration test cases for the provided code block.
Include tests for success paths, error cases, and boundary/edge conditions.
`,
      general: `
You are a helpful, professional developer assistant embedded in DevForge (DevOS).
Help the developer write clean code, suggest architecture improvements, or solve programming tasks.
`,
    };
    return prompts[mode] || prompts.general;
  }

  // --- API Callers ---

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    key: string,
  ): Promise<AiResponseDto> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const combinedPrompt = `${systemPrompt}\n\nUser request:\n${userPrompt}`;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: combinedPrompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('Invalid empty response from Gemini API.');
      }

      return {
        response: responseText,
        provider: 'gemini',
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown API error';
      throw new BadRequestException(`Gemini API Error: ${msg}`);
    }
  }

  private async callOpenAi(
    systemPrompt: string,
    userPrompt: string,
    key: string,
  ): Promise<AiResponseDto> {
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await axios.post(
        url,
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
        },
      );

      const data = response.data as {
        choices?: Array<{
          message?: { content?: string };
        }>;
      };

      const responseText = data.choices?.[0]?.message?.content;
      if (!responseText) {
        throw new Error('Invalid empty response from OpenAI API.');
      }

      return {
        response: responseText,
        provider: 'openai',
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown API error';
      throw new BadRequestException(`OpenAI API Error: ${msg}`);
    }
  }

  private async callClaude(
    systemPrompt: string,
    userPrompt: string,
    key: string,
  ): Promise<AiResponseDto> {
    const url = 'https://api.anthropic.com/v1/messages';

    try {
      const response = await axios.post(
        url,
        {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
        },
      );

      const data = response.data as {
        content?: Array<{
          text?: string;
        }>;
      };

      const responseText = data.content?.[0]?.text;
      if (!responseText) {
        throw new Error('Invalid empty response from Claude API.');
      }

      return {
        response: responseText,
        provider: 'claude',
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown API error';
      throw new BadRequestException(`Claude API Error: ${msg}`);
    }
  }

  private async callOpenRouter(
    systemPrompt: string,
    userPrompt: string,
    key: string,
    openRouterModel?: string,
  ): Promise<AiResponseDto> {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const selectedModel = openRouterModel || 'google/gemini-2.5-flash';

    try {
      const response = await axios.post(
        url,
        {
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'DevForge',
          },
        },
      );

      const data = response.data as {
        choices?: Array<{
          message?: { content?: string };
        }>;
      };

      const responseText = data.choices?.[0]?.message?.content;
      if (!responseText) {
        throw new Error('Invalid empty response from OpenRouter API.');
      }

      return {
        response: responseText,
        provider: 'openrouter',
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown API error';
      throw new BadRequestException(`OpenRouter API Error: ${msg}`);
    }
  }
}
