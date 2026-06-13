import { type Request, type Response } from 'express';
import db from '../../db.js';

// ─── Customer: Apply to affiliate programme ────────────────────────────────

export function applyAffiliate(req: Request, res: Response) {
  try {
    const userId = (req.session as { userId?: number }).userId ?? null;
    const { name, email, website, audience, message } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email are required.' });

    // Check for existing application
    const existing = db.prepare('SELECT id, status FROM affiliate_applications WHERE email = ?').get(email) as { id: number; status: string } | undefined;
    if (existing) {
      return res.json({ success: true, existing: true, status: existing.status });
    }

    db.prepare(`
      INSERT INTO affiliate_applications (user_id, name, email, website, audience, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, website || null, audience || null, message || null);

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function getMyAffiliateStatus(req: Request, res: Response) {
  try {
    const userId = (req.session as { userId?: number }).userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as { email: string } | undefined;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const app = db.prepare(`
      SELECT id, status, commission_rate, affiliate_code, created_at, approved_at, rejection_reason
      FROM affiliate_applications WHERE email = ?
    `).get(user.email) as {
      id: number; status: string; commission_rate: number; affiliate_code: string | null;
      created_at: string; approved_at: string | null; rejection_reason: string | null;
    } | undefined;

    if (!app) return res.json({ success: true, data: null });

    // Get commissions if approved
    let commissions: unknown[] = [];
    let totalEarned = 0;
    let pendingPayout = 0;
    if (app.status === 'approved') {
      commissions = db.prepare(`
        SELECT * FROM affiliate_commissions WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 50
      `).all(app.id) as unknown[];
      const totals = db.prepare(`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN commission_gbp ELSE 0 END) as paid,
          SUM(CASE WHEN status = 'pending' THEN commission_gbp ELSE 0 END) as pending
        FROM affiliate_commissions WHERE affiliate_id = ?
      `).get(app.id) as { paid: number | null; pending: number | null };
      totalEarned = totals.paid ?? 0;
      pendingPayout = totals.pending ?? 0;
    }

    res.json({ success: true, data: { ...app, commissions, totalEarned, pendingPayout } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Admin: List all applications ─────────────────────────────────────────

export function adminListAffiliates(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const query = status
      ? 'SELECT * FROM affiliate_applications WHERE status = ? ORDER BY created_at DESC'
      : 'SELECT * FROM affiliate_applications ORDER BY created_at DESC';
    const apps = status
      ? db.prepare(query).all(status)
      : db.prepare(query).all();

    // Attach commission totals
    const withTotals = (apps as Array<Record<string, unknown>>).map(a => {
      const totals = db.prepare(`
        SELECT
          COUNT(*) as total_referrals,
          SUM(commission_gbp) as total_commission,
          SUM(CASE WHEN status = 'paid' THEN commission_gbp ELSE 0 END) as paid_commission
        FROM affiliate_commissions WHERE affiliate_id = ?
      `).get(a.id) as { total_referrals: number; total_commission: number | null; paid_commission: number | null };
      return { ...a, ...totals };
    });

    res.json({ success: true, data: withTotals });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function adminApproveAffiliate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;
    const rate = parseFloat(commission_rate) || 10.0;

    // Generate unique affiliate code
    const app = db.prepare('SELECT name, email FROM affiliate_applications WHERE id = ?').get(id) as { name: string; email: string } | undefined;
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

    const code = `AFF-${app.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    db.prepare(`
      UPDATE affiliate_applications
      SET status = 'approved', commission_rate = ?, affiliate_code = ?, approved_at = CURRENT_TIMESTAMP, rejection_reason = NULL
      WHERE id = ?
    `).run(rate, code, id);

    const updated = db.prepare('SELECT * FROM affiliate_applications WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function adminRejectAffiliate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    db.prepare(`
      UPDATE affiliate_applications
      SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP, rejection_reason = ?
      WHERE id = ?
    `).run(reason || 'Application not approved at this time.', id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function adminUpdateCommissionRate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;
    const rate = parseFloat(commission_rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ success: false, error: 'Commission rate must be 0–100' });
    }
    db.prepare('UPDATE affiliate_applications SET commission_rate = ? WHERE id = ?').run(rate, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function adminListCommissions(req: Request, res: Response) {
  try {
    const commissions = db.prepare(`
      SELECT ac.*, aa.name as affiliate_name, aa.email as affiliate_email, aa.affiliate_code
      FROM affiliate_commissions ac
      JOIN affiliate_applications aa ON ac.affiliate_id = aa.id
      ORDER BY ac.created_at DESC
      LIMIT 200
    `).all();
    res.json({ success: true, data: commissions });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function adminMarkCommissionPaid(req: Request, res: Response) {
  try {
    const { id } = req.params;
    db.prepare("UPDATE affiliate_commissions SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
