import { nativeLogout } from "../_shared/oidc.js";

export async function onRequestGet(context) {
  return nativeLogout(context, "admin");
}
