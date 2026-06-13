/**
 * PATCH /api/admin/customers/:id
 * Admin override: update plan, profile fields, verification status, lifetime grant, or delete.
 */
import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_users, ja_lifetime_grants } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });
  const adminEmail = identity.email;

  const { id } = req.params;
  const body = req.body as {
    action?: 'override_plan' | 'change_plan' | 'grant_lifetime' | 'revoke_lifetime' | 'change_lifetime'
           | 'verify' | 'delete' | 'trigger_password_reset'
           | 'activate' | 'suspend'          // account status
           | 'set_role';                      // role assignment
    plan?: string;
    role?: 'user' | 'manager' | 'admin';
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    usageType?: string;
    planExpiresAt?: string | null;
    note?: string;
  };

  try {
    const users = await db
      .select({ id: ja_users.id, uuid: ja_users.uuid, plan: ja_users.plan, email: ja_users.email })
      .from(ja_users)
      .where(sql`uuid = ${id}`)
      .limit(1);

    if (!users.length) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }
    const userId = users[0].id;
    const customerEmail = users[0].email;

    const { action } = body;

    if (action === 'delete') {
      await db.delete(ja_users).where(eq(ja_users.id, userId));
      await logAdminAction(adminEmail, 'customer.delete', `Deleted customer ${customerEmail}`, req);
      return res.json({ success: true, message: 'Customer deleted.' });
    }

    if (action === 'verify') {
      await db.update(ja_users).set({ isVerified: true }).where(eq(ja_users.id, userId));
      await logAdminAction(adminEmail, 'customer.verify', `Verified customer ${customerEmail}`, req);
      return res.json({ success: true, message: 'Customer verified.' });
    }

    const VALID_PLANS = ['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional'] as const;

    if (action === 'grant_lifetime') {
      if (!body.plan || !(VALID_PLANS as readonly string[]).includes(body.plan)) {
        return res.status(400).json({ success: false, error: `A valid plan is required for lifetime grant. Got: ${body.plan}` });
      }
      await db.execute(sql`
        UPDATE ja_users
        SET plan = ${body.plan}, plan_is_lifetime = 1, plan_expires_at = NULL
        WHERE id = ${userId}
      `);
      try {
        await db.insert(ja_lifetime_grants).values({
          userId,
          grantedBy: adminEmail,
          plan: body.plan,
          action: 'grant',
          note: body.note?.trim() || null,
        });
      } catch (auditErr) {
        console.error('lifetime.grant.audit.error', auditErr);
      }
      await logAdminAction(adminEmail, 'customer.lifetime_grant', `Granted lifetime ${body.plan} to ${customerEmail}`, req);
      return res.json({ success: true, message: `Lifetime ${body.plan} plan granted.` });
    }

    if (action === 'change_lifetime') {
      if (!body.plan || !(VALID_PLANS as readonly string[]).includes(body.plan)) {
        return res.status(400).json({ success: false, error: `A valid plan is required. Got: ${body.plan}` });
      }
      await db.execute(sql`
        UPDATE ja_users
        SET plan = ${body.plan}, plan_is_lifetime = 1, plan_expires_at = NULL
        WHERE id = ${userId}
      `);
      try {
        await db.insert(ja_lifetime_grants).values({
          userId,
          grantedBy: adminEmail,
          plan: body.plan,
          action: 'change',
          note: body.note?.trim() || null,
        });
      } catch (auditErr) {
        console.error('lifetime.change.audit.error', auditErr);
      }
      await logAdminAction(adminEmail, 'customer.lifetime_change', `Changed lifetime plan to ${body.plan} for ${customerEmail}`, req);
      return res.json({ success: true, message: `Lifetime plan changed to ${body.plan}.` });
    }

    if (action === 'revoke_lifetime') {
      const prevPlan = users[0].plan ?? 'free';
      await db.execute(sql`
        UPDATE ja_users
        SET plan_is_lifetime = 0, plan = 'free', plan_expires_at = NULL
        WHERE id = ${userId}
      `);
      try {
        await db.insert(ja_lifetime_grants).values({
          userId,
          grantedBy: adminEmail,
          plan: prevPlan,
          action: 'revoke',
          note: body.note?.trim() || null,
        });
      } catch (auditErr) {
        console.error('lifetime.revoke.audit.error', auditErr);
      }
      await logAdminAction(adminEmail, 'customer.lifetime_revoke', `Revoked lifetime plan from ${customerEmail}`, req);
      return res.json({ success: true, message: 'Lifetime plan revoked. Customer moved to free.' });
    }

    if (action === 'trigger_password_reset') {
      // Create a password reset request for this customer
      const crypto = await import('node:crypto');
      const uuid = crypto.randomUUID();
      await db.execute(sql`
        INSERT INTO ja_password_reset_requests (uuid, user_id, email, status, delivery_method, created_at)
        VALUES (${uuid}, ${userId}, ${customerEmail}, 'pending', 'link', NOW())
      `);
      await logAdminAction(adminEmail, 'customer.trigger_password_reset', `Triggered password reset for ${customerEmail}`, req);
      return res.json({ success: true, message: 'Password reset request created.' });
    }

    // ── Account status ────────────────────────────────────────────────────────

    if (action === 'activate') {
      await db.execute(sql`UPDATE ja_users SET account_status = 'active', updated_at = NOW() WHERE id = ${userId}`);
      await logAdminAction(adminEmail, 'customer.activate', `Activated account for ${customerEmail}`, req);
      return res.json({ success: true, message: 'Account activated.' });
    }

    if (action === 'suspend') {
      await db.execute(sql`UPDATE ja_users SET account_status = 'suspended', updated_at = NOW() WHERE id = ${userId}`);
      await logAdminAction(adminEmail, 'customer.suspend', `Suspended account for ${customerEmail}`, req);
      return res.json({ success: true, message: 'Account suspended.' });
    }

    // ── Role assignment ───────────────────────────────────────────────────────

    if (action === 'set_role') {
      const VALID_ROLES = ['user', 'manager', 'admin'] as const;
      if (!body.role || !(VALID_ROLES as readonly string[]).includes(body.role)) {
        return res.status(400).json({ success: false, error: `Invalid role: ${body.role}` });
      }
      await db.execute(sql`UPDATE ja_users SET role = ${body.role}, updated_at = NOW() WHERE id = ${userId}`);
      await logAdminAction(adminEmail, 'customer.set_role', `Set role to ${body.role} for ${customerEmail}`, req);
      return res.json({ success: true, message: `Role set to ${body.role}.` });
    }

    if ((action === 'override_plan' || action === 'change_plan') && body.plan) {
      if (!(VALID_PLANS as readonly string[]).includes(body.plan)) {
        return res.status(400).json({ success: false, error: 'Invalid plan.' });
      }
      if (body.planExpiresAt) {
        await db.execute(sql`
          UPDATE ja_users SET plan = ${body.plan}, plan_is_lifetime = 0, plan_expires_at = ${new Date(body.planExpiresAt)} WHERE id = ${userId}
        `);
      } else {
        await db.execute(sql`
          UPDATE ja_users SET plan = ${body.plan}, plan_is_lifetime = 0, plan_expires_at = NULL WHERE id = ${userId}
        `);
      }
      await logAdminAction(adminEmail, 'customer.plan_override', `Set plan to ${body.plan} for ${customerEmail}`, req);
      return res.json({ success: true, message: `Plan set to ${body.plan}.` });
    }

    // Profile field updates
    const updates: Record<string, unknown> = {};
    if (body.firstName !== undefined) updates.firstName = body.firstName.trim();
    if (body.lastName  !== undefined) updates.lastName  = body.lastName.trim();
    if (body.email     !== undefined) updates.email     = body.email.trim().toLowerCase();
    if (body.company   !== undefined) updates.company   = body.company.trim() || null;
    if (body.usageType !== undefined) updates.usageType = body.usageType;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    await db.update(ja_users).set(updates).where(eq(ja_users.id, userId));
    await logAdminAction(adminEmail, 'customer.profile_update', `Updated profile for ${customerEmail}: ${Object.keys(updates).join(', ')}`, req);
    return res.json({ success: true, message: 'Customer updated.' });

  } catch (err) {
    console.error('admin.customer.patch.error', err);
    return res.status(500).json({ success: false, error: 'Failed to update customer.' });
  }
}

