function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function identityEmail(request) {
  return String(request.headers.get("x-ja-auth-email") || "").trim().toLowerCase();
}

function stripeId(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id || null;
}

function stripeTime(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0 ? new Date(Number(value) * 1000).toISOString() : null;
}

async function all(DB, sql, bindings = []) {
  const statement = DB.prepare(sql);
  const result = bindings.length ? await statement.bind(...bindings).all() : await statement.all();
  return result.results || [];
}

async function safeAlter(DB, sql) {
  try { await DB.prepare(sql).run(); } catch { /* Existing columns are expected. */ }
}

async function ensureBillingTables(DB) {
  const version = await DB.prepare(`SELECT value FROM site_settings WHERE key='stripe_billing_schema_version'`).first().catch(() => null);
  if (version?.value === "rc3.2") return;
  await DB.prepare(`CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id TEXT PRIMARY KEY, customer_id TEXT, customer_email TEXT, plan_code TEXT, plan_name TEXT,
    price_id TEXT, status TEXT, billing_status TEXT, billing_interval TEXT, subscription_start TEXT,
    current_period_start TEXT, current_period_end TEXT, next_payment_at TEXT, trial_start TEXT,
    trial_end TEXT, cancel_at_period_end INTEGER DEFAULT 0, cancel_at TEXT, canceled_at TEXT,
    latest_invoice_id TEXT, payment_method_brand TEXT, payment_method_last4 TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS stripe_invoices (
    id TEXT PRIMARY KEY, customer_id TEXT, customer_email TEXT, subscription_id TEXT, status TEXT,
    amount_due INTEGER, amount_paid INTEGER, currency TEXT, hosted_invoice_url TEXT, invoice_pdf TEXT,
    period_start TEXT, period_end TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  for (const sql of [
    `ALTER TABLE stripe_subscriptions ADD COLUMN plan_name TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN billing_status TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN billing_interval TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN subscription_start TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN next_payment_at TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN trial_start TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN trial_end TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN cancel_at TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN canceled_at TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN payment_method_brand TEXT`,
    `ALTER TABLE stripe_subscriptions ADD COLUMN payment_method_last4 TEXT`
  ]) await safeAlter(DB, sql);
  await DB.prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES ('stripe_billing_schema_version', 'rc3.2', CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
  `).run();
}

async function stripeSecret(DB, env) {
  const stored = await DB.prepare(`SELECT value FROM site_settings WHERE key = 'stripe_secret_key'`).first().catch(() => null);
  return String(stored?.value || env.STRIPE_SECRET_KEY || "").trim();
}

async function stripeGet(path, secret) {
  const response = await fetch(`https://api.stripe.com${path}`, { headers: { Authorization: `Bearer ${secret}` } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Stripe billing data could not be retrieved.");
  return payload;
}

async function stripePost(path, secret, params) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Stripe Billing Portal could not be opened.");
  return payload;
}

function subscriptionRank(subscription) {
  return ["active", "trialing", "past_due", "unpaid", "incomplete", "paused", "canceled"].indexOf(subscription.status);
}

async function cacheSubscription(DB, subscription, email) {
  const item = subscription.items?.data?.[0] || {};
  const price = item.price || {};
  const product = price.product || {};
  const paymentMethod = subscription.default_payment_method || {};
  const card = paymentMethod.card || {};
  const invoice = subscription.latest_invoice || {};
  const planName = subscription.metadata?.plan_name || product.name || price.nickname || subscription.metadata?.plan_code || "Stripe membership";
  await DB.prepare(`
    INSERT INTO stripe_subscriptions (
      id, customer_id, customer_email, plan_code, plan_name, price_id, status, billing_status,
      billing_interval, subscription_start, current_period_start, current_period_end, next_payment_at,
      trial_start, trial_end, cancel_at_period_end, cancel_at, canceled_at, latest_invoice_id,
      payment_method_brand, payment_method_last4, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      customer_id=excluded.customer_id, customer_email=excluded.customer_email, plan_code=excluded.plan_code,
      plan_name=excluded.plan_name, price_id=excluded.price_id, status=excluded.status,
      billing_status=excluded.billing_status, billing_interval=excluded.billing_interval,
      subscription_start=excluded.subscription_start, current_period_start=excluded.current_period_start,
      current_period_end=excluded.current_period_end, next_payment_at=excluded.next_payment_at,
      trial_start=excluded.trial_start, trial_end=excluded.trial_end,
      cancel_at_period_end=excluded.cancel_at_period_end, cancel_at=excluded.cancel_at,
      canceled_at=excluded.canceled_at, latest_invoice_id=excluded.latest_invoice_id,
      payment_method_brand=excluded.payment_method_brand, payment_method_last4=excluded.payment_method_last4,
      updated_at=CURRENT_TIMESTAMP
  `).bind(
    subscription.id, stripeId(subscription.customer), email, subscription.metadata?.plan_code || null,
    planName, stripeId(price), subscription.status || null, invoice.status || null,
    price.recurring?.interval || null, stripeTime(subscription.start_date || subscription.created),
    stripeTime(subscription.current_period_start), stripeTime(subscription.current_period_end),
    stripeTime(subscription.current_period_end), stripeTime(subscription.trial_start), stripeTime(subscription.trial_end),
    subscription.cancel_at_period_end ? 1 : 0, stripeTime(subscription.cancel_at), stripeTime(subscription.canceled_at),
    stripeId(subscription.latest_invoice), card.brand || null, card.last4 || null
  ).run();
}

async function cacheInvoice(DB, invoice, email) {
  await DB.prepare(`
    INSERT INTO stripe_invoices (id, customer_id, customer_email, subscription_id, status, amount_due,
      amount_paid, currency, hosted_invoice_url, invoice_pdf, period_start, period_end, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET status=excluded.status, amount_due=excluded.amount_due,
      amount_paid=excluded.amount_paid, hosted_invoice_url=excluded.hosted_invoice_url,
      invoice_pdf=excluded.invoice_pdf, period_start=excluded.period_start,
      period_end=excluded.period_end, updated_at=CURRENT_TIMESTAMP
  `).bind(invoice.id, stripeId(invoice.customer), email, stripeId(invoice.subscription), invoice.status || null,
    invoice.amount_due ?? null, invoice.amount_paid ?? null, invoice.currency || null,
    invoice.hosted_invoice_url || null, invoice.invoice_pdf || null,
    stripeTime(invoice.period_start), stripeTime(invoice.period_end)).run();
}

async function liveBilling(DB, env, profile) {
  await ensureBillingTables(DB);
  const secret = await stripeSecret(DB, env);
  if (!secret || !profile.stripe_customer_id) return null;
  const customer = encodeURIComponent(profile.stripe_customer_id);
  const [subscriptions, invoices, paymentMethods] = await Promise.all([
    stripeGet(`/v1/subscriptions?customer=${customer}&status=all&limit=10&expand[]=data.default_payment_method&expand[]=data.latest_invoice`, secret),
    stripeGet(`/v1/invoices?customer=${customer}&limit=10`, secret),
    stripeGet(`/v1/payment_methods?customer=${customer}&type=card&limit=1`, secret)
  ]);
  const sorted = [...(subscriptions.data || [])].sort((a, b) => subscriptionRank(a) - subscriptionRank(b));
  const subscription = sorted[0] || null;
  if (subscription) {
    if (!subscription.default_payment_method && paymentMethods.data?.[0]) subscription.default_payment_method = paymentMethods.data[0];
    const priceId = stripeId(subscription.items?.data?.[0]?.price);
    const plan = priceId ? await DB.prepare(`SELECT id, plan_name FROM service_plans WHERE stripe_price_id=?`).bind(priceId).first().catch(() => null) : null;
    if (plan) subscription.metadata = { ...(subscription.metadata || {}), plan_code: subscription.metadata?.plan_code || plan.id, plan_name: subscription.metadata?.plan_name || plan.plan_name };
    await cacheSubscription(DB, subscription, profile.email);
  }
  for (const invoice of invoices.data || []) await cacheInvoice(DB, invoice, profile.email);
  return { subscription, invoices: invoices.data || [], paymentMethod: paymentMethods.data?.[0] || null };
}

function publicSubscription(row) {
  if (!row) return null;
  return {
    plan: row.plan_name || row.plan_code || "Stripe membership",
    membershipStatus: row.status || "Not active",
    billingStatus: row.billing_status || "Not available",
    renewalDate: row.current_period_end,
    billingInterval: row.billing_interval || "Not available",
    nextPaymentDate: row.next_payment_at || row.current_period_end,
    subscriptionStartDate: row.subscription_start,
    subscriptionReference: row.id,
    paymentMethod: row.payment_method_brand && row.payment_method_last4 ? `${row.payment_method_brand.toUpperCase()} •••• ${row.payment_method_last4}` : "Not available",
    trialStatus: row.trial_end ? (new Date(row.trial_end) > new Date() ? "Trial active" : "Trial ended") : "No trial",
    trialEndDate: row.trial_end,
    cancellationStatus: Number(row.cancel_at_period_end || 0) === 1 ? "Scheduled to cancel" : row.status === "canceled" ? "Cancelled" : "Not scheduled",
    scheduledCancellationDate: row.cancel_at || (Number(row.cancel_at_period_end || 0) === 1 ? row.current_period_end : null)
  };
}

function publicInvoice(invoice) {
  return {
    reference: invoice.id,
    status: invoice.status || "unknown",
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
    currency: invoice.currency || "gbp",
    date: invoice.period_end || invoice.updated_at,
    invoiceUrl: invoice.hosted_invoice_url || invoice.invoice_pdf || null
  };
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ error: "Database unavailable." }, 500);
  const email = identityEmail(request);
  if (!email) return json({ error: "Not signed in." }, 401);

  try {
    const profile = await env.DB.prepare(`SELECT email, stripe_customer_id FROM profiles WHERE lower(email)=lower(?)`).bind(email).first();
    if (!profile) return json({ error: "Customer profile not found." }, 404);

    if (request.method === "POST") {
      if (!profile.stripe_customer_id) return json({ error: "No Stripe billing account is linked to this customer." }, 409);
      const secret = await stripeSecret(env.DB, env);
      if (!secret) return json({ error: "Stripe billing is not configured." }, 503);
      const returnUrl = `${new URL(request.url).origin}/account/membership/`;
      const portal = await stripePost("/v1/billing_portal/sessions", secret, new URLSearchParams({ customer: profile.stripe_customer_id, return_url: returnUrl }));
      return json({ url: portal.url });
    }

    if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
    if (!profile.stripe_customer_id) return json({ portalAvailable: false, subscription: null, invoices: [] });

    const portalAvailable = Boolean(await stripeSecret(env.DB, env));
    if (portalAvailable) await liveBilling(env.DB, env, profile).catch((error) => console.error(JSON.stringify({ event: "stripe_billing_sync_failed", email, message: error.message })));
    const [subscription, invoices] = await Promise.all([
      env.DB.prepare(`SELECT * FROM stripe_subscriptions WHERE customer_id=? ORDER BY updated_at DESC LIMIT 1`).bind(profile.stripe_customer_id).first(),
      all(env.DB, `SELECT * FROM stripe_invoices WHERE customer_id=? ORDER BY COALESCE(period_end, updated_at) DESC LIMIT 10`, [profile.stripe_customer_id])
    ]);
    return json({ portalAvailable, subscription: publicSubscription(subscription), invoices: invoices.map(publicInvoice) });
  } catch (error) {
    return json({ error: error.message || "Billing data unavailable." }, 500);
  }
}
