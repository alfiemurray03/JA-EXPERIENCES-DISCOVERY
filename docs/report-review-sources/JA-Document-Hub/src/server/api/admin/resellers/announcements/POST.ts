import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../../../db/client.js';
import { ja_reseller_announcements } from '../../../../db/schema.js';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { title, body, priority } = req.body;
  if (!title || !body) return res.status(400).json({ success: false, error: 'Title and body are required.' });

  await db.insert(ja_reseller_announcements).values({
    uuid: randomUUID(),
    title: title.trim(),
    body: body.trim(),
    priority: priority ?? 'normal',
    isActive: true,
    createdBy: identity.email,
  });

  return res.status(201).json({ success: true });
}
