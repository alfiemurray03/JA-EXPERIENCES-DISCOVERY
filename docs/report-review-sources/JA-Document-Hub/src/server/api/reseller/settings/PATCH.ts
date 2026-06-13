import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_resellers, ja_reseller_audit } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    const {
      fullName, phone, company, website, vatNumber, businessType,
      payoutMethod, payoutDetails,
      notifyNewSignup, notifyCommission, notifyAnnouncements,
    } = req.body;

    await db.update(ja_resellers).set({
      fullName: fullName?.trim() ?? reseller.fullName,
      phone: phone?.trim() ?? reseller.phone,
      company: company?.trim() ?? reseller.company,
      website: website?.trim() ?? reseller.website,
      vatNumber: vatNumber?.trim() ?? reseller.vatNumber,
      businessType: businessType?.trim() ?? reseller.businessType,
      payoutMethod: payoutMethod?.trim() ?? reseller.payoutMethod,
      payoutDetails: payoutDetails !== undefined ? payoutDetails : reseller.payoutDetails,
      notifyNewSignup: notifyNewSignup !== undefined ? !!notifyNewSignup : reseller.notifyNewSignup,
      notifyCommission: notifyCommission !== undefined ? !!notifyCommission : reseller.notifyCommission,
      notifyAnnouncements: notifyAnnouncements !== undefined ? !!notifyAnnouncements : reseller.notifyAnnouncements,
      updatedAt: new Date(),
    }).where(eq(ja_resellers.id, reseller.id));

    await db.insert(ja_reseller_audit).values({
      resellerId: reseller.id,
      action: 'settings_updated',
      detail: 'Reseller updated their profile/settings.',
      ipAddress: req.ip ?? null,
    });

    return res.json({ success: true });
  });
}
