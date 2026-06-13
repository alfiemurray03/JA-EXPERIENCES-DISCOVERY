import { type Request, type Response } from 'express';

export default function handler(_req: Request, res: Response) {
  res.clearCookie('auth_token');
  res.json({ success: true });
}
