/**
 * GET /api/stripe/config
 * Returns the Stripe publishable key for the frontend to initialise Stripe.js.
 * Safe to expose — publishable keys are public by design.
 */
import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default function handler(_req: Request, res: Response) {
  const publishableKey = getSecret('STRIPE_PUBLISHABLE_KEY') as string | null;
  if (!publishableKey) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured.' });
  }
  return res.json({ success: true, publishableKey });
}
