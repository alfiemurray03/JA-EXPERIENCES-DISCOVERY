import {
  ensureEnquiryTables,
  isSameOriginRequest,
  normaliseEnquiry,
  recordEnquiryConsent,
  sendNewEnquiryNotifications,
  storeEnquiry,
  turnstileConfig,
  validateEnquiry,
  verifyTurnstile
} from "../_shared/enquiries.js";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

async function storedTurnstileSiteKey(env) {
  if (!env.DB) return "";
  try {
    const row = await env.DB.prepare(`SELECT value FROM site_settings WHERE key = 'turnstile_site_key' LIMIT 1`).first();
    return String(row?.value || "");
  } catch {
    return "";
  }
}

async function freePlanIsHidden(env, enquiry) {
  if (!env.DB || enquiry.formType !== "Free Discovery Enquiry") return false;
  try {
    const plan = await env.DB.prepare(`
      SELECT is_active FROM service_plans
      WHERE lower(plan_type) = 'free' OR price_pence = 0 OR lower(plan_name) LIKE '%free discovery enquiry%'
      ORDER BY sort_order ASC, plan_name ASC LIMIT 1
    `).first();
    return Number(plan?.is_active || 0) !== 1;
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...JSON_HEADERS, Allow: "GET, POST, OPTIONS" } });
  }

  if (request.method === "GET") {
    const config = turnstileConfig(request, env, await storedTurnstileSiteKey(env));
    return json({
      ok: true,
      turnstile: {
        enabled: config.enabled,
        available: config.available,
        siteKey: config.siteKey
      }
    });
  }

  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed." }, 405, { Allow: "GET, POST, OPTIONS" });
  if (!isSameOriginRequest(request)) return json({ ok: false, message: "This submission could not be verified. Refresh the page and try again." }, 403);
  if (!env.DB) return json({ ok: false, message: "Online enquiries are temporarily unavailable. Please try again later." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Please check the form and try again." }, 400);
  }

  const enquiry = normaliseEnquiry(body);
  if (enquiry.website) return json({ ok: true, reference: "ENQ-RECEIVED" });

  const errors = validateEnquiry(enquiry);
  if (errors.length) return json({ ok: false, message: errors[0], errors }, 400);
  if (await freePlanIsHidden(env, enquiry)) return json({ ok: false, message: "The Free Discovery Enquiry is currently unavailable." }, 403);

  const turnstile = await verifyTurnstile(request, env, enquiry.turnstileToken, await storedTurnstileSiteKey(env));
  if (!turnstile.ok) {
    return json({
      ok: false,
      message: turnstile.unavailable
        ? "The security check is temporarily unavailable. Please try again later."
        : "The security check was not completed. Please try it again."
    }, turnstile.unavailable ? 503 : 400);
  }

  try {
    await ensureEnquiryTables(env.DB);
    const result = await storeEnquiry(env.DB, enquiry, request);
    if (!result.duplicate) {
      await recordEnquiryConsent(env.DB, enquiry, request, result.reference);
      const notificationWork = sendNewEnquiryNotifications(env.DB, env, result.reference).catch((error) => {
        console.error("New enquiry notification task failed", result.reference, String(error?.message || error).slice(0, 240));
      });
      if (typeof context.waitUntil === "function") context.waitUntil(notificationWork);
      else await notificationWork;
    }
    return json({
      ok: true,
      reference: result.reference,
      duplicate: result.duplicate,
      message: result.duplicate
        ? "This enquiry has already been received."
        : "Thank you. Your enquiry has been received."
    }, result.duplicate ? 200 : 201);
  } catch (error) {
    console.error("Enquiry submission failed", String(error?.message || error).slice(0, 240));
    const status = Number(error?.status || 500);
    return json({
      ok: false,
      message: status === 429 ? error.message : "We could not save your enquiry. Please try again later."
    }, status);
  }
}
