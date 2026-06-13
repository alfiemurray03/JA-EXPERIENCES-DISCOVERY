/**
 * GET /api/user/sar
 * Returns the authenticated user's Subject Access Requests.
 * Customers can only see their own requests.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_sar_requests } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  }

  try {
    const requests = await db
      .select({
        id:                   ja_sar_requests.id,
        uuid:                 ja_sar_requests.uuid,
        requestType:          ja_sar_requests.requestType,
        notes:                ja_sar_requests.notes,
        status:               ja_sar_requests.status,
        deadlineAt:           ja_sar_requests.deadlineAt,
        deadlineExtendedAt:   ja_sar_requests.deadlineExtendedAt,
        identityVerified:     ja_sar_requests.identityVerified,
        adminNotes:           ja_sar_requests.adminNotes,
        rejectionReason:      ja_sar_requests.rejectionReason,
        processedAt:          ja_sar_requests.processedAt,
        // Export availability
        exportReady:          ja_sar_requests.exportGeneratedAt,
        downloadTokenExpires: ja_sar_requests.downloadTokenExpiresAt,
        downloadToken:        ja_sar_requests.downloadToken,   // exposed only when valid (see below)
        downloadCount:        ja_sar_requests.downloadCount,
        exportFileSizeBytes:  ja_sar_requests.exportFileSizeBytes,
        createdAt:            ja_sar_requests.createdAt,
        updatedAt:            ja_sar_requests.updatedAt,
      })
      .from(ja_sar_requests)
      .where(eq(ja_sar_requests.userId, userId))
      .orderBy(desc(ja_sar_requests.createdAt));

    // Compute whether a download is currently available (token exists and not expired).
    // Expose the download token only when the export is ready and the token is valid —
    // the customer needs it to call the download endpoint.
    const now = new Date();
    const enriched = requests.map(r => {
      const tokenValid = !!(
        r.status === 'ready' &&
        r.downloadToken &&
        r.downloadTokenExpires &&
        new Date(r.downloadTokenExpires) > now
      );
      return {
        ...r,
        downloadAvailable: tokenValid,
        // Redact the token once it's no longer usable
        downloadToken: tokenValid ? r.downloadToken : null,
      };
    });

    return res.json({ success: true, requests: enriched });
  } catch (err) {
    console.error('user.sar.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
