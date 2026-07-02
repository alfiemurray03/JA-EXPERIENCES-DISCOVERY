import { completeLogin } from "../../_shared/oidc.js";

export async function onRequestGet(context) {
  try {
    return await completeLogin(context, "customer");
  } catch (error) {
    const debugEnabled = String(context.env?.JA_DEBUG_AUTH_LOGGING || "").toLowerCase() === "true";
    if (debugEnabled) {
      const authStage = error instanceof Error && error.authStage ? error.authStage : {};
      return Response.json({
        error: "Customer sign-in could not be completed.",
        stage: authStage.stage || "unknown",
        sqlStatement: authStage.sqlStatement || null,
        requestId: authStage.requestId || null,
        message: error instanceof Error ? error.message : String(error || "Unknown error"),
        stack: error instanceof Error ? error.stack : null
      }, {
        status: 401,
        headers: { "Cache-Control": "no-store" }
      });
    }
    console.error(JSON.stringify({ event: "customer_oidc_callback_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return new Response("Customer sign-in could not be completed. Please return to the login page and try again.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
