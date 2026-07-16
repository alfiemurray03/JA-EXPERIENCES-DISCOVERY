import { beginLogin } from "../_shared/oidc.js";

export async function onRequestGet(context) {
  try {
    // Always return administrators to a cache-busted dashboard document. This
    // prevents browsers that retained the retired standalone admin shell from
    // reopening it after Microsoft completes authentication.
    const url = new URL(context.request.url);
    const returnTo = url.searchParams.get("return_to") || "";
    if (!returnTo || returnTo === "/admin" || returnTo === "/admin/" || returnTo.startsWith("/admin/dashboard")) {
      url.searchParams.set("return_to", "/admin/dashboard/?portal=ja-plan-studio&release=20260716-profile-admin-v2");
    }
    const request = new Request(url.toString(), context.request);
    return await beginLogin({ ...context, request }, "admin");
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_oidc_login_start_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return new Response("Administrator authentication is temporarily unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
