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
  return {
    email: nativeEmail.trim().toLowerCase(),
    verifiedName: (request.headers.get("x-ja-auth-name") || nativeEmail).trim(),
    realm: (request.headers.get("x-ja-auth-realm") || "").trim(),
    subject: (request.headers.get("x-ja-auth-subject") || "").trim(),
    tenantId: (request.headers.get("x-ja-auth-tenant") || "").trim(),
    objectId: (request.headers.get("x-ja-auth-object-id") || "").trim(),
    givenName: (request.headers.get("x-ja-auth-given-name") || "").trim(),
    familyName: (request.headers.get("x-ja-auth-family-name") || "").trim(),
    preferredUsername: (request.headers.get("x-ja-auth-preferred-username") || "").trim(),
    locale: (request.headers.get("x-ja-auth-locale") || "").trim(),
    jobTitle: (request.headers.get("x-ja-auth-job-title") || "").trim(),
    department: (request.headers.get("x-ja-auth-department") || "").trim(),
    companyName: (request.headers.get("x-ja-auth-company-name") || "").trim(),
    mobilePhone: (request.headers.get("x-ja-auth-mobile-phone") || "").trim(),
    businessPhone: (request.headers.get("x-ja-auth-business-phone") || "").trim(),
    country: (request.headers.get("x-ja-auth-country") || "").trim(),
    preferredLanguage: (request.headers.get("x-ja-auth-preferred-language") || "").trim(),
    photoUrl: (request.headers.get("x-ja-auth-photo-url") || "").trim()
  };
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
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_object_id TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_tenant_id TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_display_name TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_given_name TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_family_name TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_email TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_preferred_username TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_locale TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_job_title TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_department TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_company_name TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_mobile_phone TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_business_phone TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_country TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_preferred_language TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_photo_url TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN microsoft_updated_at TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN stripe_customer_created_at TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN stripe_customer_synced_at TEXT`);
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
        "Source/provider: Microsoft Entra ID / JA customer CIAM"
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
  const existing = await DB.prepare(`
    SELECT * FROM profiles
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
      microsoftObjectId: existing.microsoft_object_id || identity.objectId || "",
      microsoftTenantId: existing.microsoft_tenant_id || identity.tenantId || "",
      microsoftDisplayName: existing.microsoft_display_name || existing.verified_name || identity.name || "",
      microsoftGivenName: existing.microsoft_given_name || identity.givenName || "",
      microsoftFamilyName: existing.microsoft_family_name || identity.familyName || "",
      microsoftEmail: existing.microsoft_email || identity.email || "",
      microsoftPreferredUsername: existing.microsoft_preferred_username || identity.preferredUsername || identity.email || "",
      microsoftLocale: existing.microsoft_locale || identity.locale || "",
      microsoftJobTitle: existing.microsoft_job_title || identity.jobTitle || "",
      microsoftDepartment: existing.microsoft_department || identity.department || "",
      microsoftCompanyName: existing.microsoft_company_name || identity.companyName || "",
      microsoftMobilePhone: existing.microsoft_mobile_phone || identity.mobilePhone || "",
      microsoftBusinessPhone: existing.microsoft_business_phone || identity.businessPhone || "",
      microsoftCountry: existing.microsoft_country || identity.country || "",
      microsoftPreferredLanguage: existing.microsoft_preferred_language || identity.preferredLanguage || "",
      microsoftPhotoUrl: existing.microsoft_photo_url || identity.photoUrl || "",
      country: existing.microsoft_country || identity.country || countryFromLocale(existing.microsoft_locale || identity.locale || ""),
      photoUrl: existing.microsoft_photo_url || identity.photoUrl || "",
      verificationStatus: existing.microsoft_email || existing.microsoft_object_id ? "Verified" : "Unverified",
      microsoftUpdatedAt: existing.microsoft_updated_at || "",
      stripeCustomerId: existing.stripe_customer_id || "",
      stripeCustomerCreatedAt: existing.stripe_customer_created_at || "",
      stripeCustomerSyncedAt: existing.stripe_customer_synced_at || "",
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
    microsoftObjectId: identity.objectId || "",
    microsoftTenantId: identity.tenantId || "",
    microsoftDisplayName: identity.name || identity.verifiedName || "",
    microsoftGivenName: identity.givenName || "",
    microsoftFamilyName: identity.familyName || "",
    microsoftEmail: identity.email || "",
    microsoftPreferredUsername: identity.preferredUsername || identity.email || "",
    microsoftLocale: identity.locale || "",
    microsoftJobTitle: identity.jobTitle || "",
    microsoftDepartment: identity.department || "",
    microsoftCompanyName: identity.companyName || "",
    microsoftMobilePhone: identity.mobilePhone || "",
    microsoftBusinessPhone: identity.businessPhone || "",
    microsoftCountry: identity.country || "",
    microsoftPreferredLanguage: identity.preferredLanguage || "",
    microsoftPhotoUrl: identity.photoUrl || "",
    country: identity.country || countryFromLocale(identity.locale || ""),
    photoUrl: identity.photoUrl || "",
    verificationStatus: identity.email ? "Verified" : "Unverified",
      microsoftUpdatedAt: "",
    stripeCustomerId: "",
    stripeCustomerCreatedAt: "",
    stripeCustomerSyncedAt: "",
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
      support_notes,
      microsoft_object_id,
      microsoft_tenant_id,
      microsoft_display_name,
      microsoft_given_name,
      microsoft_family_name,
      microsoft_email,
      microsoft_preferred_username,
      microsoft_locale,
      microsoft_job_title,
      microsoft_department,
      microsoft_company_name,
      microsoft_mobile_phone,
      microsoft_business_phone,
      microsoft_country,
      microsoft_preferred_language,
      microsoft_photo_url,
      microsoft_updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    nowProfile.email,
    nowProfile.verifiedName,
    nowProfile.displayName,
    nowProfile.contactEmail,
    nowProfile.phone,
    nowProfile.communicationPreference,
    nowProfile.supportNotes,
    identity.objectId || "",
    identity.tenantId || "",
    identity.name || identity.verifiedName || identity.email,
    identity.givenName || "",
    identity.familyName || "",
    identity.email || "",
    identity.preferredUsername || identity.email || "",
    identity.locale || "",
    identity.jobTitle || "",
    identity.department || "",
    identity.companyName || "",
    identity.mobilePhone || "",
    identity.businessPhone || "",
    identity.country || "",
    identity.preferredLanguage || "",
    identity.photoUrl || ""
  ).run();

  await notifyCustomerSignup(DB, env, identity, nowProfile).catch(() => {});

  await ensureStripeCustomer(DB, env, identity, nowProfile).catch(() => {});

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
  const locale = identity.locale || current.microsoftLocale || "";

  await DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      microsoft_object_id,
      microsoft_tenant_id,
      microsoft_display_name,
      microsoft_given_name,
      microsoft_family_name,
      microsoft_email,
      microsoft_preferred_username,
      microsoft_locale,
      microsoft_job_title,
      microsoft_department,
      microsoft_company_name,
      microsoft_mobile_phone,
      microsoft_business_phone,
      microsoft_country,
      microsoft_preferred_language,
      microsoft_photo_url,
      microsoft_updated_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      verified_name = excluded.verified_name,
      display_name = excluded.display_name,
      contact_email = excluded.contact_email,
      phone = excluded.phone,
      communication_preference = excluded.communication_preference,
      support_notes = excluded.support_notes,
      microsoft_object_id = COALESCE(profiles.microsoft_object_id, excluded.microsoft_object_id),
      microsoft_tenant_id = COALESCE(profiles.microsoft_tenant_id, excluded.microsoft_tenant_id),
      microsoft_display_name = COALESCE(profiles.microsoft_display_name, excluded.microsoft_display_name),
      microsoft_given_name = COALESCE(profiles.microsoft_given_name, excluded.microsoft_given_name),
      microsoft_family_name = COALESCE(profiles.microsoft_family_name, excluded.microsoft_family_name),
      microsoft_email = COALESCE(profiles.microsoft_email, excluded.microsoft_email),
      microsoft_preferred_username = COALESCE(profiles.microsoft_preferred_username, excluded.microsoft_preferred_username),
      microsoft_locale = COALESCE(profiles.microsoft_locale, excluded.microsoft_locale),
      microsoft_job_title = COALESCE(profiles.microsoft_job_title, excluded.microsoft_job_title),
      microsoft_department = COALESCE(profiles.microsoft_department, excluded.microsoft_department),
      microsoft_company_name = COALESCE(profiles.microsoft_company_name, excluded.microsoft_company_name),
      microsoft_mobile_phone = COALESCE(profiles.microsoft_mobile_phone, excluded.microsoft_mobile_phone),
      microsoft_business_phone = COALESCE(profiles.microsoft_business_phone, excluded.microsoft_business_phone),
      microsoft_country = COALESCE(profiles.microsoft_country, excluded.microsoft_country),
      microsoft_preferred_language = COALESCE(profiles.microsoft_preferred_language, excluded.microsoft_preferred_language),
      microsoft_photo_url = COALESCE(profiles.microsoft_photo_url, excluded.microsoft_photo_url),
      microsoft_updated_at = COALESCE(profiles.microsoft_updated_at, excluded.microsoft_updated_at),
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    identity.email,
    identity.verifiedName,
    updated.displayName,
    updated.contactEmail,
    updated.phone,
    updated.communicationPreference,
    updated.supportNotes,
    identity.objectId || "",
    identity.tenantId || "",
    identity.name || identity.verifiedName || identity.email,
    identity.givenName || "",
    identity.familyName || "",
    identity.email || "",
    identity.preferredUsername || identity.email || "",
    locale,
    identity.jobTitle || "",
    identity.department || "",
    identity.companyName || "",
    identity.mobilePhone || "",
    identity.businessPhone || "",
    identity.country || "",
    identity.preferredLanguage || "",
    identity.photoUrl || "",
    new Date().toISOString()
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

  await ensureStripeCustomer(DB, env, identity, current).catch(() => {});

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

function firstText(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function countryFromLocale(locale) {
  const value = String(locale || "").trim().toLowerCase();
  if (value === "en-gb" || value.endsWith("-gb")) return "United Kingdom";
  if (value === "en-us" || value.endsWith("-us")) return "United States";
  return "";
}

async function ensureStripeCustomer(DB, env, identity, profile) {
  if (!env.STRIPE_SECRET_KEY) return null;

  const current = await DB.prepare(`
    SELECT stripe_customer_id, stripe_customer_synced_at
    FROM profiles
    WHERE lower(email) = lower(?)
  `).bind(identity.email).first();

  if (current?.stripe_customer_id && current.stripe_customer_synced_at) {
    return current.stripe_customer_id;
  }

  const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      email: profile.contactEmail || identity.email,
      name: profile.displayName || profile.verifiedName || identity.verifiedName || identity.email,
      "metadata[service_line]": "JA Experiences & Discovery",
      "metadata[customer_email]": identity.email,
      "metadata[profile_email]": profile.contactEmail || identity.email
    }).toString()
  });

  const payload = await customerResponse.json().catch(() => ({}));
  if (!customerResponse.ok || !payload.id) {
    throw new Error(payload?.error?.message || "Stripe customer provisioning failed.");
  }

  await DB.prepare(`
    UPDATE profiles
    SET stripe_customer_id = ?,
      stripe_customer_created_at = COALESCE(stripe_customer_created_at, CURRENT_TIMESTAMP),
      stripe_customer_synced_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE lower(email) = lower(?)
  `).bind(payload.id, identity.email).run();

  return payload.id;
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
    await ensureStripeCustomer(env.DB, env, identity, profile).catch(() => {});
    if (!wantsJson(request)) {
      return fetch(new URL("/account/profile/index.html", request.url), {
        headers: request.headers
      });
    }
    const consent = await getLatestConsent(env.DB, identity.email);
    const refreshedProfile = await getProfile(env.DB, identity, env);
    return json({ profile: refreshedProfile, consent });
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
