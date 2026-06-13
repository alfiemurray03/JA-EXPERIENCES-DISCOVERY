import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_reseller_audit } from '../../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const log = await db.select().from(ja_reseller_audit).orderBy(desc(ja_reseller_audit.createdAt)).limit(500);
  return res.json({ success: true, log });
}
