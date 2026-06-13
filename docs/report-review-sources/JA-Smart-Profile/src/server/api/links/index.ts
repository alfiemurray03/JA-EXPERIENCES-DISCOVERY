import { type Request, type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

function ownsProfile(userId: number, profileId: number | string): boolean {
  const p = db.prepare('SELECT id FROM profiles WHERE id = ? AND user_id = ?').get(profileId, userId);
  return !!p;
}

// GET /api/links/:profileId
export async function getLinks(req: AuthRequest, res: Response) {
  try {
    const profileId = Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId;
    if (!ownsProfile(req.user!.id, profileId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const links = db.prepare('SELECT * FROM profile_links WHERE profile_id = ? ORDER BY sort_order ASC').all(profileId);
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch links' });
  }
}

// POST /api/links
export async function createLink(req: AuthRequest, res: Response) {
  try {
    const { profile_id, type, platform, label, url, icon } = req.body;
    if (!profile_id || !type || !label || !url) {
      return res.status(400).json({ success: false, error: 'profile_id, type, label, and url are required' });
    }
    if (!ownsProfile(req.user!.id, profile_id)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check plan link limits
    const plan = db.prepare('SELECT max_links FROM plans WHERE id = ?').get(req.user!.plan_id) as { max_links: number } | undefined;
    const linkCount = (db.prepare('SELECT COUNT(*) as c FROM profile_links WHERE profile_id = ?').get(profile_id) as { c: number }).c;
    if (plan && linkCount >= plan.max_links) {
      return res.status(403).json({ success: false, error: `Your plan allows a maximum of ${plan.max_links} links. Upgrade to add more.` });
    }

    const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM profile_links WHERE profile_id = ?').get(profile_id) as { m: number | null }).m ?? -1;
    const result = db.prepare(
      'INSERT INTO profile_links (profile_id, type, platform, label, url, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(profile_id, type, platform || null, label, url, icon || null, maxOrder + 1);

    const link = db.prepare('SELECT * FROM profile_links WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create link' });
  }
}

// PUT /api/links/:id
export async function updateLink(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const link = db.prepare('SELECT * FROM profile_links WHERE id = ?').get(id) as { profile_id: number } | undefined;
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });
    if (!ownsProfile(req.user!.id, link.profile_id)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const fields = ['label', 'url', 'platform', 'icon', 'is_enabled', 'sort_order', 'type'];
    const updates = fields.filter(f => req.body[f] !== undefined);
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });

    const setClause = updates.map(f => `${f} = ?`).join(', ');
    const values = updates.map(f => req.body[f]);
    db.prepare(`UPDATE profile_links SET ${setClause} WHERE id = ?`).run(...values, id);

    const updated = db.prepare('SELECT * FROM profile_links WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update link' });
  }
}

// DELETE /api/links/:id
export async function deleteLink(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const link = db.prepare('SELECT * FROM profile_links WHERE id = ?').get(id) as { profile_id: number } | undefined;
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });
    if (!ownsProfile(req.user!.id, link.profile_id)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    db.prepare('DELETE FROM profile_links WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete link' });
  }
}

// PUT /api/links/reorder
export async function reorderLinks(req: AuthRequest, res: Response) {
  try {
    const { links } = req.body as { links: { id: number; sort_order: number }[] };
    if (!Array.isArray(links)) return res.status(400).json({ success: false, error: 'links array required' });

    const update = db.prepare('UPDATE profile_links SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction((items: { id: number; sort_order: number }[]) => {
      for (const item of items) update.run(item.sort_order, item.id);
    });
    updateMany(links);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reorder links' });
  }
}

// POST /api/links/:id/click
export async function recordClick(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const link = db.prepare('SELECT * FROM profile_links WHERE id = ?').get(id) as { profile_id: number } | undefined;
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });

    const ip = req.ip || '';
    const ipHash = Buffer.from(ip).toString('base64').substring(0, 16);
    db.prepare('INSERT INTO link_clicks (link_id, profile_id, ip_hash) VALUES (?, ?, ?)').run(id, link.profile_id, ipHash);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to record click' });
  }
}
