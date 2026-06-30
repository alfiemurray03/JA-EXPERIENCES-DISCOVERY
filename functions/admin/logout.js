function clearAdminCookies() {
  return [
    "ja_admin_bypass=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  ];
}

function readAdminSessionToken(request) {
  const cookie = request.headers.get("Cookie") || "";
  const sessionCookie = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ja_admin_bypass="));
  return sessionCookie ? sessionCookie.slice(sessionCookie.indexOf("=") + 1) : "";
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function revokeAdminSession(request, env) {
  const token = readAdminSessionToken(request);
  if (!token || !env.DB) return;

  try {
    await env.DB.prepare(`
      UPDATE admin_bypass_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = ? AND revoked_at IS NULL
    `).bind(await sha256(token)).run();
  } catch {
    // The browser cookie is still removed below if the session store is unavailable.
  }
}

function logoutPage() {
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Signing out | JA Experiences</title>
</head>
<body>
  <main>
    <h1>Signing you out securely…</h1>
    <p id="logout-status" role="status" aria-live="polite">Ending your secure access session.</p>
    <button id="logout-retry" type="button" hidden>Try again</button>
  </main>
  <script src="/assets/js/admin-logout.js" defer></script>
</body>
</html>`;
}

export async function onRequestGet(context) {
  await revokeAdminSession(context.request, context.env);

  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Security-Policy": "default-src 'none'; connect-src 'self'; script-src 'self'; style-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff"
  });

  for (const cookie of clearAdminCookies()) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(logoutPage(), {
    status: 200,
    headers
  });
}
