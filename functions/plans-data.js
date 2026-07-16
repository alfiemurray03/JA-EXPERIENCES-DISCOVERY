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
  const { env } = context;

  if (!env.DB) {
    return json({ error: "Plan database binding DB is missing.", plans: [] }, 500);
  }

  let result;
  try {
    result = await env.DB.prepare(`
      SELECT id, plan_name, plan_type, price_label, price_pence, delivery_time, revisions,
        description, button_label, is_active, is_featured, sort_order,
        CASE WHEN stripe_price_id IS NOT NULL AND stripe_price_id != '' THEN 1 ELSE 0 END AS has_stripe_price
      FROM service_plans
      ORDER BY sort_order ASC, plan_name ASC
    `).all();
  } catch (error) {
    console.error("Plan catalogue read failed:", error instanceof Error ? error.message : String(error));
    return json({ plans: defaultPlanPayload(), source: "fallback" });
  }

  const plans = (result.results || [])
    .filter((plan) => Number(plan.is_active || 0) === 1)
    .map((plan) => ({
      ...plan,
      is_active: Number(plan.is_active || 0),
      is_featured: Number(plan.is_featured || 0),
      payment_available: Number(plan.has_stripe_price || 0) === 1
    }));

  return json({ plans: plans.length ? plans : defaultPlanPayload(), source: plans.length ? "database" : "fallback" });
};

function defaultPlanPayload() {
  return DEFAULT_PLANS.map((plan) => ({
    id: plan[0], plan_name: plan[1], plan_type: plan[2], price_label: plan[3], price_pence: plan[4],
    delivery_time: plan[7], revisions: plan[8], description: plan[9], button_label: plan[10],
    is_active: plan[11], is_featured: plan[12], sort_order: plan[13], payment_available: Boolean(plan[6])
  }));
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
