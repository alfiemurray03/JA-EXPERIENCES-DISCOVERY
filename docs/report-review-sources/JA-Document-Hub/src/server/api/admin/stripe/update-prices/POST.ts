/**
 * POST /api/admin/stripe/update-prices
 * Update Stripe price IDs (all 7 plans) and trial settings.
 * Requires PlatformOwner or SystemAdministrator Microsoft app role.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';
import { sql } from 'drizzle-orm';

interface UpdatePricesBody {
  pricePersonal?:        string;
  priceStandard?:        string;
  priceProfessional?:    string;
  priceOrgStarter?:      string;
  priceOrg?:             string;
  priceOrgGrowth?:       string;
  priceOrgProfessional?: string;
  trialDays?:            number;
  trialEnabled?:         boolean;
}

async function upsertConfig(configKey: string, value: string): Promise<void> {
  await db.execute(
    sql`INSERT INTO ja_system_config (config_key, value)
        VALUES (${configKey}, ${value})
        ON DUPLICATE KEY UPDATE value = ${value}, updated_at = NOW()`
  );
}

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) {
    return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });
  }

  // Any admin authenticated via Microsoft OIDC has full platform owner access.
  // No ja_admin_accounts lookup required — the OIDC session IS the authority.

  const body = req.body as UpdatePricesBody;
  const errors: string[] = [];
  const updated: string[] = [];

  // All 7 price fields: [bodyField, configKey, label]
  const priceFields: Array<[string | undefined, string, string]> = [
    [body.pricePersonal,        'stripe_price_personal_override',         'pricePersonal'],
    [body.priceStandard,        'stripe_price_standard_override',         'priceStandard'],
    [body.priceProfessional,    'stripe_price_professional_override',     'priceProfessional'],
    [body.priceOrgStarter,      'stripe_price_org_starter_override',      'priceOrgStarter'],
    [body.priceOrg,             'stripe_price_org_override',              'priceOrg'],
    [body.priceOrgGrowth,       'stripe_price_org_growth_override',       'priceOrgGrowth'],
    [body.priceOrgProfessional, 'stripe_price_org_professional_override', 'priceOrgProfessional'],
  ];

  // Validate: must start with price_ if provided
  for (const [val, , label] of priceFields) {
    if (val?.trim() && !val.trim().startsWith('price_')) {
      errors.push(`${label} must start with price_`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Persist each provided value
  for (const [val, configKey, label] of priceFields) {
    if (val?.trim()) {
      await upsertConfig(configKey, val.trim());
      updated.push(label);
    }
  }

  if (body.trialDays !== undefined) {
    const days = Math.max(0, Math.min(90, Number(body.trialDays)));
    await upsertConfig('stripe_trial_days', String(days));
    updated.push('trialDays');
  }
  if (body.trialEnabled !== undefined) {
    await upsertConfig('stripe_trial_enabled', body.trialEnabled ? 'true' : 'false');
    updated.push('trialEnabled');
  }

  if (updated.length === 0) {
    return res.status(400).json({ success: false, error: 'No fields provided to update.' });
  }

  await logAdminAction(
    adminEmail,
    'stripe.prices.updated',
    `Updated Stripe price configuration: ${updated.join(', ')}`,
    req,
  );

  return res.json({ success: true, updated });
}
