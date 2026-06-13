/**
 * GET /api/admin/customers
 *
 * Returns all customer accounts for the admin portal.
 * Includes all Microsoft Entra identity fields, role, account status,
 * and profile fields so the admin users page has everything it needs.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_users } from '../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) {
    return res.status(401).json({
      success: false,
      error: 'Admin session required. Please sign in to the Admin Portal.',
      code: 'NOT_AUTHENTICATED',
    });
  }

  try {
    const users = await db
      .select({
        // Identity
        id:            ja_users.uuid,
        email:         ja_users.email,
        displayName:   ja_users.displayName,
        firstName:     ja_users.firstName,
        lastName:      ja_users.lastName,
        company:       ja_users.company,
        photoUrl:      ja_users.photoUrl,

        // Microsoft Entra
        oidcSub:       ja_users.oidcSub,
        tenantId:      ja_users.tenantId,
        authMethod:    ja_users.authMethod,

        // App permissions
        role:          ja_users.role,
        accountStatus: ja_users.accountStatus,

        // Billing
        plan:           ja_users.plan,
        usageType:      ja_users.usageType,
        isVerified:     ja_users.isVerified,
        planIsLifetime: ja_users.planIsLifetime,
        planExpiresAt:  ja_users.planExpiresAt,

        // Timestamps
        createdAt:  ja_users.createdAt,
        updatedAt:  ja_users.updatedAt,
        lastLogin:  ja_users.lastLogin,
      })
      .from(ja_users)
      .orderBy(desc(ja_users.createdAt));

    return res.json({ success: true, users, total: users.length });
  } catch (err) {
    console.error('admin.customers.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load customers.' });
  }
}
