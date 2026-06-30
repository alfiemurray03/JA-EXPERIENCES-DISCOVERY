import {
  createLogoutHandler,
  expireSessionCookie,
  revokeHashedSession
} from "../_shared/logout.js";

export const onRequestGet = createLogoutHandler({
  clearCookies: [expireSessionCookie("ja_admin_bypass")],
  revokeSession: (context) => revokeHashedSession(context, {
    cookieName: "ja_admin_bypass",
    table: "admin_bypass_sessions"
  })
});
