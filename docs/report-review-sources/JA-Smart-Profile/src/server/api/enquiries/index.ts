import { type Request, type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

// Rate limiting: in-memory store
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 3;
  
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

// POST /api/enquiries/:username
export async function submitEnquiry(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { sender_name, sender_email, message } = req.body;

    if (!sender_name || !sender_email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender_email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, error: 'Message too long (max 2000 characters)' });
    }

    const ip = req.ip || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ success: false, error: 'Too many submissions. Please try again later.' });
    }

    const profile = db.prepare('SELECT id, user_id FROM profiles WHERE username = ? AND is_published = 1').get(username) as { id: number; user_id: number } | undefined;
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    // Check if plan has contact form
    const user = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(profile.user_id) as { plan_id: number } | undefined;
    const plan = user ? db.prepare('SELECT has_contact_form FROM plans WHERE id = ?').get(user.plan_id) as { has_contact_form: number } | undefined : undefined;
    if (!plan?.has_contact_form) {
      return res.status(403).json({ success: false, error: 'Contact form not available for this profile' });
    }

    db.prepare(
      'INSERT INTO contact_enquiries (profile_id, sender_name, sender_email, message) VALUES (?, ?, ?, ?)'
    ).run(profile.id, sender_name.trim(), sender_email.toLowerCase(), message.trim());

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}

// GET /api/enquiries
export async function getEnquiries(req: AuthRequest, res: Response) {
  try {
    const profiles = db.prepare('SELECT id FROM profiles WHERE user_id = ?').all(req.user!.id) as { id: number }[];
    if (profiles.length === 0) return res.json({ success: true, data: [] });

    const profileIds = profiles.map(p => p.id);
    const placeholders = profileIds.map(() => '?').join(',');
    const enquiries = db.prepare(
      `SELECT ce.*, p.username, p.display_name as profile_name FROM contact_enquiries ce 
       JOIN profiles p ON ce.profile_id = p.id 
       WHERE ce.profile_id IN (${placeholders}) ORDER BY ce.created_at DESC`
    ).all(...profileIds);

    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
}

// PUT /api/enquiries/:id/read
export async function markRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const enquiry = db.prepare(
      'SELECT ce.* FROM contact_enquiries ce JOIN profiles p ON ce.profile_id = p.id WHERE ce.id = ? AND p.user_id = ?'
    ).get(id, req.user!.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
    db.prepare('UPDATE contact_enquiries SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
}
