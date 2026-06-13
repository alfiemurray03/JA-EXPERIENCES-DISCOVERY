import { type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

export function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 50
    `).all(userId);
    const unread = (db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { c: number }).c;
    res.json({ success: true, data: notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function markNotificationsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { ids } = req.body; // optional array of IDs; if omitted, mark all
    if (Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`).run(userId, ...ids);
    } else {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function deleteNotification(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
