/**
 * GET /auth/oidc/start
 *
 * Initiates the Microsoft Entra External ID OIDC authorisation code flow.
 * Generates a cryptographically random state + nonce, stores them in a
 * short-lived signed cookie, then redirects the browser to the Entra
 * authorisation endpoint.
 *
 * This is a server-side confidential client — the client secret never
 * reaches the browser.
 */
import type { Request, Response } from 'express';
import { generators } from 'openid-client';
import { getOidcClient } from '../_client.js';
import { getSecret } from '#airo/secrets';
import crypto from 'node:crypto';

/** Sign a value with HMAC-SHA256 so we can verify it on callback. */
function sign(value: string): string {
  const secret = String(getSecret('OIDC_SESSION_SECRET') ?? 'fallback');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export default async function handler(req: Request, res: Response) {
  try {
    const client = await getOidcClient();

    const state = generators.state();
    const nonce = generators.nonce();

    // Store state + nonce in a short-lived httpOnly cookie (10 min)
    const payload = JSON.stringify({ state, nonce });
    const sig      = sign(payload);
    const cookieVal = `${Buffer.from(payload).toString('base64')}.${sig}`;

    res.cookie('ja_oidc_state', cookieVal, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   10 * 60 * 1000, // 10 minutes
      path:     '/',
    });

    const scope = String(getSecret('OIDC_SCOPE') ?? 'openid profile email');

    const authUrl = client.authorizationUrl({
      scope,
      state,
      nonce,
      response_type: 'code',
    });

    return res.redirect(authUrl);
  } catch (err) {
    console.error('oidc.start.error', err);
    return res.redirect('/login?error=oidc_unavailable');
  }
}
