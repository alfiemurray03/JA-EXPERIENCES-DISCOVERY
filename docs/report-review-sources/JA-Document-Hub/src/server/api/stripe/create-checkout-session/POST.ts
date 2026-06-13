/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe Checkout Session for a plan subscription.
 *
 * Body: { plan: PlanId, successUrl?, cancelUrl?, referralCode? }
 * Referral code is also read from the ja_ref cookie as a fallback.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { resolveSession } from '../../auth/_session.js';
import { db } from '../../../db/client.js';
import { ja_users, ja_system_config } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  PLAN_STRIPE_SECRET_KEY, PLAN_HAS_TRIAL, PLAN_LABELS, PAID_PLANS,
  type PlanId,
} from '../../../../lib/plan-config.js';

export default async function handler(req: Request, res: Response) {
  // Guard: payments must be enabled via feature toggle
  try {
    const toggleRows = await db
      .select({ value: ja_system_config.value })
      .from(ja_system_config)
      .where(eq(ja_system_config.configKey, 'toggle_payments'))
      .limit(1);
    const paymentsEnabled = toggleRows[0]?.value === 'true';
    if (!paymentsEnabled) {
      return res.status(503).json({
        success: false,
        error: 'Payments are not currently enabled on this platform. Please try again later.',
        code: 'PAYMENTS_DISABLED',
      });
    }
  } catch {
    // If we can't read the toggle, default to blocked for safety
    return res.status(503).json({
      success: false,
      error: 'Unable to verify payment configuration. Please try again later.',
      code: 'PAYMENTS_DISABLED',
    });
  }
  const { plan, successUrl, cancelUrl, referralCode: bodyRef } = req.body as {
    plan: string;
    successUrl?: string;
    cancelUrl?: string;
    referralCode?: string;
  };

  // Validate plan
  if (!PAID_PLANS.includes(plan as PlanId)) {
    return res.status(400).json({
      success: false,
      error: `Invalid plan. Must be one of: ${PAID_PLANS.join(', ')}.`,
    });
  }

  const planId = plan as PlanId;

  const secretKey = getSecret('STRIPE_SECRET_KEY') as string | null;
  if (!secretKey) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured on this server.' });
  }

  // Load the Price ID from secrets
  const priceSecretKey = PLAN_STRIPE_SECRET_KEY[planId];
  if (!priceSecretKey) {
    return res.status(400).json({ success: false, error: 'No Stripe price configured for this plan.' });
  }

  const priceId = getSecret(priceSecretKey) as string | null;
  if (!priceId) {
    return res.status(503).json({
      success: false,
      error: `The ${PLAN_LABELS[planId]} plan is not yet configured. Please add the ${priceSecretKey} secret in your project settings.`,
    });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    const origin = `${req.protocol}://${req.get('host')}`;

    // Pre-fill customer email if user is logged in
    const userId = await resolveSession(req);
    let customerEmail: string | undefined;

    if (userId) {
      const users = await db
        .select({ email: ja_users.email })
        .from(ja_users)
        .where(eq(ja_users.id, userId))
        .limit(1);
      customerEmail = users[0]?.email;
    }

    // Resolve referral code: body param > cookie
    const refCode = (bodyRef ?? (req.cookies?.ja_ref as string | undefined) ?? '').toUpperCase().trim() || undefined;
    let affiliateId: number | undefined;

    if (refCode) {
      try {
        const rows = await db.execute(sql`
          SELECT id FROM ja_affiliates WHERE referral_code = ${refCode} AND status = 'approved' LIMIT 1
        `);
        const aff = ((rows as unknown as { rows?: unknown[] }).rows ?? [])[0] as { id: number } | undefined;
        if (aff) affiliateId = aff.id;
      } catch { /* non-fatal */ }
    }

    const trialDays = PLAN_HAS_TRIAL[planId] ? 14 : 0;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${origin}/dashboard?checkout=success&plan=${planId}`,
      cancel_url:  cancelUrl  ?? `${origin}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        plan: planId,
        ...(userId ? { userId: String(userId) } : {}),
        ...(affiliateId ? { affiliateId: String(affiliateId), referralCode: refCode! } : {}),
      },
      ...(trialDays > 0
        ? {
            subscription_data: {
              trial_period_days: trialDays,
              metadata: {
                plan: planId,
                ...(userId ? { userId: String(userId) } : {}),
                ...(affiliateId ? { affiliateId: String(affiliateId), referralCode: refCode! } : {}),
              },
            },
          }
        : {
            subscription_data: {
              metadata: {
                plan: planId,
                ...(userId ? { userId: String(userId) } : {}),
                ...(affiliateId ? { affiliateId: String(affiliateId), referralCode: refCode! } : {}),
              },
            },
          }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('stripe.create-checkout-session.error', err);
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : 'Failed to create checkout session.';
    return res.status(500).json({ success: false, error: message });
  }
}
