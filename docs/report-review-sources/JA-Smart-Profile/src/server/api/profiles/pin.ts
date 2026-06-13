/**
 * Profile PIN management + messaging/enquiry feature toggles.
 *
 * POST /api/profiles/:id/pin          — set or clear the PIN (owner only)
 * POST /api/profiles/:id/pin/verify   — verify a PIN (returns a short-lived session flag)
 * PATCH /api/profiles/:id/messaging   — toggle messaging_enabled on/off
 * PATCH /api/profiles/:id/enquiry     — toggle enquiry_enabled on/off
 */
import bcrypt from 'bcryptjs';
import { type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function ownsProfile(userId: number, profileId: string | number) {
  const id = Array.isArray(profileId) ? profileId[0] : profileId;
  const row = db.prepare('SELECT id FROM profiles WHERE id = ? AND user_id = ?').get(id, userId);
  return !!row;
}

// ─── Set / clear PIN ──────────────────────────────────────────────────────────

export function setProfilePin(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { pin } = req.body as { pin?: string };

  if (!ownsProfile(req.user!.id, id)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  if (pin === '' || pin === null || pin === undefined) {
    // Clear PIN
    db.prepare('UPDATE profiles SET pin_hash = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    return res.json({ success: true, pinSet: false });
  }

  if (!/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ success: false, error: 'PIN must be 4–6 digits.' });
  }

  const hash = bcrypt.hashSync(pin, 10);
  db.prepare('UPDATE profiles SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, id);
  return res.json({ success: true, pinSet: true });
}

// ─── Verify PIN ───────────────────────────────────────────────────────────────

export function verifyProfilePin(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { pin } = req.body as { pin?: string };

  if (!ownsProfile(req.user!.id, id)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  if (!pin) {
    return res.status(400).json({ success: false, error: 'PIN is required.' });
  }

  const profile = db.prepare('SELECT pin_hash FROM profiles WHERE id = ?').get(id) as
    { pin_hash: string | null } | undefined;

  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
  if (!profile.pin_hash) return res.json({ success: true, verified: true }); // no PIN set — always pass

  const ok = bcrypt.compareSync(pin, profile.pin_hash);
  if (!ok) return res.status(401).json({ success: false, error: 'Incorrect PIN.' });

  // Store a per-session unlock flag so the client doesn't need to re-enter on every page load
  if (!req.session.unlockedProfiles) req.session.unlockedProfiles = [];
  if (!req.session.unlockedProfiles.includes(Number(id))) {
    req.session.unlockedProfiles.push(Number(id));
  }

  return res.json({ success: true, verified: true });
}

// ─── Get PIN status ───────────────────────────────────────────────────────────

export function getProfilePinStatus(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!ownsProfile(req.user!.id, id)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const profile = db.prepare(`
    SELECT pin_hash,
           COALESCE(messaging_enabled, 1) AS messaging_enabled,
           COALESCE(enquiry_enabled, 1)   AS enquiry_enabled
    FROM profiles WHERE id = ?
  `).get(id) as
    { pin_hash: string | null; messaging_enabled: number; enquiry_enabled: number } | undefined;

  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const unlocked = (req.session.unlockedProfiles ?? []).includes(Number(id));

  return res.json({
    success: true,
    data: {
      pinSet: !!profile.pin_hash,
      unlocked: !!profile.pin_hash ? unlocked : true,
      messaging_enabled: profile.messaging_enabled,
      enquiry_enabled: profile.enquiry_enabled,
    },
  });
}

// ─── Toggle messaging ─────────────────────────────────────────────────────────

export function toggleMessaging(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { enabled } = req.body as { enabled: boolean };

  if (!ownsProfile(req.user!.id, id)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const val = enabled ? 1 : 0;
  db.prepare('UPDATE profiles SET messaging_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(val, id);
  return res.json({ success: true, messaging_enabled: val });
}

// ─── Toggle enquiry ───────────────────────────────────────────────────────────

export function toggleEnquiry(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { enabled } = req.body as { enabled: boolean };

  if (!ownsProfile(req.user!.id, id)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const val = enabled ? 1 : 0;
  db.prepare('UPDATE profiles SET enquiry_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(val, id);
  return res.json({ success: true, enquiry_enabled: val });
}
