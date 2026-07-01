function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function redirect(location, status = 302) {
  return new Response(null, {
    status,
    headers: {
      "Location": location,
      "Cache-Control": "no-store"
    }
  });
}

function wantsJson(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("application/json");
}

function getAccessIdentity(request) {
  const nativeEmail = request.headers.get("x-ja-auth-email") || "";
  if (nativeEmail) return { email: nativeEmail.trim().toLowerCase(), verifiedName: (request.headers.get("x-ja-auth-name") || nativeEmail).trim() };
  const emailHeader =
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("CF-Access-Authenticated-User-Email") ||
    "";

  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    request.headers.get("CF-Access-Jwt-Assertion") ||
    "";

  const tokenIdentity = decodeJwtPayload(jwt);

  const emails = Array.isArray(tokenIdentity.emails) ? tokenIdentity.emails : [];
  const email =
    emailHeader ||
    tokenIdentity.email ||
    emails[0] ||
    tokenIdentity.preferred_username ||
    tokenIdentity.upn ||
    tokenIdentity.user_email ||
    tokenIdentity.username ||
    "";

  const verifiedName =
    tokenIdentity.name ||
    tokenIdentity.common_name ||
    tokenIdentity.user_name ||
    tokenIdentity.preferred_username ||
    email ||
    "";

  return {
    email: String(email || "").trim().toLowerCase(),
    verifiedName: String(verifiedName || "").trim()
  };
}

function decodeJwtPayload(jwt) {
  try {
    if (!jwt || !jwt.includes(".")) return {};

    const payload = jwt.split(".")[1];
    const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised.padEnd(normalised.length + ((4 - normalised.length % 4) % 4), "=");
    const decoded = atob(padded);

    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanEmail(value) {
  return clean(value, 254).toLowerCase();
}

function profileHasEligibleAccess(row, plan) {
  const status = String(row?.admin_customer_status || "").trim().toLowerCase();
  return Boolean(
    Number(row?.admin_lifetime || 0) === 1 ||
    row?.admin_lifetime_plan_id ||
    plan?.id ||
    (status && !["standard", "free", "secure", "secure account"].includes(status))
  );
}

async function ensureProfileTable(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      verified_name TEXT,
      display_name TEXT,
      contact_email TEXT,
      phone TEXT,
      communication_preference TEXT,
      support_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_lifetime INTEGER DEFAULT 0`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_lifetime_plan_id TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_customer_status TEXT DEFAULT 'Standard'`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_attempted_at TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_status TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_provider TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_to TEXT`);
}

async function ensureNotificationTables(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id TEXT PRIMARY KEY,
      actor_email TEXT,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      summary TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function safeAlter(DB, sql) {
  try {
    await DB.prepare(sql).run();
  } catch {
    // Existing D1 databases may already have this column.
  }
}

async function settingMap(DB, keys, defaults = {}) {
  try {
    const placeholders = keys.map(() => "?").join(", ");
    const result = await DB.prepare(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`).bind(...keys).all();
    const settings = { ...defaults };
    for (const row of result.results || []) settings[row.key] = row.value;
    return settings;
  } catch {
    return { ...defaults };
  }
}

async function providerSettings(DB, env) {
  const stored = await settingMap(DB, ["email_provider", "email_api_key", "email_api_endpoint", "smtp_from_name", "smtp_from_email", "admin_notification_email"], {});
  const provider = (stored.email_provider || env.EMAIL_PROVIDER || "resend").toLowerCase();
  const apiKey = stored.email_api_key || env.EMAIL_API_TOKEN || env.RESEND_API_KEY || env.SENDGRID_API_KEY || env.POSTMARK_API_KEY || env.BREVO_API_KEY || "";

  return {
    provider,
    apiKey,
    endpoint: stored.email_api_endpoint || env.EMAIL_API_ENDPOINT || "",
    fromName: stored.smtp_from_name || "JA Experiences & Discovery",
    fromEmail: stored.smtp_from_email || env.ENQUIRY_FROM_EMAIL || "noreply@jagroupservices.co.uk",
    to: stored.admin_notification_email || env.ADMIN_NOTIFICATION_EMAIL || env.ENQUIRY_TO_EMAIL || ""
  };
}

async function sendProviderEmail(DB, env, message) {
  const settings = await providerSettings(DB, env);
  const to = cleanEmail(message.to || settings.to);
  if (!to) throw new Error("Recipient email is not configured.");
  if (!settings.apiKey && settings.provider !== "mailchannels") throw new Error("Email API key is not configured.");

  const from = settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail;
  let endpoint = settings.endpoint;
  const headers = { "Content-Type": "application/json" };
  let body;

  if (settings.provider === "sendgrid") {
    endpoint ||= "https://api.sendgrid.com/v3/mail/send";
    headers.Authorization = `Bearer ${settings.apiKey}`;
    body = { personalizations: [{ to: [{ email: to }] }], from: { email: settings.fromEmail, name: settings.fromName }, subject: message.subject, content: [{ type: "text/plain", value: message.text }] };
  } else if (settings.provider === "postmark") {
    endpoint ||= "https://api.postmarkapp.com/email";
    headers["X-Postmark-Server-Token"] = settings.apiKey;
    body = { From: from, To: to, Subject: message.subject, TextBody: message.text };
  } else if (settings.provider === "brevo") {
    endpoint ||= "https://api.brevo.com/v3/smtp/email";
    headers["api-key"] = settings.apiKey;
    body = { sender: { name: settings.fromName, email: settings.fromEmail }, to: [{ email: to }], subject: message.subject, textContent: message.text };
  } else if (settings.provider === "mailchannels") {
    endpoint ||= "https://api.mailchannels.net/tx/v1/send";
    body = { personalizations: [{ to: [{ email: to }] }], from: { email: settings.fromEmail, name: settings.fromName }, subject: message.subject, content: [{ type: "text/plain", value: message.text }] };
  } else {
    endpoint ||= "https://api.resend.com/emails";
    headers.Authorization = `Bearer ${settings.apiKey}`;
    body = { from, to, subject: message.subject, text: message.text };
  }

  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  const responseText = await response.text().catch(() => "");
  if (!response.ok) throw new Error(`Email provider returned ${response.status}: ${responseText.slice(0, 240)}`);

  return { provider: settings.provider, to, status: response.status };
}

async function writeCustomerAudit(DB, identity, action, summary, metadata = {}) {
  await ensureNotificationTables(DB);
  await DB.prepare(`
    INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata)
    VALUES (?, ?, ?, 'profiles', ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    cleanEmail(identity.email) || "system-account",
    clean(action, 120),
    cleanEmail(identity.email),
    clean(summary, 1000),
    JSON.stringify(metadata)
  ).run();
}

async function recordSignupNotification(DB, email, result) {
  await DB.prepare(`
    UPDATE profiles
    SET signup_notification_attempted_at = CURRENT_TIMESTAMP,
      signup_notification_status = ?,
      signup_notification_provider = ?,
      signup_notification_to = ?
    WHERE lower(email) = lower(?)
  `).bind(
    clean(result.status, 500),
    clean(result.provider, 80),
    cleanEmail(result.to),
    cleanEmail(email)
  ).run();
}

async function notifyCustomerSignup(DB, env, identity, profile) {
  await ensureNotificationTables(DB);

  const createdAt = new Date().toISOString();
  const customerName = profile.displayName || profile.verifiedName || identity.verifiedName || identity.email;

  try {
    const sent = await sendProviderEmail(DB, env, {
      subject: "New JA Experiences & Discovery customer signup",
      text: [
        "A new customer account has been created or first detected by JA Experiences & Discovery.",
        "",
        `Customer name: ${customerName || "Not provided"}`,
        `Customer email: ${identity.email}`,
        `Signup date/time: ${createdAt}`,
        `Account/customer ID: ${identity.email}`,
        "Source/provider: Cloudflare Access / JA customer CIAM"
      ].join("\n")
    });

    await recordSignupNotification(DB, identity.email, { status: "sent", provider: sent.provider, to: sent.to });
    await writeCustomerAudit(DB, identity, "customer_signup_notification_sent", "Sent new customer signup notification email.", { sent: true, provider: sent.provider, to: sent.to });
  } catch (error) {
    const settings = await providerSettings(DB, env);
    await recordSignupNotification(DB, identity.email, { status: `failed: ${error.message || "Unknown email error"}`, provider: settings.provider, to: settings.to });
    await writeCustomerAudit(DB, identity, "customer_signup_notification_failed", "Customer signup notification email failed.", { sent: false, provider: settings.provider, to: settings.to, error: error.message || "Unknown email error" });
  }
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

async function getLatestConsent(DB, email) {
  await ensureConsentTable(DB);

  const consent = await DB.prepare(`
    SELECT terms_accepted, terms_accepted_at, privacy_accepted, privacy_accepted_at,
      marketing_consent, marketing_consent_at, source
    FROM consent_records
    WHERE lower(email) = lower(?)
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(email).first();

  return {
    termsAccepted: Number(consent?.terms_accepted || 0) === 1,
    termsAcceptedAt: consent?.terms_accepted_at || "",
    privacyAccepted: Number(consent?.privacy_accepted || 0) === 1,
    privacyAcceptedAt: consent?.privacy_accepted_at || "",
    marketingConsent: Number(consent?.marketing_consent || 0) === 1,
    marketingConsentAt: consent?.marketing_consent_at || "",
    source: consent?.source || ""
  };
}

async function getProfile(DB, identity, env = {}) {
  await ensureProfileTable(DB);

  const existing = await DB.prepare(`
    SELECT
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      admin_lifetime,
      admin_lifetime_plan_id,
      admin_customer_status,
      created_at,
      updated_at
    FROM profiles
    WHERE email = ?
  `).bind(identity.email).first();

  if (existing) {
    const plan = await getProfilePlan(DB, existing.admin_lifetime_plan_id);
    const eligibleAccess = profileHasEligibleAccess(existing, plan);
    return {
      email: existing.email,
      verifiedName: existing.verified_name || identity.verifiedName,
      displayName: existing.display_name || existing.verified_name || identity.verifiedName || identity.email,
      contactEmail: existing.contact_email || identity.email,
      phone: existing.phone || "",
      communicationPreference: existing.communication_preference || "Email",
      supportNotes: existing.support_notes || "",
      lifetimeAccess: Number(existing.admin_lifetime || 0) === 1,
      customerStatus: existing.admin_customer_status || "Standard",
      currentPlanId: plan?.id || existing.admin_lifetime_plan_id || "",
      currentPlan: plan?.plan_name || existing.admin_customer_status || "Standard",
      currentPlanType: plan?.plan_type || existing.admin_customer_status || "Standard",
      hasEligibleAccess: eligibleAccess,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at
    };
  }

  const nowProfile = {
    email: identity.email,
    verifiedName: identity.verifiedName,
    displayName: identity.verifiedName || identity.email,
    contactEmail: identity.email,
    phone: "",
    communicationPreference: "Email",
    supportNotes: "",
    lifetimeAccess: false,
    customerStatus: "Standard",
    currentPlanId: "",
    currentPlan: "Standard",
    currentPlanType: "Standard",
    hasEligibleAccess: false,
    createdAt: null,
    updatedAt: null
  };

  await DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    nowProfile.email,
    nowProfile.verifiedName,
    nowProfile.displayName,
    nowProfile.contactEmail,
    nowProfile.phone,
    nowProfile.communicationPreference,
    nowProfile.supportNotes
  ).run();

  await notifyCustomerSignup(DB, env, identity, nowProfile).catch(() => {});

  return getProfile(DB, identity, env);
}

async function getProfilePlan(DB, planId) {
  if (!planId) return null;
  try {
    return await DB.prepare(`SELECT id, plan_name, plan_type FROM service_plans WHERE id = ?`).bind(planId).first();
  } catch {
    return null;
  }
}

async function saveProfile(DB, identity, body, request, env = {}) {
  await ensureProfileTable(DB);

  if (!body.termsAccepted || !body.privacyAccepted) {
    const error = new Error("Terms of Service and Privacy Notice consent is required.");
    error.status = 400;
    throw error;
  }

  const current = await getProfile(DB, identity, env);

  const updated = {
    displayName: clean(body.displayName, 120) || current.displayName || identity.verifiedName || identity.email,
    contactEmail: clean(body.contactEmail, 180) || current.contactEmail || identity.email,
    phone: clean(body.phone, 80),
    communicationPreference: clean(body.communicationPreference, 80) || "Email",
    supportNotes: clean(body.supportNotes, 1000)
  };

  await DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      verified_name = excluded.verified_name,
      display_name = excluded.display_name,
      contact_email = excluded.contact_email,
      phone = excluded.phone,
      communication_preference = excluded.communication_preference,
      support_notes = excluded.support_notes,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    identity.email,
    identity.verifiedName,
    updated.displayName,
    updated.contactEmail,
    updated.phone,
    updated.communicationPreference,
    updated.supportNotes
  ).run();

  await storeConsent(DB, {
    email: identity.email,
    source: "account-profile",
    termsAccepted: Boolean(body.termsAccepted),
    privacyAccepted: Boolean(body.privacyAccepted),
    marketingConsent: Boolean(body.marketingConsent),
    ipHash: await hashValue(request.headers.get("cf-connecting-ip") || ""),
    userAgent: clean(request.headers.get("user-agent") || "", 500)
  });

  return getProfile(DB, identity, env);
}

async function storeConsent(DB, consent) {
  await ensureConsentTable(DB);

  const now = new Date().toISOString();
  await DB.prepare(`
    INSERT INTO consent_records (
      id, email, source, reference, terms_accepted, terms_version, terms_accepted_at,
      privacy_accepted, privacy_version, privacy_accepted_at, marketing_consent,
      marketing_consent_at, ip_hash, user_agent
    ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    consent.email,
    consent.source,
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

async function hashValue(value) {
  if (!value) return "";
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (!env.DB) {
    return json({ error: "Profile database binding DB is missing." }, 500);
  }

  const identity = getAccessIdentity(request);

  if (!identity.email) {
    return json({ error: "Not signed in." }, 401);
  }

  if (request.method === "GET") {
    const profile = await getProfile(env.DB, identity, env);
    if (!wantsJson(request)) {
      return redirect("/account/?signedin=1");
    }
    const consent = await getLatestConsent(env.DB, identity.email);
    return json({ profile, consent });
  }

  if (request.method === "POST") {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    try {
      const profile = await saveProfile(env.DB, identity, body, request, env);
      const consent = await getLatestConsent(env.DB, identity.email);
      return json({ profile, consent, saved: true });
    } catch (error) {
      return json({ error: error.message || "Profile could not be saved." }, error.status || 500);
    }
  }

  return json({ error: "Method not allowed." }, 405);
}
