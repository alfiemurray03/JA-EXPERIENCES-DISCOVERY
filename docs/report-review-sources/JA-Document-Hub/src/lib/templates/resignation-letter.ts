import type { DocumentTemplate } from '../document-types';
import { section, or, fmtDate, divider } from './html-helpers';

export const resignationLetter: DocumentTemplate = {
  id: 'resignation-letter',
  name: 'Resignation Letter',
  category: 'hr',
  description: 'A professional resignation letter to formally notify your employer of your intention to leave.',
  icon: 'LogOut',
  planRequired: 'free',
  tags: ['resignation', 'letter', 'hr', 'employment', 'notice'],
  signatories: [{ label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Your Details',
      fields: [
        { id: 'employeeName',   label: 'Your Full Name',          type: 'text',  required: true },
        { id: 'jobTitle',       label: 'Your Job Title',          type: 'text',  required: false },
        { id: 'department',     label: 'Department',              type: 'text',  required: false },
        { id: 'managerName',    label: 'Manager / Recipient Name', type: 'text', required: true },
        { id: 'companyName',    label: 'Company Name',            type: 'text',  required: true },
        { id: 'letterDate',     label: 'Letter Date',             type: 'date',  required: true },
        { id: 'lastWorkingDay', label: 'Last Working Day',        type: 'date',  required: true },
        { id: 'noticePeriod',   label: 'Notice Period',           type: 'text',  required: false,
          placeholder: 'e.g. 4 weeks' },
      ],
    },
    {
      id: 'content',
      title: 'Letter Content',
      fields: [
        { id: 'reason',          label: 'Reason for Leaving (optional)',    type: 'textarea', required: false,
          placeholder: 'Brief reason — or leave blank for a neutral letter' },
        { id: 'gratitude',       label: 'Positive Remarks (optional)',      type: 'textarea', required: false,
          placeholder: 'e.g. I have greatly valued my time here and the opportunities provided.' },
        { id: 'handoverOffer',   label: 'Handover Offer',                   type: 'select',   required: false,
          options: ['Yes — I am happy to assist with handover', 'No specific offer'] },
        { id: 'contactDetails',  label: 'Contact Details After Leaving',    type: 'text',     required: false,
          placeholder: 'e.g. email@example.com' },
      ],
    },
  ],
  generateDocument: (data) => {
    const employeeName   = or(data.employeeName,   '[Employee Name]');
    const managerName    = or(data.managerName,    '[Manager Name]');
    const companyName    = or(data.companyName,    '[Company Name]');
    const lastWorkingDay = fmtDate(data.lastWorkingDay);

    return [

      /* Header block */
      `<div style="margin-bottom:20px;">
        <p style="font-weight:700;font-size:10.5pt;margin:0 0 2px 0;">${employeeName}</p>
        ${data.jobTitle ? `<p style="font-size:9.5pt;color:#374151;margin:0 0 1px 0;">${data.jobTitle}${data.department ? ` — ${data.department}` : ''}</p>` : ''}
        <p style="font-size:9pt;color:#6b7280;margin:6px 0 0 0;">${fmtDate(data.letterDate)}</p>
      </div>`,

      /* Recipient */
      `<div style="margin-bottom:20px;">
        <p style="font-weight:700;font-size:10pt;margin:0 0 2px 0;">${managerName}</p>
        <p style="font-size:9.5pt;color:#374151;margin:0;">${companyName}</p>
      </div>`,

      /* Subject */
      `<p style="font-weight:700;font-size:10.5pt;margin:0 0 16px 0;text-decoration:underline;">
        Re: Resignation — ${data.jobTitle || 'Notice of Resignation'}
      </p>`,

      /* Opening */
      `<p>Dear <strong>${managerName}</strong>,</p>`,

      /* Resignation statement */
      `<p>I am writing to formally notify you of my resignation from my position as <strong>${data.jobTitle || 'my current role'}</strong> at <strong>${companyName}</strong>.</p>`,

      /* Notice period */
      data.noticePeriod
        ? `<p>In accordance with my notice period of <strong>${data.noticePeriod}</strong>, my last working day will be <strong>${lastWorkingDay}</strong>.</p>`
        : `<p>My last working day will be <strong>${lastWorkingDay}</strong>.</p>`,

      /* Reason */
      data.reason
        ? section('Reason for Leaving', `<p>${data.reason}</p>`)
        : '',

      /* Gratitude */
      data.gratitude
        ? `<p>${data.gratitude}</p>`
        : `<p>I have valued my time at ${companyName} and am grateful for the opportunities and experiences I have gained during my employment.</p>`,

      /* Handover */
      data.handoverOffer === 'Yes — I am happy to assist with handover'
        ? `<p>I am committed to ensuring a smooth transition and am happy to assist with the handover of my responsibilities, training a replacement, and completing any outstanding work before my departure.</p>`
        : '',

      /* Contact */
      data.contactDetails
        ? `<p>After my last working day, I can be reached at: <strong>${data.contactDetails}</strong>.</p>`
        : '',

      /* Close */
      `<p>I wish ${companyName} and my colleagues every success in the future.</p>`,

      divider(),

      `<p style="margin-top:16px;">Yours sincerely,</p>
      <p style="margin-top:32px;"><strong>${employeeName}</strong>${data.jobTitle ? `<br>${data.jobTitle}` : ''}</p>`,

    ].filter(Boolean).join('');
  },
};
