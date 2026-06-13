import type { LlmProvider } from './provider.js';
import { GeminiProvider } from './gemini.js';

export function createProvider(): LlmProvider {
  return new GeminiProvider();
}
