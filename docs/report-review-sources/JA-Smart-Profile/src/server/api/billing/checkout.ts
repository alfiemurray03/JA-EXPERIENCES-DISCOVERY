import { type Request, type Response } from 'express';
import db from '../../db.js';

function getStripeSecretKey(): string | null {
  try {
    const row = db.prepare("SELECT value FROM stripe_config WHERE key = 'stripe_secret_key'").get() as { value: string } | undefined;
    return row?.value || null;
  } catch {
    return null;
  }
}

function getStripeMode(): string {
  try {
    const row = db.prepare("SELECT value FROM stripe_config WHERE key = 'stripe_mode'").get() as { value: string } | undefined;
    return row?.value || 'test';
  } catch {
    return 'test';
  }
}

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout Session for a plan upgrade.
 * Requires the user to be authenticated.
 */
export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const userId = (req.session as { userId?: number }).userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ success: false, error: 'plan_id is required' });

    const secretKey = getStripeSecretKey();
    if (!secretKey) {
      return res.status(503).json({ success: false, error: 'Stripe is not configured. Please contact support.' });
    }

    const mode = getStripeMode();
    if (mode !== 'live') {
      return res.status(503).json({
        success: false,
        error: 'Payments are not yet active. JA Group Services will enable live payments shortly.',
      });
    }

    // Fetch plan with Stripe price ID
    const plan = db.prepare(`
      SELECT id, name, stripe_price_monthly, stripe_product_id, price_monthly
      FROM plans WHERE id = ?
    `).get(plan_id) as {
      id: number; name: string; stripe_price_monthly: string | null;
      stripe_product_id: string | null; price_monthly: number;
    } | undefined;

    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    if (!plan.stripe_price_monthly) {
      return res.status(400).json({ success: false, error: 'This plan does not have a Stripe price configured.' });
    }

    // Get user info
    const user = db.prepare('SELECT email, name, stripe_customer_id FROM users WHERE id = ?').get(userId) as {
      email: string; name: string; stripe_customer_id: string | null;
    } | undefined;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const appUrl = db.prepare("SELECT value FROM admin_settings WHERE key = 'platform_url'").get() as { value: string } | undefined;
    const baseUrl = appUrl?.value || 'https://jasmartprofile.jagroupservices.co.uk';

    // Build Checkout Session params
    const params: Record<string, unknown> = {
      mode: 'subscription',
      line_items: [{ price: plan.stripe_price_monthly, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/billing?checkout=success&plan=${encodeURIComponent(plan.name)}`,
      cancel_url: `${baseUrl}/dashboard/billing?checkout=cancelled`,
      metadata: { user_id: String(userId), plan_id: String(plan_id) },
      subscription_data: { metadata: { user_id: String(userId), plan_id: String(plan_id) } },
      allow_promotion_codes: true,
    };

    // Attach or create Stripe customer
    if (user.stripe_customer_id) {
      params.customer = user.stripe_customer_id;
    } else {
      params.customer_email = user.email;
    }

    // Create session via Stripe REST API
    const formBody = buildFormEncoded(params);
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const session = await stripeRes.json() as { id?: string; url?: string; error?: { message: string } };
    if (!stripeRes.ok || !session.url) {
      return res.status(400).json({ success: false, error: session.error?.message || 'Failed to create checkout session' });
    }

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// Recursively build application/x-www-form-urlencoded for nested Stripe params
function buildFormEncoded(obj: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(buildFormEncoded(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          parts.push(buildFormEncoded(item as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}
