import {
  createLogoutHandler,
  expireSessionCookie,
  revokeHashedSession
} from "../_shared/logout.js";
import { nativeLogout, nativeOidcEnabled } from "../_shared/oidc.js";

const accessLogout = createLogoutHandler({
  title: "Signing out of your customer account…",
  message: "Please wait while we end your JA Experiences customer session.",
  clearCookies: [expireSessionCookie("ja_customer_session")],
  revokeSession: (context) => revokeHashedSession(context, {
    cookieName: "ja_customer_session",
    table: "customer_sessions"
  })
});

export async function onRequestGet(context) {
  if (nativeOidcEnabled(context.env)) {
    await revokeHashedSession(context, { cookieName: "ja_customer_session", table: "customer_sessions" });
    return nativeLogout(context, "customer", [expireSessionCookie("ja_customer_session")]);
  }
  return accessLogout(context);
}
