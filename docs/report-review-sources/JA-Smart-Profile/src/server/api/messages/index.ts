import { randomBytes } from 'crypto';
import { type Request, type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';
import { notifyNewMessage } from '../../lib/notifications.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createNotification(userId: number, type: string, title: string, body: string, link: string) {
  try {
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, body, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, title, body, link);
  } catch { /* non-fatal */ }
}

// ─── Public: Start a new message thread from a card visitor ──────────────────

export function sendCardMessage(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { sender_name, sender_email, subject, body } = req.body;

    if (!sender_name?.trim() || !sender_email?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    }

    // Resolve profile + check plan allows messaging
    const profile = db.prepare(`
      SELECT p.id, p.user_id, p.display_name, pl.has_messaging
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      JOIN plans pl ON u.plan_id = pl.id
      WHERE p.username = ? AND p.is_published = 1
    `).get(username) as { id: number; user_id: number; display_name: string; has_messaging: number } | undefined;

    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (!profile.has_messaging) {
      return res.status(403).json({ success: false, error: 'This profile does not have messaging enabled.' });
    }

    const visitorToken = randomBytes(24).toString('hex');

    const thread = db.prepare(`
      INSERT INTO card_message_threads (profile_id, sender_name, sender_email, subject, status, visitor_token, visitor_verified, visitor_accepted)
      VALUES (?, ?, ?, ?, 'open', ?, 0, 0)
    `).run(profile.id, sender_name.trim(), sender_email.trim(), subject?.trim() || null, visitorToken);

    db.prepare(`
      INSERT INTO card_messages (thread_id, sender, body)
      VALUES (?, 'visitor', ?)
    `).run(thread.lastInsertRowid, body.trim());

    // Notify the card owner
    createNotification(
      profile.user_id,
      'new_message',
      `New message from ${sender_name.trim()}`,
      body.trim().slice(0, 120),
      `/dashboard/messages`
    );

    // Email admin notification
    notifyNewMessage({
      senderName: sender_name.trim(),
      senderEmail: sender_email.trim(),
      recipientUsername: String(username),
      preview: body.trim(),
      threadId: Number(thread.lastInsertRowid),
    });

    res.status(201).json({
      success: true,
      thread_id: thread.lastInsertRowid,
      visitor_token: visitorToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Public: Visitor replies to an existing thread via token ─────────────────

export function visitorReply(req: Request, res: Response) {
  try {
    const { threadId } = req.params;
    const { body, visitor_token } = req.body;

    if (!body?.trim()) return res.status(400).json({ success: false, error: 'Message body is required.' });
    if (!visitor_token) return res.status(401).json({ success: false, error: 'Visitor token required.' });

    const thread = db.prepare(`
      SELECT t.id, t.status, t.visitor_token, t.visitor_accepted, t.profile_id,
             t.sender_name, p.user_id, p.display_name
      FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ?
    `).get(threadId) as {
      id: number; status: string; visitor_token: string; visitor_accepted: number;
      profile_id: number; sender_name: string; user_id: number; display_name: string;
    } | undefined;

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found.' });
    if (thread.visitor_token !== visitor_token) return res.status(403).json({ success: false, error: 'Invalid token.' });
    if (thread.status === 'closed') return res.status(400).json({ success: false, error: 'This conversation has been closed.' });
    if (!thread.visitor_accepted) return res.status(403).json({ success: false, error: 'The card owner has not yet accepted this conversation.' });

    db.prepare(`INSERT INTO card_messages (thread_id, sender, body) VALUES (?, 'visitor', ?)`).run(threadId, body.trim());
    db.prepare(`UPDATE card_message_threads SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?`).run(threadId);

    // Notify owner of visitor reply
    createNotification(
      thread.user_id,
      'visitor_reply',
      `${thread.sender_name} replied`,
      body.trim().slice(0, 120),
      `/dashboard/messages`
    );

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Public: Get thread status + messages for visitor (via token) ─────────────

export function getVisitorThread(req: Request, res: Response) {
  try {
    const { threadId } = req.params;
    const { token } = req.query;

    const thread = db.prepare(`
      SELECT t.id, t.status, t.visitor_token, t.visitor_accepted, t.sender_name,
             t.sender_email, t.subject, t.created_at, t.last_message_at,
             p.display_name as profile_name
      FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ?
    `).get(threadId) as Record<string, unknown> | undefined;

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found.' });
    if (thread.visitor_token !== token) return res.status(403).json({ success: false, error: 'Invalid token.' });

    const messages = db.prepare(`SELECT * FROM card_messages WHERE thread_id = ? ORDER BY created_at ASC`).all(threadId);

    res.json({ success: true, data: { thread, messages } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Authenticated: Accept a visitor into live conversation ──────────────────

export function acceptVisitor(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;

    const thread = db.prepare(`
      SELECT t.id FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `).get(threadId, userId);

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    db.prepare('UPDATE card_message_threads SET visitor_accepted = 1 WHERE id = ?').run(threadId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Authenticated: Get all threads for the logged-in user's profiles ────────

export function getMyThreads(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const threads = db.prepare(`
      SELECT t.*,
        (SELECT COUNT(*) FROM card_messages m WHERE m.thread_id = t.id AND m.is_read = 0 AND m.sender = 'visitor') as unread_count,
        (SELECT body FROM card_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        p.username as profile_username, p.display_name as profile_name
      FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE p.user_id = ?
      ORDER BY t.last_message_at DESC
    `).all(userId);
    res.json({ success: true, data: threads });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function getThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;

    const thread = db.prepare(`
      SELECT t.*, p.username as profile_username, p.display_name as profile_name
      FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `).get(threadId, userId) as Record<string, unknown> | undefined;

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    const messages = db.prepare(`SELECT * FROM card_messages WHERE thread_id = ? ORDER BY created_at ASC`).all(threadId);

    // Mark visitor messages as read
    db.prepare(`UPDATE card_messages SET is_read = 1 WHERE thread_id = ? AND sender = 'visitor' AND is_read = 0`).run(threadId);

    res.json({ success: true, data: { thread, messages } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function replyToThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;
    const { body } = req.body;

    if (!body?.trim()) return res.status(400).json({ success: false, error: 'Reply body is required.' });

    const thread = db.prepare(`
      SELECT t.id, t.status, t.sender_name FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `).get(threadId, userId) as { id: number; status: string; sender_name: string } | undefined;

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
    if (thread.status === 'closed') return res.status(400).json({ success: false, error: 'This conversation is closed.' });

    const msg = db.prepare(`INSERT INTO card_messages (thread_id, sender, body) VALUES (?, 'owner', ?)`).run(threadId, body.trim());
    db.prepare(`UPDATE card_message_threads SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?`).run(threadId);

    const newMsg = db.prepare('SELECT * FROM card_messages WHERE id = ?').get(msg.lastInsertRowid);
    res.status(201).json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function setThreadStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) return res.status(400).json({ success: false, error: 'Status must be open or closed.' });

    const thread = db.prepare(`
      SELECT t.id FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `).get(threadId, userId);

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    db.prepare('UPDATE card_message_threads SET status = ? WHERE id = ?').run(status, threadId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

export function deleteThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;

    const thread = db.prepare(`
      SELECT t.id FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `).get(threadId, userId);

    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    db.prepare('DELETE FROM card_message_threads WHERE id = ?').run(threadId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Public: Check thread status (for visitor) ───────────────────────────────

export function getThreadStatus(req: Request, res: Response) {
  try {
    const { threadId } = req.params;
    const thread = db.prepare('SELECT status, sender_email, visitor_accepted FROM card_message_threads WHERE id = ?').get(threadId) as { status: string; sender_email: string; visitor_accepted: number } | undefined;
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
    res.json({ success: true, data: { status: thread.status, visitor_accepted: thread.visitor_accepted } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ─── Admin: Get all threads ───────────────────────────────────────────────────

export function adminGetAllThreads(req: Request, res: Response) {
  try {
    const threads = db.prepare(`
      SELECT t.*,
        p.username as profile_username, p.display_name as profile_name,
        u.name as owner_name, u.email as owner_email,
        (SELECT COUNT(*) FROM card_messages m WHERE m.thread_id = t.id) as message_count
      FROM card_message_threads t
      JOIN profiles p ON t.profile_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY t.last_message_at DESC
      LIMIT 500
    `).all();
    res.json({ success: true, data: threads });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
