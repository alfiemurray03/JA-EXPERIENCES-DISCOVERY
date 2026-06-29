function clearAdminCookies() {
  return [
    "ja_admin_bypass=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  ];
}

function redirectResponse(location, cookies = []) {
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store"
  });
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, {
    status: 302,
    headers
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const signedOut = `${url.origin}/signed-out/`;
  const accessLogout = `${url.origin}/cdn-cgi/access/logout?redirect_url=${encodeURIComponent(signedOut)}`;
  return redirectResponse(accessLogout, clearAdminCookies());
}
