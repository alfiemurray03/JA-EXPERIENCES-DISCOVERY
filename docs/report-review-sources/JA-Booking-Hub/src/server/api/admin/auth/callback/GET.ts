/**
 * GET /api/admin/auth/callback
 * OAuth 2.0 authorization code → token exchange for the Admin portal.
 */
import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';
import { ADMIN_AUTH } from '../../../../lib/auth-config-server';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function handler(req: Request, res: Response) {
  const { code, error, error_description } = req.query as Record<string, string>;

  if (error) {
    console.error('admin.auth.callback.error', { error, error_description });
    return res.redirect(
      `/admin/login?error=${encodeURIComponent(error)}&desc=${encodeURIComponent(error_description ?? '')}`,
    );
  }

  if (!code) {
    return res.redirect('/admin/login?error=missing_code');
  }

  try {
    const clientSecret = String(getSecret('ADMIN_ENTRA_CLIENT_SECRET') ?? '');
    // Must exactly match what is registered in Azure App Registration
    const redirectUri = 'https://jabooking.jagroupservices.co.uk/admin/auth/callback';

    const body = new URLSearchParams({
      client_id: ADMIN_AUTH.clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: ADMIN_AUTH.scopes.join(' '),
    });

    const tokenRes = await fetch(ADMIN_AUTH.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokens = await tokenRes.json() as Record<string, unknown>;

    if (!tokenRes.ok || tokens.error) {
      console.error('admin.auth.callback.token_error', tokens);
      return res.redirect(
        `/admin/login?error=${encodeURIComponent(String(tokens.error ?? 'token_error'))}&desc=${encodeURIComponent(String(tokens.error_description ?? ''))}`,
      );
    }

    // Validate admin role claim — skip in dev if no roles present
    const idPayload = parseJwtPayload(String(tokens.id_token ?? ''));
    const roles: string[] = Array.isArray(idPayload?.roles) ? idPayload.roles as string[] : [];
    const allowedRoles = [...ADMIN_AUTH.allowedRoles] as string[];
    const isProd = process.env.NODE_ENV === 'production';
    const hasAdminRole = roles.some((r) => allowedRoles.includes(r));

    if (isProd && !hasAdminRole) {
      console.warn('admin.auth.callback.unauthorized', { roles });
      return res.redirect('/admin/login?error=unauthorized&desc=Your+account+does+not+have+admin+access');
    }

    const cookieOpts = `HttpOnly; Path=/admin; SameSite=Strict${isProd ? '; Secure' : ''}`;
    const maxAge = Number(tokens.expires_in ?? 3600);

    res.setHeader('Set-Cookie', [
      `ja_admin_access_token=${tokens.access_token}; ${cookieOpts}; Max-Age=${maxAge}`,
      `ja_admin_id_token=${tokens.id_token}; ${cookieOpts}; Max-Age=${maxAge}`,
      ...(tokens.refresh_token
        ? [`ja_admin_refresh_token=${tokens.refresh_token}; ${cookieOpts}; Max-Age=28800`]
        : []),
    ]);

    return res.redirect('/admin');
  } catch (err) {
    console.error('admin.auth.callback.exception', err);
    return res.redirect('/admin/login?error=server_error');
  }
}
