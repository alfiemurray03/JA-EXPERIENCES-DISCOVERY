/**
 * Legacy admin-shell bridge.
 *
 * Older Cloudflare deployments served a standalone administration document at
 * /admin/dashboard/. Browsers that still have that document retained request
 * this script. Move those sessions onto a cache-busted URL so Cloudflare serves
 * the current Planyx React administration portal instead.
 */
export async function onRequest() {
  const source = `(() => {
    const current = new URL(window.location.href);
    if (!current.pathname.startsWith('/admin/dashboard')) return;
    if (current.searchParams.get('portal') === 'ja-plan-studio') return;
    current.pathname = '/admin/dashboard/';
    current.searchParams.set('portal', 'ja-plan-studio');
    current.searchParams.set('release', '20260716-exact-profile-layout');
    window.location.replace(current.toString());
  })();`;

  return new Response(source, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Clear-Site-Data': '"cache"',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
