/**
 * POST /api/quote-request
 * Receives a quote request and emails it to the studio + sends a confirmation to the customer.
 * Generates a unique reference number (e.g. JA-2026-4821) for cross-matching.
 * If files are large, they are NOT attached — the customer is instructed to email them separately
 * quoting the reference number.
 * No database — purely email-based.
 */
import type { Request, Response } from 'express';
import { sendEmail } from '@/server/email.js';
import { getSecret } from '#airo/secrets';

const DESIGN_LABELS: Record<string, string> = {
  none: 'I have print-ready artwork',
  minor: 'Minor edits needed',
  full: 'Full design needed',
};

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JA-${year}-${rand}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const {
      name, email, phone,
      product, quantity, size, finish, sides, paperStock,
      designSupport, deadline, notes,
      files = [],
      filesAreLarge = false,
    } = req.body as {
      name: string; email: string; phone?: string;
      product: string; quantity?: string; size?: string; finish?: string;
      sides?: string; paperStock?: string; designSupport?: string;
      deadline?: string; notes?: string;
      filesAreLarge?: boolean;
      files?: Array<{ name: string; size: number; mimeType: string; data: string }>;
    };

    if (!product?.trim()) return res.status(400).json({ error: 'Product is required' });
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    const reference = generateReference();

    const notificationEmail = getSecret('NOTIFICATION_EMAIL') as string | undefined;
    const studioEmail = notificationEmail || 'Hello@jagroupservices.co.uk';

    const row = (label: string, value?: string) =>
      value ? `<tr><td style="padding:6px 0;color:#666;width:140px;vertical-align:top">${label}</td><td style="padding:6px 0;font-weight:500">${value}</td></tr>` : '';

    // Build file section for studio email
    let fileSection = '';
    if (filesAreLarge && files.length > 0) {
      const fileList = files.map(f => {
        const mb = f.size / (1024 * 1024);
        const sizeStr = mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : mb >= 1 ? `${mb.toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`;
        return `<li>${f.name} (${sizeStr})</li>`;
      }).join('');
      fileSection = `
        <div style="margin-top:20px;padding:16px;background:#fffbe6;border:1px solid #f0d060;border-radius:4px">
          <p style="margin:0 0 8px;font-weight:bold;font-size:14px;color:#b45309">⚠ Files too large to attach — customer will email separately</p>
          <p style="margin:0 0 8px;font-size:13px;color:#555">When the customer emails their files, the subject will include reference <strong>${reference}</strong>.</p>
          <p style="margin:0 0 4px;font-size:13px;color:#666">Files listed (${files.length}):</p>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#444">${fileList}</ul>
        </div>`;
    } else if (files.length > 0) {
      const fileList = files.map(f => `<li>${f.name}</li>`).join('');
      fileSection = `<p style="margin:16px 0 4px;color:#666;font-size:13px">Attached files (${files.length}):</p><ul style="margin:0;padding-left:20px;color:#444;font-size:13px">${fileList}</ul>`;
    }

    const studioHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111">
        <div style="background:#0047FF;padding:20px 28px;display:flex;justify-content:space-between;align-items:center">
          <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px">JA PRINT STUDIO — New Quote Request</h1>
          <span style="background:#fff;color:#0047FF;font-weight:bold;font-size:15px;padding:4px 12px;border-radius:4px;letter-spacing:1px">${reference}</span>
        </div>
        <div style="padding:28px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${row('Reference', reference)}
            ${row('Name', name)}
            ${row('Email', `<a href="mailto:${email}">${email}</a>`)}
            ${row('Phone', phone)}
            <tr><td colspan="2" style="padding:8px 0"><hr style="border:none;border-top:1px solid #eee"/></td></tr>
            ${row('Product', product)}
            ${row('Quantity', quantity)}
            ${row('Size', size)}
            ${row('Finish', finish)}
            ${row('Sides', sides)}
            ${row('Paper Stock', paperStock)}
            ${row('Deadline', deadline)}
            ${row('Design Support', designSupport ? DESIGN_LABELS[designSupport] || designSupport : undefined)}
            ${row('Notes', notes)}
          </table>
          ${fileSection}
          <div style="margin-top:24px;padding:14px;background:#f0f4ff;border-radius:4px;font-size:13px;color:#555">
            Reply directly to this email to respond to <strong>${name}</strong> at <a href="mailto:${email}">${email}</a>.
          </div>
        </div>
      </div>
    `;

    // Build attachments from base64 files (only when files are small enough)
    const attachments = (!filesAreLarge && files.length > 0)
      ? files.slice(0, 5).map(f => ({
          filename: f.name,
          content: Buffer.from(f.data, 'base64'),
          contentType: f.mimeType,
        }))
      : undefined;

    // Studio email
    await sendEmail({
      to: studioEmail,
      replyTo: email,
      subject: `[${reference}] New quote — ${product} from ${name}`,
      html: studioHtml,
      text: `[${reference}] New quote request from ${name} (${email}).\nProduct: ${product}\n${quantity ? `Quantity: ${quantity}\n` : ''}${filesAreLarge ? `\nFiles will be emailed separately by customer — reference: ${reference}` : ''}${notes ? `\nNotes: ${notes}` : ''}`,
      attachments,
    });

    // Customer confirmation
    const customerFilesNote = filesAreLarge && files.length > 0
      ? `
        <div style="margin:20px 0;padding:16px;background:#fffbe6;border:1px solid #f0d060;border-radius:4px">
          <p style="margin:0 0 8px;font-weight:bold;font-size:14px;color:#b45309">Next step: send your artwork files</p>
          <p style="margin:0 0 10px;font-size:13px;color:#555">
            Your files were too large to attach here. Please email them to us and we'll match them to your request instantly using your reference number.
          </p>
          <table style="font-size:13px;color:#444">
            <tr><td style="padding:3px 12px 3px 0;color:#888">Email to:</td><td><strong>Hello@jagroupservices.co.uk</strong></td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#888">Subject:</td><td><strong>Artwork for ${reference} — ${product}</strong></td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#888">Include:</td><td>Your reference <strong>${reference}</strong> in the email body</td></tr>
          </table>
        </div>`
      : '';

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <div style="background:#0047FF;padding:20px 28px">
          <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px">JA PRINT STUDIO</h1>
        </div>
        <div style="padding:28px">
          <h2 style="margin:0 0 12px;font-size:22px">Thanks, ${name}!</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">
            We've received your quote request for <strong>${product}</strong>. Our team will review it and get back to you within <strong>one business day</strong>.
          </p>

          <div style="margin:20px 0;padding:16px;background:#f0f4ff;border:2px solid #0047FF;border-radius:4px;text-align:center">
            <p style="margin:0 0 4px;font-size:12px;color:#666;letter-spacing:1px;text-transform:uppercase">Your Reference Number</p>
            <p style="margin:0;font-size:28px;font-weight:bold;color:#0047FF;letter-spacing:3px">${reference}</p>
            <p style="margin:6px 0 0;font-size:12px;color:#888">Quote this in any emails to us so we can match your files and correspondence instantly.</p>
          </div>

          ${customerFilesNote}

          <div style="margin:20px 0;padding:14px;border:1px solid #e5e5e5;border-radius:4px;font-size:13px">
            <table style="width:100%;border-collapse:collapse">
              ${row('Product', product)}
              ${row('Quantity', quantity)}
              ${row('Finish', finish)}
              ${row('Deadline', deadline)}
            </table>
          </div>

          <p style="color:#555;font-size:14px;line-height:1.6">
            Questions? Just reply to this email or contact us at
            <a href="mailto:Hello@jagroupservices.co.uk" style="color:#0047FF">Hello@jagroupservices.co.uk</a>.
            Always include your reference <strong>${reference}</strong>.
          </p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">
            JA Print Studio — operated by JA Group Services Ltd.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `[${reference}] Quote request received — ${product} | JA Print Studio`,
      html: customerHtml,
      text: `Hi ${name},\n\nThanks for your quote request for ${product}.\n\nYour reference number: ${reference}\n\nPlease quote this reference in any emails to us — especially when sending artwork files.\n${filesAreLarge && files.length > 0 ? `\nTo send your artwork files, email them to Hello@jagroupservices.co.uk with subject: "Artwork for ${reference} — ${product}"\n` : ''}\nWe'll get back to you within one business day.\n\nJA Print Studio`,
    }).catch((err) => console.error('[email] customer confirmation failed:', err));

    return res.json({ success: true, reference });
  } catch (error) {
    console.error('POST /api/quote-request error:', error);
    return res.status(500).json({ error: 'Failed to send request', message: String(error) });
  }
}
