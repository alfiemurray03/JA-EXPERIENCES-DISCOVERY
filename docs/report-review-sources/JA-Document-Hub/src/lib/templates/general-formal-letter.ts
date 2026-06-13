import type { DocumentTemplate } from '../document-types';
import { or, nl2br, fmtDate } from './html-helpers';

export const generalFormalLetter: DocumentTemplate = {
  id: 'general-formal-letter',
  name: 'General Formal Letter',
  category: 'letters',
  description: 'A polished, professional formal letter with a full letterhead — suitable for complaints, requests, notices, or any formal correspondence.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['letter', 'formal', 'general', 'correspondence', 'letterhead'],
  signatories: [{ label: 'Sender' }],
  sections: [
    {
      id: 'sender',
      title: 'Your Details',
      fields: [
        { id: 'senderName',    label: 'Your Full Name',       type: 'text',     required: true },
        { id: 'senderTitle',   label: 'Your Job Title',       type: 'text',     required: false, placeholder: 'e.g. Director, Manager, Customer' },
        { id: 'senderOrg',    label: 'Organisation (if any)', type: 'text',     required: false },
        { id: 'senderAddress', label: 'Your Address',         type: 'textarea', required: false, placeholder: 'Line 1\nLine 2\nCity\nPostcode' },
        { id: 'senderEmail',   label: 'Your Email',           type: 'email',    required: false },
        { id: 'senderPhone',   label: 'Your Phone',           type: 'phone',    required: false },
        { id: 'letterDate',    label: 'Letter Date',          type: 'date',     required: true },
      ],
    },
    {
      id: 'recipient',
      title: 'Recipient Details',
      fields: [
        { id: 'recipientName',    label: 'Recipient Name / Title',    type: 'text',     required: true },
        { id: 'recipientOrg',     label: 'Organisation (if any)',     type: 'text',     required: false },
        { id: 'recipientAddress', label: 'Recipient Address',         type: 'textarea', required: false, placeholder: 'Line 1\nLine 2\nCity\nPostcode' },
      ],
    },
    {
      id: 'content',
      title: 'Letter Content',
      fields: [
        { id: 'subject',   label: 'Subject / Re:',       type: 'text',     required: true,  placeholder: 'e.g. Request for Information / Notice of Complaint' },
        { id: 'salutation',label: 'Salutation',          type: 'text',     required: false, placeholder: 'e.g. Dear Sir/Madam, Dear Mr Smith' },
        { id: 'opening',   label: 'Opening Paragraph',   type: 'textarea', required: true,  placeholder: 'I am writing to...' },
        { id: 'body',      label: 'Main Body',           type: 'textarea', required: true,  placeholder: 'Main content of your letter...' },
        { id: 'closing',   label: 'Closing Paragraph',   type: 'textarea', required: false, placeholder: 'I look forward to hearing from you...' },
        { id: 'signOff',   label: 'Sign Off',            type: 'select',   required: false, options: ['Yours sincerely', 'Yours faithfully', 'Kind regards', 'Yours truly', 'Best regards'] },
      ],
    },
  ],

  generateDocument: (data) => {
    const senderLines = [
      data.senderName    ? `<strong>${data.senderName}</strong>` : '',
      data.senderTitle   ? `<span style="color:#6b7280;">${data.senderTitle}</span>` : '',
      data.senderOrg     ? `<span style="color:#6b7280;">${data.senderOrg}</span>` : '',
      ...(data.senderAddress ?? '').split('\n').filter(Boolean).map(l => `<span>${l}</span>`),
      data.senderEmail   ? `<a href="mailto:${data.senderEmail}" style="color:inherit;text-decoration:none;">${data.senderEmail}</a>` : '',
      data.senderPhone   ? `<span>${data.senderPhone}</span>` : '',
    ].filter(Boolean);

    const recipientLines = [
      data.recipientName    ? `<strong>${data.recipientName}</strong>` : '',
      data.recipientOrg     ? `<span>${data.recipientOrg}</span>` : '',
      ...(data.recipientAddress ?? '').split('\n').filter(Boolean).map(l => `<span>${l}</span>`),
    ].filter(Boolean);

    const dateStr = fmtDate(data.letterDate);
    const salutation = data.salutation || `Dear ${or(data.recipientName, 'Sir/Madam')}`;
    const signOff = or(data.signOff, 'Yours sincerely');

    return `
<!-- LETTER BODY — rendered inside the layout's article wrapper -->

<!-- Sender + Date block -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;gap:24px;">
  <div style="font-size:9.5pt;line-height:1.7;color:#374151;display:flex;flex-direction:column;gap:1px;">
    ${senderLines.join('\n    ')}
  </div>
  <div style="text-align:right;font-size:9.5pt;color:#374151;white-space:nowrap;flex-shrink:0;">
    <p style="margin:0;">${dateStr}</p>
  </div>
</div>

<!-- Recipient block -->
<div style="margin-bottom:24px;font-size:9.5pt;line-height:1.7;color:#374151;display:flex;flex-direction:column;gap:1px;">
  ${recipientLines.join('\n  ')}
</div>

<!-- Subject line -->
<p style="font-size:10pt;font-weight:700;color:#1a1a1a;margin:0 0 20px 0;padding:8px 12px;background:#f0f4fa;border-left:3px solid #1B4F8A;border-radius:0 3px 3px 0;">
  Re: ${or(data.subject, '[Subject]')}
</p>

<!-- Letter body -->
<div style="font-size:10.5pt;line-height:1.7;color:#1a1a1a;">
  <p style="margin:0 0 14px 0;">${salutation},</p>
  <p style="margin:0 0 14px 0;">${nl2br(or(data.opening, '[Opening paragraph]'))}</p>
  <p style="margin:0 0 14px 0;">${nl2br(or(data.body, '[Main body]'))}</p>
  ${data.closing ? `<p style="margin:0 0 14px 0;">${nl2br(data.closing)}</p>` : ''}
  <p style="margin:0 0 40px 0;">${signOff},</p>
  <p style="margin:0;font-weight:700;">${or(data.senderName, '[Your Name]')}</p>
  ${data.senderTitle ? `<p style="margin:2px 0 0 0;font-size:9.5pt;color:#6b7280;">${data.senderTitle}</p>` : ''}
  ${data.senderOrg   ? `<p style="margin:2px 0 0 0;font-size:9.5pt;color:#6b7280;">${data.senderOrg}</p>` : ''}
</div>
`;
  },
};
