import { type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

export default function handler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, email } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, error: 'Name is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    // Check email not taken by another user
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), userId);
    if (existing) return res.status(409).json({ success: false, error: 'That email address is already in use' });

    db.prepare('UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name.trim(), email.trim().toLowerCase(), userId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
