import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { buildSystemPrompt } from '../services/prompt.js';
import type { LlmProvider } from './provider.js';
import type { ChatMessage } from '../types.js';

const TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`LLM timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export class GeminiProvider implements LlmProvider {
  private readonly ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  async generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
    const contents = [
      ...history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await withTimeout(
      this.ai.models.generateContent({
        model: config.geminiModel,
        contents,
        config: {
          systemInstruction: buildSystemPrompt(),
          maxOutputTokens: config.maxOutputTokens,
          temperature: 0.3,
        },
      }),
      TIMEOUT_MS
    );

    return response.text ?? '';
  }
}
