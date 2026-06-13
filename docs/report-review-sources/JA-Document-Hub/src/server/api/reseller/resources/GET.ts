/**
 * GET /api/reseller/resources
 * Active reseller resources (marketing materials, guides, etc.)
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_reseller_resources } from '../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const resources = await db.select().from(ja_reseller_resources)
      .where(eq(ja_reseller_resources.isActive, true))
      .orderBy(asc(ja_reseller_resources.sortOrder), asc(ja_reseller_resources.title));
    return res.json({ success: true, resources });
  });
}
