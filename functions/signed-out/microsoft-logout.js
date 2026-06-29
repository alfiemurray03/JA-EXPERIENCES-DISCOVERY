function buildMicrosoftLogoutUrl(origin, env = {}) {
  const redirectTarget = `${origin}/signed-out/`;
  const configured = String(env.MICROSOFT_LOGOUT_URL || "").trim();
  if (configured) {
    const url = new URL(configured);
    if (!url.searchParams.has("post_logout_redirect_uri")) {
      url.searchParams.set("post_logout_redirect_uri", redirectTarget);
    }
    return url.toString();
  }
  return `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(redirectTarget)}`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  return Response.redirect(buildMicrosoftLogoutUrl(url.origin, context.env), 302);
}
