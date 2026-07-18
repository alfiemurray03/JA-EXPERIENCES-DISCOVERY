import { getNativeSession, assertSameOrigin } from "../../../_shared/oidc.js";
import { accountPlanEntitlements, accountTypeFromProfile, enforceSharePermission } from "../../../_shared/account-entitlements.js";
import { normalisePlanCode } from "../../../_shared/subscription-entitlements.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

const PLAN_LABELS = Object.freeze({
  free: "No subscription",
  personal: "Explore Plan",
  standard: "Plan Plan",
  professional: "Complete Plan",
  org_starter: "Together Plan"
});

async function all(DB, sql, bindings = []) {
  const result = await DB.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function tableExists(DB, table) {
  const row = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").bind(table).first().catch(() => null);
  return Boolean(row?.name);
}

async function safeAlter(DB, sql) {
  try { await DB.prepare(sql).run(); } catch (error) {
    if (!String(error?.message || error).toLowerCase().includes("duplicate column")) throw error;
  }
}

async function prepareMonitoringSchema(DB) {
  await safeAlter(DB, "ALTER TABLE profiles ADD COLUMN account_type TEXT");
  await safeAlter(DB, "ALTER TABLE profiles ADD COLUMN account_type_selected_at TEXT");
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_output_access (
    id TEXT PRIMARY KEY,
    owner_email TEXT NOT NULL,
    output_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    permission TEXT NOT NULL DEFAULT 'view',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TEXT
  )`).run();
}

function activeSubscriptionMap(rows) {
  const map = new Map();
  for (const row of rows) {
    const email = String(row.customer_email || "").toLowerCase();
    if (!email || map.has(email)) continue;
    map.set(email, row);
  }
  return map;
}

function planForProfile(profile, subscriptions) {
  if (Number(profile.admin_lifetime || 0) === 1) {
    return normalisePlanCode(profile.admin_lifetime_plan_id) || "free";
  }
  const subscription = subscriptions.get(String(profile.email || "").toLowerCase());
  return normalisePlanCode(subscription?.plan_code || subscription?.plan_name) || "free";
}

function confirmedClassification(profile) {
  const explicit = String(profile.account_type || "").toLowerCase();
  return Boolean(profile.account_type_selected_at) && ["individual", "organisation"].includes(explicit);
}

function shareCountsByOwner(rows) {
  const map = new Map();
  for (const row of rows) {
    const email = String(row.owner_email || "").toLowerCase();
    if (!email) continue;
    const current = map.get(email) || { active: 0, view: 0, edit: 0, revoked: 0 };
    if (String(row.status || "active").toLowerCase() === "active") {
      current.active += 1;
      if (String(row.permission || "view").toLowerCase() === "edit") current.edit += 1;
      else current.view += 1;
    } else {
      current.revoked += 1;
    }
    map.set(email, current);
  }
  return map;
}

function invitationRow(row, ownerContext) {
  const requested = String(row.permission || "view").toLowerCase();
  const effective = enforceSharePermission(ownerContext.accountType, ownerContext.planCode, requested);
  return {
    id: row.id,
    owner: row.owner_email,
    recipient: row.recipient_email,
    itinerary: row.title || row.output_id,
    requested_permission: requested,
    effective_permission: effective,
    status: row.status || "active",
    created: row.created_at,
    last_updated: row.updated_at
  };
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: "Database binding is unavailable." }, 503);

  let identity;
  try {
    identity = await getNativeSession(request, env, "admin");
  } catch {
    return json({ success: false, error: "Admin authentication is temporarily unavailable." }, 503);
  }
  if (!identity) return json({ success: false, error: "Admin session expired. Please sign in again." }, 401);
  if (!assertSameOrigin(request)) return json({ success: false, error: "The request origin could not be verified." }, 403);
  if (request.method !== "GET") return json({ success: false, error: "Method not allowed." }, 405);

  try {
    await prepareMonitoringSchema(env.DB);

    const profiles = await all(env.DB, `SELECT email, COALESCE(display_name, verified_name, email) AS display_name,
      company, microsoft_company_name, account_type, account_type_selected_at, usage_type,
      admin_customer_status, admin_lifetime, admin_lifetime_plan_id, created_at, updated_at
      FROM profiles ORDER BY datetime(created_at) DESC`);

    const subscriptionRows = await all(env.DB, `SELECT customer_email, plan_code, plan_name, status,
      current_period_end, trial_end, updated_at FROM stripe_subscriptions
      WHERE lower(COALESCE(status,'')) IN ('active','trialing')
      AND (current_period_end IS NULL OR current_period_end='' OR datetime(current_period_end)>datetime('now'))
      ORDER BY datetime(COALESCE(current_period_end, trial_end, updated_at)) DESC`).catch(() => []);
    const subscriptions = activeSubscriptionMap(subscriptionRows);

    const shareTablePresent = await tableExists(env.DB, "builder_output_access");
    const shareRows = shareTablePresent ? await all(env.DB, `SELECT a.*, o.title FROM builder_output_access a
      LEFT JOIN builder_outputs o ON o.id=a.output_id ORDER BY datetime(a.created_at) DESC`).catch(() => []) : [];
    const sharesByOwner = shareCountsByOwner(shareRows);

    const workspaceRows = profiles.map((profile) => {
      const accountType = accountTypeFromProfile(profile);
      const planCode = planForProfile(profile, subscriptions);
      const entitlements = accountPlanEntitlements(accountType, planCode);
      const shares = sharesByOwner.get(String(profile.email || "").toLowerCase()) || { active: 0, view: 0, edit: 0, revoked: 0 };
      return {
        email: profile.email,
        name: profile.display_name,
        account_type: accountType,
        classification: confirmedClassification(profile) ? "Confirmed" : "Customer confirmation required",
        plan: PLAN_LABELS[planCode] || planCode,
        sharing_level: entitlements.maximumSharePermission === "edit" ? "View or edit" : entitlements.maximumSharePermission === "view" ? "Read-only" : "Private",
        member_workspace: entitlements.organisationMemberWorkspace ? "Enabled" : "Not included",
        active_invitations: shares.active,
        last_updated: profile.updated_at || profile.created_at,
        _context: { accountType, planCode, entitlements, shares }
      };
    });

    const publicWorkspaceRows = workspaceRows.map(({ _context, ...row }) => row);
    const organisationRows = workspaceRows
      .filter((row) => row._context.accountType === "organisation")
      .map(({ _context, ...row }) => row);

    const attentionRequired = [];
    for (const row of workspaceRows) {
      const { accountType, planCode, entitlements, shares } = row._context;
      if (row.classification !== "Confirmed") {
        attentionRequired.push({ email: row.email, issue: "Account type not confirmed", current_state: accountType, required_action: "Customer must explicitly choose Individual or Organisation." });
      }
      if (accountType === "individual" && shares.active > 0) {
        attentionRequired.push({ email: row.email, issue: "Individual account has active organisation invitations", current_state: `${shares.active} active`, required_action: "Review and revoke organisation sharing records." });
      }
      if (accountType === "organisation" && !entitlements.canShareItineraries && shares.active > 0) {
        attentionRequired.push({ email: row.email, issue: "Organisation sharing exceeds current plan", current_state: PLAN_LABELS[planCode] || planCode, required_action: "Invitations are unavailable until an eligible paid plan is active." });
      }
      if (!entitlements.canInviteEditors && shares.edit > 0) {
        attentionRequired.push({ email: row.email, issue: "Edit invitations exceed current entitlement", current_state: `${shares.edit} requested edit invitation(s)`, required_action: "Effective access is read-only; review or revoke stale edit records." });
      }
    }

    const contextsByEmail = new Map(workspaceRows.map((row) => [String(row.email || "").toLowerCase(), row._context]));
    const recentInvitations = shareRows.slice(0, 100).map((row) => invitationRow(row, contextsByEmail.get(String(row.owner_email || "").toLowerCase()) || {
      accountType: "individual", planCode: "free"
    }));

    const individuals = workspaceRows.filter((row) => row._context.accountType === "individual");
    const organisations = workspaceRows.filter((row) => row._context.accountType === "organisation");
    const readOnlyOrganisations = organisations.filter((row) => row._context.entitlements.maximumSharePermission === "view");
    const collaborativeOrganisations = organisations.filter((row) => row._context.entitlements.maximumSharePermission === "edit");

    return json({
      success: true,
      data: {
        total_accounts: profiles.length,
        individual_accounts: individuals.length,
        organisation_accounts: organisations.length,
        classification_required: workspaceRows.filter((row) => row.classification !== "Confirmed").length,
        read_only_organisation_workspaces: readOnlyOrganisations.length,
        collaborative_together_workspaces: collaborativeOrganisations.length,
        active_itinerary_invitations: shareRows.filter((row) => String(row.status || "active").toLowerCase() === "active").length,
        permission_issues_requiring_attention: attentionRequired.length,
        organisation_workspaces: organisationRows,
        account_workspace_register: publicWorkspaceRows,
        permission_attention: attentionRequired,
        plan_entitlement_matrix: [
          { account_type: "Individual", plan: "Explore / Plan / Complete / Together", own_workspace: "Private", itinerary_invitations: "Not available", invited_editing: "Not available", member_workspace: "Not available" },
          { account_type: "Organisation", plan: "Explore Plan", own_workspace: "Separate organisation workspace", itinerary_invitations: "Read-only", invited_editing: "No", member_workspace: "No" },
          { account_type: "Organisation", plan: "Plan Plan", own_workspace: "Separate organisation workspace", itinerary_invitations: "Read-only", invited_editing: "No", member_workspace: "No" },
          { account_type: "Organisation", plan: "Complete Plan", own_workspace: "Separate organisation workspace", itinerary_invitations: "Read-only", invited_editing: "No", member_workspace: "No" },
          { account_type: "Organisation", plan: "Together Plan", own_workspace: "Separate organisation workspace", itinerary_invitations: "Read-only or edit", invited_editing: "Yes", member_workspace: "Enabled" }
        ],
        recent_itinerary_invitations: recentInvitations
      }
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_workspace_monitor_failed", message: error instanceof Error ? error.message : String(error) }));
    return json({ success: false, error: "Account and organisation monitoring could not be loaded." }, 500);
  }
}
