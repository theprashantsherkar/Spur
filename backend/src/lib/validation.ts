import { z } from 'zod';

export const sendMessageBody = z.object({
  message: z.string(),
  sessionId: z.string().uuid().optional(),
});

export const historyQuery = z.object({
  sessionId: z.string().uuid().optional(),
});

export type SendMessageBody = z.infer<typeof sendMessageBody>;
export type HistoryQuery = z.infer<typeof historyQuery>;
