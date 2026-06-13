import type { Request, Response } from 'express';
import { sendEmail } from '@/server/email.js';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const { name, email, phone, subject, message } = req.body as {
      name?: string; email?: string; phone?: string; subject?: string; message?: string;
    };
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }

    const notificationEmail = getSecret('NOTIFICATION_EMAIL') as string | undefined;
    const studioEmail = notificationEmail || 'Hello@jagroupservices.co.uk';

    // Notify studio
    await sendEmail({
      to: studioEmail,
      replyTo: email,
      subject: `New enquiry from ${name}${subject ? ` — ${subject}` : ''} | JA Print Studio`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
          <div style="background:#0047FF;padding:20px 28px">
            <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px">JA PRINT STUDIO — New Enquiry</h1>
          </div>
          <div style="padding:28px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#666;width:100px">Name</td><td style="padding:6px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:6px 0;color:#666">Phone</td><td style="padding:6px 0">${phone}</td></tr>` : ''}
              ${subject ? `<tr><td style="padding:6px 0;color:#666">Subject</td><td style="padding:6px 0">${subject}</td></tr>` : ''}
            </table>
            <div style="background:#f5f5f5;border-radius:4px;padding:16px;margin-top:16px;font-size:14px;line-height:1.6;white-space:pre-wrap">${message}</div>
            <div style="margin-top:16px;padding:12px;background:#fffbe6;border-radius:4px;font-size:13px;color:#555">
              Reply directly to this email to respond to ${name} at <strong>${email}</strong>.
            </div>
          </div>
        </div>
      `,
      text: `New enquiry from ${name} (${email})${subject ? `\nSubject: ${subject}` : ''}${phone ? `\nPhone: ${phone}` : ''}\n\n${message}`,
    });

    // Confirmation to sender
    await sendEmail({
      to: email,
      subject: `We've received your message | JA Print Studio`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
          <div style="background:#0047FF;padding:20px 28px">
            <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px">JA PRINT STUDIO</h1>
          </div>
          <div style="padding:28px">
            <h2 style="margin:0 0 12px;font-size:20px">Thanks, ${name}!</h2>
            <p style="color:#555;font-size:14px;line-height:1.6">
              We've received your message and will get back to you as soon as possible.
            </p>
            <p style="color:#888;font-size:12px;margin-top:32px">
              JA Print Studio — operated by JA Group Services Ltd.
            </p>
          </div>
        </div>
      `,
      text: `Hi ${name},\n\nThanks for getting in touch. We've received your message and will get back to you soon.\n\nJA Print Studio`,
    }).catch((err) => console.error('[email] contact confirmation failed:', err));

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('POST /api/contact error:', error);
    return res.status(500).json({ error: 'Failed to send message', message: String(error) });
  }
}
