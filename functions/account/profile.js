function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function getAccessIdentity(request) {
  const emailHeader =
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("CF-Access-Authenticated-User-Email") ||
    "";

  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    request.headers.get("CF-Access-Jwt-Assertion") ||
    "";

  const tokenIdentity = decodeJwtPayload(jwt);

  const email =
    emailHeader ||
    tokenIdentity.email ||
    tokenIdentity.user_email ||
    tokenIdentity.username ||
    "";

  const verifiedName =
    tokenIdentity.name ||
    tokenIdentity.common_name ||
    tokenIdentity.user_name ||
    tokenIdentity.preferred_username ||
    email ||
    "";

  return {
    email: String(email || "").trim().toLowerCase(),
    verifiedName: String(verifiedName || "").trim()
  };
}

function decodeJwtPayload(jwt) {
  try {
    if (!jwt || !jwt.includes(".")) return {};

    const payload = jwt.split(".")[1];
    const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised.padEnd(normalised.length + ((4 - normalised.length % 4) % 4), "=");
    const decoded = atob(padded);

    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

async function ensureProfileTable(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      verified_name TEXT,
      display_name TEXT,
      contact_email TEXT,
      phone TEXT,
      communication_preference TEXT,
      support_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function getProfile(DB, identity) {
  await ensureProfileTable(DB);

  const existing = await DB.prepare(`
    SELECT
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      created_at,
      updated_at
    FROM profiles
    WHERE email = ?
  `).bind(identity.email).first();

  if (existing) {
    return {
      email: existing.email,
      verifiedName: existing.verified_name || identity.verifiedName,
      displayName: existing.display_name || existing.verified_name || identity.verifiedName || identity.email,
      contactEmail: existing.contact_email || identity.email,
      phone: existing.phone || "",
      communicationPreference: existing.communication_preference || "Email",
      supportNotes: existing.support_notes || "",
      createdAt: existing.created_at,
      updatedAt: existing.updated_at
    };
  }

  const nowProfile = {
    email: identity.email,
    verifiedName: identity.verifiedName,
    displayName: identity.verifiedName || identity.email,
    contactEmail: identity.email,
    phone: "",
    communicationPreference: "Email",
    supportNotes: "",
    createdAt: null,
    updatedAt: null
  };

  await DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    nowProfile.email,
    nowProfile.verifiedName,
    nowProfile.displayName,
    nowProfile.contactEmail,
    nowProfile.phone,
    nowProfile.communicationPreference,
    nowProfile.supportNotes
  ).run();

  return getProfile(DB, identity);
}

async function saveProfile(DB, identity, body) {
  await ensureProfileTable(DB);

  const current = await getProfile(DB, identity);

  const updated = {
    displayName: clean(body.displayName, 120) || current.displayName || identity.verifiedName || identity.email,
    contactEmail: clean(body.contactEmail, 180) || current.contactEmail || identity.email,
    phone: clean(body.phone, 80),
    communicationPreference: clean(body.communicationPreference, 80) || "Email",
    supportNotes: clean(body.supportNotes, 1000)
  };

  await DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      verified_name = excluded.verified_name,
      display_name = excluded.display_name,
      contact_email = excluded.contact_email,
      phone = excluded.phone,
      communication_preference = excluded.communication_preference,
      support_notes = excluded.support_notes,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    identity.email,
    identity.verifiedName,
    updated.displayName,
    updated.contactEmail,
    updated.phone,
    updated.communicationPreference,
    updated.supportNotes
  ).run();

  return getProfile(DB, identity);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (!env.DB) {
    return json({ error: "Profile database binding DB is missing." }, 500);
  }

  const identity = getAccessIdentity(request);

  if (!identity.email) {
    return json({ error: "Not signed in." }, 401);
  }

  if (request.method === "GET") {
    const profile = await getProfile(env.DB, identity);
    return json({ profile });
  }

  if (request.method === "POST") {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const profile = await saveProfile(env.DB, identity, body);
    return json({ profile, saved: true });
  }

  return json({ error: "Method not allowed." }, 405);
}
