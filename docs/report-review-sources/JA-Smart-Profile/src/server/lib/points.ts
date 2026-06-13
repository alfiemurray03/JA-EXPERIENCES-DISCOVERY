/**
 * Points engine — award, deduct, balance.
 * All mutations go through this module to keep the ledger consistent.
 */
import { randomBytes } from 'crypto';
import db from '../db.js';

export interface LedgerEntry {
  id: number;
  user_id: number;
  delta: number;
  balance_after: number;
  action: string;
  description: string | null;
  ref_id: number | null;
  created_at: string;
}

/** Get current points balance for a user */
export function getBalance(userId: number): number {
  const row = db.prepare(
    'SELECT balance_after FROM points_ledger WHERE user_id = ? ORDER BY id DESC LIMIT 1'
  ).get(userId) as { balance_after: number } | undefined;
  return row?.balance_after ?? 0;
}

/** Get points rule by action */
export function getRule(action: string): { points: number; is_active: number } | undefined {
  return db.prepare('SELECT points, is_active FROM points_rules WHERE action = ?').get(action) as
    { points: number; is_active: number } | undefined;
}

/** Award points for a qualifying action. Returns the new balance or null if rule inactive/missing. */
export function awardPoints(
  userId: number,
  action: string,
  description?: string,
  refId?: number,
  overridePoints?: number
): number | null {
  const rule = getRule(action);
  const pts = overridePoints ?? rule?.points ?? 0;
  if (!overridePoints && (!rule || !rule.is_active || pts === 0)) return null;

  const current = getBalance(userId);
  const newBalance = current + pts;
  db.prepare(
    'INSERT INTO points_ledger (user_id, delta, balance_after, action, description, ref_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, pts, newBalance, action, description ?? null, refId ?? null);
  return newBalance;
}

/** Deduct points (e.g. redemption). Returns new balance or throws if insufficient. */
export function deductPoints(
  userId: number,
  points: number,
  action: string,
  description?: string,
  refId?: number
): number {
  const current = getBalance(userId);
  if (current < points) throw new Error('Insufficient points balance');
  const newBalance = current - points;
  db.prepare(
    'INSERT INTO points_ledger (user_id, delta, balance_after, action, description, ref_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, -points, newBalance, action, description ?? null, refId ?? null);
  return newBalance;
}

/** Get or create a referral code for a user */
export function getOrCreateReferralCode(userId: number): string {
  const existing = db.prepare('SELECT code FROM referral_codes WHERE user_id = ?').get(userId) as
    { code: string } | undefined;
  if (existing) return existing.code;

  // Generate a short unique code: first 3 chars of user id + 5 random hex chars
  const code = `JA${userId}${randomBytes(3).toString('hex').toUpperCase()}`;
  db.prepare('INSERT OR IGNORE INTO referral_codes (user_id, code) VALUES (?, ?)').run(userId, code);
  return code;
}

/** Get points summary for a user */
export function getPointsSummary(userId: number) {
  const balance = getBalance(userId);
  const earned = (db.prepare(
    'SELECT COALESCE(SUM(delta),0) as total FROM points_ledger WHERE user_id = ? AND delta > 0'
  ).get(userId) as { total: number }).total;
  const redeemed = Math.abs((db.prepare(
    'SELECT COALESCE(SUM(delta),0) as total FROM points_ledger WHERE user_id = ? AND delta < 0'
  ).get(userId) as { total: number }).total);
  const referralCount = (db.prepare(
    'SELECT COUNT(*) as c FROM points_ledger WHERE user_id = ? AND action = ?'
  ).get(userId, 'referral_signup') as { c: number }).c;
  return { balance, earned, redeemed, referralCount };
}
