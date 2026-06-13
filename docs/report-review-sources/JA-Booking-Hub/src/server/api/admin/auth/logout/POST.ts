/**
 * POST /api/admin/auth/logout
 * Clears admin session cookies and returns the Entra logout URL.
 */
import type { Request, Response } from 'express';
import { ADMIN_AUTH } from '../../../../lib/auth-config-server';

export default async function handler(_req: Request, res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = `HttpOnly; Path=/admin; SameSite=Strict${isProd ? '; Secure' : ''}; Max-Age=0`;

  res.setHeader('Set-Cookie', [
    `ja_admin_access_token=; ${cookieOpts}`,
    `ja_admin_id_token=; ${cookieOpts}`,
    `ja_admin_refresh_token=; ${cookieOpts}`,
  ]);

  const baseUrl = 'https://jabooking.jagroupservices.co.uk';
  const postLogoutUri = `${baseUrl}/admin/login`;
  const logoutBase = ADMIN_AUTH.authority.replace('/v2.0', '');
  const logoutUrl = `${logoutBase}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutUri)}`;

  return res.json({ logoutUrl });
}
