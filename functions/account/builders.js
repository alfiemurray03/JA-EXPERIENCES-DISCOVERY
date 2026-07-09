function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function wantsPortalHtml(request, pathname) {
  return request.method === "GET" && !pathname.startsWith("/account/api/");
}

function portalAssetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Request(url.toString(), request);
}

function clean(value, max = 1000) { return String(value || "").trim().slice(0, max); }
function cleanEmail(value) { return clean(value, 254).toLowerCase(); }

function getAccessIdentity(request) {
  const nativeEmail = request.headers.get("x-ja-auth-email") || "";
  return { email: cleanEmail(nativeEmail), name: clean(request.headers.get("x-ja-auth-name") || nativeEmail, 160) };
}

const DEFAULT_BUILDERS = [
  ["day-trip", "Day Trip Builder", "Small", "Everyday experiences", 10, "trial,membership,plus,family", "trial", "Build a practical day trip outline with timings, budget prompts and checklist notes."],
  ["family-day-out", "Family Day Out Builder", "Standard", "Everyday experiences", 15, "trial,membership,plus,family", "trial", "Plan a family day out with pace, facilities, accessibility and weather alternatives."],
  ["school-holiday", "School Holiday Planner", "Standard", "Everyday experiences", 15, "membership,plus,family", "paid", "Organise school holiday ideas across dates, budgets and family priorities."],
  ["occasion", "Occasion Planner", "Standard", "Everyday experiences", 15, "membership,plus,family", "paid", "Plan a birthday, anniversary or special occasion with tasks and provider checks."],
  ["local-discovery", "Local Discovery Builder", "Small", "Everyday experiences", 10, "trial,membership,plus,family", "trial", "Create a local discovery shortlist with suitability checks."],
  ["budget-experience", "Budget Experience Builder", "Small", "Everyday experiences", 10, "membership,plus,family", "paid", "Shape ideas around a realistic budget and priority list."],
  ["rainy-day", "Rainy Day Plan Builder", "Small", "Everyday experiences", 10, "membership,plus,family", "paid", "Prepare an indoor or weather-resilient plan."],
  ["date-night", "Date Night Builder", "Small", "Everyday experiences", 10, "membership,plus,family", "paid", "Build a date-night plan with timings, budget and booking prompts."],
  ["birthday-plan", "Birthday Plan Builder", "Standard", "Everyday experiences", 15, "membership,plus,family", "paid", "Create a birthday plan with guests, venue checks and tasks."],
  ["travel-itinerary", "Travel Itinerary Builder", "Travel", "Travel experiences", 35, "plus,family", "paid", "Create a self-service travel itinerary outline and checklist."],
  ["country-brief", "Country Travel Brief Builder", "Travel", "Travel experiences", 35, "plus,family", "paid", "Summarise official-source checks a member should complete before travel."],
  ["europe-entry", "Europe Entry Readiness Builder", "Travel", "Travel experiences", 35, "plus,family", "paid", "Organise Europe entry-readiness prompts without immigration advice."],
  ["travel-checklist", "Travel Checklist Builder", "Travel", "Travel experiences", 35, "membership,plus,family", "paid", "Build a travel checklist for documents, packing, operator checks and responsibilities."],
  ["tube-notes", "Tube Planning Notes Builder", "Travel", "Travel experiences", 35, "plus,family", "paid", "Create general Tube planning notes; customers must check operators before travel."],
  ["bus-notes", "Bus Planning Notes Builder", "Travel", "Travel experiences", 35, "plus,family", "paid", "Create general bus planning notes; customers must check operators before travel."],
  ["destination-board", "Destination Board Builder", "Travel", "Travel experiences", 35, "membership,plus,family", "paid", "Create a destination board with ideas, notes and provider checks."],
  ["airport-assistance", "Airport Assistance Request Builder", "Accessibility/support", "Accessibility and support", 40, "plus,family", "paid", "Prepare general assistance request notes for the customer to check with providers."],
  ["accessible-travel-checklist", "Accessible Travel Checklist", "Accessibility/support", "Accessibility and support", 35, "plus,family", "paid", "Build a general accessible travel planning checklist."],
  ["mobility-equipment", "Mobility Equipment Planner", "Accessibility/support", "Accessibility and support", 40, "plus,family", "paid", "Organise mobility equipment planning prompts without medical or safety advice."],
  ["hidden-disabilities", "Hidden Disabilities Support Planner", "Accessibility/support", "Accessibility and support", 40, "plus,family", "paid", "Prepare general hidden-disability support planning notes."],
  ["accessible-destination", "Accessible Destination Checklist", "Accessibility/support", "Accessibility and support", 35, "plus,family", "paid", "Create accessibility checks for destinations and providers."],
  ["accessible-venue-questions", "Accessible Venue Questions Builder", "Accessibility/support", "Accessibility and support", 35, "plus,family", "paid", "Prepare questions to ask venues directly."],
  ["support-confirmation", "Support Confirmation Tracker", "Accessibility/support", "Accessibility and support", 35, "plus,family", "paid", "Track support confirmations and follow-up tasks."],
  ["my-plans", "My Plans", "Organisation", "Organisation tools", 0, "trial,membership,plus,family", "trial", "View and organise saved plans."],
  ["my-discovery-boards", "My Discovery Boards", "Organisation", "Organisation tools", 0, "trial,membership,plus,family", "trial", "View and organise discovery boards."],
  ["saved-experiences", "Saved Experiences", "Organisation", "Organisation tools", 0, "trial,membership,plus,family", "trial", "View saved experiences."],
  ["budget-planner", "Budget Planner", "Small", "Organisation tools", 10, "membership,plus,family", "paid", "Create a simple budget planning output."],
  ["booking-tracker", "Booking Tracker", "Small", "Organisation tools", 10, "membership,plus,family", "paid", "Create a booking tracker output for member-managed bookings."],
  ["checklists", "Checklists", "Small", "Organisation tools", 10, "trial,membership,plus,family", "trial", "Create a reusable checklist."]
];

const ADDONS = [
  ["extra-10-tokens", "Extra 10 Builder Usage Tokens", 500, 10, "tokens"],
  ["extra-25-tokens", "Extra 25 Builder Usage Tokens", 1000, 25, "tokens"],
  ["extra-50-tokens", "Extra 50 Builder Usage Tokens", 1800, 50, "tokens"],
  ["extra-100-tokens", "Extra 100 Builder Usage Tokens", 3000, 100, "tokens"],
  ["quick-human-help", "Quick Human Help", 2500, 0, "human_support"],
  ["human-plan-review", "Human Plan Review", 5000, 0, "human_support"],
  ["human-made-plan", "Human-Made Experience Plan", 10000, 0, "human_support"]
];

async function ensureTables(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS experience_builders (id TEXT PRIMARY KEY, name TEXT NOT NULL, builder_type TEXT NOT NULL, category TEXT NOT NULL, token_cost INTEGER NOT NULL DEFAULT 15, plan_inclusion TEXT NOT NULL DEFAULT 'trial,membership,plus,family', status TEXT NOT NULL DEFAULT 'Active', visibility TEXT NOT NULL DEFAULT 'paid', description TEXT, form_schema TEXT NOT NULL DEFAULT '[]', usage_count INTEGER NOT NULL DEFAULT 0, blocked_attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_outputs (id TEXT PRIMARY KEY, email TEXT NOT NULL, builder_id TEXT NOT NULL, builder_name TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Completed', token_cost INTEGER NOT NULL DEFAULT 0, input_payload TEXT NOT NULL DEFAULT '{}', output_payload TEXT NOT NULL DEFAULT '{}', request_id TEXT, archived_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(email, request_id))`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_token_ledger (id TEXT PRIMARY KEY, email TEXT NOT NULL, amount INTEGER NOT NULL, balance_after INTEGER NOT NULL, source TEXT NOT NULL, reason TEXT NOT NULL, builder_output_id TEXT, builder_id TEXT, admin_email TEXT, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_blocked_attempts (id TEXT PRIMARY KEY, email TEXT NOT NULL, builder_id TEXT, builder_name TEXT, reason TEXT NOT NULL, tokens_available INTEGER NOT NULL DEFAULT 0, tokens_required INTEGER NOT NULL DEFAULT 0, action_offered TEXT, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS trial_access_tokens (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'Active', activated_at TEXT NOT NULL, expires_at TEXT NOT NULL, token_allowance INTEGER NOT NULL DEFAULT 30, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS token_addon_packages (id TEXT PRIMARY KEY, name TEXT NOT NULL, price_pence INTEGER NOT NULL, token_amount INTEGER NOT NULL DEFAULT 0, package_type TEXT NOT NULL DEFAULT 'tokens', status TEXT NOT NULL DEFAULT 'Configuration Ready', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await seedDefaults(DB);
}

async function seedDefaults(DB) {
  for (const row of DEFAULT_BUILDERS) {
    await DB.prepare(`INSERT OR IGNORE INTO experience_builders (id, name, builder_type, category, token_cost, plan_inclusion, visibility, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(...row).run();
  }
  for (const row of ADDONS) {
    await DB.prepare(`INSERT OR IGNORE INTO token_addon_packages (id, name, price_pence, token_amount, package_type) VALUES (?, ?, ?, ?, ?)`).bind(...row).run();
  }
}

async function all(DB, sql, bindings = []) {
  const result = await DB.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function first(DB, sql, bindings = []) {
  return await DB.prepare(sql).bind(...bindings).first();
}

async function tokenBalance(DB, email) {
  const row = await first(DB, `SELECT COALESCE(SUM(amount), 0) AS balance FROM builder_token_ledger WHERE lower(email) = lower(?)`, [email]);
  return Number(row?.balance || 0);
}

async function activeSubscription(DB, email) {
  return await first(DB, `
    SELECT plan_name, status, current_period_end, trial_end
    FROM stripe_subscriptions
    WHERE lower(customer_email) = lower(?)
      AND lower(COALESCE(status, '')) IN ('active', 'trialing')
      AND (
        current_period_end IS NULL
        OR current_period_end = ''
        OR datetime(current_period_end) > datetime('now')
      )
    ORDER BY COALESCE(current_period_end, trial_end, subscription_start, updated_at) DESC
    LIMIT 1
  `, [email]).catch(() => null);
}

async function tokenSummary(DB, email) {
  const [trial, balanceRow, usedRow, addOnRow, subscription] = await Promise.all([
    first(DB, `SELECT * FROM trial_access_tokens WHERE lower(email) = lower(?)`, [email]),
    first(DB, `SELECT COALESCE(SUM(amount), 0) AS balance FROM builder_token_ledger WHERE lower(email) = lower(?)`, [email]),
    first(DB, `SELECT ABS(COALESCE(SUM(amount), 0)) AS used FROM builder_token_ledger WHERE lower(email) = lower(?) AND amount < 0 AND source = 'builder_usage'`, [email]),
    first(DB, `SELECT COALESCE(SUM(amount), 0) AS purchased FROM builder_token_ledger WHERE lower(email) = lower(?) AND source = 'add_on_purchase'`, [email]),
    activeSubscription(DB, email)
  ]);
  const now = Date.now();
  const activeTrial = trial && trial.status === "Active" && new Date(trial.expires_at).getTime() > now;
  const activePlan = Boolean(subscription);
  return {
    wording: "Builder Usage Tokens",
    remaining_tokens: Number(balanceRow?.balance || 0),
    used_tokens: Number(usedRow?.used || 0),
    purchased_addon_tokens: Number(addOnRow?.purchased || 0),
    monthly_allowance: activeTrial ? Number(trial.token_allowance || 30) : 0,
    trial_tokens: trial ? Number(trial.token_allowance || 30) : 0,
    token_reset_at: "",
    trial: trial || null,
    trial_active: Boolean(activeTrial),
    subscription: subscription || null,
    subscription_active: activePlan,
    plan_active: Boolean(activeTrial || activePlan),
    plan_name: activeTrial ? "14-Day Free Trial" : activePlan ? (subscription.plan_name || "Active membership") : "No active self-service plan detected",
    deduction_rule: "Tokens are deducted only when a finished builder output is created, saved, generated or completed. Opening or viewing a builder does not deduct tokens."
  };
}

function outputFromInput(builder, body) {
  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  const notes = Object.entries(fields)
    .filter(([, value]) => clean(value, 1000))
    .map(([key, value]) => ({ label: key.replace(/[_-]+/g, " "), value: clean(value, 1000) }));
  return {
    title: clean(body.title, 160) || `${builder.name} output`,
    builder: builder.name,
    summary: `Self-service ${builder.name} output created from the details supplied by the member.`,
    notes,
    responsibilities: [
      "Check prices, opening times, availability, accessibility, suitability and provider terms before relying on this plan.",
      "JA Group Services Ltd does not arrange flights, transport, package holidays, visas, third-party bookings, refunds or cancellations.",
      "Accessibility and route notes are general planning support only and are not medical, safety, insurance or immigration advice."
    ]
  };
}

async function blockAttempt(DB, email, builder, reason, available, required) {
  await DB.prepare(`INSERT INTO builder_blocked_attempts (id, email, builder_id, builder_name, reason, tokens_available, tokens_required, action_offered) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(
    crypto.randomUUID(), email, builder?.id || "", builder?.name || "", reason, available, required, "View usage, upgrade plan, or purchase extra Builder Usage Tokens."
  ).run();
  if (builder?.id) {
    await DB.prepare(`UPDATE experience_builders SET blocked_attempts = COALESCE(blocked_attempts, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(builder.id).run();
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (wantsPortalHtml(request, url.pathname)) {
    if (env.ASSETS?.fetch) return env.ASSETS.fetch(portalAssetRequest(request, "/account/builders/index.html"));
    return Response.redirect(new URL("/account/builders/", request.url), 302);
  }
  if (!env.DB) return json({ error: "Database unavailable." }, 500);
  const identity = getAccessIdentity(request);
  if (!identity.email) return json({ error: "Not signed in." }, 401);
  await ensureTables(env.DB);

  if (request.method === "GET") {
    const [builders, outputs, ledger, attempts, packages, summary] = await Promise.all([
      all(env.DB, `SELECT * FROM experience_builders WHERE COALESCE(status, 'Active') != 'Archived' ORDER BY category, token_cost, name`),
      all(env.DB, `SELECT * FROM builder_outputs WHERE lower(email) = lower(?) AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`, [identity.email]),
      all(env.DB, `SELECT * FROM builder_token_ledger WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 100`, [identity.email]),
      all(env.DB, `SELECT * FROM builder_blocked_attempts WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 50`, [identity.email]),
      all(env.DB, `SELECT * FROM token_addon_packages ORDER BY package_type DESC, price_pence ASC`),
      tokenSummary(env.DB, identity.email)
    ]);
    return json({ builders, outputs, ledger, blocked_attempts: attempts, add_on_packages: packages, token_summary: summary });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const body = await request.json().catch(() => ({}));
  const action = clean(body.action, 40);

  if (action === "activate_trial") {
    const existing = await first(env.DB, `SELECT * FROM trial_access_tokens WHERE lower(email) = lower(?)`, [identity.email]);
    if (existing) return json({ error: "A trial has already been activated for this customer account.", trial: existing }, 409);
    const now = new Date();
    const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const trialId = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO trial_access_tokens (id, email, activated_at, expires_at, token_allowance) VALUES (?, ?, ?, ?, 30)`).bind(trialId, identity.email, now.toISOString(), expires.toISOString()).run();
    const balanceAfter = (await tokenBalance(env.DB, identity.email)) + 30;
    await env.DB.prepare(`INSERT INTO builder_token_ledger (id, email, amount, balance_after, source, reason, metadata) VALUES (?, ?, 30, ?, 'trial', 'One-time 14-day trial Builder Usage Tokens', ?)`).bind(crypto.randomUUID(), identity.email, balanceAfter, JSON.stringify({ trialId })).run();
    return json({ activated: true, token_summary: await tokenSummary(env.DB, identity.email) });
  }

  if (action === "archive_output") {
    const id = clean(body.id, 120);
    await env.DB.prepare(`UPDATE builder_outputs SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND lower(email) = lower(?)`).bind(id, identity.email).run();
    return json({ archived: true });
  }

  if (action === "save_output") {
    const builderId = clean(body.builder_id, 120);
    const builder = await first(env.DB, `SELECT * FROM experience_builders WHERE id = ?`, [builderId]);
    if (!builder) return json({ error: "Builder not found." }, 404);
    if (String(builder.status || "Active") !== "Active") {
      await blockAttempt(env.DB, identity.email, builder, "Builder is not active.", await tokenBalance(env.DB, identity.email), Number(builder.token_cost || 0));
      return json({ error: "This builder is not currently available." }, 403);
    }
    const summary = await tokenSummary(env.DB, identity.email);
    if (!summary.plan_active) {
      await blockAttempt(env.DB, identity.email, builder, "No active paid subscription or active trial.", summary.remaining_tokens, Number(builder.token_cost || 0));
      return json({ error: "An active trial or paid subscription is required before completing this builder.", token_summary: summary }, 402);
    }
    const cost = Math.max(0, Number(builder.token_cost || 0));
    if (summary.remaining_tokens < cost) {
      await blockAttempt(env.DB, identity.email, builder, "Insufficient Builder Usage Tokens.", summary.remaining_tokens, cost);
      return json({ error: "Not enough Builder Usage Tokens to complete this builder.", token_summary: summary }, 402);
    }
    const requestId = clean(body.request_id, 120) || crypto.randomUUID();
    const existing = await first(env.DB, `SELECT * FROM builder_outputs WHERE lower(email) = lower(?) AND request_id = ?`, [identity.email, requestId]);
    if (existing) return json({ saved: true, output: existing, token_summary: await tokenSummary(env.DB, identity.email), duplicate: true });
    const outputId = crypto.randomUUID();
    const output = outputFromInput(builder, body);
    const balanceAfter = summary.remaining_tokens - cost;
    await env.DB.prepare(`INSERT INTO builder_outputs (id, email, builder_id, builder_name, title, token_cost, input_payload, output_payload, request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      outputId, identity.email, builder.id, builder.name, output.title, cost, JSON.stringify(body.fields || {}), JSON.stringify(output), requestId
    ).run();
    if (cost > 0) {
      await env.DB.prepare(`INSERT INTO builder_token_ledger (id, email, amount, balance_after, source, reason, builder_output_id, builder_id, metadata) VALUES (?, ?, ?, ?, 'builder_usage', ?, ?, ?, ?)`).bind(
        crypto.randomUUID(), identity.email, -cost, balanceAfter, `Completed ${builder.name}`, outputId, builder.id, JSON.stringify({ requestId })
      ).run();
    }
    await env.DB.prepare(`UPDATE experience_builders SET usage_count = COALESCE(usage_count, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(builder.id).run();
    return json({ saved: true, output, output_id: outputId, token_summary: await tokenSummary(env.DB, identity.email) });
  }

  return json({ error: "Unknown action." }, 400);
}
