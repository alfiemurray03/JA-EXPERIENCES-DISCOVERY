/**
 * GET /api/admin/stripe-diagnostics
 * Returns live Stripe connection status, mode, products, prices, and webhook info.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { ja_stripe_subscriptions } from '../../../db/schema.js';
import { count, sql } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const secretKey             = getSecret('STRIPE_SECRET_KEY') as string | null;
  const publishableKey        = getSecret('STRIPE_PUBLISHABLE_KEY') as string | null;
  const webhookSecret         = getSecret('STRIPE_WEBHOOK_SECRET') as string | null;
  const pricePersonal         = getSecret('STRIPE_PRICE_PERSONAL') as string | null;
  const priceStandard         = getSecret('STRIPE_PRICE_STANDARD') as string | null;
  const priceProfessional     = getSecret('STRIPE_PRICE_PROFESSIONAL') as string | null;
  const priceOrgStarter       = getSecret('STRIPE_PRICE_ORG_STARTER') as string | null;
  const priceOrg              = getSecret('STRIPE_PRICE_ORG') as string | null;
  const priceOrgGrowth        = getSecret('STRIPE_PRICE_ORG_GROWTH') as string | null;
  const priceOrgProfessional  = getSecret('STRIPE_PRICE_ORG_PROFESSIONAL') as string | null;

  const result: Record<string, unknown> = {
    secretKeySet:        !!secretKey,
    publishableKeySet:   !!publishableKey,
    webhookSecretSet:    !!webhookSecret,
    isLiveMode:          secretKey?.startsWith('sk_live_') ?? false,
    publishableIsLive:   publishableKey?.startsWith('pk_live_') ?? false,
    priceIds: {
      personal:         pricePersonal        ? { id: pricePersonal,        set: true, label: 'Personal' }                 : { set: false, label: 'Personal' },
      standard:         priceStandard        ? { id: priceStandard,        set: true, label: 'Standard' }                 : { set: false, label: 'Standard' },
      professional:     priceProfessional    ? { id: priceProfessional,    set: true, label: 'Professional' }             : { set: false, label: 'Professional' },
      org_starter:      priceOrgStarter      ? { id: priceOrgStarter,      set: true, label: 'Organisation Starter' }     : { set: false, label: 'Organisation Starter' },
      org:              priceOrg             ? { id: priceOrg,             set: true, label: 'Organisation (legacy)' }    : { set: false, label: 'Organisation (legacy)' },
      org_growth:       priceOrgGrowth       ? { id: priceOrgGrowth,       set: true, label: 'Organisation Growth' }      : { set: false, label: 'Organisation Growth' },
      org_professional: priceOrgProfessional ? { id: priceOrgProfessional, set: true, label: 'Organisation Professional' }: { set: false, label: 'Organisation Professional' },
    },
    stripeConnected:     false,
    stripeAccount:       null as unknown,
    products:            [] as unknown[],
    prices:              [] as unknown[],
    lastError:           null as string | null,
  };

  if (!secretKey) {
    return res.json({ success: true, diagnostics: result });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });

    // Test connection by fetching account
    await stripe.balance.retrieve();
    result.stripeConnected = true;
    result.stripeAccount = {
      id:          secretKey.slice(0, 20) + '…',
      displayName: secretKey.startsWith('sk_live_') ? 'Live Account' : 'Test Account',
      email:       null,
      country:     null,
      currency:    null,
    };

    // Fetch products
    const products = await stripe.products.list({ limit: 20, active: true });
    result.products = products.data.map(p => ({
      id:     p.id,
      name:   p.name,
      active: p.active,
    }));

    // Fetch prices for all configured price IDs
    const allPriceIds = [
      pricePersonal, priceStandard, priceProfessional,
      priceOrgStarter, priceOrg, priceOrgGrowth, priceOrgProfessional,
    ].filter(Boolean) as string[];
    const priceDetails: unknown[] = [];
    for (const pid of allPriceIds) {
      try {
        const price = await stripe.prices.retrieve(pid, { expand: ['product'] });
        priceDetails.push({
          id:        price.id,
          product:   (price.product as Stripe.Product)?.name ?? price.product,
          amount:    price.unit_amount,
          currency:  price.currency,
          interval:  price.recurring?.interval ?? 'one_time',
          active:    price.active,
        });
      } catch {
        priceDetails.push({ id: pid, error: 'Price not found or inaccessible' });
      }
    }
    result.prices = priceDetails;

    // Subscription stats from DB
    const [subCount] = await db.select({ count: count() }).from(ja_stripe_subscriptions);
    const [activeCount] = await db.select({ count: count() }).from(ja_stripe_subscriptions)
      .where(sql`status IN ('active','trialing')`);
    const [cancelledCount] = await db.select({ count: count() }).from(ja_stripe_subscriptions)
      .where(sql`status = 'canceled'`);

    result.subscriptionStats = {
      total:     subCount?.count ?? 0,
      active:    activeCount?.count ?? 0,
      cancelled: cancelledCount?.count ?? 0,
    };

  } catch (err) {
    result.stripeConnected = false;
    result.lastError = err instanceof Error ? err.message : String(err);
  }

  return res.json({ success: true, diagnostics: result });
}
