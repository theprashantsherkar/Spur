import type { ChatMessage } from '../types.js';

export interface LlmProvider {
  generateReply(history: ChatMessage[], userMessage: string): Promise<string>;
}
