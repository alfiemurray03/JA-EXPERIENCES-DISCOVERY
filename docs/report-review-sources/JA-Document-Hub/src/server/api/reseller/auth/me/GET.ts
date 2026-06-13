import type { Request, Response } from 'express';
import { resolveResellerSession } from '../../_session.js';

export default async function handler(req: Request, res: Response) {
  const reseller = await resolveResellerSession(req);
  if (!reseller) return res.status(401).json({ success: false, error: 'Not authenticated.' });
  return res.json({
    success: true,
    reseller: {
      uuid: reseller.uuid,
      fullName: reseller.fullName,
      email: reseller.email,
      company: reseller.company,
      status: reseller.status,
      referralCode: reseller.referralCode,
      referralLink: reseller.referralLink,
      commissionType: reseller.commissionType,
      commissionRate: reseller.commissionRate,
      commissionRecurring: reseller.commissionRecurring,
      notifyNewSignup: reseller.notifyNewSignup,
      notifyCommission: reseller.notifyCommission,
      notifyAnnouncements: reseller.notifyAnnouncements,
    },
  });
}
