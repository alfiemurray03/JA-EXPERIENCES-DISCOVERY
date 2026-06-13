/**
 * POST /api/admin/customers
 * Admin creates a new customer account directly (bypasses email registration).
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../../../db/client.js';
import { ja_users } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ja_salt_2026').digest('hex');
}

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const { firstName, lastName, email, password, plan, company, usageType } = req.body as {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    plan?: string;
    company?: string;
    usageType?: string;
  };

  if (!firstName?.trim()) return res.status(400).json({ success: false, error: 'First name is required.' });
  if (!lastName?.trim())  return res.status(400).json({ success: false, error: 'Last name is required.' });
  if (!email?.trim())     return res.status(400).json({ success: false, error: 'Email is required.' });
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
  }

  const validPlans = ['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional'];
  type PlanId = 'free' | 'personal' | 'standard' | 'professional' | 'org_starter' | 'org_growth' | 'org_professional';
  const resolvedPlan = validPlans.includes(plan ?? '') ? (plan as PlanId) : 'free';

  try {
    // Check for duplicate email
    const existing = await db
      .select({ id: ja_users.id })
      .from(ja_users)
      .where(eq(ja_users.email, email.trim().toLowerCase()))
      .limit(1);

    if (existing.length) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const uuid = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    await db.insert(ja_users).values({
      uuid,
      email:        email.trim().toLowerCase(),
      firstName:    firstName.trim(),
      lastName:     lastName.trim(),
      company:      company?.trim() || null,
      passwordHash,
      plan:         resolvedPlan,
      usageType:    (usageType as 'personal' | 'business' | 'both') ?? 'both',
      isVerified:   true, // Admin-created accounts are pre-verified
    });

    return res.status(201).json({ success: true, message: 'Customer account created.', uuid });
  } catch (err) {
    console.error('admin.customers.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to create customer.' });
  }
}
