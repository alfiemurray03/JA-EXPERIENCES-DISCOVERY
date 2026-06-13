import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, notice, divider } from './html-helpers';

export const employmentOfferLetter: DocumentTemplate = {
  id: 'employment-offer-letter',
  name: 'Employment Offer Letter',
  category: 'hr',
  description: 'A formal offer of employment letter outlining the key terms and conditions of employment.',
  icon: 'Briefcase',
  planRequired: 'free',
  tags: ['employment', 'offer', 'hr', 'job'],
  signatories: [{ label: 'Authorised Signatory (Employer)' }, { label: 'Candidate Acceptance' }],
  sections: [
    {
      id: 'employer',
      title: 'Employer Details',
      fields: [
        { id: 'companyName',    label: 'Company Name',                  type: 'text',     required: true },
        { id: 'companyAddress', label: 'Company Address',               type: 'textarea', required: false },
        { id: 'hrContact',      label: 'HR Contact / Signatory Name',   type: 'text',     required: true },
        { id: 'hrTitle',        label: 'Signatory Job Title',           type: 'text',     required: false,
          placeholder: 'e.g. HR Manager' },
        { id: 'letterDate',     label: 'Letter Date',                   type: 'date',     required: true },
      ],
    },
    {
      id: 'candidate',
      title: 'Candidate Details',
      fields: [
        { id: 'candidateName',    label: 'Candidate Full Name',   type: 'text',     required: true },
        { id: 'candidateAddress', label: 'Candidate Address',     type: 'textarea', required: false },
      ],
    },
    {
      id: 'role',
      title: 'Role & Terms',
      fields: [
        { id: 'jobTitle',            label: 'Job Title',                    type: 'text',     required: true },
        { id: 'department',          label: 'Department',                   type: 'text',     required: false },
        { id: 'startDate',           label: 'Proposed Start Date',          type: 'date',     required: true },
        { id: 'salary',              label: 'Annual Salary',                type: 'text',     required: true,
          placeholder: 'e.g. £35,000 per annum' },
        { id: 'workingHours',        label: 'Working Hours',                type: 'text',     required: false,
          placeholder: 'e.g. 37.5 hours per week, Monday to Friday' },
        { id: 'workLocation',        label: 'Place of Work',                type: 'text',     required: false },
        { id: 'contractType',        label: 'Contract Type',                type: 'select',   required: false,
          options: ['Permanent', 'Fixed-Term', 'Part-Time', 'Zero Hours', 'Casual'] },
        { id: 'probationPeriod',     label: 'Probation Period',             type: 'text',     required: false,
          placeholder: 'e.g. 3 months' },
        { id: 'holidayEntitlement',  label: 'Holiday Entitlement',          type: 'text',     required: false,
          placeholder: 'e.g. 28 days per year including bank holidays' },
        { id: 'noticePeriod',        label: 'Notice Period',                type: 'text',     required: false,
          placeholder: 'e.g. 1 month on either side' },
        { id: 'additionalTerms',     label: 'Additional Terms or Benefits', type: 'textarea', required: false },
        { id: 'offerExpiry',         label: 'Offer Expiry Date',            type: 'date',     required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const companyName   = or(data.companyName,   '[Company Name]');
    const candidateName = or(data.candidateName, '[Candidate Name]');
    const jobTitle      = or(data.jobTitle,      '[Job Title]');
    const hrContact     = or(data.hrContact,     '[Signatory Name]');

    return [

      /* Sender block */
      `<div style="margin-bottom:20px;">
        <p style="font-weight:700;font-size:11pt;margin:0 0 2px 0;">${companyName}</p>
        ${data.companyAddress
          ? data.companyAddress.split('\n').filter(Boolean).map(l => `<p style="margin:0 0 1px 0;font-size:9.5pt;color:#374151;">${l}</p>`).join('')
          : ''}
        <p style="margin:6px 0 0 0;font-size:9pt;color:#6b7280;">${fmtDate(data.letterDate)}</p>
      </div>`,

      /* Recipient block */
      `<div style="margin-bottom:20px;">
        <p style="font-weight:700;font-size:10pt;margin:0 0 2px 0;">${candidateName}</p>
        ${data.candidateAddress
          ? data.candidateAddress.split('\n').filter(Boolean).map(l => `<p style="margin:0 0 1px 0;font-size:9.5pt;color:#374151;">${l}</p>`).join('')
          : ''}
      </div>`,

      /* Subject line */
      `<p style="font-weight:700;font-size:10.5pt;margin:0 0 16px 0;text-decoration:underline;">
        Re: Offer of Employment — ${jobTitle}
      </p>`,

      /* Opening */
      section('Offer of Employment',
        `<p>Dear <strong>${candidateName}</strong>,</p>
        <p>We are delighted to offer you the position of <strong>${jobTitle}</strong>${
          data.department ? ` within the <strong>${data.department}</strong> department` : ''
        } at <strong>${companyName}</strong>.</p>
        <p>This offer is subject to the terms and conditions set out below, and is conditional upon receipt of satisfactory references, proof of right to work in the UK, and any other pre-employment checks required by the company.</p>`
      ),

      /* Terms table */
      section('Terms of Employment', infoTable([
        ['Job Title',            jobTitle],
        ['Department',           data.department],
        ['Contract Type',        data.contractType],
        ['Proposed Start Date',  fmtDate(data.startDate)],
        ['Annual Salary',        or(data.salary, '[Salary]')],
        ['Working Hours',        data.workingHours],
        ['Place of Work',        data.workLocation],
        ['Probation Period',     data.probationPeriod],
        ['Holiday Entitlement',  data.holidayEntitlement],
        ['Notice Period',        data.noticePeriod],
      ])),

      /* Additional terms */
      data.additionalTerms
        ? section('Additional Terms & Benefits',
            `<p>${nl2br(data.additionalTerms)}</p>`)
        : '',

      /* Offer expiry notice */
      data.offerExpiry
        ? notice(`This offer will expire on <strong>${fmtDate(data.offerExpiry)}</strong> if not accepted in writing by that date.`, 'warning')
        : '',

      /* Acceptance */
      section('Acceptance',
        `<p>Please confirm your acceptance of this offer by signing and returning a copy of this letter${
          data.offerExpiry ? ` by <strong>${fmtDate(data.offerExpiry)}</strong>` : ' at your earliest convenience'
        }.</p>
        <p>A full written statement of employment particulars (contract of employment) will be provided on or before your first day of employment.</p>
        <p>We look forward to welcoming you to the team and are confident you will make a valuable contribution to ${companyName}.</p>`
      ),

      divider(),

      /* Sign-off */
      `<p style="margin-top:16px;">Yours sincerely,</p>
      <p style="margin-top:24px;"><strong>${hrContact}</strong>${data.hrTitle ? `<br>${data.hrTitle}` : ''}<br>${companyName}</p>`,

      /* Candidate acceptance */
      `<div style="margin-top:24px;padding:14px;background:#f8f9fb;border:1px solid #dde1e8;border-radius:4px;">
        <p style="font-weight:700;font-size:9.5pt;margin:0 0 8px 0;font-family:Arial,sans-serif;">Candidate Acceptance</p>
        <p style="font-size:9pt;margin:0 0 12px 0;color:#374151;">I, <strong>${candidateName}</strong>, accept the offer of employment as <strong>${jobTitle}</strong> at <strong>${companyName}</strong> on the terms set out above.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <div style="height:1px;background:#374151;margin-bottom:4px;margin-top:28px;"></div>
            <p style="font-size:8.5pt;color:#6b7280;margin:0;font-family:Arial,sans-serif;">Signature</p>
          </div>
          <div>
            <div style="height:1px;background:#374151;margin-bottom:4px;margin-top:28px;"></div>
            <p style="font-size:8.5pt;color:#6b7280;margin:0;font-family:Arial,sans-serif;">Date</p>
          </div>
        </div>
      </div>`,

    ].filter(Boolean).join('');
  },
};
