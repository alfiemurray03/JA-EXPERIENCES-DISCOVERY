/**
 * GET /api/auth/debug
 * Returns the exact redirect URIs used for token exchange.
 * These must be registered in Azure App Registrations.
 */
import type { Request, Response } from 'express';

export default function handler(_req: Request, res: Response) {
  const base = 'https://jabooking.jagroupservices.co.uk';
  res.json({
    customerRedirectUri: `${base}/auth/callback`,
    adminRedirectUri: `${base}/admin/auth/callback`,
    note: 'These URIs must be registered in Azure App Registrations → Authentication → Redirect URIs',
  });
}
