/**
 * Points & Rewards API — customer-facing endpoints
 */
import { type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';
import {
  getBalance, getPointsSummary, getOrCreateReferralCode, deductPoints,
} from '../../lib/points.js';

// ── GET /api/points/summary ───────────────────────────────────────────────
export function getMyPointsSummary(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const summary = getPointsSummary(userId);
    const code = getOrCreateReferralCode(userId);
    res.json({ success: true, data: { ...summary, referral_code: code } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ── GET /api/points/history ───────────────────────────────────────────────
export function getMyPointsHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const limit = 50;
    const offset = (page - 1) * limit;

    const rows = db.prepare(`
      SELECT * FROM points_ledger WHERE user_id = ?
      ORDER BY id DESC LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as c FROM points_ledger WHERE user_id = ?').get(userId) as { c: number }).c;

    res.json({ success: true, data: rows, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ── GET /api/points/rewards ───────────────────────────────────────────────
export function getRewards(req: AuthRequest, res: Response) {
  try {
    const rewards = db.prepare('SELECT * FROM rewards WHERE is_active = 1 ORDER BY points_cost ASC').all();
    const balance = getBalance(req.user!.id);
    res.json({ success: true, data: rewards, balance });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ── POST /api/points/redeem ───────────────────────────────────────────────
export function redeemReward(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { reward_id } = req.body;

    if (!reward_id) return res.status(400).json({ success: false, error: 'reward_id is required' });

    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(reward_id) as
      { id: number; name: string; points_cost: number; stock: number; type: string; value: string } | undefined;

    if (!reward) return res.status(404).json({ success: false, error: 'Reward not found or inactive' });

    const balance = getBalance(userId);
    if (balance < reward.points_cost) {
      return res.status(400).json({ success: false, error: `Insufficient points. You need ${reward.points_cost} but have ${balance}.` });
    }

    // Check stock
    if (reward.stock !== -1) {
      const used = (db.prepare('SELECT COUNT(*) as c FROM reward_redemptions WHERE reward_id = ?').get(reward_id) as { c: number }).c;
      if (used >= reward.stock) {
        return res.status(400).json({ success: false, error: 'This reward is out of stock.' });
      }
    }

    // Deduct points
    deductPoints(userId, reward.points_cost, 'redemption', `Redeemed: ${reward.name}`, reward.id);

    // Create redemption record
    const redemption = db.prepare(`
      INSERT INTO reward_redemptions (user_id, reward_id, points_spent, status)
      VALUES (?, ?, ?, 'pending')
    `).run(userId, reward.id, reward.points_cost);

    res.status(201).json({
      success: true,
      data: {
        redemption_id: redemption.lastInsertRowid,
        reward_name: reward.name,
        points_spent: reward.points_cost,
        new_balance: getBalance(userId),
        message: 'Redemption submitted. Our team will process it within 24 hours.',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ── GET /api/points/redemptions ───────────────────────────────────────────
export function getMyRedemptions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const rows = db.prepare(`
      SELECT rr.*, r.name as reward_name, r.type as reward_type, r.value as reward_value
      FROM reward_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      WHERE rr.user_id = ?
      ORDER BY rr.created_at DESC
    `).all(userId);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}

// ── GET /api/points/referral ──────────────────────────────────────────────
export function getMyReferral(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const code = getOrCreateReferralCode(userId);
    const referrals = db.prepare(`
      SELECT u.name, u.email, u.created_at,
        (SELECT COUNT(*) FROM points_ledger pl WHERE pl.user_id = ? AND pl.action = 'referral_purchase' AND pl.ref_id = u.id) as purchased
      FROM users u
      WHERE u.referred_by_code = ?
      ORDER BY u.created_at DESC
    `).all(userId, code);
    const summary = getPointsSummary(userId);
    res.json({ success: true, data: { code, referrals, summary } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
