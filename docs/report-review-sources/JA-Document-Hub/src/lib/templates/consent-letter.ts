import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br } from './html-helpers';

export const consentLetter: DocumentTemplate = {
  id: 'consent-letter',
  name: 'Consent Letter',
  category: 'consent',
  description: 'A general consent letter for activities, medical treatment, data use, or other purposes requiring written permission.',
  icon: 'CheckSquare',
  planRequired: 'free',
  tags: ['consent', 'permission', 'letter', 'authorisation'],
  signatories: [{ label: 'Consenting Party' }],
  sections: [
    {
      id: 'consenter',
      title: 'Consenting Party',
      fields: [
        { id: 'consenterName', label: 'Your Full Name', type: 'text', required: true },
        { id: 'consenterAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'consenterRelationship', label: 'Your Relationship (if consenting on behalf of another)', type: 'text', required: false, placeholder: 'e.g. Parent, Legal Guardian' },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
      ],
    },
    {
      id: 'subject',
      title: 'Subject of Consent',
      fields: [
        { id: 'subjectName', label: 'Name of Person Consent Relates To (if different)', type: 'text', required: false },
        { id: 'consentType', label: 'Type of Consent', type: 'select', required: true, options: ['Medical Treatment', 'Activity / Trip', 'Data Use / Photography', 'Financial Transaction', 'General Permission', 'Other'] },
        { id: 'consentDescription', label: 'Description of What is Being Consented To', type: 'textarea', required: true, placeholder: 'Describe clearly what you are giving consent for...' },
        { id: 'recipient', label: 'Consent Given To (Organisation / Person)', type: 'text', required: false },
        { id: 'validFrom', label: 'Valid From', type: 'date', required: false },
        { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
        { id: 'conditions', label: 'Conditions or Limitations', type: 'textarea', required: false, placeholder: 'Any conditions attached to this consent...' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Consent Details', infoTable([
      ['Consenting Party', or(data.consenterName, '[Name]')],
      ['Relationship', data.consenterRelationship],
      ['Subject', data.subjectName],
      ['Consent Type', or(data.consentType, '[Type]')],
      ['Consent Given To', data.recipient],
      ['Valid From', data.validFrom],
      ['Valid Until', data.validUntil],
      ['Date', or(data.letterDate, '[Date]')],
    ])),

    section('Consent Statement',
      `<p>I, <strong>${or(data.consenterName, '[Name]')}</strong>${data.consenterRelationship ? `, acting as ${data.consenterRelationship}${data.subjectName ? ` of ${data.subjectName}` : ''},` : ','} hereby give my consent to the following:</p>
      <div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
        <p style="margin:0;">${nl2br(or(data.consentDescription, '[Description of consent]'))}</p>
      </div>`
    ),

    data.conditions ? section('Conditions & Limitations',
      `<p>${nl2br(data.conditions)}</p>`
    ) : '',

    section('Declaration',
      `<p>I confirm that I have the legal authority to give this consent and that I understand the nature of what I am consenting to. This consent may be withdrawn at any time by written notice.</p>
      <p>Yours faithfully,<br><strong>${or(data.consenterName, '[Name]')}</strong>${data.consenterRelationship ? `<br>${data.consenterRelationship}` : ''}</p>`
    ),
  ].filter(Boolean).join(''),
};
