import { type Response } from 'express';
import QRCode from 'qrcode';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

export async function getQRCode(req: AuthRequest, res: Response) {
  try {
    const { profileId } = req.params;
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?').get(profileId, req.user!.id) as { username: string } | undefined;
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    // Use branding platform_url so QR codes always point to the correct live domain
    const brandingUrl = (db.prepare("SELECT value FROM admin_settings WHERE key = 'platform_url'").get() as { value: string } | undefined)?.value;
    const baseUrl = brandingUrl || process.env.PUBLIC_URL || process.env.SITE_URL || 'https://jasmartprofile.jagroupservices.co.uk';
    const profileUrl = `${baseUrl}/${profile.username}`;

    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    });

    res.json({ success: true, data: { qr_data_url: qrDataUrl, profile_url: profileUrl } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
}
