import { getNativeSession } from "../../../_shared/oidc.js";

const DEFAULT_ADMIN_EMAIL = "alfieholywoodmurray@jagroupservices.co.uk";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function configuredAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  return String(raw)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function appRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "platform owner") return "PlatformOwner";
  if (normalized === "system administrator") return "SystemAdministrator";
  if (normalized === "administrator" || normalized === "admin") return "Admin";
  if (normalized === "support admin") return "SupportAdmin";
  return "";
}

export async function onRequestGet(context) {
  try {
    const identity = await getNativeSession(context.request, context.env, "admin");
    if (!identity) {
      return json({
        success: false,
        error: "Admin session expired. Please sign in again.",
        code: "SESSION_EXPIRED"
      }, 401);
    }

    const email = String(identity.email || "").trim().toLowerCase();
    const configured = configuredAdmins(context.env).includes(email);
    let admin = null;

    if (context.env.DB) {
      admin = await context.env.DB.prepare(`SELECT role, status FROM admin_users WHERE lower(email) = lower(?)`)
        .bind(email)
        .first()
        .catch(() => null);
    }

    const status = String(admin?.status || "Active").trim().toLowerCase();
    const disabled = ["blocked", "closed", "disabled", "inactive", "suspended"].includes(status);
    if (disabled || (!configured && !admin)) {
      return json({ success: false, error: "This account is not authorised for the admin portal." }, 403);
    }

    const role = appRole(admin?.role);
    const roles = role ? [role] : [];

    return json({
      success: true,
      admin: {
        email,
        name: identity.name || email,
        roles,
        tid: identity.tenantId || "",
        isSystemAdministrator: configured || roles.includes("PlatformOwner") || roles.includes("SystemAdministrator"),
        authMethod: "oidc",
        operator: "JA Group Services Ltd"
      }
    });
  } catch (error) {
    console.error(JSON.stringify({
      event: "admin_session_restore_failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }));
    return json({ success: false, error: "Authentication is temporarily unavailable." }, 503);
  }
}
