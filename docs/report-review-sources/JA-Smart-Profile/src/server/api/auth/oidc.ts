/**
 * JA Smart Profile — Microsoft Entra OIDC authentication
 *
 * Two completely separate flows:
 *   Customer → JA Secure Access / Entra External ID (CIAM)
 *   Admin    → JA Group Services normal workforce tenant
 *
 * All redirect URIs: https://jasmartprofile.jagroupservices.co.uk
 * No linkhub.jagroupservices.co.uk references anywhere.
 */
import { type Request, type Response } from 'express';
import * as openidClient from 'openid-client';
import { getSecret } from '#airo/secrets';
import db from '../../db.js';
import { trackReferralSignup } from '../referral/index.js';
import { awardPoints, getOrCreateReferralCode } from '../../lib/points.js';

// ─── Constants ──────────────────────────────────────────────────────────────

const APP_BASE_URL = 'https://jasmartprofile.jagroupservices.co.uk';

// Customer — JA Secure Access / Entra External ID (CIAM)
// Use tenant-specific authority — /common is NOT supported by CIAM tenants
const CUSTOMER = {
  tenantId:    '643abcb7-2f0d-4e72-a193-47ff1a0e63e1',
  clientId:    'e2ca8d90-bb3e-4edb-8e91-ae86b19bebda',
  // Exact metadata URL from the CIAM tenant — discovery() fetches this directly
  metadataUrl: 'https://jagroupservicescustomerhub.ciamlogin.com/643abcb7-2f0d-4e72-a193-47ff1a0e63e1/v2.0/.well-known/openid-configuration',
  redirectUri: `${APP_BASE_URL}/auth/callback`,
  scope:       'openid profile email',
};

// Admin — JA Group Services normal workforce tenant
const ADMIN = {
  tenantId:    '53477196-db21-46d2-8123-00be3d6882da',
  clientId:    'e38d92f2-eb56-4473-ac55-1f08644da43c',
  metadataUrl: 'https://login.microsoftonline.com/53477196-db21-46d2-8123-00be3d6882da/v2.0/.well-known/openid-configuration',
  redirectUri: `${APP_BASE_URL}/admin/auth/callback`,
  scope:       'openid profile email',
  requiredRole: 'Administrator',
};

// ─── OIDC discovery cache (separate per flow, retries on failure) ────────────

let _customerCfg: openidClient.Configuration | null = null;
let _adminCfg:    openidClient.Configuration | null = null;

async function getCustomerCfg(): Promise<openidClient.Configuration> {
  if (_customerCfg) return _customerCfg;

  const secret = getSecret('OIDC_CLIENT_SECRET') as string | undefined;
  if (!secret) {
    console.error('[auth:customer] OIDC_CLIENT_SECRET secret is not set');
    throw new Error('OIDC_CLIENT_SECRET missing');
  }

  console.log('[auth:customer] Running OIDC discovery', {
    metadataUrl: CUSTOMER.metadataUrl,
    clientId: CUSTOMER.clientId.slice(0, 8) + '…',
    redirectUri: CUSTOMER.redirectUri,
  });

  // Pass the metadata URL directly so discovery() fetches the exact document
  _customerCfg = await openidClient.discovery(
    new URL(CUSTOMER.metadataUrl),
    CUSTOMER.clientId,
    secret,
  );

  console.log('[auth:customer] OIDC discovery OK');
  return _customerCfg;
}

async function getAdminCfg(): Promise<openidClient.Configuration> {
  if (_adminCfg) return _adminCfg;

  const secret = getSecret('ADMIN_OIDC_CLIENT_SECRET') as string | undefined;
  if (!secret) {
    console.error('[auth:admin] ADMIN_OIDC_CLIENT_SECRET secret is not set');
    throw new Error('ADMIN_OIDC_CLIENT_SECRET missing');
  }

  console.log('[auth:admin] Running OIDC discovery', {
    metadataUrl: ADMIN.metadataUrl,
    clientId: ADMIN.clientId.slice(0, 8) + '…',
    redirectUri: ADMIN.redirectUri,
  });

  _adminCfg = await openidClient.discovery(
    new URL(ADMIN.metadataUrl),
    ADMIN.clientId,
    secret,
  );

  console.log('[auth:admin] OIDC discovery OK — token_endpoint_auth_methods_supported:',
    (_adminCfg as any).serverMetadata?.token_endpoint_auth_methods_supported
  );
  return _adminCfg;
}

// Clear cache so next request retries discovery
function resetCustomerCfg() { _customerCfg = null; }
function resetAdminCfg()    { _adminCfg    = null; }

// ─── DB helpers ─────────────────────────────────────────────────────────────

type UserRow = { id: number; email: string; name: string; role: string; plan_id: number };

function getOrCreateUser(email: string, name: string, role: 'user' | 'admin'): UserRow {
  const existing = db.prepare(
    'SELECT id, email, name, role, plan_id FROM users WHERE email = ?'
  ).get(email.toLowerCase()) as UserRow | undefined;

  if (existing) {
    // Update name if we now have a better one
    if (name && name !== existing.name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, existing.id);
      existing.name = name;
    }
    return existing;
  }

  const freePlan = db.prepare('SELECT id FROM plans WHERE slug = ?').get('free') as { id: number } | undefined;
  const planId = freePlan?.id ?? 1;
  const result = db.prepare(
    'INSERT INTO users (email, name, role, plan_id) VALUES (?, ?, ?, ?)'
  ).run(email.toLowerCase(), name, role, planId);

  const newUserId = Number(result.lastInsertRowid);

  // Award signup points and create referral code for new OIDC users (non-fatal)
  try {
    awardPoints(newUserId, 'signup', 'Welcome bonus for creating an account');
    getOrCreateReferralCode(newUserId);
  } catch { /* non-fatal */ }

  return { id: newUserId, email: email.toLowerCase(), name, role, plan_id: planId };
}

// Look up user by OID (for CIAM users whose email may change between logins)
function getUserByOid(oid: string): UserRow | undefined {
  try {
    return db.prepare(
      'SELECT id, email, name, role, plan_id FROM users WHERE entra_oid = ?'
    ).get(oid) as UserRow | undefined;
  } catch {
    return undefined;
  }
}

// Upsert user by OID — update email/name if they've changed, store OID on new users too
function upsertUserByOid(oid: string, email: string, name: string): UserRow {
  const existing = getUserByOid(oid);
  if (existing) {
    const updates: string[] = [];
    const params: (string | number)[] = [];
    if (email && email !== existing.email) { updates.push('email = ?'); params.push(email.toLowerCase()); }
    if (name  && name  !== existing.name)  { updates.push('name = ?');  params.push(name); }
    if (updates.length) {
      params.push(existing.id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      if (email) existing.email = email.toLowerCase();
      if (name)  existing.name  = name;
    }
    return existing;
  }
  // New user — create and immediately stamp the OID
  const user = getOrCreateUser(email, name, 'user');
  try { db.prepare('UPDATE users SET entra_oid = ? WHERE id = ?').run(oid, user.id); } catch { /* ignore */ }
  return user;
}

// ─── Session save helper ─────────────────────────────────────────────────────

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// ─── Customer: /auth/login ───────────────────────────────────────────────────

export async function customerLoginStart(req: Request, res: Response) {
  console.log('[auth:customer] /auth/login hit');
  try {
    const cfg = await getCustomerCfg();

    const codeVerifier  = openidClient.randomPKCECodeVerifier();
    const codeChallenge = await openidClient.calculatePKCECodeChallenge(codeVerifier);
    const state         = openidClient.randomState();

    req.session.customerOidcState        = state;
    req.session.customerOidcCodeVerifier = codeVerifier;

    // Persist referral code from ?ref= so we can award points after signup
    const refCode = typeof req.query.ref === 'string' ? req.query.ref.trim().toUpperCase() : undefined;
    if (refCode && /^[A-F0-9]{8}$/.test(refCode)) {
      req.session.pendingReferralCode = refCode;
    }

    await saveSession(req);

    const authUrl = openidClient.buildAuthorizationUrl(cfg, {
      redirect_uri:          CUSTOMER.redirectUri,
      scope:                 CUSTOMER.scope,
      state,
      code_challenge:        codeChallenge,
      code_challenge_method: 'S256',
      // Always show the login prompt — prevents Entra silently re-authenticating
      // a user who just logged out but still has an active Entra SSO cookie.
      prompt: 'login',
    });

    console.log('[auth:customer] PKCE state saved, redirecting to Entra External ID', {
      redirectUri: CUSTOMER.redirectUri,
    });
    res.redirect(authUrl.href);
  } catch (err) {
    resetCustomerCfg();
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth:customer] Login start failed:', msg);
    res.redirect('/login?error=oidc_init_failed');
  }
}

// ─── Customer: /auth/callback ────────────────────────────────────────────────

export async function customerLoginCallback(req: Request, res: Response) {
  console.log('[auth:customer] /auth/callback hit — code present:', !!req.query.code);
  try {
    const cfg = await getCustomerCfg();

    const callbackUrl = new URL(
      req.url,
      `${req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`
    );

    console.log('[auth:customer] Callback URL reconstructed:', callbackUrl.href);
    console.log('[auth:customer] State in session:', !!req.session.customerOidcState);
    console.log('[auth:customer] Verifier in session:', !!req.session.customerOidcCodeVerifier);

    if (req.query.error) {
      console.error('[auth:customer] Microsoft returned OAuth error:', req.query.error, req.query.error_description);
      return res.redirect(`/login?error=${req.query.error}`);
    }

    const tokens = await openidClient.authorizationCodeGrant(cfg, callbackUrl, {
      pkceCodeVerifier: req.session.customerOidcCodeVerifier!,
      expectedState:    req.session.customerOidcState!,
    });

    console.log('[auth:customer] Token exchange succeeded');

    const claims = tokens.claims();
    console.log('[auth:customer] Token claims keys:', Object.keys(claims ?? {}));

    // Try userinfo endpoint first — CIAM often puts email there but not in the ID token
    let userinfoEmail = '';
    let userinfoName  = '';
    try {
      const userinfo = await openidClient.fetchUserInfo(cfg, tokens.access_token!, claims?.sub as string);
      console.log('[auth:customer] Userinfo keys:', Object.keys(userinfo ?? {}));
      userinfoEmail = (userinfo?.email as string) || '';
      userinfoName  = (userinfo?.name  as string)
                   || `${userinfo?.given_name ?? ''} ${userinfo?.family_name ?? ''}`.trim()
                   || '';
    } catch (uiErr) {
      console.warn('[auth:customer] Userinfo fetch failed (non-fatal):', uiErr instanceof Error ? uiErr.message : String(uiErr));
    }

    // CIAM tokens may not include `email` — fall back chain:
    // 1. userinfo.email  2. id_token email  3. preferred_username  4. oid-based synthetic
    const oid   = (claims?.oid               as string) || '';
    const email = userinfoEmail
               || (claims?.email             as string)
               || (claims?.preferred_username as string)
               || (oid ? `${oid}@jasmartprofile.local` : '');
    const name  = userinfoName
               || (claims?.name              as string)
               || `${claims?.given_name ?? ''} ${claims?.family_name ?? ''}`.trim()
               || email.split('@')[0];

    if (!email) {
      console.warn('[auth:customer] Cannot derive identity — claims:', Object.keys(claims ?? {}));
      return res.redirect('/login?error=no_email');
    }

    console.log('[auth:customer] Identity resolved — email:', email, 'name:', name, 'oid:', oid);

    // Prefer OID-based lookup so the same user is found even if their email changes
    const isNewUser = !db.prepare('SELECT id FROM users WHERE entra_oid = ? OR email = ?').get(oid, email.toLowerCase());
    const user = oid ? upsertUserByOid(oid, email, name) : getOrCreateUser(email, name, 'user');

    // Award referral points if this is a brand-new signup with a pending ref code
    if (isNewUser && req.session.pendingReferralCode) {
      trackReferralSignup(user.id, req.session.pendingReferralCode);
    }

    req.session.userId   = user.id;
    req.session.userRole = user.role;
    req.session.customerIdToken = tokens.id_token ?? undefined;
    delete req.session.customerOidcState;
    delete req.session.customerOidcCodeVerifier;
    delete req.session.pendingReferralCode;

    await saveSession(req);

    // Audit login
    try {
      const { writeAudit } = await import('../../lib/audit.js');
      writeAudit({ actorId: user.id, actorName: name, actorEmail: email, actorType: 'user', action: isNewUser ? 'register' : 'login', resourceType: 'auth', details: isNewUser ? 'New user registration via OIDC' : 'User login via OIDC', ipAddress: req.ip, userAgent: req.headers['user-agent'] ?? null });
    } catch { /* non-fatal */ }

    // Notify admin of new signup
    if (isNewUser) {
      try {
        const { notifyNewSignup } = await import('../../lib/notifications.js');
        notifyNewSignup({ userName: name, userEmail: email, userId: user.id, isReferral: !!req.session.pendingReferralCode, referralCode: req.session.pendingReferralCode });
      } catch { /* non-fatal */ }
    }

    console.log('[auth:customer] Session created for user', user.id, '— redirecting to /dashboard/overview');
    res.redirect('/dashboard/overview');
  } catch (err) {
    resetCustomerCfg();
    if (err instanceof Error) {
      console.error('[auth:customer] Callback failed:', err.message);
      const cause = (err as any).cause;
      if (cause) console.error('[auth:customer] Error cause:', JSON.stringify(cause, null, 2));
    } else {
      console.error('[auth:customer] Callback failed (non-Error):', String(err));
    }
    res.redirect('/login?error=oidc_callback_failed');
  }
}

// ─── Customer: /auth/logout ──────────────────────────────────────────────────

export function customerLogout(req: Request, res: Response) {
  console.log('[auth:customer] /auth/logout hit');

  // Grab the id_token_hint before we destroy the session (needed for Entra logout)
  const idTokenHint = req.session.customerIdToken ?? null;

  req.session.destroy((err) => {
    if (err) console.error('[auth:customer] session destroy error', err);
    res.clearCookie('ja_smart_profile_session', { path: '/' });

    // Build Entra External ID end_session URL so Microsoft clears its SSO cookie too.
    // post_logout_redirect_uri MUST be registered in the Azure app registration.
    const postLogoutUri = `${APP_BASE_URL}/logged-out`;
    const endSessionBase = `https://jagroupservicescustomerhub.ciamlogin.com/${CUSTOMER.tenantId}/oauth2/v2.0/logout`;
    const params = new URLSearchParams({ post_logout_redirect_uri: postLogoutUri });
    if (idTokenHint) params.set('id_token_hint', idTokenHint);

    const logoutUrl = `${endSessionBase}?${params.toString()}`;
    console.log('[auth:customer] Redirecting to Entra end_session:', logoutUrl);
    res.redirect(logoutUrl);
  });
}

// ─── Admin: /admin/login ─────────────────────────────────────────────────────

export async function adminLoginStart(req: Request, res: Response) {
  console.log('[auth:admin] /admin/login hit');
  try {
    const cfg = await getAdminCfg();

    const codeVerifier  = openidClient.randomPKCECodeVerifier();
    const codeChallenge = await openidClient.calculatePKCECodeChallenge(codeVerifier);
    const state         = openidClient.randomState();

    req.session.adminOidcState        = state;
    req.session.adminOidcCodeVerifier = codeVerifier;

    await saveSession(req);

    const authUrl = openidClient.buildAuthorizationUrl(cfg, {
      redirect_uri:          ADMIN.redirectUri,
      scope:                 ADMIN.scope,
      state,
      code_challenge:        codeChallenge,
      code_challenge_method: 'S256',
    });

    console.log('[auth:admin] PKCE state saved, redirecting to JA Group Services tenant', {
      redirectUri: ADMIN.redirectUri,
    });
    res.redirect(authUrl.href);
  } catch (err) {
    resetAdminCfg();
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth:admin] Login start failed:', msg);
    res.redirect('/admin/login?error=oidc_init_failed');
  }
}

// ─── Admin: /admin/auth/callback ─────────────────────────────────────────────

export async function adminLoginCallback(req: Request, res: Response) {
  console.log('[auth:admin] /admin/auth/callback hit — code present:', !!req.query.code);
  console.log('[auth:admin] Query params:', JSON.stringify(req.query));
  try {
    const cfg = await getAdminCfg();

    const callbackUrl = new URL(
      req.url,
      `${req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`
    );

    console.log('[auth:admin] Callback URL reconstructed:', callbackUrl.href);
    console.log('[auth:admin] State in session:', req.session.adminOidcState);
    console.log('[auth:admin] Verifier in session:', !!req.session.adminOidcCodeVerifier);

    // If Microsoft returned an error param, log it clearly before attempting token exchange
    if (req.query.error) {
      console.error('[auth:admin] Microsoft returned OAuth error:', req.query.error, req.query.error_description);
      return res.redirect(`/admin/login?error=${req.query.error}`);
    }

    const tokens = await openidClient.authorizationCodeGrant(cfg, callbackUrl, {
      pkceCodeVerifier: req.session.adminOidcCodeVerifier!,
      expectedState:    req.session.adminOidcState!,
    });

    console.log('[auth:admin] Token exchange succeeded');

    const claims = tokens.claims();
    console.log('[auth:admin] Token claims keys:', Object.keys(claims ?? {}));

    // Workforce tenant: email may be in `email` or `preferred_username` (UPN)
    const email  = (claims?.email as string) || (claims?.preferred_username as string) || '';
    const name   = (claims?.name  as string) || email.split('@')[0];
    const oid    = (claims?.oid   as string) || '';

    if (!email && !oid) {
      console.warn('[auth:admin] No email or oid in token claims');
      return res.redirect('/admin/login?error=no_email');
    }

    // Check Administrator app role — Microsoft puts app roles in `roles` claim
    const roles = (claims?.roles as string[]) || [];
    console.log('[auth:admin] Roles in token:', roles);
    const hasAdminRole = roles.includes(ADMIN.requiredRole);

    if (!hasAdminRole) {
      console.warn('[auth:admin] User', email, 'lacks Administrator role — roles:', roles);
      return res.redirect('/admin/login?error=access_denied');
    }

    const user = getOrCreateUser(email || `oid-${oid}`, name, 'admin');
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);

    req.session.adminUserId   = user.id;
    req.session.adminUserRole = 'admin';
    req.session.adminIdToken  = tokens.id_token ?? undefined;
    delete req.session.adminOidcState;
    delete req.session.adminOidcCodeVerifier;

    await saveSession(req);

    console.log('[auth:admin] Admin session created for user', user.id, '— redirecting to /admin');
    res.redirect('/admin');
  } catch (err: any) {
    resetAdminCfg();
    console.error('[auth:admin] Callback failed:', err?.message ?? String(err));
    // openid-client v6: error details live on various properties
    if (err?.error)             console.error('[auth:admin] OAuth error code:', err.error);
    if (err?.error_description) console.error('[auth:admin] OAuth error description:', err.error_description);
    if (err?.response)          console.error('[auth:admin] HTTP status:', err.response?.status);
    // Try to log the raw body if available
    try {
      const body = err?.cause ?? err?.body ?? err?.response?.body;
      if (body) console.error('[auth:admin] Error body:', typeof body === 'string' ? body : JSON.stringify(body));
    } catch {}
    // Log the full error object keys for diagnosis
    console.error('[auth:admin] Error keys:', Object.keys(err ?? {}));
    console.error('[auth:admin] Full error (stringified):', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    res.redirect('/admin/login?error=oidc_callback_failed');
  }
}

// ─── Admin: /admin/logout ────────────────────────────────────────────────────

export function adminLogout(req: Request, res: Response) {
  console.log('[auth:admin] /admin/logout hit');

  // Grab the id_token_hint before we destroy the session
  const idTokenHint = req.session.adminIdToken ?? null;

  req.session.destroy((err) => {
    if (err) console.error('[auth:admin] session destroy error', err);
    res.clearCookie('ja_smart_profile_session', { path: '/' });

    // Build Microsoft workforce tenant end_session URL so Microsoft clears its SSO cookie.
    // post_logout_redirect_uri MUST be registered in the Azure app registration.
    const postLogoutUri = `${APP_BASE_URL}/admin/logged-out`;
    const endSessionBase = `https://login.microsoftonline.com/${ADMIN.tenantId}/oauth2/v2.0/logout`;
    const params = new URLSearchParams({ post_logout_redirect_uri: postLogoutUri });
    if (idTokenHint) params.set('id_token_hint', idTokenHint);

    const logoutUrl = `${endSessionBase}?${params.toString()}`;
    console.log('[auth:admin] Redirecting to Microsoft end_session:', logoutUrl);
    res.redirect(logoutUrl);
  });
}
