/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to keep subscription state in sync.
 *
 * Set your webhook endpoint in the Stripe dashboard to:
 *   https://yourdomain.com/api/stripe/webhook
 *
 * Events handled:
 *   checkout.session.completed       → activate plan + create subscription record
 *   customer.subscription.updated    → sync plan status (trialing, active, past_due, etc.)
 *   customer.subscription.deleted    → revert to free plan
 *
 * Add STRIPE_WEBHOOK_SECRET to your secrets for signature verification.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { ja_users, ja_stripe_subscriptions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import crypto from 'node:crypto';

type PlanId = 'free' | 'standard' | 'professional' | 'org_starter' | 'org_growth' | 'org_professional';

async function upsertSubscription(params: {
  userId: number;
  plan: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status: string;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  // Check if user has a lifetime plan — never downgrade a lifetime user via webhook
  const users = await db
    .select({ planIsLifetime: ja_users.planIsLifetime })
    .from(ja_users)
    .where(eq(ja_users.id, params.userId))
    .limit(1);

  const isLifetime = users[0]?.planIsLifetime ?? false;

  // Only update plan if not lifetime (or if upgrading)
  if (!isLifetime) {
    await db.update(ja_users)
      .set({ plan: params.plan })
      .where(eq(ja_users.id, params.userId));
  }

  // Upsert subscription record
  const existing = await db
    .select({ id: ja_stripe_subscriptions.id })
    .from(ja_stripe_subscriptions)
    .where(eq(ja_stripe_subscriptions.userId, params.userId))
    .limit(1);

  const record = {
    plan:                 params.plan,
    stripeCustomerId:     params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    stripePriceId:        params.stripePriceId,
    status:               params.status,
    trialStart:           params.trialStart ?? null,
    trialEnd:             params.trialEnd ?? null,
    currentPeriodStart:   params.currentPeriodStart ?? null,
    currentPeriodEnd:     params.currentPeriodEnd ?? null,
    cancelAtPeriodEnd:    params.cancelAtPeriodEnd ?? false,
  };

  if (existing.length > 0) {
    await db.update(ja_stripe_subscriptions)
      .set(record)
      .where(eq(ja_stripe_subscriptions.userId, params.userId));
  } else {
    await db.insert(ja_stripe_subscriptions).values({ userId: params.userId, ...record });
  }
}

export default async function handler(req: Request, res: Response) {
  const secretKey = getSecret('STRIPE_SECRET_KEY') as string | null;
  const webhookSecret = getSecret('STRIPE_WEBHOOK_SECRET') as string | null;

  if (!secretKey) {
    return res.status(503).send('Stripe not configured.');
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
  let event: Stripe.Event;

  if (webhookSecret) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig as string, webhookSecret);
    } catch (err) {
      console.error('stripe.webhook.signature-error', err);
      return res.status(400).send('Webhook signature verification failed.');
    }
  } else {
    // No webhook secret — accept without verification (dev/test only)
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body as Stripe.Event;
    } catch {
      return res.status(400).send('Invalid JSON body.');
    }
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : null;
        const plan   = session.metadata?.plan as PlanId | undefined;

        if (userId && plan && plan !== 'free') {
          // Fetch the subscription for full details
          let sub: Stripe.Subscription | null = null;
          if (session.subscription) {
            sub = await stripe.subscriptions.retrieve(session.subscription as string);
          }
          await upsertSubscription({
            userId,
            plan,
            stripeCustomerId:     session.customer as string | undefined,
            stripeSubscriptionId: session.subscription as string | undefined,
            stripePriceId:        sub?.items.data[0]?.price.id,
            status:               sub?.status ?? 'active',
            trialStart:           sub?.trial_start ? new Date(sub.trial_start * 1000) : null,
            trialEnd:             sub?.trial_end   ? new Date(sub.trial_end   * 1000) : null,
            currentPeriodStart:   (sub as unknown as Record<string, number>)['current_period_start'] ? new Date((sub as unknown as Record<string, number>)['current_period_start'] * 1000) : null,
            currentPeriodEnd:     (sub as unknown as Record<string, number>)['current_period_end']   ? new Date((sub as unknown as Record<string, number>)['current_period_end']   * 1000) : null,
            cancelAtPeriodEnd:    sub?.cancel_at_period_end ?? false,
          });
          console.log(`stripe.webhook: checkout.session.completed — user ${userId} → ${plan} (${sub?.status ?? 'active'})`);

          // ── Affiliate conversion attribution ──────────────────────────────
          const affiliateId = session.metadata?.affiliateId ? parseInt(session.metadata.affiliateId, 10) : null;
          if (affiliateId) {
            try {
              // Look up commission rate
              const affRows = await db.execute(sql`
                SELECT commission_rate FROM ja_affiliates WHERE id = ${affiliateId} AND status = 'approved' LIMIT 1
              `);
              const aff = ((affRows as unknown as { rows?: unknown[] }).rows ?? [])[0] as { commission_rate: number } | undefined;
              if (aff) {
                const amountPence = session.amount_total ?? 0;
                const commissionPence = Math.round(amountPence * aff.commission_rate / 100);
                await db.execute(sql`
                  INSERT INTO ja_affiliate_conversions
                    (affiliate_id, user_id, type, plan, amount_gbp, commission_gbp, status,
                     stripe_session_id, created_at, updated_at)
                  VALUES
                    (${affiliateId}, ${userId}, 'subscription', ${plan}, ${amountPence},
                     ${commissionPence}, 'pending', ${session.id}, NOW(), NOW())
                `);
                console.log(`stripe.webhook: affiliate conversion recorded — affiliate ${affiliateId}, commission ${commissionPence}p`);
              }
            } catch (affErr) {
              console.error('stripe.webhook: affiliate conversion error (non-fatal)', affErr);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId ? parseInt(sub.metadata.userId, 10) : null;
        const plan   = sub.metadata?.plan as PlanId | undefined;

        if (userId && plan) {
          const effectivePlan: PlanId =
            sub.status === 'canceled' || sub.status === 'unpaid' ? 'free' : plan;

          await upsertSubscription({
            userId,
            plan:                 effectivePlan,
            stripeCustomerId:     sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId:        sub.items.data[0]?.price.id,
            status:               sub.status,
            trialStart:           sub.trial_start ? new Date(sub.trial_start * 1000) : null,
            trialEnd:             sub.trial_end   ? new Date(sub.trial_end   * 1000) : null,
            currentPeriodStart:   new Date(((sub as unknown as Record<string, number>)['current_period_start'] ?? 0) * 1000),
            currentPeriodEnd:     new Date(((sub as unknown as Record<string, number>)['current_period_end']   ?? 0) * 1000),
            cancelAtPeriodEnd:    sub.cancel_at_period_end,
          });
          console.log(`stripe.webhook: subscription.updated — user ${userId} → ${effectivePlan} (${sub.status})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId ? parseInt(sub.metadata.userId, 10) : null;

        if (userId) {
          await upsertSubscription({
            userId,
            plan:                 'free',
            stripeCustomerId:     sub.customer as string,
            stripeSubscriptionId: sub.id,
            status:               'canceled',
            cancelAtPeriodEnd:    false,
          });
          console.log(`stripe.webhook: subscription.deleted — user ${userId} → free`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = (invoice as unknown as Record<string, unknown>).subscription as string | null;
        if (subId) {
          // Refresh subscription status in DB
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId ? parseInt(sub.metadata.userId, 10) : null;
          const plan   = sub.metadata?.plan as PlanId | undefined;
          if (userId && plan) {
            await upsertSubscription({
              userId,
              plan,
              stripeCustomerId:     sub.customer as string,
              stripeSubscriptionId: sub.id,
              stripePriceId:        sub.items.data[0]?.price.id,
              status:               sub.status,
              trialStart:           sub.trial_start ? new Date(sub.trial_start * 1000) : null,
              trialEnd:             sub.trial_end   ? new Date(sub.trial_end   * 1000) : null,
              currentPeriodStart:   new Date(((sub as unknown as Record<string, number>)['current_period_start'] ?? 0) * 1000),
              currentPeriodEnd:     new Date(((sub as unknown as Record<string, number>)['current_period_end']   ?? 0) * 1000),
              cancelAtPeriodEnd:    sub.cancel_at_period_end,
            });
            console.log(`stripe.webhook: invoice.payment_succeeded — user ${userId} sub ${subId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = (invoice as unknown as Record<string, unknown>).subscription as string | null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId ? parseInt(sub.metadata.userId, 10) : null;
          const plan   = sub.metadata?.plan as PlanId | undefined;
          if (userId && plan) {
            await upsertSubscription({
              userId,
              plan,
              stripeCustomerId:     sub.customer as string,
              stripeSubscriptionId: sub.id,
              stripePriceId:        sub.items.data[0]?.price.id,
              status:               'past_due',
              cancelAtPeriodEnd:    sub.cancel_at_period_end,
            });
            console.log(`stripe.webhook: invoice.payment_failed — user ${userId} sub ${subId} → past_due`);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        // Handled by checkout.session.completed — just log
        console.log('stripe.webhook: subscription.created received');
        break;
      }

      default:
        // Unhandled event — acknowledge receipt
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('stripe.webhook.handler-error', err);
    return res.status(500).send('Webhook handler error.');
  }
}
