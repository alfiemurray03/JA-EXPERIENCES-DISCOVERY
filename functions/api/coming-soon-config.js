const DEFAULT_CONFIG = {
  success: true,
  headline: "Coming Soon",
  subtext: "We are putting the finishing touches on something great.",
  launchDate: "2026-08-29T22:01:00+01:00",
  platformName: "JA Experiences & Discovery",
  description: "JA Experiences & Discovery is a self-service experience planning platform that helps you build, save and manage everyday, travel and support planning outputs.",
  features: [
    "Guided Experience Builders",
    "Builder Usage Tokens",
    "Saved Plans and outputs",
    "Destination discovery tools",
    "Accessibility and support planning",
    "Membership plans and add-ons"
  ]
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function readSiteSetting(env, key) {
  if (!env?.DB) return null;
  try {
    const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(key).first();
    return typeof row?.value === "string" && row.value.trim() ? row.value.trim() : null;
  } catch (error) {
    console.warn(JSON.stringify({
      message: "Coming soon setting lookup failed",
      key,
      error: error instanceof Error ? error.message : String(error)
    }));
    return null;
  }
}

function parseFeatures(value) {
  if (!value) return DEFAULT_CONFIG.features;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.map((item) => String(item || "").trim()).filter(Boolean);
      if (cleaned.length) return cleaned;
    }
  } catch (_) {
    const cleaned = value.split("\n").map((item) => item.trim()).filter(Boolean);
    if (cleaned.length) return cleaned;
  }
  return DEFAULT_CONFIG.features;
}

export async function onRequestGet({ env }) {
  const [headline, subtext, launchDate, description, features] = await Promise.all([
    readSiteSetting(env, "coming_soon_headline"),
    readSiteSetting(env, "coming_soon_subtext"),
    readSiteSetting(env, "coming_soon_launch_date"),
    readSiteSetting(env, "coming_soon_description"),
    readSiteSetting(env, "coming_soon_features")
  ]);

  return json({
    ...DEFAULT_CONFIG,
    headline: headline || DEFAULT_CONFIG.headline,
    subtext: subtext || DEFAULT_CONFIG.subtext,
    launchDate: launchDate || DEFAULT_CONFIG.launchDate,
    description: description || DEFAULT_CONFIG.description,
    features: parseFeatures(features)
  });
}
