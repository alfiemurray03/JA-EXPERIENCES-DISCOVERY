/**
 * GET /auth/callback
 *
 * Handles the redirect back from Microsoft Entra External ID.
 *
 * Full flow:
 *  1. Verify state + nonce from the signed httpOnly cookie (CSRF protection).
 *  2. Exchange the authorisation code for tokens server-side (confidential client).
 *  3. Extract all available identity claims from the ID token.
 *  4. Upsert the user in ja_users:
 *       a. Look up by oidc_sub (Entra object ID) — most reliable, never changes.
 *       b. Fall back to email match — links pre-existing accounts on first OIDC login.
 *       c. If no match — create a new user record automatically (no manual registration).
 *  5. Always update: displayName, firstName, lastName, tenantId, photoUrl, lastLogin, updatedAt.
 *  6. Create a ja_session cookie and redirect to /dashboard.
 *
 * On any failure the user is redirected to /sign-in?error=<code> so the branded
 * error page can display a human-readable message.
 *
 * Claims captured:
 *   sub          → oidcSub       (Entra object ID — permanent, unique per user per app)
 *   tid          → tenantId      (Entra tenant ID)
 *   email / upn  → email
 *   name         → displayName
 *   given_name   → firstName
 *   family_name  → lastName
 *   picture      → photoUrl      (not always present in Entra; stored if available)
 */
import type { Request, Response } from 'express';
import { getOidcClient } from '../_client.js';
import { getSecret } from '#airo/secrets';
import { db } from '../../../../db/client.js';
import { ja_users, ja_sessions } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import crypto from 'node:crypto';

// ── Helpers ────────────────────────────────────────────────────────────────────

function sign(value: string): string {
  const secret = String(getSecret('OIDC_SESSION_SECRET') ?? 'fallback');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function generateSessionToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/** Safely extract a string claim, returning undefined if absent or wrong type. */
function strClaim(claims: Record<string, unknown>, key: string): string | undefined {
  const v = claims[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response) {

  // ── 1. Recover and verify state + nonce from cookie ───────────────────────
  const rawCookie = req.cookies?.ja_oidc_state as string | undefined;
  res.clearCookie('ja_oidc_state', { path: '/' }); // one-time use — clear immediately

  if (!rawCookie) {
    console.warn('oidc.callback: missing state cookie');
    return res.redirect('/sign-in?error=oidc_state_missing');
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
    console.warn('oidc.callback: invalid state cookie');
    return res.redirect('/sign-in?error=oidc_state_invalid');
  }

  // ── 2. Exchange authorisation code for tokens ─────────────────────────────
  try {
    const client      = await getOidcClient();
    const redirectUri = String(getSecret('OIDC_REDIRECT_URI') ?? '');

    const callbackParams = client.callbackParams(req);
    const tokenSet = await client.callback(redirectUri, callbackParams, {
      state: storedState,
      nonce: storedNonce,
    });

    const claims = tokenSet.claims() as Record<string, unknown>;

    // ── 3. Extract identity claims ──────────────────────────────────────────
    //
    // Microsoft Entra ID token claims reference:
    //   sub          — object ID (unique per user per application registration)
    //   tid          — tenant ID
    //   email        — email address (may be absent; fall back to upn)
    //   preferred_username / upn — UPN, often the email
    //   name         — display name
    //   given_name   — first name
    //   family_name  — last name
    //   picture      — profile photo URL (not always present in Entra)
    //
    const sub      = claims.sub as string;
    const tenantId = strClaim(claims, 'tid');

    // ── Email extraction ────────────────────────────────────────────────────
    //
    // Entra External ID (CIAM) may place the email in different claims
    // depending on tenant config and whether optional claims are enabled.
    // Strategy:
    //   1. Try all known ID-token claim locations.
    //   2. If still empty, call the UserInfo endpoint — CIAM always returns
    //      email there when the `email` scope is granted.
    //   3. Normalise EXT-format UPNs (guest accounts).

    function extractEmailFromClaims(c: Record<string, unknown>): string {
      return strClaim(c, 'email')
          ?? strClaim(c, 'preferred_username')
          ?? strClaim(c, 'upn')
          ?? strClaim(c, 'unique_name')
          ?? strClaim(c, 'signInNames.emailAddress')
          ?? '';
    }

    function normaliseEmail(raw: string): string {
      const lower = raw.toLowerCase();
      // Guest UPN format: firstname_domain.com#EXT#@tenant.onmicrosoft.com
      const extMatch = lower.match(/^(.+)_([^_@]+\.[^_@]+)#ext#@/);
      if (extMatch) return `${extMatch[1]}@${extMatch[2]}`;
      return lower;
    }

    let rawEmail = extractEmailFromClaims(claims);

    // Log what the ID token contained so we can diagnose Entra config issues
    console.info('oidc.callback: id_token claims', {
      sub,
      claimKeys: Object.keys(claims),
      rawEmailFromIdToken: rawEmail,
    });

    // Fallback: call UserInfo endpoint — most reliable source for CIAM email
    if (!rawEmail || !rawEmail.includes('@')) {
      try {
        const userinfo = await client.userinfo(tokenSet) as Record<string, unknown>;
        console.info('oidc.callback: userinfo claims', {
          claimKeys: Object.keys(userinfo),
          rawEmailFromUserinfo: extractEmailFromClaims(userinfo),
        });
        rawEmail = extractEmailFromClaims(userinfo);
      } catch (uiErr) {
        console.warn('oidc.callback: userinfo fetch failed', uiErr);
      }
    }

    const email = normaliseEmail(rawEmail);

    if (!email || !email.includes('@')) {
      console.warn('oidc.callback: no usable email found in id_token or userinfo', { sub });
      return res.redirect('/sign-in?error=oidc_no_email');
    }

    const displayName = strClaim(claims, 'name') ?? '';
    const firstName   = strClaim(claims, 'given_name')
                     ?? (displayName.split(' ')[0] || 'User');
    const lastName    = strClaim(claims, 'family_name')
                     ?? (displayName.split(' ').slice(1).join(' ') || '');
    const photoUrl    = strClaim(claims, 'picture') ?? null;

    // ── 4. Upsert user ──────────────────────────────────────────────────────
    //
    // Priority:
    //   a. Match by oidc_sub  → existing OIDC user; update profile + lastLogin
    //   b. Match by email     → pre-existing account; link oidc_sub, update profile
    //   c. No match           → create new account automatically
    //
    const now = new Date();
    let userId: number;

    const [bySubRow] = await db
      .select({ id: ja_users.id, accountStatus: ja_users.accountStatus })
      .from(ja_users)
      .where(eq(ja_users.oidcSub, sub))
      .limit(1);

    if (bySubRow) {
      // ── (a) Known OIDC user — refresh profile ──────────────────────────
      userId = bySubRow.id;

      // Block suspended accounts before creating a session
      if (bySubRow.accountStatus === 'suspended') {
        console.warn('oidc.callback: suspended account attempted login', { sub, email });
        return res.redirect('/sign-in?error=account_suspended');
      }

      await db.update(ja_users)
        .set({
          displayName: displayName || undefined,
          firstName,
          lastName,
          tenantId:    tenantId ?? undefined,
          photoUrl,
          lastLogin:   now,
          updatedAt:   now,
          isVerified:  true,
        })
        .where(eq(ja_users.id, userId));

    } else {
      // ── (b) Check by email — link existing account ─────────────────────
      const [byEmailRow] = await db
        .select({ id: ja_users.id, passwordHash: ja_users.passwordHash, accountStatus: ja_users.accountStatus })
        .from(ja_users)
        .where(eq(ja_users.email, email))
        .limit(1);

      if (byEmailRow) {
        if (byEmailRow.accountStatus === 'suspended') {
          console.warn('oidc.callback: suspended account attempted login', { sub, email });
          return res.redirect('/sign-in?error=account_suspended');
        }

        userId = byEmailRow.id;
        const hadPassword = byEmailRow.passwordHash && byEmailRow.passwordHash.length > 0;

        await db.update(ja_users)
          .set({
            oidcSub:     sub,
            tenantId:    tenantId ?? undefined,
            displayName: displayName || undefined,
            firstName,
            lastName,
            photoUrl,
            authMethod:  hadPassword ? 'both' : 'oidc',
            isVerified:  true,
            lastLogin:   now,
            updatedAt:   now,
          })
          .where(eq(ja_users.id, userId));

      } else {
        // ── (c) New user — provision automatically ─────────────────────
        const uuid = crypto.randomUUID();
        const [inserted] = await db.insert(ja_users).values({
          uuid,
          email,
          displayName:   displayName || `${firstName} ${lastName}`.trim(),
          firstName,
          lastName:      lastName || '—',
          passwordHash:  '',          // OIDC-only; no local password
          oidcSub:       sub,
          tenantId:      tenantId ?? undefined,
          photoUrl,
          plan:          'free',
          role:          'user',
          accountStatus: 'active',
          authMethod:    'oidc',
          isVerified:    true,        // Entra has already verified the identity
          lastLogin:     now,
          updatedAt:     now,
        }).$returningId();
        userId = inserted.id;

        console.info('oidc.callback: new user provisioned', { uuid, email, sub });

        // ── Affiliate signup conversion attribution ─────────────────────
        // Read referral code from the ja_ref cookie (set by /api/affiliate/track)
        const refCode = (req.cookies?.ja_ref as string | undefined)?.toUpperCase().trim();
        if (refCode) {
          try {
            const affRows = await db.execute(sql`
              SELECT id, commission_rate FROM ja_affiliates
              WHERE referral_code = ${refCode} AND status = 'approved' LIMIT 1
            `);
            const aff = ((affRows as unknown as { rows?: unknown[] }).rows ?? [])[0] as
              { id: number; commission_rate: number } | undefined;
            if (aff) {
              await db.execute(sql`
                INSERT INTO ja_affiliate_conversions
                  (affiliate_id, user_id, type, plan, amount_gbp, commission_gbp, status, created_at, updated_at)
                VALUES
                  (${aff.id}, ${userId}, 'signup', 'free', 0, 0, 'pending', NOW(), NOW())
              `);
              console.info('oidc.callback: affiliate signup conversion recorded', { affiliateId: aff.id, userId });
            }
          } catch (affErr) {
            console.error('oidc.callback: affiliate conversion error (non-fatal)', affErr);
          }
        }
      }
    }

    // ── 5. Create session ───────────────────────────────────────────────────
    const sessionToken = generateSessionToken();
    const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(ja_sessions).values({ token: sessionToken, userId, expiresAt });

    res.cookie('ja_session', sessionToken, {
      httpOnly: true,
      secure:   false,   // works in both preview (http) and production (https)
      sameSite: 'lax',
      maxAge:   30 * 24 * 60 * 60 * 1000,
      path:     '/',
    });

    // ── 6. Redirect to dashboard ────────────────────────────────────────────
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('oidc.callback.error', err);
    return res.redirect('/sign-in?error=oidc_callback_failed');
  }
}
