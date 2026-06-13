/**
 * GET /api/stripe/billing-history
 * Returns the authenticated user's Stripe invoice history.
 * Requires authentication and an active Stripe subscription record.
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

  const secretKey = String(getSecret('STRIPE_SECRET_KEY') ?? '');
  if (!secretKey) {
    return res.json({ success: true, invoices: [], note: 'Billing not configured.' });
  }

  try {
    const subs = await db
      .select({ stripeCustomerId: ja_stripe_subscriptions.stripeCustomerId })
      .from(ja_stripe_subscriptions)
      .where(eq(ja_stripe_subscriptions.userId, userId))
      .limit(1);

    const stripeCustomerId = subs[0]?.stripeCustomerId;
    if (!stripeCustomerId) {
      return res.json({ success: true, invoices: [], note: 'No billing account found.' });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    const invoiceList = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 24,
    });

    const invoices = invoiceList.data.map(inv => ({
      id:          inv.id,
      number:      inv.number,
      status:      inv.status,
      amountPaid:  inv.amount_paid,
      amountDue:   inv.amount_due,
      currency:    inv.currency,
      created:     inv.created,
      periodStart: inv.period_start,
      periodEnd:   inv.period_end,
      pdfUrl:      inv.invoice_pdf,
      hostedUrl:   inv.hosted_invoice_url,
      description: inv.description,
      lines:       inv.lines.data.map(l => ({
        description: l.description,
        amount:      l.amount,
        currency:    l.currency,
      })),
    }));

    return res.json({ success: true, invoices });
  } catch (err) {
    console.error('stripe.billing-history.error', err);
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Failed to load billing history.';
    return res.status(500).json({ success: false, error: message });
  }
}
