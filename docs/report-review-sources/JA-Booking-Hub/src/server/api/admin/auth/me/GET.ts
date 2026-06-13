/**
 * GET /api/admin/auth/me
 * Returns decoded admin identity from the admin id_token cookie.
 */
import type { Request, Response } from 'express';
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
  const cookieHeader = req.headers.cookie ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }),
  );

  const idToken = cookies['ja_admin_id_token'];
  if (!idToken) {
    return res.status(401).json({ authenticated: false });
  }

  const payload = parseJwtPayload(idToken);
  if (!payload) {
    return res.status(401).json({ authenticated: false });
  }

  const exp = Number(payload.exp ?? 0);
  if (exp && Date.now() / 1000 > exp) {
    return res.status(401).json({ authenticated: false, reason: 'token_expired' });
  }

  const roles: string[] = Array.isArray(payload.roles) ? payload.roles as string[] : [];
  const allowedRoles = [...ADMIN_AUTH.allowedRoles] as string[];
  const hasAdminRole = roles.some((r) => allowedRoles.includes(r));

  if (!hasAdminRole) {
    return res.status(403).json({ authenticated: false, reason: 'insufficient_role' });
  }

  return res.json({
    authenticated: true,
    user: {
      sub: payload.sub,
      name: payload.name,
      email: payload.email ?? payload.preferred_username,
      given_name: payload.given_name,
      family_name: payload.family_name,
      roles,
    },
  });
}
