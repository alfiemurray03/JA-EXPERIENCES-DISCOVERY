import type { Request, Response } from 'express';
import { ja_resellers } from '../../../db/schema.js';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    return res.json({
      success: true,
      settings: {
        fullName: reseller.fullName,
        email: reseller.email,
        phone: reseller.phone,
        company: reseller.company,
        website: reseller.website,
        vatNumber: reseller.vatNumber,
        businessType: reseller.businessType,
        payoutMethod: reseller.payoutMethod,
        notifyNewSignup: reseller.notifyNewSignup,
        notifyCommission: reseller.notifyCommission,
        notifyAnnouncements: reseller.notifyAnnouncements,
      },
    });
  });
}
