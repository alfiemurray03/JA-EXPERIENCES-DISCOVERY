/**
 * Platform notification helpers.
 * Sends admin email notifications for key events.
 * All calls are fire-and-forget — never throws to the caller.
 */
import { sendEmail } from '../email.js';
import { getSecret } from '#airo/secrets';

function adminEmail(): string | null {
  try {
    const v = getSecret('ADMIN_NOTIFICATION_EMAIL');
    return typeof v === 'string' && v.includes('@') ? v : null;
  } catch {
    return null;
  }
}

function safe(fn: () => Promise<void>): void {
  fn().catch(err => console.error('[notify]', err instanceof Error ? err.message : err));
}

// ── New message received ────────────────────────────────────────────────────
export function notifyNewMessage(opts: {
  senderName: string;
  senderEmail?: string;
  recipientUsername: string;
  preview: string;
  threadId: number;
}): void {
  const to = adminEmail();
  if (!to) return;
  safe(async () => {
    await sendEmail({
      to,
      subject: `💬 New message from ${opts.senderName} — JA Smart Profile`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#3b82f6;margin-top:0">New Message Received</h2>
          <p><strong>From:</strong> ${opts.senderName}${opts.senderEmail ? ` &lt;${opts.senderEmail}&gt;` : ''}</p>
          <p><strong>To profile:</strong> @${opts.recipientUsername}</p>
          <p><strong>Preview:</strong></p>
          <blockquote style="border-left:3px solid #3b82f6;margin:0;padding:8px 16px;color:#94a3b8">${opts.preview.slice(0, 200)}</blockquote>
          <p style="margin-top:24px">
            <a href="https://jasmartprofile.jagroupservices.co.uk/dashboard/messages" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Dashboard</a>
          </p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `New message from ${opts.senderName}${opts.senderEmail ? ` <${opts.senderEmail}>` : ''} to @${opts.recipientUsername}:\n\n${opts.preview.slice(0, 200)}\n\nView: https://jasmartprofile.jagroupservices.co.uk/dashboard/messages`,
    });
  });
}

// ── New user signup ─────────────────────────────────────────────────────────
export function notifyNewSignup(opts: {
  userName: string;
  userEmail: string;
  userId: number;
  isReferral?: boolean;
  referralCode?: string;
}): void {
  const to = adminEmail();
  if (!to) return;
  safe(async () => {
    await sendEmail({
      to,
      subject: `🎉 New signup: ${opts.userName} — JA Smart Profile`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#3b82f6;margin-top:0">New User Registered</h2>
          <p><strong>Name:</strong> ${opts.userName}</p>
          <p><strong>Email:</strong> ${opts.userEmail}</p>
          <p><strong>User ID:</strong> #${opts.userId}</p>
          ${opts.isReferral ? `<p><strong>Referred via:</strong> ${opts.referralCode ?? 'referral link'}</p>` : ''}
          <p style="margin-top:24px">
            <a href="https://jasmartprofile.jagroupservices.co.uk/admin/users" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin</a>
          </p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `New signup: ${opts.userName} <${opts.userEmail}> (ID #${opts.userId})${opts.isReferral ? ` via referral ${opts.referralCode}` : ''}\n\nAdmin: https://jasmartprofile.jagroupservices.co.uk/admin/users`,
    });
  });
}

// ── Plan change ─────────────────────────────────────────────────────────────
export function notifyPlanChange(opts: {
  userName: string;
  userEmail: string;
  userId: number;
  fromPlan: string;
  toPlan: string;
  action: 'upgrade' | 'downgrade' | 'cancel' | 'lifetime_granted' | 'lifetime_revoked';
}): void {
  const to = adminEmail();
  if (!to) return;
  const actionLabels: Record<string, string> = {
    upgrade: '⬆️ Plan Upgraded',
    downgrade: '⬇️ Plan Downgraded',
    cancel: '❌ Subscription Cancelled',
    lifetime_granted: '♾️ Lifetime Access Granted',
    lifetime_revoked: '🔄 Lifetime Access Revoked',
  };
  const label = actionLabels[opts.action] ?? 'Plan Changed';
  safe(async () => {
    await sendEmail({
      to,
      subject: `${label}: ${opts.userName} — JA Smart Profile`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#3b82f6;margin-top:0">${label}</h2>
          <p><strong>User:</strong> ${opts.userName} &lt;${opts.userEmail}&gt;</p>
          <p><strong>User ID:</strong> #${opts.userId}</p>
          <p><strong>From:</strong> ${opts.fromPlan}</p>
          <p><strong>To:</strong> ${opts.toPlan}</p>
          <p style="margin-top:24px">
            <a href="https://jasmartprofile.jagroupservices.co.uk/admin/users" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin</a>
          </p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `${label}: ${opts.userName} <${opts.userEmail}> (ID #${opts.userId})\nFrom: ${opts.fromPlan} → To: ${opts.toPlan}\n\nAdmin: https://jasmartprofile.jagroupservices.co.uk/admin/users`,
    });
  });
}

// ── Support request ─────────────────────────────────────────────────────────
export function notifySupportRequest(opts: {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
}): void {
  const to = adminEmail();
  if (!to) return;
  safe(async () => {
    await sendEmail({
      to,
      subject: `🆘 Support Request: ${opts.subject} — JA Smart Profile`,
      replyTo: opts.userEmail,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#3b82f6;margin-top:0">New Support Request</h2>
          <p><strong>From:</strong> ${opts.userName} &lt;${opts.userEmail}&gt;</p>
          <p><strong>Subject:</strong> ${opts.subject}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #3b82f6;margin:0;padding:8px 16px;color:#94a3b8">${opts.message.slice(0, 1000)}</blockquote>
          <p style="margin-top:24px">
            <a href="https://jasmartprofile.jagroupservices.co.uk/admin/support-requests" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin</a>
          </p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `Support request from ${opts.userName} <${opts.userEmail}>\nSubject: ${opts.subject}\n\n${opts.message.slice(0, 1000)}\n\nAdmin: https://jasmartprofile.jagroupservices.co.uk/admin/support-requests`,
    });
  });
}

// ── User paused/unpaused ────────────────────────────────────────────────────
export function notifyUserPaused(opts: {
  userName: string;
  userEmail: string;
  userId: number;
  paused: boolean;
  reason?: string;
}): void {
  const to = adminEmail();
  if (!to) return;
  safe(async () => {
    await sendEmail({
      to,
      subject: `${opts.paused ? '⏸️ Account Paused' : '▶️ Account Unpaused'}: ${opts.userName} — JA Smart Profile`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#3b82f6;margin-top:0">${opts.paused ? 'Account Paused' : 'Account Unpaused'}</h2>
          <p><strong>User:</strong> ${opts.userName} &lt;${opts.userEmail}&gt;</p>
          <p><strong>User ID:</strong> #${opts.userId}</p>
          ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ''}
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `Account ${opts.paused ? 'paused' : 'unpaused'}: ${opts.userName} <${opts.userEmail}> (ID #${opts.userId})${opts.reason ? `\nReason: ${opts.reason}` : ''}`,
    });
  });
}

// ── Issue report submitted ──────────────────────────────────────────────────
export function notifyIssueReport(opts: {
  id: number;
  name: string;
  email: string;
  issueType: string;
  subject: string | null;
  description: string;
  pageUrl: string | null;
}): void {
  const to = adminEmail();
  if (!to) return;
  safe(async () => {
    await sendEmail({
      to,
      subject: `🐛 Issue Report #${opts.id}: ${opts.issueType} — JA Smart Profile`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
          <h2 style="color:#f59e0b;margin-top:0">New Issue Report #${opts.id}</h2>
          <p><strong>From:</strong> ${opts.name} &lt;${opts.email}&gt;</p>
          <p><strong>Type:</strong> ${opts.issueType}</p>
          ${opts.subject ? `<p><strong>Subject:</strong> ${opts.subject}</p>` : ''}
          ${opts.pageUrl ? `<p><strong>Page:</strong> <a href="${opts.pageUrl}" style="color:#3b82f6">${opts.pageUrl}</a></p>` : ''}
          <p><strong>Description:</strong></p>
          <blockquote style="border-left:3px solid #f59e0b;margin:0;padding:8px 16px;color:#94a3b8;white-space:pre-wrap">${opts.description.slice(0, 1000)}</blockquote>
          <p style="margin-top:24px">
            <a href="https://jasmartprofile.jagroupservices.co.uk/admin/support-requests" style="background:#f59e0b;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin</a>
          </p>
          <p style="color:#64748b;font-size:12px;margin-top:24px">JA Smart Profile · JA Group Services</p>
        </div>
      `,
      text: `New issue report #${opts.id} from ${opts.name} <${opts.email}>\nType: ${opts.issueType}${opts.subject ? `\nSubject: ${opts.subject}` : ''}${opts.pageUrl ? `\nPage: ${opts.pageUrl}` : ''}\n\n${opts.description.slice(0, 500)}`,
    });
  });
}
