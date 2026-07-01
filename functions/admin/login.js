import { beginLogin } from "../_shared/oidc.js";

export async function onRequestGet(context) {
  try {
    return await beginLogin(context, "admin");
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_oidc_login_start_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return new Response("Administrator authentication is temporarily unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
