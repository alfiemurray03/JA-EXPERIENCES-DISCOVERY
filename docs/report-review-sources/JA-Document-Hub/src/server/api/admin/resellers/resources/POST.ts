import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../../../db/client.js';
import { ja_reseller_resources } from '../../../../db/schema.js';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { title, description, category, fileUrl, externalUrl, fileType, sortOrder } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Title is required.' });

  await db.insert(ja_reseller_resources).values({
    uuid: randomUUID(),
    title: title.trim(),
    description: description?.trim() ?? null,
    category: category ?? 'general',
    fileUrl: fileUrl?.trim() ?? null,
    externalUrl: externalUrl?.trim() ?? null,
    fileType: fileType?.trim() ?? null,
    sortOrder: Number(sortOrder ?? 0),
    isActive: true,
    createdBy: identity.email,
  });

  return res.status(201).json({ success: true });
}
