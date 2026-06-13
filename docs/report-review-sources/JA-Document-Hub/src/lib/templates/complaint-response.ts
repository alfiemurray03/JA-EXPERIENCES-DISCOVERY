import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br } from './html-helpers';

export const complaintResponse: DocumentTemplate = {
  id: 'complaint-response',
  name: 'Customer Complaint Response',
  category: 'complaints',
  description: 'A professional response letter to a customer complaint, acknowledging the issue and setting out the resolution.',
  icon: 'MessageSquare',
  planRequired: 'free',
  tags: ['complaint', 'response', 'customer service', 'letter'],
  signatories: [{ label: 'Authorised Signatory' }],
  sections: [
    {
      id: 'sender',
      title: 'Your Details',
      fields: [
        { id: 'companyName', label: 'Company / Organisation Name', type: 'text', required: true },
        { id: 'signatoryName', label: 'Your Name', type: 'text', required: true },
        { id: 'signatoryTitle', label: 'Your Title / Role', type: 'text', required: false },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
      ],
    },
    {
      id: 'recipient',
      title: 'Customer Details',
      fields: [
        { id: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { id: 'customerAddress', label: 'Customer Address', type: 'textarea', required: false },
        { id: 'complaintRef', label: 'Complaint Reference Number', type: 'text', required: false },
        { id: 'complaintDate', label: 'Date of Original Complaint', type: 'date', required: false },
      ],
    },
    {
      id: 'response',
      title: 'Response Details',
      fields: [
        { id: 'complaintSummary', label: 'Summary of the Complaint', type: 'textarea', required: true, placeholder: 'Briefly describe the complaint received...' },
        { id: 'investigation', label: 'Investigation Findings', type: 'textarea', required: true, placeholder: 'What was found during the investigation...' },
        { id: 'outcome', label: 'Outcome / Decision', type: 'select', required: true, options: ['Complaint upheld', 'Complaint partially upheld', 'Complaint not upheld'] },
        { id: 'remedy', label: 'Remedy / Action Taken', type: 'textarea', required: false, placeholder: 'What action has been or will be taken...' },
        { id: 'apology', label: 'Include Apology?', type: 'select', required: false, options: ['Yes', 'No'] },
        { id: 'escalationInfo', label: 'Escalation / Appeal Information', type: 'textarea', required: false, placeholder: 'How the customer can escalate if dissatisfied...' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['From', `${or(data.signatoryName, '[Name]')}${data.signatoryTitle ? `, ${data.signatoryTitle}` : ''}, ${or(data.companyName, '[Company]')}`],
      ['To', or(data.customerName, '[Customer Name]')],
      ['Date', or(data.letterDate, '[Date]')],
      ['Complaint Reference', data.complaintRef],
      ['Original Complaint Date', data.complaintDate],
    ])),

    section('Response to Your Complaint',
      `<p>Dear <strong>${or(data.customerName, '[Customer Name]')}</strong>,</p>
      ${data.apology === 'Yes' ? '<p>Thank you for bringing this matter to our attention. We are sorry to hear about your experience and take all complaints very seriously.</p>' : '<p>Thank you for contacting us regarding your recent complaint. We have now completed our investigation and write to provide our response.</p>'}`
    ),

    section('Summary of Your Complaint',
      `<p>${nl2br(or(data.complaintSummary, '[Complaint summary]'))}</p>`
    ),

    section('Our Investigation',
      `<p>${nl2br(or(data.investigation, '[Investigation findings]'))}</p>`
    ),

    section('Our Decision',
      `<p><strong>Outcome: ${or(data.outcome, '[Outcome]')}</strong></p>` +
      (data.remedy ? `<p><strong>Action taken / remedy:</strong><br>${nl2br(data.remedy)}</p>` : '')
    ),

    data.escalationInfo ? section('If You Remain Dissatisfied',
      `<p>${nl2br(data.escalationInfo)}</p>`
    ) : section('If You Remain Dissatisfied',
      `<p>If you are not satisfied with this response, you may request a further review by writing to us within 28 days. You may also have the right to refer your complaint to an independent body or ombudsman relevant to our sector.</p>`
    ),

    section('Closing',
      `<p>We value your feedback and will use it to improve our services. If you have any further questions, please do not hesitate to contact us.</p>
      <p>Yours sincerely,<br><strong>${or(data.signatoryName, '[Name]')}</strong>${data.signatoryTitle ? `<br>${data.signatoryTitle}` : ''}<br>${or(data.companyName, '[Company Name]')}</p>`
    ),
  ].filter(Boolean).join(''),
};
