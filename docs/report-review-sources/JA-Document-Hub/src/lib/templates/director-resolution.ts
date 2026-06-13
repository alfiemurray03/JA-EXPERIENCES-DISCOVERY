import type { DocumentTemplate } from '../document-types';
import { section, infoTable, clause, or, nl2br } from './html-helpers';

export const directorResolution: DocumentTemplate = {
  id: 'director-resolution',
  name: 'Director Resolution',
  category: 'director',
  description: 'A written resolution of the board of directors, passed without a formal meeting.',
  icon: 'UserCheck',
  planRequired: 'free',
  tags: ['director', 'resolution', 'board', 'written', 'governance'],
  signatories: [{ label: 'Director 1' }, { label: 'Director 2' }],
  sections: [
    {
      id: 'company',
      title: 'Company Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'resolutionDate', label: 'Date of Resolution', type: 'date', required: true },
      ],
    },
    {
      id: 'resolution',
      title: 'Resolution Details',
      fields: [
        { id: 'resolutionTitle', label: 'Resolution Title / Subject', type: 'text', required: true, placeholder: 'e.g. Approval of Bank Account Opening' },
        { id: 'background', label: 'Background / Recitals', type: 'textarea', required: false, placeholder: 'Brief context for the resolution...' },
        { id: 'resolutionText', label: 'Resolution Text', type: 'textarea', required: true, placeholder: 'IT IS RESOLVED THAT...' },
        { id: 'additionalClauses', label: 'Additional Clauses (optional)', type: 'textarea', required: false },
      ],
    },
    {
      id: 'directors',
      title: 'Signing Directors',
      fields: [
        { id: 'director1Name', label: 'Director 1 Full Name', type: 'text', required: true },
        { id: 'director1Title', label: 'Director 1 Title', type: 'text', required: false, placeholder: 'e.g. Managing Director' },
        { id: 'director2Name', label: 'Director 2 Full Name', type: 'text', required: false },
        { id: 'director2Title', label: 'Director 2 Title', type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Company Information', infoTable([
      ['Company Name', or(data.companyName, '[Company Name]')],
      ['Registration Number', data.companyNumber],
      ['Date of Resolution', or(data.resolutionDate, '[Date]')],
    ])),

    section('Written Resolution of the Directors',
      `<p>The directors of <strong>${or(data.companyName, '[Company Name]')}</strong>, acting pursuant to the company's articles of association, hereby pass the following written resolution:</p>`
    ),

    data.background ? section('Background', `<p>${nl2br(data.background)}</p>`) : '',

    section('Resolution',
      `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
        <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
        <p style="margin:0;">${nl2br(or(data.resolutionText, '[Resolution text]'))}</p>
      </div>`
    ),

    data.additionalClauses ? section('Additional Clauses', `<p>${nl2br(data.additionalClauses)}</p>`) : '',

    section('Authority',
      clause('1.', 'This resolution is passed as a written resolution of the directors in accordance with the company\'s articles of association.') +
      clause('2.', 'This resolution shall be effective from the date last signed below.')
    ),
  ].filter(Boolean).join(''),
};
