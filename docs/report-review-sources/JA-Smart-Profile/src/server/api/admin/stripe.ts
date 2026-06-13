import { type Request, type Response } from 'express';
import db from '../../db.js';

// ─── Stripe Config (keys stored in DB, not env) ────────────────────────────

const STRIPE_KEYS = ['stripe_publishable_key', 'stripe_secret_key', 'stripe_webhook_secret', 'stripe_mode'];

export function getStripeConfig(_req: Request, res: Response) {
  try {
    const rows = db.prepare('SELECT key, value FROM stripe_config').all() as { key: string; value: string }[];
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    // Mask secret key — only show last 4 chars
    if (obj.stripe_secret_key && obj.stripe_secret_key.length > 8) {
      obj.stripe_secret_key_masked = '••••••••' + obj.stripe_secret_key.slice(-4);
      delete obj.stripe_secret_key;
    }
    res.json({ success: true, data: obj });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch Stripe config' });
  }
}

export function updateStripeConfig(req: Request, res: Response) {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO stripe_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const run = db.transaction((body: Record<string, string>) => {
      for (const key of STRIPE_KEYS) {
        if (key in body && body[key] !== undefined) {
          // Don't overwrite secret key if placeholder sent
          if (key === 'stripe_secret_key' && body[key].startsWith('••••')) continue;
          upsert.run(key, String(body[key]));
        }
      }
    });
    run(req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update Stripe config' });
  }
}

// ─── Lifetime Access ───────────────────────────────────────────────────────

export function grantLifetimeAccess(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ success: false, error: 'plan_id required' });

    const plan = db.prepare('SELECT id, name FROM plans WHERE id = ?').get(plan_id) as { id: number; name: string } | undefined;
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    // Update user
    db.prepare('UPDATE users SET plan_id = ?, lifetime_access = 1, lifetime_plan_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(plan_id, plan_id, userId);

    // Upsert subscription record
    const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(userId) as { id: number } | undefined;
    if (existing) {
      db.prepare(`UPDATE subscriptions SET plan_id = ?, status = 'lifetime', billing_interval = 'lifetime',
        stripe_subscription_id = NULL, current_period_end = NULL WHERE user_id = ?`).run(plan_id, userId);
    } else {
      db.prepare(`INSERT INTO subscriptions (user_id, plan_id, status, billing_interval) VALUES (?, ?, 'lifetime', 'lifetime')`).run(userId, plan_id);
    }

    const user = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.plan_id, u.lifetime_access, u.lifetime_plan_id,
        p.name as plan_name,
        (SELECT COUNT(*) FROM profiles WHERE user_id = u.id) as profile_count,
        u.created_at
      FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = ?
    `).get(userId);
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to grant lifetime access' });
  }
}

export function revokeLifetimeAccess(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const freePlan = db.prepare('SELECT id FROM plans WHERE slug = ?').get('free') as { id: number } | undefined;
    const planId = freePlan?.id ?? 1;

    db.prepare('UPDATE users SET plan_id = ?, lifetime_access = 0, lifetime_plan_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(planId, userId);
    db.prepare(`UPDATE subscriptions SET plan_id = ?, status = 'cancelled', billing_interval = 'monthly',
      cancelled_at = CURRENT_TIMESTAMP WHERE user_id = ?`).run(planId, userId);

    const user = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.plan_id, u.lifetime_access, u.lifetime_plan_id,
        p.name as plan_name,
        (SELECT COUNT(*) FROM profiles WHERE user_id = u.id) as profile_count,
        u.created_at
      FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = ?
    `).get(userId);
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to revoke lifetime access' });
  }
}

// ─── Stripe Product Sync ───────────────────────────────────────────────────

function getStripeSecretKey(): string | null {
  try {
    const row = db.prepare("SELECT value FROM stripe_config WHERE key = 'stripe_secret_key'").get() as { value: string } | undefined;
    return row?.value || null;
  } catch {
    return null;
  }
}

export async function syncStripeProducts(_req: Request, res: Response) {
  try {
    const secretKey = getStripeSecretKey();
    if (!secretKey) return res.status(400).json({ success: false, error: 'Stripe secret key not configured.' });

    // Fetch products from Stripe REST API (no SDK needed)
    const productsRes = await fetch('https://api.stripe.com/v1/products?limit=100&active=true', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!productsRes.ok) {
      const err = await productsRes.json() as { error?: { message?: string } };
      return res.status(400).json({ success: false, error: err?.error?.message || 'Stripe API error' });
    }
    const productsData = await productsRes.json() as { data: StripeProduct[] };

    // Fetch prices
    const pricesRes = await fetch('https://api.stripe.com/v1/prices?limit=100&active=true', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const pricesData = pricesRes.ok ? await pricesRes.json() as { data: StripePrice[] } : { data: [] };

    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS stripe_products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active INTEGER DEFAULT 1,
        metadata TEXT,
        created INTEGER,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS stripe_prices (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        currency TEXT,
        unit_amount INTEGER,
        recurring_interval TEXT,
        active INTEGER DEFAULT 1,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const upsertProduct = db.prepare(`
      INSERT OR REPLACE INTO stripe_products (id, name, description, active, metadata, created, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const upsertPrice = db.prepare(`
      INSERT OR REPLACE INTO stripe_prices (id, product_id, currency, unit_amount, recurring_interval, active, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const syncAll = db.transaction(() => {
      for (const p of productsData.data) {
        upsertProduct.run(p.id, p.name, p.description || '', p.active ? 1 : 0, JSON.stringify(p.metadata || {}), p.created);
      }
      for (const pr of pricesData.data) {
        upsertPrice.run(pr.id, pr.product, pr.currency, pr.unit_amount, pr.recurring?.interval || null, pr.active ? 1 : 0);
      }
    });
    syncAll();

    res.json({ success: true, synced: { products: productsData.data.length, prices: pricesData.data.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function getStripeProducts(_req: Request, res: Response) {
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS stripe_products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, active INTEGER DEFAULT 1,
      metadata TEXT, created INTEGER, synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS stripe_prices (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, currency TEXT, unit_amount INTEGER,
      recurring_interval TEXT, active INTEGER DEFAULT 1, synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    const products = db.prepare('SELECT * FROM stripe_products ORDER BY created DESC').all() as StripeProductRow[];
    const prices = db.prepare('SELECT * FROM stripe_prices ORDER BY unit_amount ASC').all() as StripePriceRow[];
    // Attach prices to products
    const result = products.map(p => ({
      ...p,
      prices: prices.filter(pr => pr.product_id === p.id),
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

interface StripeProduct { id: string; name: string; description?: string; active: boolean; metadata?: Record<string, string>; created: number; }
interface StripePrice { id: string; product: string; currency: string; unit_amount: number; recurring?: { interval: string }; active: boolean; }
interface StripeProductRow { id: string; name: string; description: string; active: number; metadata: string; created: number; synced_at: string; }
interface StripePriceRow { id: string; product_id: string; currency: string; unit_amount: number; recurring_interval: string | null; active: number; synced_at: string; }


export function getSubscriptions(_req: Request, res: Response) {
  try {
    const subs = db.prepare(`
      SELECT s.*, u.email, u.name, u.lifetime_access, p.name as plan_name, p.price_monthly
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.started_at DESC
    `).all();
    res.json({ success: true, data: subs });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
  }
}
