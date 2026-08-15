import { NextFunction, Request, Response } from 'express';
import { errorEnvelope } from '../util/validate';

export interface AuthedRequest extends Request {
  userId?: string;
}

const VALID_TOKENS: Record<string, string> = {
  'token-u1': 'u1',
  'token-u2': 'u2',
  'token-u3': 'u3',
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json(errorEnvelope('UNAUTHENTICATED', 'Missing bearer token'));
    return;
  }
  const token = header.slice('Bearer '.length);
  const userId = VALID_TOKENS[token];
  if (!userId) {
    res.status(401).json(errorEnvelope('UNAUTHENTICATED', 'Invalid bearer token'));
    return;
  }
  req.userId = userId;
  next();
}
