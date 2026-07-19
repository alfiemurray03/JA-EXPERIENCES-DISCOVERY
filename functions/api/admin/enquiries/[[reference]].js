import { assertSameOrigin, getNativeSession } from "../../../_shared/oidc.js";
import { getEnquiryThread, listAdminEnquiries, updateEnquiryAsAdmin } from "../../../_shared/enquiries.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function referenceOf(context) {
  const raw = Array.isArray(context.params?.reference) ? context.params.reference.join("/") : String(context.params?.reference || "");
  return raw.split("/").filter(Boolean).map(decodeURIComponent)[0] || "";
}

function configuredAdmins(env) {
  return String(env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk")
    .split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

async function authorised(DB, identity, env) {
  if (configuredAdmins(env).includes(String(identity.email || "").toLowerCase())) return true;
  const row = await DB.prepare("SELECT status FROM admin_users WHERE lower(email)=lower(?)").bind(identity.email).first().catch(() => null);
  return Boolean(row) && !["blocked", "closed", "disabled", "inactive", "suspended"].includes(String(row.status || "active").toLowerCase());
}

export async function onRequest(context) {
  if (!context.env.DB) return json({ success: false, error: "Database binding is unavailable." }, 503);
  const identity = await getNativeSession(context.request, context.env, "admin").catch(() => null);
  if (!identity) return json({ success: false, error: "Admin session expired. Please sign in again." }, 401);
  if (!(await authorised(context.env.DB, identity, context.env))) return json({ success: false, error: "This account is not authorised for the Admin Portal." }, 403);

  const reference = referenceOf(context);
  if (context.request.method === "GET") {
    if (reference) {
      const thread = await getEnquiryThread(context.env.DB, reference, true);
      return thread ? json({ success: true, thread }) : json({ success: false, error: "Enquiry not found." }, 404);
    }
    const url = new URL(context.request.url);
    const filters = Object.fromEntries(url.searchParams.entries());
    return json({ success: true, enquiries: await listAdminEnquiries(context.env.DB, filters) });
  }

  if (context.request.method === "POST") {
    if (!assertSameOrigin(context.request)) return json({ success: false, error: "The request origin could not be verified." }, 403);
    if (!reference) return json({ success: false, error: "Enquiry reference is required." }, 400);
    const body = await context.request.json().catch(() => ({}));
    const thread = await updateEnquiryAsAdmin(context.env.DB, context.env, { ...body, reference }, identity);
    return json({ success: true, thread });
  }

  return json({ success: false, error: "Method not allowed." }, 405);
}
