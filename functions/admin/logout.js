function clearAdminCookies() {
  return [
    "ja_admin_bypass=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  ];
}

function redirectResponse(location, cookies = []) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      ...cookies.reduce((headers, cookie, index) => {
        headers[index === 0 ? "Set-Cookie" : `Set-Cookie-${index}`] = cookie;
        return headers;
      }, {})
    }
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
  const accessLogout = `/cdn-cgi/access/logout?redirect_url=${encodeURIComponent(signedOut)}`;

  if (url.searchParams.get("complete") === "1") {
    return htmlResponse(`<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Signed Out | JA Experiences &amp; Discovery</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/ja-travel-rebuild.css?v=20260621-1">
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f7f9; color: #111827; font-family: Inter, system-ui, sans-serif; }
    main { width: min(560px, calc(100% - 2rem)); background: #fff; border: 1px solid #e2e6eb; border-radius: 16px; padding: clamp(1.5rem, 5vw, 3rem); box-shadow: 0 18px 50px rgba(16, 24, 40, .08); text-align: centre; }
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; margin-top: 1.5rem; }
    a.button { display: inline-flex; align-items: center; justify-content: center; padding: .9rem 1.2rem; border-radius: 999px; text-decoration: none; background: #0f172a; color: #fff; font-weight: 700; }
    h1 { margin-top: 0; }
  </style>
</head>
<body>
  <main>
    <span class="eyebrow">Signed out</span>
    <h1>You have successfully signed out.</h1>
    <p>Your Cloudflare Access session and application session have been cleared. You can sign in again when ready.</p>
    <div class="actions">
      <a class="button" href="${signInAgain}">Sign In Again</a>
    </div>
  </main>
</body>
</html>`);
  }

  return redirectResponse(accessLogout, clearAdminCookies());
}
