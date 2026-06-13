/**
 * GET /auth/admin/oidc/callback
 *
 * Handles the redirect back from Microsoft Entra ID (corporate tenant)
 * for the admin portal sign-in flow.
 *
 * Microsoft is the sole authority for admin access. There is no internal
 * allowlist — any account in the JA Group Services Ltd tenant that
 * Microsoft authenticates is granted access. Roles/permissions come from
 * Microsoft app roles or group claims in the token.
 *
 * Security checks (in order):
 *  1. Verify state + nonce from the signed httpOnly cookie (CSRF).
 *  2. Exchange the authorisation code for tokens server-side.
 *  3. Verify the `tid` claim === JA Group Services Ltd tenant ID.
 *     Tokens from any other tenant (personal accounts, External ID
 *     customers, other organisations) are rejected immediately.
 *  4. Extract email, display name, and app roles from the token.
 *  5. Create a ja_admin_session carrying the Microsoft identity.
 *  6. Redirect to /admin/dashboard.
 *
 * On any failure the user is redirected to /admin?error=<code>.
 *
 * Audit events logged:
 *   ms_login_success        — successful sign-in
 *   ms_login_failure        — token exchange or claim extraction failed
 *   ms_wrong_tenant         — tid mismatch
 *   ms_no_email             — no usable email in token
 */
import type { Request, Response } from 'express';
import { getAdminOidcClient, ADMIN_OIDC_TENANT_ID, getAdminOidcRedirectUri } from '../_client.js';
import { getSecret } from '#airo/secrets';
import { db } from '../../../../../db/client.js';
import { ja_admin_audit_log } from '../../../../../db/schema.js';
import { createAdminSession } from '../../_session-cookie.js';
import crypto from 'node:crypto';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sign(value: string): string {
  const secret = String(getSecret('OIDC_SESSION_SECRET') ?? 'admin-oidc-fallback');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function strClaim(claims: Record<string, unknown>, key: string): string | undefined {
  const v = claims[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function extractEmail(claims: Record<string, unknown>): string {
  return strClaim(claims, 'email')
      ?? strClaim(claims, 'preferred_username')
      ?? strClaim(claims, 'upn')
      ?? strClaim(claims, 'unique_name')
      ?? '';
}

/**
 * Extract app roles from the token.
 * Microsoft Entra ID places app roles in the `roles` claim as a string array.
 * Groups (if configured) appear in `groups`. We capture both.
 */
function extractRoles(claims: Record<string, unknown>): string[] {
  const roles: string[] = [];
  const r = claims['roles'];
  if (Array.isArray(r)) roles.push(...r.filter((x): x is string => typeof x === 'string'));
  const g = claims['groups'];
  if (Array.isArray(g)) roles.push(...g.filter((x): x is string => typeof x === 'string'));
  return [...new Set(roles)];
}

async function auditLog(
  email: string,
  success: boolean,
  ip: string,
  _eventType: string,
  _detail?: string
): Promise<void> {
  try {
    await db.insert(ja_admin_audit_log).values({ email, success, ip });
  } catch { /* best-effort — never crash the auth flow */ }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response) {
  const ip = req.ip ?? 'unknown';

  // ── 1. Recover and verify state + nonce from cookie ──────────────────────
  const rawCookie = req.cookies?.ja_admin_oidc_state as string | undefined;
  res.clearCookie('ja_admin_oidc_state', { path: '/' }); // one-time use

  if (!rawCookie) {
    console.warn('admin.oidc.callback: missing state cookie');
    return res.redirect('/admin?error=oidc_state_missing');
  }

  let storedState: string;
  let storedNonce: string;

  try {
    const [b64, sig] = rawCookie.split('.');
    const payload = Buffer.from(b64, 'base64').toString('utf8');
    if (sign(payload) !== sig) throw new Error('signature mismatch');
    const parsed = JSON.parse(payload) as { state: string; nonce: string };
    storedState = parsed.state;
    storedNonce = parsed.nonce;
  } catch {
    console.warn('admin.oidc.callback: invalid state cookie');
    return res.redirect('/admin?error=oidc_state_invalid');
  }

  // ── 2. Exchange authorisation code for tokens ─────────────────────────────
  try {
    const client      = await getAdminOidcClient();
    const redirectUri = getAdminOidcRedirectUri(req);

    const callbackParams = client.callbackParams(req);
    const tokenSet = await client.callback(redirectUri, callbackParams, {
      state: storedState,
      nonce: storedNonce,
    });

    const claims = tokenSet.claims() as Record<string, unknown>;

    console.info('admin.oidc.callback: token received', {
      claimKeys: Object.keys(claims),
      tid: claims.tid,
    });

    // ── 3. Tenant enforcement ─────────────────────────────────────────────
    //
    // CRITICAL: Only tokens from the JA Group Services Ltd tenant are accepted.
    // This rejects personal Microsoft accounts (no tid), External ID customer
    // accounts (different tid), and any other organisation.
    //
    const tid = strClaim(claims, 'tid');
    if (!tid || tid !== ADMIN_OIDC_TENANT_ID) {
      console.warn('admin.oidc.callback: tenant mismatch — access denied', {
        receivedTid: tid,
        expectedTid: ADMIN_OIDC_TENANT_ID,
      });
      await auditLog(`unknown (tid=${tid ?? 'none'})`, false, ip, 'ms_wrong_tenant',
        `Expected tid=${ADMIN_OIDC_TENANT_ID}, received tid=${tid ?? 'none'}`);
      return res.redirect('/admin?error=oidc_wrong_tenant');
    }

    // ── 4. Extract email ──────────────────────────────────────────────────
    let email = extractEmail(claims);

    // Fallback: call UserInfo endpoint
    if (!email || !email.includes('@')) {
      try {
        const userinfo = await client.userinfo(tokenSet) as Record<string, unknown>;
        email = extractEmail(userinfo);
        console.info('admin.oidc.callback: email from userinfo', { email });
      } catch (uiErr) {
        console.warn('admin.oidc.callback: userinfo fetch failed', uiErr);
      }
    }

    email = email.toLowerCase().trim();

    if (!email || !email.includes('@')) {
      console.warn('admin.oidc.callback: no usable email in token');
      await auditLog('unknown (no email)', false, ip, 'ms_no_email');
      return res.redirect('/admin?error=oidc_no_email');
    }

    // ── 5. Extract display name and app roles ─────────────────────────────
    const displayName = strClaim(claims, 'name') ?? email;
    const roles       = extractRoles(claims);

    console.info('admin.oidc.callback: identity resolved', {
      email,
      displayName,
      roles,
      tid,
    });

    // ── 6. Create session with Microsoft identity ─────────────────────────
    await createAdminSession({ email, name: displayName, roles, tid }, res);

    await auditLog(email, true, ip, 'ms_login_success',
      `roles=${JSON.stringify(roles)}`);

    console.info('admin.oidc.callback: admin signed in', { email, displayName, roles });

    return res.redirect('/admin/dashboard');

  } catch (err) {
    console.error('admin.oidc.callback.error', err);
    await auditLog('unknown', false, ip, 'ms_login_failure', String(err));
    return res.redirect('/admin?error=oidc_callback_failed');
  }
}
