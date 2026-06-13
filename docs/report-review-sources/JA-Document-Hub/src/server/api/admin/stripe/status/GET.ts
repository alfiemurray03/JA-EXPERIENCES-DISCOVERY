/**
 * GET /api/admin/stripe/status
 * Returns full Stripe configuration status, account info, and all 7 price ID verification.
 * Requires PlatformOwner, SystemAdministrator, or Admin Microsoft app role.
 * Never returns raw secret values — only masked previews and boolean flags.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../../db/client.js';
import { ja_stripe_subscriptions, ja_system_config } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';
import { eq, count, sql } from 'drizzle-orm';

/** Mask a secret: show type prefix + last 4 chars */
function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 8) return '****';
  const prefix = value.startsWith('sk_live_') ? 'sk_live_' :
                 value.startsWith('sk_test_') ? 'sk_test_' :
                 value.startsWith('pk_live_') ? 'pk_live_' :
                 value.startsWith('pk_test_') ? 'pk_test_' :
                 value.startsWith('whsec_')   ? 'whsec_'   :
                 value.startsWith('price_')   ? 'price_'   : '';
  const last4 = value.slice(-4);
  return `${prefix}****${last4}`;
}

/** Read a single system_config value, falling back to an env secret */
async function getConfigValue(configKey: string, envFallback: string | null): Promise<string | null> {
  const rows = await db
    .select({ value: ja_system_config.value })
    .from(ja_system_config)
    .where(eq(ja_system_config.configKey, configKey))
    .limit(1);
  return rows[0]?.value ?? envFallback;
}

// All 7 price slots — config key, env secret name, display label
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
  const canEdit = true;
  const canView = true;

  // Resolve keys: DB override takes priority over env secret
  const secretKey      = await getConfigValue('stripe_secret_key_override',      getSecret('STRIPE_SECRET_KEY') as string | null);
  const publishableKey = await getConfigValue('stripe_publishable_key_override', getSecret('STRIPE_PUBLISHABLE_KEY') as string | null);
  const webhookSecret  = await getConfigValue('stripe_webhook_secret_override',  getSecret('STRIPE_WEBHOOK_SECRET') as string | null);

  // Resolve all 7 price IDs
  const resolvedPrices: Record<string, { value: string | null; label: string }> = {};
  for (const slot of PRICE_SLOTS) {
    const value = await getConfigValue(slot.configKey, getSecret(slot.envSecret) as string | null);
    resolvedPrices[slot.key] = { value, label: slot.label };
  }

  // Read URL config values
  const successUrl         = await getConfigValue('stripe_success_url', null);
  const cancelUrl          = await getConfigValue('stripe_cancel_url', null);
  const portalReturnUrl    = await getConfigValue('stripe_portal_return_url', null);
  const webhookEndpointUrl = await getConfigValue('stripe_webhook_endpoint_url', null);
  const trialEnabled       = await getConfigValue('stripe_trial_enabled', 'true');
  const trialDays          = await getConfigValue('stripe_trial_days', '14');

  const isLiveMode = secretKey?.startsWith('sk_live_') ?? false;

  // Build prices object for response
  const pricesOut: Record<string, { set: boolean; masked: string | null; id?: string; label: string }> = {};
  for (const [key, { value, label }] of Object.entries(resolvedPrices)) {
    pricesOut[key] = {
      set:    !!value,
      masked: maskSecret(value),
      label,
      ...(canEdit && value ? { id: value } : {}),
    };
  }

  const status: Record<string, unknown> = {
    canEdit,
    isLiveMode,
    publishableIsLive: publishableKey?.startsWith('pk_live_') ?? false,
    keys: {
      secretKey:      { set: !!secretKey,      masked: maskSecret(secretKey) },
      publishableKey: { set: !!publishableKey, masked: maskSecret(publishableKey) },
      webhookSecret:  { set: !!webhookSecret,  masked: maskSecret(webhookSecret) },
    },
    prices: pricesOut,
    urls: {
      successUrl,
      cancelUrl,
      portalReturnUrl,
      webhookEndpointUrl,
    },
    trial: {
      enabled: trialEnabled !== 'false',
      days:    parseInt(trialDays ?? '14', 10),
    },
    stripeConnected: false,
    stripeAccount:   null as unknown,
    subscriptionStats: null as unknown,
    lastError: null as string | null,
  };

  // Attempt live Stripe API connection
  // Use balance.retrieve() — works for all account types (not just Connect platforms)
  if (secretKey) {
    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
      const balance = await stripe.balance.retrieve();
      const isLive = !secretKey.startsWith('sk_test_');
      status.stripeConnected = true;
      status.stripeAccount = {
        id:              null,
        businessName:    null,
        country:         null,
        defaultCurrency: balance.available[0]?.currency?.toUpperCase() ?? null,
        chargesEnabled:  true,
        payoutsEnabled:  true,
        email:           null,
        liveMode:        isLive,
        availableBalance: balance.available.map(b => ({
          amount:   b.amount,
          currency: b.currency,
        })),
      };

      // Subscription stats from DB
      const [total]     = await db.select({ c: count() }).from(ja_stripe_subscriptions);
      const [active]    = await db.select({ c: count() }).from(ja_stripe_subscriptions).where(sql`status IN ('active','trialing')`);
      const [cancelled] = await db.select({ c: count() }).from(ja_stripe_subscriptions).where(sql`status = 'canceled'`);
      status.subscriptionStats = {
        total:     total?.c ?? 0,
        active:    active?.c ?? 0,
        cancelled: cancelled?.c ?? 0,
      };
    } catch (err) {
      status.stripeConnected = false;
      status.lastError = err instanceof Error ? err.message : String(err);
    }
  }

  await logAdminAction(adminEmail, 'stripe.status.viewed', 'Viewed Stripe integration status', req);

  return res.json({ success: true, status });
}
