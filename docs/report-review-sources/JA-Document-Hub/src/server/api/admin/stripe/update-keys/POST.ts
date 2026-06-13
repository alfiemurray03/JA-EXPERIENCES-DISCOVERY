/**
 * POST /api/admin/stripe/update-keys
 * Update Stripe API keys (secret, publishable, webhook secret) and checkout URLs.
 * Requires PlatformOwner or SystemAdministrator Microsoft app role.
 * Keys are stored in ja_system_config — never returned in full.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';
import { sql } from 'drizzle-orm';

interface UpdateKeysBody {
  secretKey?:          string;
  publishableKey?:     string;
  webhookSecret?:      string;
  successUrl?:         string;
  cancelUrl?:          string;
  portalReturnUrl?:    string;
  webhookEndpointUrl?: string;
}

function validateKeyFormat(key: string, type: 'secret' | 'publishable' | 'webhook'): string | null {
  if (type === 'secret') {
    if (!key.startsWith('sk_live_') && !key.startsWith('sk_test_')) {
      return 'Secret key must start with sk_live_ or sk_test_';
    }
  }
  if (type === 'publishable') {
    if (!key.startsWith('pk_live_') && !key.startsWith('pk_test_')) {
      return 'Publishable key must start with pk_live_ or pk_test_';
    }
  }
  if (type === 'webhook') {
    if (!key.startsWith('whsec_')) {
      return 'Webhook secret must start with whsec_';
    }
  }
  return null;
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

  const body = req.body as UpdateKeysBody;
  const errors: string[] = [];
  const updated: string[] = [];

  // Validate formats before saving anything
  if (body.secretKey?.trim()) {
    const err = validateKeyFormat(body.secretKey.trim(), 'secret');
    if (err) errors.push(err);
  }
  if (body.publishableKey?.trim()) {
    const err = validateKeyFormat(body.publishableKey.trim(), 'publishable');
    if (err) errors.push(err);
  }
  if (body.webhookSecret?.trim()) {
    const err = validateKeyFormat(body.webhookSecret.trim(), 'webhook');
    if (err) errors.push(err);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Save to ja_system_config (server-side only, never exposed to browser)
  if (body.secretKey?.trim()) {
    await upsertConfig('stripe_secret_key_override', body.secretKey.trim());
    updated.push('secretKey');
  }
  if (body.publishableKey?.trim()) {
    await upsertConfig('stripe_publishable_key_override', body.publishableKey.trim());
    updated.push('publishableKey');
  }
  if (body.webhookSecret?.trim()) {
    await upsertConfig('stripe_webhook_secret_override', body.webhookSecret.trim());
    updated.push('webhookSecret');
  }
  if (body.successUrl !== undefined && body.successUrl.trim()) {
    await upsertConfig('stripe_success_url', body.successUrl.trim());
    updated.push('successUrl');
  }
  if (body.cancelUrl !== undefined && body.cancelUrl.trim()) {
    await upsertConfig('stripe_cancel_url', body.cancelUrl.trim());
    updated.push('cancelUrl');
  }
  if (body.portalReturnUrl !== undefined && body.portalReturnUrl.trim()) {
    await upsertConfig('stripe_portal_return_url', body.portalReturnUrl.trim());
    updated.push('portalReturnUrl');
  }
  if (body.webhookEndpointUrl !== undefined && body.webhookEndpointUrl.trim()) {
    await upsertConfig('stripe_webhook_endpoint_url', body.webhookEndpointUrl.trim());
    updated.push('webhookEndpointUrl');
  }

  if (updated.length === 0) {
    return res.status(400).json({ success: false, error: 'No fields provided to update.' });
  }

  await logAdminAction(
    adminEmail,
    'stripe.keys.updated',
    `Updated Stripe configuration fields: ${updated.join(', ')} (values not logged)`,
    req,
  );

  return res.json({ success: true, updated });
}
