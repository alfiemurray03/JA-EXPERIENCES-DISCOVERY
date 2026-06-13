import { type Request, type Response, type NextFunction } from 'express';
import db from '../db.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    plan_id: number;
  };
}

// ─── Customer auth ─────────────────────────────────────────────────────────

/**
 * Requires a valid customer session (req.session.userId).
 * Returns 401 JSON if not authenticated — does NOT redirect.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const userId = req.session?.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const user = db.prepare(
    'SELECT id, email, name, role, plan_id FROM users WHERE id = ?'
  ).get(userId) as AuthRequest['user'];

  if (!user) {
    res.status(401).json({ success: false, error: 'User not found' });
    return;
  }

  req.user = user;
  next();
}

// ─── Admin auth ────────────────────────────────────────────────────────────

/**
 * Admin route guard — reads from req.session.adminUserId (workforce tenant).
 *
 * Routes that must NEVER be intercepted by this guard:
 *   /admin/login
 *   /admin/auth/callback
 *   /admin/logout
 *
 * Those are registered in entry.ts BEFORE this middleware is applied to
 * /admin/* so they are never caught here. But as a belt-and-braces safety
 * check we also skip them explicitly.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  // Belt-and-braces: never intercept the auth routes themselves
  const path = req.path || req.url?.split('?')[0] || '';
  const ADMIN_AUTH_PATHS = ['/admin/login', '/admin/auth/callback', '/admin/logout'];
  if (ADMIN_AUTH_PATHS.some(p => path === p || path.startsWith(p + '?'))) {
    return next();
  }

  const adminUserId = req.session?.adminUserId;

  if (!adminUserId) {
    // API requests get JSON; page requests get a redirect
    if (req.path?.startsWith('/api/')) {
      res.status(401).json({ success: false, error: 'Authentication required' });
    } else {
      console.log('[auth:admin] requireAdmin — no admin session, redirecting to /admin/login', { path });
      res.redirect('/admin/login');
    }
    return;
  }

  const user = db.prepare(
    'SELECT id, email, name, role, plan_id FROM users WHERE id = ?'
  ).get(adminUserId) as AuthRequest['user'];

  if (!user || user.role !== 'admin') {
    if (req.path?.startsWith('/api/')) {
      res.status(403).json({ success: false, error: 'Admin access required' });
    } else {
      res.redirect('/admin/login');
    }
    return;
  }

  req.user = user;
  next();
}

/**
 * requireAdmin variant for API routes — always returns JSON, never redirects.
 */
export function requireAdminApi(req: AuthRequest, res: Response, next: NextFunction): void {
  const adminUserId = req.session?.adminUserId;

  if (!adminUserId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const user = db.prepare(
    'SELECT id, email, name, role, plan_id FROM users WHERE id = ?'
  ).get(adminUserId) as AuthRequest['user'];

  if (!user || user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  req.user = user;
  next();
}
