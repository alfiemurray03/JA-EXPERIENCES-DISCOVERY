import { readPublicFeatureConfig } from "../../_shared/feature-flags.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

export async function onRequestGet({ env }) {
  const config = await readPublicFeatureConfig(env?.DB);
  return json({ success: true, config });
}

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return json({ success: false, error: "Method not allowed." }, 405);
  }
  return onRequestGet(context);
}
