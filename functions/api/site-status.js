export async function onRequestGet({ env }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ status: "maintenance" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
  try {
    const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'site_status'").first();
    const status = ["normal", "coming_soon", "maintenance"].includes(row?.value) ? row.value : "normal";
    return new Response(JSON.stringify({ status }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new Response(JSON.stringify({ status: "maintenance" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
