/**
 * GET /api/documents/audit
 * Returns a combined audit log of document activity and signing events
 * for the authenticated user. Merges:
 *  - ja_builder_docs (document saves/creates)
 *  - ja_signing_requests (signing request lifecycle)
 *  - ja_signing_audit (per-event signing audit trail)
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_docs, ja_signing_requests, ja_signing_audit } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  try {

    // 1. Document saves (builder docs)
    const docs = await db
      .select()
      .from(ja_builder_docs)
      .where(eq(ja_builder_docs.userId, userId))
      .orderBy(desc(ja_builder_docs.createdAt))
      .limit(200);

    const docEntries = docs.map(d => ({
      id:            d.id * 10,
      type:          'document' as const,
      event:         d.status === 'draft' ? 'document_saved' : 'document_created',
      title:         d.title,
      detail:        `${d.builderId ? d.builderId.charAt(0).toUpperCase() + d.builderId.slice(1) : ''} builder`,
      builderId:     d.builderId,
      signingStatus: null,
      signerEmail:   null,
      ipAddress:     null,
      createdAt:     new Date(d.createdAt).toISOString(),
    }));

    // 2. Signing requests (owned by this user)
    const signingReqs = await db
      .select()
      .from(ja_signing_requests)
      .where(eq(ja_signing_requests.userId, userId))
      .orderBy(desc(ja_signing_requests.createdAt))
      .limit(200);

    const signingReqEntries = signingReqs.map(r => ({
      id:            r.id * 10 + 1,
      type:          'signing' as const,
      event:         'signing_created',
      title:         r.title,
      detail:        r.documentName ?? null,
      builderId:     null,
      signingStatus: r.status,
      signerEmail:   null,
      ipAddress:     null,
      createdAt:     new Date(r.createdAt).toISOString(),
    }));

    // 3. Signing audit events for this user's requests
    const reqIds = signingReqs.map(r => r.id);
    let auditEntries: typeof signingReqEntries = [];

    if (reqIds.length > 0) {
      // Fetch audit rows for all user's signing requests
      const auditRows = await db
        .select({
          id:          ja_signing_audit.id,
          requestId:   ja_signing_audit.requestId,
          event:       ja_signing_audit.event,
          detail:      ja_signing_audit.detail,
          signerEmail: ja_signing_audit.signerEmail,
          ipAddress:   ja_signing_audit.ipAddress,
          createdAt:   ja_signing_audit.createdAt,
        })
        .from(ja_signing_audit)
        .orderBy(desc(ja_signing_audit.createdAt))
        .limit(500);

      // Filter to only this user's requests
      const userReqIdSet = new Set(reqIds);
      const reqTitleMap = new Map(signingReqs.map(r => [r.id, r.title]));

      auditEntries = auditRows
        .filter(a => userReqIdSet.has(a.requestId))
        .map(a => ({
          id:            a.id * 10 + 2,
          type:          'signing' as const,
          event:         `signing_${a.event}`.replace('signing_signing_', 'signing_'),
          title:         reqTitleMap.get(a.requestId) ?? 'Signing Request',
          detail:        a.detail ?? null,
          builderId:     null,
          signingStatus: null,
          signerEmail:   a.signerEmail ?? null,
          ipAddress:     a.ipAddress ?? null,
          createdAt:     new Date(a.createdAt).toISOString(),
        }));
    }

    // Merge and sort by date descending
    const all = [...docEntries, ...signingReqEntries, ...auditEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 500);

    return res.json({ success: true, entries: all });
  } catch (err) {
    console.error('documents.audit.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load audit history.' });
  }
}
