import type { DocumentTemplate } from '../document-types';
import { section, infoTable, clause, or } from './html-helpers';

export const complaintsPolicy: DocumentTemplate = {
  id: 'complaints-policy',
  name: 'Complaints Policy',
  category: 'policies',
  description: 'A formal complaints handling policy for businesses, setting out how complaints are received, investigated, and resolved.',
  icon: 'MessageSquare',
  planRequired: 'free',
  tags: ['complaints', 'policy', 'customer service', 'procedure'],
  signatories: [{ label: 'Authorised Signatory' }],
  sections: [
    {
      id: 'organisation',
      title: 'Organisation Details',
      fields: [
        { id: 'companyName', label: 'Organisation / Company Name', type: 'text', required: true },
        { id: 'contactEmail', label: 'Complaints Contact Email', type: 'email', required: false },
        { id: 'contactPhone', label: 'Complaints Contact Phone', type: 'phone', required: false },
        { id: 'contactAddress', label: 'Complaints Contact Address', type: 'textarea', required: false },
        { id: 'effectiveDate', label: 'Policy Effective Date', type: 'date', required: true },
        { id: 'reviewDate', label: 'Next Review Date', type: 'date', required: false },
      ],
    },
    {
      id: 'procedure',
      title: 'Complaints Procedure',
      fields: [
        { id: 'stage1', label: 'Stage 1 — Initial Response', type: 'textarea', required: false, placeholder: 'e.g. We will acknowledge your complaint within 2 working days...' },
        { id: 'stage2', label: 'Stage 2 — Investigation', type: 'textarea', required: false, placeholder: 'e.g. A full investigation will be completed within 10 working days...' },
        { id: 'stage3', label: 'Stage 3 — Final Response', type: 'textarea', required: false, placeholder: 'e.g. A final written response will be issued within 20 working days...' },
        { id: 'escalation', label: 'Escalation / External Bodies', type: 'textarea', required: false, placeholder: 'e.g. If you remain dissatisfied, you may refer your complaint to...' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Policy Information', infoTable([
      ['Organisation', or(data.companyName, '[Organisation Name]')],
      ['Complaints Email', data.contactEmail],
      ['Complaints Phone', data.contactPhone],
      ['Effective Date', or(data.effectiveDate, '[Date]')],
      ['Next Review Date', data.reviewDate],
    ])),

    section('Our Commitment',
      `<p><strong>${or(data.companyName, '[Organisation Name]')}</strong> is committed to providing a high-quality service. We take all complaints seriously and aim to resolve them promptly, fairly, and effectively.</p>
      <p>This policy sets out how we handle complaints and what you can expect from us.</p>`
    ),

    section('How to Make a Complaint',
      `<p>You can submit a complaint by:</p>
      <ul>
        ${data.contactEmail ? `<li><strong>Email:</strong> ${data.contactEmail}</li>` : ''}
        ${data.contactPhone ? `<li><strong>Phone:</strong> ${data.contactPhone}</li>` : ''}
        ${data.contactAddress ? `<li><strong>Post:</strong> ${data.contactAddress.replace(/\n/g, ', ')}</li>` : ''}
        <li><strong>In person</strong> at our premises</li>
      </ul>
      <p>Please provide your name, contact details, a clear description of your complaint, and any relevant dates or reference numbers.</p>`
    ),

    section('Our Complaints Procedure',
      clause('Stage 1', data.stage1 || 'We will acknowledge receipt of your complaint within 2 working days of receiving it.') +
      clause('Stage 2', data.stage2 || 'We will investigate your complaint thoroughly and aim to provide a full response within 10 working days.') +
      clause('Stage 3', data.stage3 || 'If you are not satisfied with our initial response, you may request a review. A final written response will be issued within 20 working days of your original complaint.')
    ),

    data.escalation ? section('Escalation & External Bodies', `<p>${data.escalation.replace(/\n/g, '<br>')}</p>`) : '',

    section('Confidentiality',
      `<p>All complaints will be handled confidentially and in accordance with our Privacy Policy and data protection obligations.</p>`
    ),

    section('Policy Review',
      `<p>This policy will be reviewed${data.reviewDate ? ` on ${data.reviewDate}` : ' annually'} to ensure it remains effective and up to date.</p>`
    ),
  ].filter(Boolean).join(''),
};
