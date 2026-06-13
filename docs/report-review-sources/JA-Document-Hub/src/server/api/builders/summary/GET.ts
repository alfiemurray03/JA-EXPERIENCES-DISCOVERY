/**
 * GET /api/builders/summary
 * Returns merged builder metadata (static defaults + DB overrides) for the
 * Builders Hub page. Requires a valid user session.
 *
 * Merges two layers:
 *  1. ja_builder_meta_overrides  — builder-level label/description/accentColor
 *  2. ja_builder_template_overrides — template-level status/popular counts
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_template_overrides, ja_builder_meta_overrides } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

import { LETTER_TEMPLATES }         from '../../../../lib/builders/letter-templates.js';
import { EMAIL_BUILDER_TEMPLATES }  from '../../../../lib/builders/email-builder-templates.js';
import { INVOICE_TEMPLATES }        from '../../../../lib/builders/invoice-templates.js';
import { CONTRACT_TEMPLATES }       from '../../../../lib/builders/contract-templates.js';
import { POLICY_TEMPLATES }         from '../../../../lib/builders/policy-templates.js';
import { FORM_TEMPLATES }           from '../../../../lib/builders/form-templates.js';
import { REPORT_TEMPLATES }         from '../../../../lib/builders/report-templates.js';
import { MINUTES_TEMPLATES }        from '../../../../lib/builders/minutes-templates.js';
import { PROPOSAL_TEMPLATES }       from '../../../../lib/builders/proposal-templates.js';
import { CHECKLIST_TEMPLATES }      from '../../../../lib/builders/checklist-templates.js';
import { BUILDER_META }             from '../../../../lib/builder-framework.js';

const STATIC_TEMPLATES: Record<string, { id: string; status: string; popular?: boolean }[]> = {
  letter:    LETTER_TEMPLATES,
  email:     EMAIL_BUILDER_TEMPLATES,
  invoice:   INVOICE_TEMPLATES,
  contract:  CONTRACT_TEMPLATES,
  policy:    POLICY_TEMPLATES,
  form:      FORM_TEMPLATES,
  report:    REPORT_TEMPLATES,
  minutes:   MINUTES_TEMPLATES,
  proposal:  PROPOSAL_TEMPLATES,
  checklist: CHECKLIST_TEMPLATES,
};

const DEFAULT_ACCENT: Record<string, string> = {
  letter:    '#1B4F8A',
  email:     '#7c3aed',
  invoice:   '#b45309',
  contract:  '#dc2626',
  policy:    '#16a34a',
  form:      '#0891b2',
  report:    '#ea580c',
  minutes:   '#0f766e',
  proposal:  '#be185d',
  checklist: '#65a30d',
};

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    // Fetch both override tables in parallel
    const [templateRows, metaRows] = await Promise.all([
      db.select().from(ja_builder_template_overrides),
      db.select().from(ja_builder_meta_overrides),
    ]);

    // Build template override map: builderId -> templateId -> { status, popular }
    const templateOverrideMap: Record<string, Record<string, { status?: string; popular?: boolean }>> = {};
    for (const row of templateRows) {
      if (!templateOverrideMap[row.builderId]) templateOverrideMap[row.builderId] = {};
      templateOverrideMap[row.builderId][row.templateId] = {
        status:  row.status  ?? undefined,
        popular: row.popular ?? undefined,
      };
    }

    // Build meta override map: builderId -> { label, description, accentColor }
    const metaOverrideMap: Record<string, { label?: string; description?: string; accentColor?: string }> = {};
    for (const row of metaRows) {
      metaOverrideMap[row.builderId] = {
        label:       row.label       ?? undefined,
        description: row.description ?? undefined,
        accentColor: row.accentColor ?? undefined,
      };
    }

    // Build summary for each builder
    const builders = BUILDER_META.map(meta => {
      const staticTemplates = STATIC_TEMPLATES[meta.id] ?? [];
      const tOverrides = templateOverrideMap[meta.id] ?? {};
      const mOverride  = metaOverrideMap[meta.id] ?? {};

      // Merge static + template overrides for counts
      const merged = staticTemplates.map(t => ({
        ...t,
        ...(tOverrides[t.id] ?? {}),
      }));

      const activeCount  = merged.filter(t => t.status === 'active').length;
      const popularCount = merged.filter(t => t.status === 'active' && t.popular).length;

      return {
        id:          meta.id,
        label:       mOverride.label       ?? meta.label,
        description: mOverride.description ?? meta.description,
        href:        meta.href,
        accentColor: mOverride.accentColor ?? DEFAULT_ACCENT[meta.id] ?? '#1B4F8A',
        activeCount,
        popularCount,
      };
    });

    return res.json({ success: true, builders });
  } catch (err) {
    console.error('GET /api/builders/summary error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
