import { expireSessionCookie, revokeHashedSession } from "../_shared/logout.js";
import { nativeLogout } from "../_shared/oidc.js";

export async function onRequestGet(context) {
  await revokeHashedSession(context, { cookieName: "ja_admin_bypass", table: "admin_bypass_sessions" });
  return nativeLogout(context, "admin", [expireSessionCookie("ja_admin_bypass")]);
}
