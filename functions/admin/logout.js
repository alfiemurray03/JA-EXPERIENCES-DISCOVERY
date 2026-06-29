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

function htmlResponse(body) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const signInAgain = `${url.origin}/admin`;
  const signedOut = `${url.origin}/signed-out/`;
  const accessLogout = `${url.origin}/cdn-cgi/access/logout?redirect_url=${encodeURIComponent(signedOut)}`;
  return redirectResponse(accessLogout, clearAdminCookies());
}
