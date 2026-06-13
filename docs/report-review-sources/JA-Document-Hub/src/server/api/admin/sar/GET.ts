/**
 * GET /api/admin/sar
 * Returns all SAR requests with optional filtering.
 * Query params: status, requestType, search (email/name), overdue (true/false)
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_sar_requests, ja_users } from '../../../db/schema.js';
import { requireAdminRole } from '../_require-role.js';
import { desc, eq, like, and, or, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator', 'Admin', 'SupportAdmin']);
  if (!identity) return;

  const { status, requestType, search, overdue } = req.query as Record<string, string>;

  try {
    // Build where conditions
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(ja_sar_requests.status, status as 'submitted' | 'in_review' | 'processing' | 'ready' | 'completed' | 'rejected' | 'unable_to_complete'));
    }

    if (requestType && requestType !== 'all') {
      conditions.push(eq(ja_sar_requests.requestType, requestType as 'sar' | 'export' | 'deletion' | 'rectification' | 'restriction' | 'portability' | 'objection'));
    }

    if (overdue === 'true') {
      conditions.push(lte(ja_sar_requests.deadlineAt, new Date()));
      // Only overdue if not yet completed/rejected
      conditions.push(
        sql`${ja_sar_requests.status} NOT IN ('completed', 'rejected', 'unable_to_complete')`
      );
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          like(ja_sar_requests.email, pattern),
          like(ja_sar_requests.fullName, pattern),
          like(ja_sar_requests.uuid, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db
      .select()
      .from(ja_sar_requests)
      .where(whereClause)
      .orderBy(desc(ja_sar_requests.createdAt))
      .limit(200);

    // Compute deadline status for each
    const now = new Date();
    const enriched = requests.map(r => {
      const deadline = r.deadlineExtendedAt ?? r.deadlineAt;
      const daysRemaining = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysRemaining < 0 && !['completed', 'rejected', 'unable_to_complete'].includes(r.status);
      const isUrgent = daysRemaining >= 0 && daysRemaining <= 5 && !['completed', 'rejected', 'unable_to_complete'].includes(r.status);

      return {
        ...r,
        daysRemaining,
        isOverdue,
        isUrgent,
        // Never expose download token or export path to admin list view
        downloadToken: undefined,
        exportPath: undefined,
      };
    });

    // Summary counts
    const summary = {
      total: enriched.length,
      submitted: enriched.filter(r => r.status === 'submitted').length,
      in_review: enriched.filter(r => r.status === 'in_review').length,
      processing: enriched.filter(r => r.status === 'processing').length,
      ready: enriched.filter(r => r.status === 'ready').length,
      completed: enriched.filter(r => r.status === 'completed').length,
      overdue: enriched.filter(r => r.isOverdue).length,
      urgent: enriched.filter(r => r.isUrgent).length,
    };

    return res.json({ success: true, requests: enriched, summary });
  } catch (err) {
    console.error('admin.sar.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
