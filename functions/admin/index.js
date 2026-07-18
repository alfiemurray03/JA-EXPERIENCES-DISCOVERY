export async function onRequest(context) {
  const url = new URL(context.request.url);
  const section = String(url.searchParams.get("section") || "").trim().toLowerCase();

  if (section === "enquiries") {
    const destination = new URL("/admin/enquiries", url.origin);
    const reference = String(url.searchParams.get("reference") || "").trim();
    if (reference) destination.searchParams.set("reference", reference);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${destination.pathname}${destination.search}`,
        "Cache-Control": "no-store"
      }
    });
  }

  return context.next();
}
