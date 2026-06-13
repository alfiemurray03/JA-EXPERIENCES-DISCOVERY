/**
 * GET /auth/admin/oidc/start
 *
 * Initiates the Microsoft Entra ID (corporate tenant) OIDC authorisation
 * code flow for the admin portal.
 *
 * This is entirely separate from the customer External ID flow.
 * It uses the JA Group Services Ltd corporate tenant and a dedicated
 * client registration.
 *
 * State + nonce are stored in a short-lived signed httpOnly cookie
 * (ja_admin_oidc_state) to prevent CSRF.
 */
import type { Request, Response } from 'express';
import { generators } from 'openid-client';
import { getAdminOidcClient, getAdminOidcRedirectUri } from '../_client.js';
import { getSecret } from '#airo/secrets';
import crypto from 'node:crypto';

function sign(value: string): string {
  // Reuse the existing OIDC session secret — it's just an HMAC key
  const secret = String(getSecret('OIDC_SESSION_SECRET') ?? 'admin-oidc-fallback');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export default async function handler(req: Request, res: Response) {
  try {
    const client = await getAdminOidcClient();
    const redirectUri = getAdminOidcRedirectUri(req);

    const state = generators.state();
    const nonce = generators.nonce();

    // Pack state + nonce into a signed, base64-encoded cookie (10 min TTL)
    const payload  = JSON.stringify({ state, nonce });
    const sig      = sign(payload);
    const cookieVal = `${Buffer.from(payload).toString('base64')}.${sig}`;

    res.cookie('ja_admin_oidc_state', cookieVal, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   10 * 60 * 1000, // 10 minutes
      path:     '/',
    });

    const authUrl = client.authorizationUrl({
      scope:         'openid profile email',
      state,
      nonce,
      response_type: 'code',
      redirect_uri:  redirectUri,
      prompt:        'select_account',
    });

    console.log('admin.oidc.start: redirecting to Microsoft sign-in');
    return res.redirect(authUrl);
  } catch (err) {
    console.error('admin.oidc.start.error', err);
    return res.redirect('/admin?error=oidc_unavailable');
  }
}
