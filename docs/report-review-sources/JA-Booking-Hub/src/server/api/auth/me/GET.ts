/**
 * GET /api/auth/me
 * Returns the decoded identity from the id_token cookie (no DB lookup).
 * Used by the frontend to know who is logged in.
 */
import type { Request, Response } from 'express';

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

  const idToken = cookies['ja_id_token'];
  if (!idToken) {
    return res.status(401).json({ authenticated: false });
  }

  const payload = parseJwtPayload(idToken);
  if (!payload) {
    return res.status(401).json({ authenticated: false });
  }

  // Check expiry
  const exp = Number(payload.exp ?? 0);
  if (exp && Date.now() / 1000 > exp) {
    return res.status(401).json({ authenticated: false, reason: 'token_expired' });
  }

  return res.json({
    authenticated: true,
    user: {
      sub: payload.sub,
      name: payload.name,
      email: payload.email ?? payload.preferred_username,
      given_name: payload.given_name,
      family_name: payload.family_name,
      roles: payload.roles ?? [],
    },
  });
}
