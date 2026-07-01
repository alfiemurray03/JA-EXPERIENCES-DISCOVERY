import {
  addCustomerReply,
  getAccessIdentity,
  getCustomerEnquiry,
  isSameOriginRequest,
  listCustomerEnquiries
} from "../_shared/enquiries.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ ok: false, message: "My Enquiries is temporarily unavailable." }, 503);
  const identity = getAccessIdentity(request);
  if (!identity.email) return json({ ok: false, message: "Authentication is required." }, 401);

  try {
    if (request.method === "GET") {
      const reference = new URL(request.url).searchParams.get("reference") || "";
      if (reference) {
        const thread = await getCustomerEnquiry(env.DB, reference, identity.email);
        return thread ? json({ ok: true, thread }) : json({ ok: false, message: "Enquiry not found." }, 404);
      }
      return json({ ok: true, enquiries: await listCustomerEnquiries(env.DB, identity.email), customer: { email: identity.email, name: identity.name } });
    }

    if (request.method === "POST") {
      if (!isSameOriginRequest(request)) return json({ ok: false, message: "This request could not be verified." }, 403);
      const body = await request.json().catch(() => ({}));
      const thread = await addCustomerReply(env.DB, env, body.reference, identity.email, body.message);
      return json({ ok: true, thread });
    }
    return json({ ok: false, message: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Customer enquiry request failed", String(error?.message || error).slice(0, 240));
    return json({ ok: false, message: Number(error?.status) < 500 ? error.message : "The request could not be completed." }, Number(error?.status || 500));
  }
}
