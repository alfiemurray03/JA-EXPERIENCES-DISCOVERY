import {
  createLogoutHandler,
  expireSessionCookie,
  revokeHashedSession
} from "../_shared/logout.js";

export const onRequestGet = createLogoutHandler({
  title: "Signing out of your customer account…",
  message: "Please wait while we end your JA Experiences customer session.",
  clearCookies: [expireSessionCookie("ja_customer_session")],
  revokeSession: (context) => revokeHashedSession(context, {
    cookieName: "ja_customer_session",
    table: "customer_sessions"
  })
});
