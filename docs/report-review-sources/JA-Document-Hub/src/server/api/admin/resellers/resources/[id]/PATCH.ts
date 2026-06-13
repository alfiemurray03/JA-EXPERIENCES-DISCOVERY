import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_reseller_resources } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { id } = req.params;
  const { title, description, category, fileUrl, externalUrl, fileType, sortOrder, isActive } = req.body;

  await db.update(ja_reseller_resources).set({
    ...(title && { title: title.trim() }),
    ...(description !== undefined && { description: description?.trim() ?? null }),
    ...(category && { category }),
    ...(fileUrl !== undefined && { fileUrl: fileUrl?.trim() ?? null }),
    ...(externalUrl !== undefined && { externalUrl: externalUrl?.trim() ?? null }),
    ...(fileType !== undefined && { fileType: fileType?.trim() ?? null }),
    ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    ...(isActive !== undefined && { isActive: !!isActive }),
    updatedAt: new Date(),
  }).where(eq(ja_reseller_resources.uuid, id));

  return res.json({ success: true });
}
