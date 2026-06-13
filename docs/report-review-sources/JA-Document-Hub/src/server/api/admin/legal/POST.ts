/**
 * POST /api/admin/legal
 * Save draft or publish a legal document.
 * Admin-only. Writes to ja_system_config with legal_ prefix.
 * Appends to audit trail stored as JSON in a separate config key.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';
import { sql } from 'drizzle-orm';

interface LegalPayload {
  slug: string;
  title: string;
  body: string;
  effectiveDate: string;
  action: 'save_draft' | 'publish';
}

async function upsertConfig(key: string, value: string) {
  await db.execute(
    sql`INSERT INTO ja_system_config (config_key, value) VALUES (${key}, ${value})
        ON DUPLICATE KEY UPDATE value = ${value}`
  );
}

async function appendAudit(slug: string, entry: { action: string; adminName: string; timestamp: string; detail?: string }) {
  const auditKey = `legal_audit_${slug.replace(/-/g, '_')}`;
  // Read existing
  const rows = await db.select().from(ja_system_config).where(eq(ja_system_config.configKey, auditKey));
  let existing: unknown[] = [];
  if (rows[0]?.value) {
    try { existing = JSON.parse(String(rows[0].value)); } catch { existing = []; }
  }
  existing.unshift(entry); // newest first
  if (existing.length > 50) existing = existing.slice(0, 50); // cap at 50 entries
  await upsertConfig(auditKey, JSON.stringify(existing));
}

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const { slug, title, body, effectiveDate, action } = req.body as LegalPayload;

  if (!slug || !body || !action) {
    return res.status(400).json({ success: false, error: 'slug, body, and action are required.' });
  }

  const slugKey = slug.replace(/-/g, '_');
  const now = new Date().toISOString();
  const adminName = identity.name ?? identity.email ?? 'Admin';

  try {
    // Read current version
    const versionKey = `legal_${slugKey}_version`;
    const versionRow = await db.select().from(ja_system_config).where(eq(ja_system_config.configKey, versionKey));
    const currentVersion = parseInt(String(versionRow[0]?.value ?? '0'), 10);
    const newVersion = currentVersion + 1;

    // Save all fields
    await Promise.all([
      upsertConfig(`legal_${slugKey}_title`,         title ?? slug),
      upsertConfig(`legal_${slugKey}_body`,           body),
      upsertConfig(`legal_${slugKey}_effectiveDate`,  effectiveDate ?? now.split('T')[0]),
      upsertConfig(`legal_${slugKey}_version`,        String(newVersion)),
      upsertConfig(`legal_${slugKey}_updatedBy`,      adminName),
      upsertConfig(`legal_${slugKey}_updatedAt`,      now),
      upsertConfig(`legal_${slugKey}_status`,         action === 'publish' ? 'published' : 'draft'),
    ]);

    if (action === 'publish') {
      await upsertConfig(`legal_${slugKey}_publishedAt`, now);
    }

    // Append audit entry
    await appendAudit(slug, {
      action: action === 'publish' ? 'Published' : 'Saved Draft',
      adminName,
      timestamp: now,
      detail: `Version ${newVersion}`,
    });

    const doc = {
      slug,
      title: title ?? slug,
      body,
      status: action === 'publish' ? 'published' : 'draft',
      effectiveDate: effectiveDate ?? now.split('T')[0],
      version: newVersion,
      updatedBy: adminName,
      updatedAt: now,
      publishedAt: action === 'publish' ? now : undefined,
    };

    return res.json({ success: true, doc });
  } catch (err) {
    console.error('admin.legal.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to save legal document.' });
  }
}
