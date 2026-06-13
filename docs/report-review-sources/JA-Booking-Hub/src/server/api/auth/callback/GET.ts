/**
 * GET /api/auth/callback
 * OAuth 2.0 authorization code → token exchange for the Business/Customer portal.
 */
import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';
import { BUSINESS_AUTH } from '../../../lib/auth-config-server';

export default async function handler(req: Request, res: Response) {
  const { code, error, error_description, state } = req.query as Record<string, string>;

  if (error) {
    console.error('auth.callback.error', { error, error_description });
    return res.redirect(
      `/login?error=${encodeURIComponent(error)}&desc=${encodeURIComponent(error_description ?? '')}`,
    );
  }

  if (!code) {
    return res.redirect('/login?error=missing_code');
  }

  try {
    const clientSecret = String(getSecret('CUSTOMER_ENTRA_CLIENT_SECRET') ?? '');
    // Must exactly match what is registered in Azure App Registration
    const redirectUri = 'https://jabooking.jagroupservices.co.uk/auth/callback';

    console.log('auth.callback.token_exchange', { redirectUri });

    const body = new URLSearchParams({
      client_id: BUSINESS_AUTH.clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: BUSINESS_AUTH.scopes.join(' '),
    });

    const tokenRes = await fetch(BUSINESS_AUTH.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokens = await tokenRes.json() as Record<string, unknown>;

    if (!tokenRes.ok || tokens.error) {
      console.error('auth.callback.token_error', tokens);
      return res.redirect(
        `/login?error=${encodeURIComponent(String(tokens.error ?? 'token_error'))}&desc=${encodeURIComponent(String(tokens.error_description ?? ''))}`,
      );
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = `HttpOnly; Path=/; SameSite=Lax${isProd ? '; Secure' : ''}`;
    const maxAge = Number(tokens.expires_in ?? 3600);

    res.setHeader('Set-Cookie', [
      `ja_access_token=${tokens.access_token}; ${cookieOpts}; Max-Age=${maxAge}`,
      `ja_id_token=${tokens.id_token}; ${cookieOpts}; Max-Age=${maxAge}`,
      ...(tokens.refresh_token
        ? [`ja_refresh_token=${tokens.refresh_token}; ${cookieOpts}; Max-Age=2592000`]
        : []),
    ]);

    const redirectTo = state ? decodeURIComponent(state) : '/dashboard';
    const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
    return res.redirect(safeRedirect);
  } catch (err) {
    console.error('auth.callback.exception', err);
    return res.redirect('/login?error=server_error');
  }
}
