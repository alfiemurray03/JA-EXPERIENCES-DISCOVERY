import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_reseller_resources } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { id } = req.params;
  await db.delete(ja_reseller_resources).where(eq(ja_reseller_resources.uuid, id));
  return res.json({ success: true });
}
