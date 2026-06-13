import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.js';
import db from '../../db.js';

export default function handler(req: AuthRequest, res: Response) {
  const user = db.prepare(`
    SELECT
      u.id, u.email, u.name, u.role, u.plan_id,
      u.lifetime_access,
      u.created_at,
      p.name        AS plan_name,
      p.slug        AS plan_slug,
      s.status      AS subscription_status,
      s.billing_interval,
      s.current_period_end
    FROM users u
    LEFT JOIN plans p ON u.plan_id = p.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u.id = ?
  `).get(req.user!.id) as {
    id: number; email: string; name: string; role: string; plan_id: number;
    lifetime_access: number; created_at: string;
    plan_name: string | null; plan_slug: string | null;
    subscription_status: string | null; billing_interval: string | null;
    current_period_end: string | null;
  } | undefined;

  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, data: { user } });
}
