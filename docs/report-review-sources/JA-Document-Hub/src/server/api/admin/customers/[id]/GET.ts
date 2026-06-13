/**
 * GET /api/admin/customers/:id
 *
 * Full customer profile: user record (all fields) + subscription + document stats.
 */
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_users, ja_stripe_subscriptions, ja_documents } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) {
    return res.status(401).json({
      success: false,
      error: 'Admin session required.',
      code: 'NOT_AUTHENTICATED',
    });
  }

  const { id } = req.params;
  try {
    const users = await db
      .select()
      .from(ja_users)
      .where(sql`uuid = ${id}`)
      .limit(1);

    if (!users.length) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }
    const user = users[0];

    // Subscription
    const subs = await db
      .select()
      .from(ja_stripe_subscriptions)
      .where(sql`user_id = ${user.id}`)
      .limit(1);
    const subscription = subs[0] ?? null;

    // Document stats
    const docStats = await db
      .select({
        total:     sql<number>`COUNT(*)`,
        drafts:    sql<number>`SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END)`,
        archived:  sql<number>`SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END)`,
      })
      .from(ja_documents)
      .where(sql`user_id = ${user.id}`);

    // Recent documents (last 10)
    const recentDocs = await db
      .select({
        uuid:       ja_documents.uuid,
        title:      ja_documents.title,
        templateId: ja_documents.templateId,
        status:     ja_documents.status,
        createdAt:  ja_documents.createdAt,
        updatedAt:  ja_documents.updatedAt,
      })
      .from(ja_documents)
      .where(sql`user_id = ${user.id}`)
      .orderBy(sql`updated_at DESC`)
      .limit(10);

    return res.json({
      success: true,
      customer: {
        // Identity
        id:           user.uuid,
        email:        user.email,
        displayName:  user.displayName ?? null,
        firstName:    user.firstName,
        lastName:     user.lastName,
        company:      user.company ?? null,
        photoUrl:     user.photoUrl ?? null,

        // Microsoft Entra
        oidcSub:    user.oidcSub ?? null,
        tenantId:   user.tenantId ?? null,
        authMethod: user.authMethod ?? 'oidc',

        // App permissions
        role:          user.role ?? 'user',
        accountStatus: user.accountStatus ?? 'active',

        // Billing
        plan:           user.plan,
        usageType:      user.usageType ?? null,
        isVerified:     user.isVerified,
        planIsLifetime: user.planIsLifetime,
        planExpiresAt:  user.planExpiresAt ?? null,

        // Timestamps
        createdAt: user.createdAt,
        updatedAt: user.updatedAt ?? null,
        lastLogin: user.lastLogin ?? null,
      },
      subscription: subscription ? {
        stripeCustomerId:     subscription.stripeCustomerId ?? null,
        stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
        stripePriceId:        subscription.stripePriceId ?? null,
        status:               subscription.status,
        trialStart:           subscription.trialStart ?? null,
        trialEnd:             subscription.trialEnd ?? null,
        currentPeriodStart:   subscription.currentPeriodStart ?? null,
        currentPeriodEnd:     subscription.currentPeriodEnd ?? null,
        cancelAtPeriodEnd:    subscription.cancelAtPeriodEnd,
      } : null,
      documents: {
        total:     Number(docStats[0]?.total ?? 0),
        drafts:    Number(docStats[0]?.drafts ?? 0),
        completed: Number(docStats[0]?.completed ?? 0),
        archived:  Number(docStats[0]?.archived ?? 0),
        recent:    recentDocs,
      },
    });
  } catch (err) {
    console.error('admin.customer.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load customer profile.' });
  }
}
