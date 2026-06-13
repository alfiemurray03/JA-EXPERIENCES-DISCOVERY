import type { DocumentTemplate } from '../document-types';
import { section, infoTable, clause, or } from './html-helpers';

export const appointmentOfDirector: DocumentTemplate = {
  id: 'appointment-of-director',
  name: 'Appointment of Director',
  category: 'director',
  description: 'A written resolution to formally appoint a new director to the board of a company.',
  icon: 'UserPlus',
  planRequired: 'free',
  tags: ['director', 'appointment', 'resolution', 'board', 'governance'],
  signatories: [{ label: 'Existing Director / Chair' }, { label: 'New Director (Consent)' }],
  sections: [
    {
      id: 'company',
      title: 'Company Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'appointmentDate', label: 'Date of Appointment', type: 'date', required: true },
      ],
    },
    {
      id: 'newDirector',
      title: 'New Director Details',
      fields: [
        { id: 'directorName', label: 'New Director Full Name', type: 'text', required: true },
        { id: 'directorAddress', label: 'Director Residential Address', type: 'textarea', required: false },
        { id: 'directorDOB', label: 'Date of Birth', type: 'date', required: false },
        { id: 'directorNationality', label: 'Nationality', type: 'text', required: false },
        { id: 'directorTitle', label: 'Director Title / Role', type: 'text', required: false, placeholder: 'e.g. Managing Director, Non-Executive Director' },
      ],
    },
    {
      id: 'resolution',
      title: 'Resolution',
      fields: [
        { id: 'proposedBy', label: 'Resolution Proposed By', type: 'text', required: false },
        { id: 'additionalTerms', label: 'Additional Terms of Appointment', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Company Information', infoTable([
      ['Company Name', or(data.companyName, '[Company Name]')],
      ['Registration Number', data.companyNumber],
      ['Date of Appointment', or(data.appointmentDate, '[Date]')],
    ])),

    section('New Director Details', infoTable([
      ['Full Name', or(data.directorName, '[Director Name]')],
      ['Residential Address', data.directorAddress],
      ['Date of Birth', data.directorDOB],
      ['Nationality', data.directorNationality],
      ['Role / Title', data.directorTitle],
    ])),

    section('Written Resolution',
      `<p>The directors / shareholders of <strong>${or(data.companyName, '[Company Name]')}</strong> hereby resolve as follows:</p>
      <div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
        <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
        <p style="margin:0;"><strong>${or(data.directorName, '[Director Name]')}</strong>${data.directorTitle ? `, ${data.directorTitle},` : ''} be and is hereby appointed as a director of the company with effect from ${or(data.appointmentDate, '[Date]')}.</p>
      </div>`
    ),

    section('Consent to Act',
      clause('1.', `${or(data.directorName, '[Director Name]')} hereby consents to act as a director of ${or(data.companyName, '[Company Name]')} and confirms that they are not disqualified from acting as a director.`) +
      clause('2.', 'The company secretary is instructed to file the necessary forms at Companies House within 14 days of this appointment.') +
      (data.additionalTerms ? clause('3.', data.additionalTerms) : '')
    ),
  ].filter(Boolean).join(''),
};
