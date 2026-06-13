/**
 * GET /api/admin/sar/:id/download
 * Admin-only download of a generated SAR export ZIP.
 * Requires admin session. Audit-logged.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_sar_requests } from '../../../../../db/schema.js';
import { requireAdminRole } from '../../../_require-role.js';
import { logAdminAction } from '../../../_audit-log.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator', 'Admin']);
  if (!identity) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid request ID.' });

  try {
    const rows = await db.select().from(ja_sar_requests).where(eq(ja_sar_requests.id, id)).limit(1);
    if (!rows.length) return res.status(404).json({ success: false, error: 'SAR request not found.' });

    const sar = rows[0];

    if (!sar.exportPath) {
      return res.status(404).json({ success: false, error: 'No export has been generated for this request yet.' });
    }

    if (!fs.existsSync(sar.exportPath)) {
      return res.status(404).json({ success: false, error: 'Export file not found on server.' });
    }

    await logAdminAction(
      identity.email,
      'sar.export.admin-download',
      `Admin downloaded SAR export for #${id} (${sar.uuid.slice(0, 8).toUpperCase()}) — ${sar.email}`,
      req,
    );

    const filename = `SAR-Export-${sar.uuid.slice(0, 8).toUpperCase()}-${sar.email.replace(/[^a-z0-9]/gi, '_')}.zip`;
    const stat = fs.statSync(sar.exportPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = fs.createReadStream(sar.exportPath);
    stream.pipe(res);
  } catch (err) {
    console.error('admin.sar.download.error', err);
    return res.status(500).json({ success: false, error: 'Download failed.' });
  }
}
