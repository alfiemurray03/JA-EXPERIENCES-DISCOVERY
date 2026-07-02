import { beginLogin, nativeOidcEnabled } from "../_shared/oidc.js";

export async function onRequestGet(context) {
  if (!nativeOidcEnabled(context.env)) return new Response("Native authentication is not enabled.", { status: 404 });
  try {
    return await beginLogin(context, "customer");
  } catch (error) {
    console.error(JSON.stringify({ event: "customer_oidc_login_start_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return new Response("Customer authentication is temporarily unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
