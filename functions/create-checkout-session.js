const DEFAULT_PLANS = [
  ["personal", "Explore Plan", "Monthly subscription", "£5.99", 599, "", "", "Essential planning builders", "Save and revisit your plans", "A simple starting point for exploring ideas and building clear, practical plans.", "Start 30-day free trial", 1, 0, 10],
  ["standard", "Plan Plan", "Monthly subscription", "£7.99", 799, "", "", "More builders and planning tools", "Download your finished plans", "For regularly creating detailed destination, itinerary, experience and everyday plans.", "Start 30-day free trial", 1, 1, 20],
  ["professional", "Complete Plan", "Monthly subscription", "£14.99", 1499, "", "", "Full planning-builder access", "Enhanced planning and outputs", "Complete access for building and managing more comprehensive personalised plans.", "Start 30-day free trial", 1, 0, 30],
  ["org_starter", "Together Plan", "Monthly subscription", "£39.99", 3999, "", "", "Shared planning for groups", "All builders and collaborative tools", "Shared planning for households, families and groups who want to build plans together.", "Start 30-day free trial", 1, 0, 40]
];

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const planCode = String(url.searchParams.get("plan") || "").trim();

    if (!planCode) {
      return redirectTo(getSiteUrl(context.env) + "/pricing/");
    }

    return await createCheckoutSession(planCode, context.env);
  } catch (error) {
    return jsonResponse({ error: "Checkout GET failed.", details: errorMessage(error) }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const planCode = String(formData.get("plan") || "").trim();
    return await createCheckoutSession(planCode, context.env);
  } catch (error) {
    return jsonResponse({ error: "Checkout POST failed.", details: errorMessage(error) }, 500);
  }
}

async function createCheckoutSession(planCode, env) {
  if (!env || !env.DB) {
    return jsonResponse({ error: "Plan database binding DB is missing." }, 500);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Missing STRIPE_SECRET_KEY in Cloudflare." }, 500);
  }

  await syncServicePlans(env.DB);

  const selectedPlan = await env.DB.prepare(`
    SELECT id, plan_name, plan_type, price_label, price_pence, stripe_price_id, is_active
    FROM service_plans
    WHERE id = ?
  `).bind(planCode).first();

  if (!selectedPlan) {
    return jsonResponse({ error: "Invalid plan selected.", planCode }, 404);
  }

  if (Number(selectedPlan.is_active || 0) !== 1) {
    return jsonResponse({
      error: "This plan is currently unavailable.",
      planCode,
      planName: selectedPlan.plan_name
    }, 403);
  }

  const priceId = await resolveStripePriceId(selectedPlan, env, env.DB);
  if (!priceId) {
    return jsonResponse({
      error: "This subscription could not be matched to an active recurring Stripe price.",
      planCode,
      planName: selectedPlan.plan_name
    }, 409);
  }

  const siteUrl = getSiteUrl(env);
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("billing_address_collection", "auto");
  params.append("allow_promotion_codes", "true");
  params.append("subscription_data[trial_period_days]", "30");
  params.append("success_url", siteUrl + "/payment-success/?session_id={CHECKOUT_SESSION_ID}");
  params.append("cancel_url", siteUrl + "/pricing/?payment=cancelled");
  params.append("metadata[service_line]", "JA Plan Studio");
  params.append("metadata[plan_code]", selectedPlan.id);
  params.append("metadata[plan_name]", selectedPlan.plan_name || selectedPlan.id);
  params.append("metadata[plan_type]", selectedPlan.plan_type || "");
  params.append("subscription_data[metadata][service_line]", "JA Plan Studio");
  params.append("subscription_data[metadata][plan_code]", selectedPlan.id);
  params.append("subscription_data[metadata][plan_name]", selectedPlan.plan_name || selectedPlan.id);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const responseText = await stripeResponse.text();
  let session;

  try {
    session = JSON.parse(responseText);
  } catch {
    return jsonResponse({
      error: "Stripe returned non-JSON.",
      status: stripeResponse.status,
      response: responseText
    }, 500);
  }

  if (!stripeResponse.ok) {
    return jsonResponse({
      error: "Stripe checkout could not be created.",
      status: stripeResponse.status,
      details: session && session.error && session.error.message ? session.error.message : "Unknown Stripe error"
    }, 500);
  }

  if (!session || !session.url) {
    return jsonResponse({ error: "Stripe did not return a Checkout URL." }, 500);
  }

  return redirectTo(session.url);
}

async function syncServicePlans(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS service_plans (
      id TEXT PRIMARY KEY,
      plan_name TEXT,
      plan_type TEXT,
      price_label TEXT,
      price_pence INTEGER,
      stripe_price_id TEXT,
      delivery_time TEXT,
      revisions TEXT,
      description TEXT,
      button_label TEXT,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 100,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE service_plans ADD COLUMN stripe_product_id TEXT`);

  const currentIds = DEFAULT_PLANS.map((plan) => plan[0]);
  const placeholders = currentIds.map(() => "?").join(", ");
  await DB.prepare(`DELETE FROM service_plans WHERE id NOT IN (${placeholders})`).bind(...currentIds).run();

  for (const plan of DEFAULT_PLANS) {
    await DB.prepare(`
      INSERT INTO service_plans (
        id, plan_name, plan_type, price_label, price_pence, stripe_product_id, stripe_price_id,
        delivery_time, revisions, description, button_label, is_active, is_featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        plan_name = excluded.plan_name,
        plan_type = excluded.plan_type,
        price_label = excluded.price_label,
        price_pence = excluded.price_pence,
        delivery_time = excluded.delivery_time,
        revisions = excluded.revisions,
        description = excluded.description,
        button_label = excluded.button_label,
        is_active = excluded.is_active,
        is_featured = excluded.is_featured,
        sort_order = excluded.sort_order,
        updated_at = CURRENT_TIMESTAMP
    `).bind(...plan).run();
  }
}

async function resolveStripePriceId(plan, env, DB) {
  const overrideByPlan = {
    personal: "stripe_price_personal_override",
    standard: "stripe_price_standard_override",
    professional: "stripe_price_professional_override",
    org_starter: "stripe_price_org_starter_override"
  };
  const overrideKey = overrideByPlan[plan.id];
  if (DB && overrideKey) {
    const row = await DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(overrideKey).first().catch(() => null);
    const override = String(row?.value || "").trim();
    if (override) return override;
  }
  const secretByPlan = {
    personal: "STRIPE_PRICE_EXPLORE",
    standard: "STRIPE_PRICE_PLAN",
    professional: "STRIPE_PRICE_COMPLETE",
    org_starter: "STRIPE_PRICE_TOGETHER"
  };
  const configured = env[secretByPlan[plan.id]];
  if (configured) return String(configured);

  const response = await fetch("https://api.stripe.com/v1/prices?active=true&type=recurring&limit=100&expand[]=data.product", {
    headers: { "Authorization": "Bearer " + env.STRIPE_SECRET_KEY }
  });
  if (!response.ok) return "";
  const catalogue = await response.json();
  const stripeProductNames = {
    personal: "JA Plan Studio – Explore",
    standard: "JA Plan Studio – Plan",
    professional: "JA Plan Studio – Complete",
    org_starter: "JA Plan Studio – Together"
  };
  const acceptedNames = new Set([
    String(plan.plan_name || "").trim().toLowerCase(),
    String(stripeProductNames[plan.id] || "").trim().toLowerCase()
  ]);
  const match = (catalogue.data || []).find((price) => {
    const product = price && typeof price.product === "object" ? price.product : null;
    return product && product.active !== false
      && acceptedNames.has(String(product.name || "").trim().toLowerCase())
      && String(price.currency || "").toLowerCase() === "gbp"
      && Number(price.unit_amount || 0) === Number(plan.price_pence || 0)
      && price.recurring && price.recurring.interval === "month";
  });
  return match && match.id ? String(match.id) : "";
}

async function safeAlter(DB, sql) {
  try {
    await DB.prepare(sql).run();
  } catch {
    // Column already exists.
  }
}

function getSiteUrl(env) {
  return String(env && env.SITE_URL ? env.SITE_URL : "https://japlanstudio.jagroupservices.co.uk").replace(/\/+$/, "");
}

function redirectTo(url) {
  return new Response("", {
    status: 303,
    headers: {
      "Location": url,
      "Cache-Control": "no-store"
    }
  });
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function errorMessage(error) {
  return error && error.message ? error.message : String(error);
}
