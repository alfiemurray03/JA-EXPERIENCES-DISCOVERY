const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (context.request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405);
  }

  return submitEnquiry(context.request, context.env);
}

async function submitEnquiry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Please check the form and try again." }, 400);
  }

  if (clean(body.website, 100)) {
    return json({ ok: true, reference: "JA-RECEIVED" });
  }

  const submittedAt = Number(body.startedAt);
  if (!submittedAt || Date.now() - submittedAt < 2500) {
    return json({ ok: false, message: "Please wait a moment and submit the form again." }, 400);
  }

  const enquiry = {
    name: clean(body.name, 100),
    email: clean(body.email, 160).toLowerCase(),
    telephone: clean(body.telephone, 40),
    formType: clean(body.formType, 80),
    enquiryType: clean(body.enquiryType, 120),
    plan: clean(body.plan, 120),
    destination: clean(body.destination, 120),
    dates: clean(body.dates, 120),
    travellers: clean(body.travellers, 120),
    travellerType: clean(body.travellerType, 120),
    budget: clean(body.budget, 120),
    supportNeeds: clean(body.supportNeeds, 1500),
    message: clean(body.message, 4000),
    socialTariff: Boolean(body.socialTariff),
    specialCategoryConsent: Boolean(body.specialCategoryConsent),
    transportConfirmed: Boolean(body.transportConfirmed),
    termsAccepted: Boolean(body.termsAccepted),
    privacyAccepted: Boolean(body.privacyAccepted),
    marketingConsent: Boolean(body.marketingConsent)
  };

  if (!enquiry.name || !isValidEmail(enquiry.email) || !enquiry.message || !enquiry.termsAccepted || !enquiry.privacyAccepted) {
    return json({ ok: false, message: "Please complete your name, email, enquiry, Terms confirmation and Privacy confirmation." }, 400);
  }

  if (enquiry.supportNeeds && !enquiry.specialCategoryConsent) {
    return json({ ok: false, message: "Sensitive-information consent is required when support needs are included." }, 400);
  }

  if (await freePlanIsHidden(env, enquiry)) {
    return json({ ok: false, message: "The Free Discovery Enquiry is currently unavailable." }, 403);
  }

  if (enquiry.formType === "Free Discovery Enquiry" && !enquiry.transportConfirmed) {
    return json({ ok: false, message: "Please confirm that you understand the travel and transport responsibility." }, 400);
  }

  const reference = `JED-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  if (env.DB) {
    await storeEnquiry(env.DB, reference, enquiry, request);
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO_EMAIL || !env.ENQUIRY_FROM_EMAIL) {
    console.error("Enquiry email environment variables are not configured.");
    return json({
      ok: false,
      message: "Online forms are temporarily unavailable. Please try again later."
    }, 503);
  }

  const emailResponse = await sendEnquiryEmail(env, reference, enquiry);

  if (!emailResponse.ok) {
    console.error("Resend rejected enquiry email", emailResponse.status, await emailResponse.text());
    return json({ ok: false, message: "We could not send your form. Please try again later." }, 502);
  }

  return json({
    ok: true,
    reference,
    message: "Thank you. Your form has been sent to JA Experiences & Discovery."
  });
}

async function storeEnquiry(DB, reference, enquiry, request) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS enquiries (
      reference TEXT PRIMARY KEY,
      form_type TEXT,
      enquiry_type TEXT,
      name TEXT,
      email TEXT,
      telephone TEXT,
      plan TEXT,
      destination TEXT,
      dates TEXT,
      travellers TEXT,
      traveller_type TEXT,
      budget TEXT,
      support_needs TEXT,
      message TEXT,
      social_tariff INTEGER DEFAULT 0,
      special_category_consent INTEGER DEFAULT 0,
      transport_confirmed INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await ensureConsentTable(DB);

  await DB.prepare(`
    INSERT INTO enquiries (
      reference, form_type, enquiry_type, name, email, telephone, plan, destination, dates,
      travellers, traveller_type, budget, support_needs, message, social_tariff,
      special_category_consent, transport_confirmed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    reference,
    enquiry.formType,
    enquiry.enquiryType,
    enquiry.name,
    enquiry.email,
    enquiry.telephone,
    enquiry.plan,
    enquiry.destination,
    enquiry.dates,
    enquiry.travellers,
    enquiry.travellerType,
    enquiry.budget,
    enquiry.supportNeeds,
    enquiry.message,
    enquiry.socialTariff ? 1 : 0,
    enquiry.specialCategoryConsent ? 1 : 0,
    enquiry.transportConfirmed ? 1 : 0
  ).run();

  await insertConsent(DB, {
    email: enquiry.email,
    source: "enquiry",
    termsAccepted: enquiry.termsAccepted,
    privacyAccepted: enquiry.privacyAccepted,
    marketingConsent: enquiry.marketingConsent,
    ipHash: await hashValue(request.headers.get("cf-connecting-ip") || ""),
    userAgent: clean(request.headers.get("user-agent") || "", 500),
    reference
  });
}

async function ensureConsentTable(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      email TEXT,
      source TEXT,
      reference TEXT,
      terms_accepted INTEGER DEFAULT 0,
      terms_version TEXT,
      terms_accepted_at TEXT,
      privacy_accepted INTEGER DEFAULT 0,
      privacy_version TEXT,
      privacy_accepted_at TEXT,
      marketing_consent INTEGER DEFAULT 0,
      marketing_consent_at TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function insertConsent(DB, consent) {
  const now = new Date().toISOString();
  await DB.prepare(`
    INSERT INTO consent_records (
      id, email, source, reference, terms_accepted, terms_version, terms_accepted_at,
      privacy_accepted, privacy_version, privacy_accepted_at, marketing_consent,
      marketing_consent_at, ip_hash, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    consent.email,
    consent.source,
    consent.reference || "",
    consent.termsAccepted ? 1 : 0,
    "1.0",
    consent.termsAccepted ? now : null,
    consent.privacyAccepted ? 1 : 0,
    "1.0",
    consent.privacyAccepted ? now : null,
    consent.marketingConsent ? 1 : 0,
    consent.marketingConsent ? now : null,
    consent.ipHash || "",
    consent.userAgent || ""
  ).run();
}

async function freePlanIsHidden(env, enquiry) {
  if (!env || !env.DB || !isFreePlanEnquiry(enquiry)) return false;
  const settings = await settingMap(env.DB, ["show_free_plan"], { show_free_plan: "true" });
  return settings.show_free_plan === "false";
}

function isFreePlanEnquiry(enquiry) {
  const text = `${enquiry.formType || ""} ${enquiry.plan || ""} ${enquiry.enquiryType || ""}`.toLowerCase();
  return text.includes("free discovery enquiry") || text.includes("free enquiry");
}

async function settingMap(DB, keys, defaults = {}) {
  try {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    const placeholders = keys.map(() => "?").join(", ");
    const result = await DB.prepare(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`).bind(...keys).all();
    const settings = { ...defaults };
    for (const row of result.results || []) settings[row.key] = row.value;
    return settings;
  } catch {
    return { ...defaults };
  }
}

async function sendEnquiryEmail(env, reference, enquiry) {
  const rows = [
    ["Reference", reference],
    ["Form", enquiry.formType || "Website enquiry"],
    ["Enquiry type", enquiry.enquiryType || "Not specified"],
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Telephone", enquiry.telephone || "Not provided"],
    ["Requested plan", enquiry.plan || "Free Discovery Enquiry"],
    ["Destination", enquiry.destination || "Not decided"],
    ["Dates", enquiry.dates || "Not provided"],
    ["Travellers", enquiry.travellers || "Not provided"],
    ["Traveller type", enquiry.travellerType || "Not provided"],
    ["Budget", enquiry.budget || "Not provided"],
    ["Social tariff requested", enquiry.socialTariff ? "Yes" : "No"],
    ["Support or access needs", enquiry.supportNeeds || "None provided"],
    ["Terms accepted", enquiry.termsAccepted ? "Yes" : "No"],
    ["Privacy accepted", enquiry.privacyAccepted ? "Yes" : "No"],
    ["Marketing consent", enquiry.marketingConsent ? "Yes" : "No"],
    ["Enquiry", enquiry.message]
  ];
  const htmlRows = rows.map(([label, value]) =>
    `<tr><th style="padding:8px;text-align:left;vertical-align:top;background:#f4f7fa">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
  ).join("");

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_EMAIL,
      to: [env.ENQUIRY_TO_EMAIL],
      reply_to: enquiry.email,
      subject: `${reference}: ${enquiry.enquiryType || enquiry.formType || "Website enquiry"} from ${enquiry.name}`,
      html: `<h1>New JA Experiences &amp; Discovery enquiry</h1><table style="border-collapse:collapse;width:100%;max-width:760px" border="1" cellpadding="0" cellspacing="0">${htmlRows}</table>`
    })
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hashValue(value) {
  if (!value) return "";
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
