/**
 * Consumer Documents batch
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, dataTable } from './html-helpers';
import { letterHeader, DISCLAIMER } from './template-factory';

function consumerLetter(opts: {
  id: string; name: string; description: string; icon: string; tags: string[];
  subject: string;
  bodyField: string;
  bodyLabel: string;
  extraFields?: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'date' | 'select' | 'email' | 'phone'; required: boolean; placeholder?: string; options?: string[] }>;
  generateBody: (data: Record<string, string>) => string;
}): DocumentTemplate {
  return {
    id: opts.id, name: opts.name, category: 'consumer', description: opts.description,
    icon: opts.icon, planRequired: 'free', tags: opts.tags,
    signatories: [{ label: 'Sender' }],
    sections: [
      {
        id: 'sender', title: 'Your Details',
        fields: [
          { id: 'senderName', label: 'Your Full Name', type: 'text', required: true },
          { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: false },
          { id: 'senderEmail', label: 'Your Email', type: 'email', required: false },
          { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        ],
      },
      {
        id: 'recipient', title: 'Recipient Details',
        fields: [
          { id: 'recipientName', label: 'Company / Recipient Name', type: 'text', required: true },
          { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: false },
          { id: 'refNumber', label: 'Reference / Order Number', type: 'text', required: false },
        ],
      },
      ...(opts.extraFields ? [{ id: 'extra', title: 'Details', fields: opts.extraFields }] : []),
      {
        id: 'content', title: 'Letter Content',
        fields: [{ id: opts.bodyField, label: opts.bodyLabel, type: 'textarea', required: true }],
      },
    ],
    generateDocument: (data) => [
      letterHeader(data),
      section(`Re: ${opts.subject}${data.refNumber ? ` — Ref: ${data.refNumber}` : ''}`,
        `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>` +
        opts.generateBody(data) +
        `<p>Yours faithfully,<br><strong>${or(data.senderName, '[Your Name]')}</strong></p>`
      ),
      DISCLAIMER,
    ].filter(Boolean).join(''),
  };
}

export const complaintLetter = consumerLetter({
  id: 'complaint-letter', name: 'Complaint Letter', description: 'A formal complaint letter to a company or organisation.',
  icon: 'AlertCircle', tags: ['complaint', 'consumer', 'letter'],
  subject: 'Formal Complaint', bodyField: 'complaintDetails', bodyLabel: 'Details of Your Complaint',
  generateBody: (data) => `<p>${nl2br(or(data.complaintDetails, '[Complaint details]'))}</p><p>I would be grateful for your response within 14 days.</p>`,
});

export const refundRequestLetter = consumerLetter({
  id: 'refund-request-letter', name: 'Refund Request Letter', description: 'A letter requesting a refund for goods or services.',
  icon: 'RotateCcw', tags: ['refund', 'consumer', 'letter'],
  subject: 'Refund Request',
  bodyField: 'refundDetails', bodyLabel: 'Details of Your Refund Request',
  extraFields: [
    { id: 'purchaseDate', label: 'Date of Purchase', type: 'date', required: false },
    { id: 'amount', label: 'Amount Paid', type: 'text', required: false },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.refundDetails, '[Refund details]'))}</p>` +
    (data.purchaseDate ? `<p>Date of purchase: ${data.purchaseDate}${data.amount ? `. Amount paid: ${data.amount}` : ''}.</p>` : '') +
    `<p>I request a full refund to be processed within 14 days.</p>`,
});

export const cancellationLetter = consumerLetter({
  id: 'cancellation-letter', name: 'Cancellation Letter', description: 'A letter cancelling a contract, subscription, or service.',
  icon: 'XCircle', tags: ['cancellation', 'consumer', 'letter'],
  subject: 'Notice of Cancellation',
  bodyField: 'cancellationDetails', bodyLabel: 'Details of What You Are Cancelling',
  extraFields: [
    { id: 'cancellationDate', label: 'Cancellation Effective Date', type: 'date', required: false },
  ],
  generateBody: (data) => `<p>I am writing to formally cancel ${nl2br(or(data.cancellationDetails, '[service/subscription/contract]'))}${data.cancellationDate ? ` with effect from ${data.cancellationDate}` : ' with immediate effect'}.</p><p>Please confirm receipt of this cancellation and provide written confirmation.</p>`,
});

export const formalRequestLetter = consumerLetter({
  id: 'formal-request-letter', name: 'Formal Request Letter', description: 'A formal letter making a request to a company or organisation.',
  icon: 'FileText', tags: ['request', 'formal', 'consumer', 'letter'],
  subject: 'Formal Request',
  bodyField: 'requestDetails', bodyLabel: 'Details of Your Request',
  generateBody: (data) => `<p>${nl2br(or(data.requestDetails, '[Request details]'))}</p><p>I would be grateful for your response at your earliest convenience.</p>`,
});

export const letterBeforeComplaint = consumerLetter({
  id: 'letter-before-complaint', name: 'Letter Before Complaint', description: 'A pre-action letter before escalating a complaint to a regulator or ombudsman.',
  icon: 'AlertTriangle', tags: ['pre-action', 'complaint', 'consumer', 'letter'],
  subject: 'Letter Before Complaint / Pre-Action Notice',
  bodyField: 'issueDetails', bodyLabel: 'Details of the Issue',
  extraFields: [
    { id: 'responseDeadline', label: 'Response Deadline', type: 'date', required: false },
    { id: 'escalationBody', label: 'Escalation Body (if no response)', type: 'text', required: false, placeholder: 'e.g. Financial Ombudsman Service, Trading Standards' },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.issueDetails, '[Issue details]'))}</p>` +
    `<p>I require a satisfactory response by <strong>${data.responseDeadline || '[date]'}</strong>. If I do not receive a satisfactory response, I will have no option but to escalate this matter${data.escalationBody ? ` to ${data.escalationBody}` : ' to the relevant regulatory body or ombudsman'}.</p>`,
});

export const consumerRightsComplaint = consumerLetter({
  id: 'consumer-rights-complaint', name: 'Consumer Rights Complaint', description: 'A complaint letter citing consumer rights under the Consumer Rights Act 2015.',
  icon: 'Scale', tags: ['consumer rights', 'complaint', 'CRA', 'letter'],
  subject: 'Consumer Rights Complaint — Consumer Rights Act 2015',
  bodyField: 'complaintDetails', bodyLabel: 'Details of Your Complaint',
  extraFields: [
    { id: 'purchaseDate', label: 'Date of Purchase', type: 'date', required: false },
    { id: 'productService', label: 'Product / Service', type: 'text', required: false },
    { id: 'remedy', label: 'Remedy Requested', type: 'select', required: false, options: ['Repair', 'Replacement', 'Full refund', 'Partial refund'] },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.complaintDetails, '[Complaint details]'))}</p>` +
    `<p>Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. I am entitled to ${data.remedy || 'a remedy'} in these circumstances.</p>` +
    `<p>I request that you resolve this matter within 14 days.</p>`,
});

export const deliveryIssueLetter = consumerLetter({
  id: 'delivery-issue-letter', name: 'Delivery Issue Letter', description: 'A letter reporting a delivery problem — late, missing, or damaged goods.',
  icon: 'Truck', tags: ['delivery', 'consumer', 'complaint', 'letter'],
  subject: 'Delivery Issue',
  bodyField: 'issueDetails', bodyLabel: 'Description of the Delivery Issue',
  extraFields: [
    { id: 'orderDate', label: 'Order Date', type: 'date', required: false },
    { id: 'expectedDelivery', label: 'Expected Delivery Date', type: 'date', required: false },
    { id: 'issueType', label: 'Issue Type', type: 'select', required: false, options: ['Item not received', 'Item arrived damaged', 'Wrong item delivered', 'Partial delivery', 'Significant delay'] },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.issueDetails, '[Issue details]'))}</p><p>I request that you investigate and resolve this matter promptly.</p>`,
});

export const faultyGoodsLetter = consumerLetter({
  id: 'faulty-goods-letter', name: 'Faulty Goods Letter', description: 'A letter reporting faulty or defective goods and requesting a remedy.',
  icon: 'AlertOctagon', tags: ['faulty goods', 'defective', 'consumer', 'letter'],
  subject: 'Faulty Goods — Request for Remedy',
  bodyField: 'faultDetails', bodyLabel: 'Description of the Fault',
  extraFields: [
    { id: 'purchaseDate', label: 'Date of Purchase', type: 'date', required: false },
    { id: 'faultDate', label: 'Date Fault Discovered', type: 'date', required: false },
    { id: 'remedy', label: 'Remedy Requested', type: 'select', required: false, options: ['Repair', 'Replacement', 'Full refund'] },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.faultDetails, '[Fault details]'))}</p>` +
    `<p>I am requesting ${data.remedy || 'a remedy'} under the Consumer Rights Act 2015. Please respond within 14 days.</p>`,
});

export const subjectAccessRequest: DocumentTemplate = {
  id: 'subject-access-request', name: 'Subject Access Request', category: 'consumer',
  description: 'A formal Subject Access Request (SAR) under UK GDPR to obtain personal data held about you.',
  icon: 'Eye', planRequired: 'free', tags: ['SAR', 'GDPR', 'data', 'consumer'],
  signatories: [{ label: 'Requester' }],
  sections: [
    {
      id: 'details', title: 'Request Details',
      fields: [
        { id: 'senderName', label: 'Your Full Name', type: 'text', required: true },
        { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'senderEmail', label: 'Your Email', type: 'email', required: false },
        { id: 'senderDOB', label: 'Your Date of Birth', type: 'date', required: false },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'recipientName', label: 'Organisation Name', type: 'text', required: true },
        { id: 'recipientAddress', label: 'Organisation Address', type: 'textarea', required: false },
        { id: 'dataDescription', label: 'Description of Data Requested', type: 'textarea', required: false, placeholder: 'e.g. All personal data held about me, including account records, correspondence, and any third-party disclosures' },
        { id: 'identityDoc', label: 'Identity Document Enclosed', type: 'select', required: false, options: ['Yes — copy of ID enclosed', 'No — please advise what is required'] },
      ],
    },
  ],
  generateDocument: (data) => [
    letterHeader(data),
    section('Subject Access Request — UK GDPR Article 15',
      `<p>Dear ${or(data.recipientName, 'Data Controller')},</p>
      <p>I am writing to make a Subject Access Request under Article 15 of the UK General Data Protection Regulation (UK GDPR) and Section 45 of the Data Protection Act 2018.</p>
      <p>I request a copy of all personal data you hold about me, including but not limited to: ${data.dataDescription || 'all records, correspondence, account information, and any data shared with third parties'}.</p>
      ${data.senderDOB ? `<p>My date of birth is: <strong>${data.senderDOB}</strong></p>` : ''}
      ${data.identityDoc === 'Yes — copy of ID enclosed' ? '<p>I have enclosed a copy of my identity document to assist with verification.</p>' : ''}
      <p>I understand that you have one calendar month to respond to this request. If you require any further information to process this request, please contact me at the address above.</p>
      <p>Yours faithfully,<br><strong>${or(data.senderName, '[Your Name]')}</strong></p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

export const dataDeletionRequest = consumerLetter({
  id: 'data-deletion-request', name: 'Data Deletion Request', description: 'A request for erasure of personal data under UK GDPR (Right to be Forgotten).',
  icon: 'Trash2', tags: ['GDPR', 'erasure', 'data deletion', 'consumer'],
  subject: 'Request for Erasure of Personal Data — UK GDPR Article 17',
  bodyField: 'deletionDetails', bodyLabel: 'Details of Data to be Deleted',
  generateBody: (data) => `<p>I am writing to exercise my right to erasure under Article 17 of the UK GDPR. I request that you delete all personal data you hold about me${data.deletionDetails ? `, specifically: ${nl2br(data.deletionDetails)}` : ''}.</p><p>Please confirm in writing that the deletion has been completed within one calendar month.</p>`,
});

export const witnessStatement: DocumentTemplate = {
  id: 'witness-statement', name: 'Witness Statement', category: 'consumer',
  description: 'A formal witness statement recording what was seen or heard.',
  icon: 'Eye', planRequired: 'free', tags: ['witness', 'statement', 'evidence'],
  signatories: [{ label: 'Witness' }],
  sections: [
    {
      id: 'details', title: 'Statement Details',
      fields: [
        { id: 'witnessName', label: 'Witness Full Name', type: 'text', required: true },
        { id: 'witnessAddress', label: 'Witness Address', type: 'textarea', required: false },
        { id: 'statementDate', label: 'Statement Date', type: 'date', required: true },
        { id: 'incidentDate', label: 'Date of Incident', type: 'date', required: false },
        { id: 'incidentLocation', label: 'Location of Incident', type: 'text', required: false },
        { id: 'statement', label: 'Statement of Evidence', type: 'textarea', required: true },
        { id: 'additionalInfo', label: 'Additional Information', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Statement Details', infoTable([
      ['Witness', or(data.witnessName, '[Witness Name]')],
      ['Address', data.witnessAddress],
      ['Statement Date', or(data.statementDate, '[Date]')],
      ['Date of Incident', data.incidentDate],
      ['Location', data.incidentLocation],
    ])),
    section('Statement of Evidence',
      `<p>I, <strong>${or(data.witnessName, '[Witness Name]')}</strong>, make this statement from my own knowledge and belief.</p>
      <p>${nl2br(or(data.statement, '[Statement]'))}</p>` +
      (data.additionalInfo ? `<p>${nl2br(data.additionalInfo)}</p>` : '') +
      `<p>I believe the facts stated in this witness statement are true.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

export const timelineOfEvents: DocumentTemplate = {
  id: 'timeline-of-events', name: 'Timeline of Events', category: 'consumer',
  description: 'A chronological record of events for use in complaints, disputes, or investigations.',
  icon: 'Clock', planRequired: 'free', tags: ['timeline', 'events', 'record', 'evidence'],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'preparedBy', label: 'Prepared By', type: 'text', required: true },
        { id: 'subject', label: 'Subject / Matter', type: 'text', required: true },
        { id: 'preparedDate', label: 'Date Prepared', type: 'date', required: true },
        { id: 'events', label: 'Events (Date | Time | Description)', type: 'textarea', required: true, placeholder: '01 Jan 2026 | 10:00 | Placed order online\n05 Jan 2026 | 14:30 | Received damaged goods\n06 Jan 2026 | 09:00 | Called customer service' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.events || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Timeline Details', infoTable([
        ['Prepared By', or(data.preparedBy, '[Name]')],
        ['Subject', or(data.subject, '[Subject]')],
        ['Date Prepared', or(data.preparedDate, '[Date]')],
      ])),
      section('Chronological Timeline', dataTable(['Date', 'Time', 'Event Description'], rows)),
      DISCLAIMER,
    ].filter(Boolean).join('');
  },
};
