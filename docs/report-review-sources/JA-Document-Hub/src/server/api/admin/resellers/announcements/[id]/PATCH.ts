import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_reseller_announcements } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { id } = req.params;
  const { title, body, priority, isActive } = req.body;
  await db.update(ja_reseller_announcements).set({
    ...(title && { title: title.trim() }),
    ...(body && { body: body.trim() }),
    ...(priority && { priority }),
    ...(isActive !== undefined && { isActive: !!isActive }),
    updatedAt: new Date(),
  }).where(eq(ja_reseller_announcements.uuid, id));
  return res.json({ success: true });
}
