import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_resellers } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveResellerSession, clearResellerCookie } from '../../_session.js';

export default async function handler(req: Request, res: Response) {
  const reseller = await resolveResellerSession(req);
  if (reseller) {
    await db.update(ja_resellers).set({ sessionToken: null, sessionExpiresAt: null }).where(eq(ja_resellers.id, reseller.id));
  }
  clearResellerCookie(res);
  return res.json({ success: true });
}
