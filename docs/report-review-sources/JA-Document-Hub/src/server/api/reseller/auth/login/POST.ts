/**
 * POST /api/reseller/auth/login
 * Reseller email + password login.
 */
import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../../../../db/client.js';
import { ja_resellers, ja_reseller_audit } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { setResellerCookie, TTL_MS } from '../../_session.js';

export default async function handler(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const [reseller] = await db.select().from(ja_resellers).where(eq(ja_resellers.email, email.toLowerCase().trim())).limit(1);
  if (!reseller) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  if (reseller.status === 'rejected') {
    return res.status(403).json({ success: false, error: 'Your application was not approved.', code: 'REJECTED' });
  }
  if (reseller.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.', code: 'SUSPENDED' });
  }
  if (reseller.status === 'applied') {
    return res.status(403).json({ success: false, error: 'Your application is pending review.', code: 'PENDING' });
  }

  if (!reseller.passwordHash) {
    return res.status(401).json({ success: false, error: 'Password not set. Please contact support to activate your account.' });
  }

  const valid = await bcrypt.compare(password, reseller.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db.update(ja_resellers).set({
    sessionToken: token,
    sessionExpiresAt: expiresAt,
    lastLogin: new Date(),
  }).where(eq(ja_resellers.id, reseller.id));

  await db.insert(ja_reseller_audit).values({
    resellerId: reseller.id,
    action: 'login',
    detail: `Login from ${req.ip}`,
    ipAddress: req.ip ?? null,
  });

  setResellerCookie(res, token);

  return res.json({
    success: true,
    reseller: {
      uuid: reseller.uuid,
      fullName: reseller.fullName,
      email: reseller.email,
      company: reseller.company,
      status: reseller.status,
    },
  });
}
