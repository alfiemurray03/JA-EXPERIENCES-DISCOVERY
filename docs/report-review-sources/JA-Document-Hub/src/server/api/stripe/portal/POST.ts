/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session so users can manage their
 * subscription, update payment methods, and cancel.
 * Requires authentication.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { resolveSession } from '../../auth/_session.js';
import { db } from '../../../db/client.js';
import { ja_stripe_subscriptions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  }

  const secretKey = getSecret('STRIPE_SECRET_KEY') as string | null;
  if (!secretKey) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured.' });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });

    // Look up the Stripe customer ID from our subscription record
    const subs = await db
      .select({ stripeCustomerId: ja_stripe_subscriptions.stripeCustomerId })
      .from(ja_stripe_subscriptions)
      .where(eq(ja_stripe_subscriptions.userId, userId))
      .limit(1);

    const stripeCustomerId = subs[0]?.stripeCustomerId;
    if (!stripeCustomerId) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found. Please subscribe to a plan first.',
      });
    }

    const origin = `${req.protocol}://${req.get('host')}`;
    const returnUrl = (req.body as { returnUrl?: string }).returnUrl ?? `${origin}/settings`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   stripeCustomerId,
      return_url: returnUrl,
    });

    return res.json({ success: true, url: portalSession.url });
  } catch (err) {
    console.error('stripe.portal.error', err);
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Failed to open billing portal.';
    return res.status(500).json({ success: false, error: message });
  }
}
