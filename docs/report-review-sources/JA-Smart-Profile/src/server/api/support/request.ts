/**
 * Support request handlers.
 *
 * UK GDPR compliance:
 * - consent_given_at recorded at submission time
 * - user_id linked from authenticated session (not from body — prevents spoofing)
 * - Email/name length-capped; message length-capped
 * - Table created at DB startup (db.ts), not here
 */
import { type Request, type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.js';
import db from '../../db.js';
import { notifySupportRequest } from '../../lib/notifications.js';

const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MAX_NAME    = 120;
const MAX_EMAIL   = 254;

export function submitSupportRequest(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id ?? null;
    const { name, email, subject, message } = req.body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, error: 'A valid email address is required' });
      return;
    }
    if (typeof subject !== 'string' || !subject.trim()) {
      res.status(400).json({ success: false, error: 'Subject is required' });
      return;
    }
    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    const safeName    = name.trim().slice(0, MAX_NAME);
    const safeEmail   = email.trim().toLowerCase().slice(0, MAX_EMAIL);
    const safeSubject = subject.trim().slice(0, MAX_SUBJECT);
    const safeMessage = message.trim().slice(0, MAX_MESSAGE);

    const result = db.prepare(`
      INSERT INTO support_requests (user_id, name, email, subject, message, consent_given_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, safeName, safeEmail, safeSubject, safeMessage);

    // Audit log — non-fatal
    try {
      db.prepare(`INSERT INTO audit_log (actor, action, detail) VALUES (?, 'support.request', ?)`)
        .run(`user:${userId ?? 'anon'}`, `subject="${safeSubject}" from=${safeEmail}`);
    } catch { /* audit table may not exist yet */ }

    // Email admin notification
    notifySupportRequest({ userName: safeName, userEmail: safeEmail, subject: safeSubject, message: safeMessage });

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('[support] submitSupportRequest error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit request' });
  }
}

export function getSupportRequests(_req: Request, res: Response): void {
  try {
    const rows = db.prepare(`
      SELECT sr.id, sr.user_id, sr.name, sr.email, sr.subject, sr.message,
             sr.status, sr.created_at, u.name as user_name, u.plan_id
      FROM support_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
    `).all();
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[support] getSupportRequests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
}

export function updateSupportRequest(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    const allowed = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(', ')}` });
      return;
    }

    const result = db.prepare('UPDATE support_requests SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[support] updateSupportRequest error:', err);
    res.status(500).json({ success: false, error: 'Failed to update request' });
  }
}
