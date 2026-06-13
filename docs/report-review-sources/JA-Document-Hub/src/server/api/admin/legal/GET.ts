/**
 * GET /api/admin/legal
 * Returns all legal documents and their audit trails.
 * Admin-only.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { like } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';

const LEGAL_SLUGS = ['privacy-policy', 'terms-of-service', 'cookie-policy', 'acceptable-use'];

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  try {
    // Load all legal_ keys from ja_system_config
    const rows = await db
      .select()
      .from(ja_system_config)
      .where(like(ja_system_config.configKey, 'legal_%'));

    const docMap: Record<string, Record<string, string>> = {};
    const auditMap: Record<string, unknown[]> = {};

    for (const row of rows) {
      const key = row.configKey; // e.g. legal_privacy-policy_body
      const parts = key.split('_');
      if (parts.length < 3) continue;
      // Format: legal_{slug}_{field} — but slug may contain hyphens
      // We stored as legal_{slug}_body, legal_{slug}_status, etc.
      const slug = parts.slice(1, parts.length - 1).join('_').replace(/_/g, '-');
      const field = parts[parts.length - 1];
      if (!docMap[slug]) docMap[slug] = {};
      docMap[slug][field] = String(row.value ?? '');
    }

    // Load audit entries
    for (const slug of LEGAL_SLUGS) {
      const auditKey = `legal_audit_${slug.replace(/-/g, '_')}`;
      const auditRow = rows.find(r => r.configKey === auditKey);
      if (auditRow?.value) {
        try { auditMap[slug] = JSON.parse(String(auditRow.value)); } catch { auditMap[slug] = []; }
      } else {
        auditMap[slug] = [];
      }
    }

    // Build doc list
    const docs = LEGAL_SLUGS.map(slug => {
      const d = docMap[slug] ?? {};
      return {
        slug,
        title: d.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        body: d.body ?? '',
        status: (d.status as 'draft' | 'published' | 'archived') ?? 'draft',
        effectiveDate: d.effectiveDate ?? new Date().toISOString().split('T')[0],
        version: parseInt(d.version ?? '1', 10),
        updatedBy: d.updatedBy ?? 'System',
        updatedAt: d.updatedAt ?? new Date().toISOString(),
        publishedAt: d.publishedAt,
      };
    });

    return res.json({ success: true, docs, audit: auditMap });
  } catch (err) {
    console.error('admin.legal.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load legal documents.' });
  }
}
