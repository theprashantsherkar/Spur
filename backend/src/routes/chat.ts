import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { sendMessageBody, historyQuery } from '../lib/validation.js';
import { sendMessage, getHistory } from '../services/chatService.js';
import { ValidationError } from '../lib/errors.js';

export const chatRouter = Router();

chatRouter.post('/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = sendMessageBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid request body.');
    }

    const { message, sessionId } = parsed.data;

    if (!message.trim()) {
      throw new ValidationError('Message cannot be empty.');
    }

    const result = await sendMessage(message, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

chatRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = historyQuery.safeParse(req.query);
    const sessionId = parsed.success ? parsed.data.sessionId : undefined;

    if (!sessionId) {
      res.json({ sessionId: '', messages: [] });
      return;
    }

    const messages = await getHistory(sessionId);
    res.json({ sessionId, messages });
  } catch (err) {
    next(err);
  }
});
