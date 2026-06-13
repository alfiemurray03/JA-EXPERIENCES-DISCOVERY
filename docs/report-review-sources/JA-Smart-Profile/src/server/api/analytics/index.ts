/**
 * Analytics handlers.
 *
 * UK GDPR compliance:
 * - IP addresses are one-way hashed (SHA-256 + per-process salt) before storage.
 *   Raw IPs are never persisted — they are personal data under UK GDPR Art 4(1).
 * - user_agent is NOT stored — it can be used to fingerprint individuals.
 * - Only aggregate counts and date-bucketed data are returned to the frontend.
 * - Days parameter is capped at 365 to prevent unbounded queries.
 */
import { createHash, randomBytes } from 'node:crypto';
import { type Request, type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

// Per-process salt — not persisted; resets on restart.
// This means the same IP produces a different hash after a restart,
// which is intentional: it prevents long-term cross-session tracking.
const IP_SALT = randomBytes(16).toString('hex');

function hashIp(ip: string): string {
  return createHash('sha256').update(IP_SALT + ip).digest('hex').slice(0, 32);
}

// POST /api/analytics/view/:username
export async function recordView(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const profile = db.prepare(
      'SELECT id FROM profiles WHERE username = ? AND is_published = 1'
    ).get(username) as { id: number } | undefined;

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    const rawIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const ipHash = hashIp(rawIp);

    // Insert with hashed IP only — no user_agent stored (GDPR)
    db.prepare(
      'INSERT INTO page_views (profile_id, ip_hash) VALUES (?, ?)'
    ).run(profile.id, ipHash);

    res.json({ success: true });
  } catch (err) {
    console.error('[analytics] recordView error:', err);
    res.status(500).json({ success: false, error: 'Failed to record view' });
  }
}

// GET /api/analytics/:profileId
export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const { profileId } = req.params;

    // Cap days at 365 to prevent unbounded table scans
    const rawDays = parseInt((req.query.days as string) || '30', 10);
    const daysNum = Math.min(Math.max(isNaN(rawDays) ? 30 : rawDays, 1), 365);
    const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000).toISOString();

    const profile = db.prepare(
      'SELECT id FROM profiles WHERE id = ? AND user_id = ?'
    ).get(profileId, req.user!.id);
    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    const totalViews = (db.prepare(
      'SELECT COUNT(*) as c FROM page_views WHERE profile_id = ?'
    ).get(profileId) as { c: number }).c;

    const recentViews = (db.prepare(
      'SELECT COUNT(*) as c FROM page_views WHERE profile_id = ? AND viewed_at >= ?'
    ).get(profileId, since) as { c: number }).c;

    const totalClicks = (db.prepare(
      'SELECT COUNT(*) as c FROM link_clicks WHERE profile_id = ?'
    ).get(profileId) as { c: number }).c;

    const recentClicks = (db.prepare(
      'SELECT COUNT(*) as c FROM link_clicks WHERE profile_id = ? AND clicked_at >= ?'
    ).get(profileId, since) as { c: number }).c;

    // Views by day — aggregate only, no PII
    const viewsByDay = db.prepare(`
      SELECT DATE(viewed_at) as date, COUNT(*) as count
      FROM page_views
      WHERE profile_id = ? AND viewed_at >= ?
      GROUP BY DATE(viewed_at)
      ORDER BY date ASC
    `).all(profileId, since);

    // Top links — aggregate only
    const topLinks = db.prepare(`
      SELECT pl.label, pl.url, pl.platform, COUNT(lc.id) as clicks
      FROM profile_links pl
      LEFT JOIN link_clicks lc ON pl.id = lc.link_id AND lc.clicked_at >= ?
      WHERE pl.profile_id = ?
      GROUP BY pl.id
      ORDER BY clicks DESC
      LIMIT 10
    `).all(since, profileId);

    res.json({
      success: true,
      data: { totalViews, recentViews, totalClicks, recentClicks, viewsByDay, topLinks },
    });
  } catch (err) {
    console.error('[analytics] getAnalytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
}
