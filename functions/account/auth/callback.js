import { completeLogin } from "../../_shared/oidc.js";

export async function onRequestGet(context) {
  try {
    return await completeLogin(context, "customer");
  } catch (error) {
    console.error(JSON.stringify({ event: "customer_oidc_callback_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return new Response("Customer sign-in could not be completed. Please return to the login page and try again.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
