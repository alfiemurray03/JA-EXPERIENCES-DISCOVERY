const DEFAULT_PLANS = [
  ["free_discovery_enquiry", "Free Discovery Enquiry", "Free", "£0", 0, "", "", "1 to 3 working days", "Initial review and recommendation", "A no-cost starting point for questions and support route guidance.", "Start a free enquiry", 1, 0, 0],
  ["destination_discovery_standard", "Destination Discovery Plan", "Standard", "£49", 4900, "prod_destination_discovery", "price_1TkZu2DZzb3r6Q3cuhKd6KTt", "3-5 working days", "1 minor revision", "A focused destination discovery plan for early-stage trip ideas.", "Buy now securely", 1, 1, 10],
  ["itinerary_experience_standard", "Itinerary and Experience Planning Plan", "Standard", "£89", 8900, "prod_itinerary_experience", "price_1TkZuJDZzb3r6Q3c9cEy41Iw", "5-7 working days", "1 minor revision", "A structured itinerary and experience planning service.", "Buy now securely", 1, 1, 20],
  ["complete_planning_standard", "Complete Discovery and Planning Guidance Plan", "Standard", "£149", 14900, "prod_complete_planning", "price_1TkZucDZzb3r6Q3cGVNcyvIF", "7-10 working days", "2 minor revisions", "A complete discovery and planning guidance package.", "Buy now securely", 1, 1, 30],
  ["destination_discovery_social", "Destination Discovery Social Tariff", "Social tariff", "£29", 2900, "prod_destination_social", "price_1TkZuuDZzb3r6Q3c2C6jQuvo", "3-5 working days", "1 minor revision", "Reduced-rate destination discovery plan.", "Buy now securely", 1, 0, 40],
  ["itinerary_experience_social", "Itinerary Planning Social Tariff", "Social tariff", "£55", 5500, "prod_itinerary_social", "price_1TkZv0DZzb3r6Q3cOh6tjkIM", "5-7 working days", "1 minor revision", "Reduced-rate itinerary and experience planning service.", "Buy now securely", 1, 0, 50],
  ["complete_planning_social", "Complete Planning Social Tariff", "Social tariff", "£95", 9500, "prod_complete_social", "price_1TkZvDDZzb3r6Q3csGxh4vSL", "7-10 working days", "2 minor revisions", "Reduced-rate complete planning guidance package.", "Buy now securely", 1, 0, 60]
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

  if (!selectedPlan.stripe_price_id) {
    return jsonResponse({
      error: "This plan is not connected to Stripe yet.",
      planCode,
      planName: selectedPlan.plan_name
    }, 409);
  }

  const siteUrl = getSiteUrl(env);
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("line_items[0][price]", selectedPlan.stripe_price_id);
  params.append("line_items[0][quantity]", "1");
  params.append("customer_creation", "always");
  params.append("billing_address_collection", "auto");
  params.append("success_url", siteUrl + "/payment-success/?session_id={CHECKOUT_SESSION_ID}");
  params.append("cancel_url", siteUrl + "/pricing/?payment=cancelled");
  params.append("metadata[service_line]", "JA Plan Studio");
  params.append("metadata[plan_code]", selectedPlan.id);
  params.append("metadata[plan_name]", selectedPlan.plan_name || selectedPlan.id);
  params.append("metadata[plan_type]", selectedPlan.plan_type || "");
  params.append("payment_intent_data[metadata][service_line]", "JA Plan Studio");
  params.append("payment_intent_data[metadata][plan_code]", selectedPlan.id);
  params.append("payment_intent_data[metadata][plan_name]", selectedPlan.plan_name || selectedPlan.id);

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

async function ensureServicePlans(DB) {
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

  for (const plan of DEFAULT_PLANS) {
    await DB.prepare(`
      INSERT INTO service_plans (
        id, plan_name, plan_type, price_label, price_pence, stripe_product_id, stripe_price_id,
        delivery_time, revisions, description, button_label, is_active, is_featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).bind(...plan).run();
  }
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
