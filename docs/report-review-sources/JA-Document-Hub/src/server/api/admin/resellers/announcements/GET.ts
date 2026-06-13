import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_reseller_announcements } from '../../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const announcements = await db.select().from(ja_reseller_announcements).orderBy(desc(ja_reseller_announcements.createdAt));
  return res.json({ success: true, announcements });
}
