import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_reseller_resources } from '../../../../db/schema.js';
import { asc } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const resources = await db.select().from(ja_reseller_resources).orderBy(asc(ja_reseller_resources.sortOrder), asc(ja_reseller_resources.title));
  return res.json({ success: true, resources });
}
