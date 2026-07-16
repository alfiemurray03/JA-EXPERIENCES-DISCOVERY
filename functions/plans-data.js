const DEFAULT_PLANS = [
  ["personal", "Explore", "Monthly subscription", "£5.99", 599, "", "", "Essential planning builders", "Save and revisit your plans", "A simple starting point for exploring ideas and building clear, practical plans.", "Subscribe to Explore", 1, 0, 10],
  ["standard", "Plan", "Monthly subscription", "£7.99", 799, "", "", "More builders and planning tools", "Download your finished plans", "For regularly creating detailed destination, itinerary, experience and everyday plans.", "Subscribe to Plan", 1, 1, 20],
  ["professional", "Complete", "Monthly subscription", "£14.99", 1499, "", "", "Full planning-builder access", "Enhanced planning and outputs", "Complete access for building and managing more comprehensive personalised plans.", "Subscribe to Complete", 1, 0, 30],
  ["org_starter", "Together", "Monthly subscription", "£39.99", 3999, "", "", "Shared planning for groups", "All builders and collaborative tools", "Shared planning for households, families and groups who want to build plans together.", "Subscribe to Together", 1, 0, 40]
];

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return json({ error: "Plan database binding DB is missing.", plans: [] }, 500);
  }

  await syncServicePlans(env.DB);

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
