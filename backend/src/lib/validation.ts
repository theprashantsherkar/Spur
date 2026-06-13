import { z } from 'zod';

export const sendMessageBody = z.object({
  message: z.string(),
  // Malformed / non-UUID sessionId silently becomes undefined → new conversation
  sessionId: z.string().uuid().optional().catch(undefined),
});

export const historyQuery = z.object({
  // Malformed sessionId silently becomes undefined → empty history response
  sessionId: z.string().uuid().optional().catch(undefined),
});

export type SendMessageBody = z.infer<typeof sendMessageBody>;
export type HistoryQuery = z.infer<typeof historyQuery>;
