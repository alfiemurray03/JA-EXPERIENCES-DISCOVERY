/**
 * POST /api/admin/stripe/verify-prices
 * Verifies all 7 configured price IDs against the Stripe API.
 * Returns product name, amount, currency, interval, and active status per price.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../../db/client.js';
import { ja_system_config } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';
import { eq } from 'drizzle-orm';

async function getConfigValue(configKey: string, envFallback: string | null): Promise<string | null> {
  const rows = await db
    .select({ value: ja_system_config.value })
    .from(ja_system_config)
    .where(eq(ja_system_config.configKey, configKey))
    .limit(1);
  return rows[0]?.value ?? envFallback;
}

const PRICE_SLOTS = [
  { key: 'personal',         configKey: 'stripe_price_personal_override',         envSecret: 'STRIPE_PRICE_PERSONAL',         label: 'Personal' },
  { key: 'standard',         configKey: 'stripe_price_standard_override',         envSecret: 'STRIPE_PRICE_STANDARD',         label: 'Standard' },
  { key: 'professional',     configKey: 'stripe_price_professional_override',     envSecret: 'STRIPE_PRICE_PROFESSIONAL',     label: 'Professional' },
  { key: 'org_starter',      configKey: 'stripe_price_org_starter_override',      envSecret: 'STRIPE_PRICE_ORG_STARTER',      label: 'Organisation Starter' },
  { key: 'org',              configKey: 'stripe_price_org_override',              envSecret: 'STRIPE_PRICE_ORG',              label: 'Organisation (legacy)' },
  { key: 'org_growth',       configKey: 'stripe_price_org_growth_override',       envSecret: 'STRIPE_PRICE_ORG_GROWTH',       label: 'Organisation Growth' },
  { key: 'org_professional', configKey: 'stripe_price_org_professional_override', envSecret: 'STRIPE_PRICE_ORG_PROFESSIONAL', label: 'Organisation Professional' },
] as const;

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) {
    return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });
  }

  // Any admin authenticated via Microsoft OIDC has full platform owner access.
  // No ja_admin_accounts lookup required — the OIDC session IS the authority.

  const secretKey = await getConfigValue('stripe_secret_key_override', getSecret('STRIPE_SECRET_KEY') as string | null);
  if (!secretKey) {
    return res.json({ success: false, error: 'No Stripe secret key configured.' });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    const results: Record<string, unknown> = {};

    for (const slot of PRICE_SLOTS) {
      const priceId = await getConfigValue(slot.configKey, getSecret(slot.envSecret) as string | null);
      if (!priceId) {
        results[slot.key] = { set: false, valid: false, label: slot.label, error: 'Not configured' };
        continue;
      }
      try {
        const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
        const product = price.product as Stripe.Product | null;
        results[slot.key] = {
          set:      true,
          valid:    true,
          label:    slot.label,
          id:       price.id,
          product:  product?.name ?? null,
          amount:   price.unit_amount,
          currency: price.currency?.toUpperCase(),
          interval: price.recurring?.interval ?? 'one_time',
          active:   price.active,
        };
      } catch (err) {
        results[slot.key] = {
          set:   true,
          valid: false,
          label: slot.label,
          id:    priceId,
          error: err instanceof Error ? err.message : 'Price not found or inaccessible',
        };
      }
    }

    await logAdminAction(adminEmail, 'stripe.verify-prices.run', 'Verified all Stripe price IDs', req);
    return res.json({ success: true, prices: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logAdminAction(adminEmail, 'stripe.verify-prices.failed', `Price verification failed: ${message}`, req);
    return res.json({ success: false, error: message });
  }
}
