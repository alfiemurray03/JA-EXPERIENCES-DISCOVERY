/**
 * POST /api/auth/logout
 * Clears session cookies for the Business/Customer portal and returns
 * the Entra logout URL so the client can end the SSO session too.
 */
import type { Request, Response } from 'express';
import { BUSINESS_AUTH } from '../../../lib/auth-config-server';

export default async function handler(_req: Request, res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = `HttpOnly; Path=/; SameSite=Lax${isProd ? '; Secure' : ''}; Max-Age=0`;

  res.setHeader('Set-Cookie', [
    `ja_access_token=; ${cookieOpts}`,
    `ja_id_token=; ${cookieOpts}`,
    `ja_refresh_token=; ${cookieOpts}`,
  ]);

  const baseUrl = 'https://jabooking.jagroupservices.co.uk';
  const postLogoutUri = `${baseUrl}/`;
  const logoutBase = BUSINESS_AUTH.authority.replace('/v2.0', '');
  const logoutUrl = `${logoutBase}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutUri)}`;

  return res.json({ logoutUrl });
}
