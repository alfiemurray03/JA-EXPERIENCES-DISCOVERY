/**
 * POST /api/admin/stripe/test-connection
 * Tests the Stripe API connection using the configured secret key.
 * Returns account info without exposing the key.
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

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) {
    return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });
  }

  // Any admin authenticated via Microsoft OIDC has full platform owner access.
  // No ja_admin_accounts lookup required — the OIDC session IS the authority.

  // DB override takes priority over env secret
  const secretKey = await getConfigValue('stripe_secret_key_override', getSecret('STRIPE_SECRET_KEY') as string | null);

  if (!secretKey) {
    await logAdminAction(adminEmail, 'stripe.test-connection.failed', 'No Stripe secret key configured', req);
    return res.json({ success: false, error: 'No Stripe secret key configured. Add your secret key in the API Keys tab.' });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    const account = await stripe.accounts.retrieve('self' as string);

    await logAdminAction(adminEmail, 'stripe.test-connection.success', `Stripe connection test passed — account ${account.id}`, req);

    return res.json({
      success: true,
      account: {
        id:              account.id,
        businessName:    account.business_profile?.name ?? account.settings?.dashboard?.display_name ?? null,
        country:         account.country ?? null,
        defaultCurrency: account.default_currency ?? null,
        chargesEnabled:  account.charges_enabled,
        payoutsEnabled:  account.payouts_enabled,
        email:           account.email ?? null,
        isLiveMode:      secretKey.startsWith('sk_live_'),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logAdminAction(adminEmail, 'stripe.test-connection.failed', `Stripe connection test failed: ${message}`, req);
    return res.json({ success: false, error: message });
  }
}
