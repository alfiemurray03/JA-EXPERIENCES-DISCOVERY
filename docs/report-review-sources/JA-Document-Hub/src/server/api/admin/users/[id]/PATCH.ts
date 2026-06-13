/**
 * PATCH /api/admin/users/:id
 * Update, suspend, restore, or delete an admin account.
 * Platform Owner account cannot be modified via this endpoint.
 *
 * Body: { action: 'suspend' | 'restore' | 'delete' | 'update', ...fields }
 * Note: :id is the uuid string (e.g. "admin-abc12345")
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_admin_accounts } from '../../../../db/schema.js';
import { updateAdminAccount, deleteAdminAccount } from '../../auth/_store.js';
import { requireAdminRole } from '../../_require-role.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator']);
  if (!identity) return;

  try {
    const { id } = req.params;
    const { action, name, role } = req.body as {
      action: 'suspend' | 'restore' | 'delete' | 'update';
      name?: string;
      role?: string;
    };

    // Look up by uuid
    const rows = await db
      .select()
      .from(ja_admin_accounts)
      .where(eq(ja_admin_accounts.uuid, String(id)))
      .limit(1);

    const admin = rows[0];
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    if (admin.isPlatformOwner) {
      return res.status(403).json({ success: false, error: 'The Platform Owner account cannot be modified via this endpoint.' });
    }

    if (action === 'delete') {
      await deleteAdminAccount(admin.id);
      await logAdminAction(identity.email, 'admin_user.deleted', `Deleted admin account ${admin.email}`, req);
      return res.json({ success: true });
    }

    if (action === 'suspend') {
      await updateAdminAccount(admin.id, { suspended: true });
      await logAdminAction(identity.email, 'admin_user.suspended', `Suspended admin account ${admin.email}`, req);
      return res.json({ success: true });
    }

    if (action === 'restore') {
      await updateAdminAccount(admin.id, { suspended: false });
      await logAdminAction(identity.email, 'admin_user.restored', `Restored admin account ${admin.email}`, req);
      return res.json({ success: true });
    }

    if (action === 'update') {
      const updates: Parameters<typeof updateAdminAccount>[1] = {};
      if (name) updates.name = name.trim();
      if (role) updates.role = role;
      await updateAdminAccount(admin.id, updates);
      await logAdminAction(identity.email, 'admin_user.updated', `Updated admin account ${admin.email}`, req);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('admin.users.patch.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
