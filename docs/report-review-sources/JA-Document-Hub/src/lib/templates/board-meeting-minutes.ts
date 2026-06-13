import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br } from './html-helpers';

export const boardMeetingMinutes: DocumentTemplate = {
  id: 'board-meeting-minutes',
  name: 'Board Meeting Minutes',
  category: 'board-meeting',
  description: 'Formal minutes of a board of directors meeting, recording attendance, resolutions, and actions.',
  icon: 'Users',
  planRequired: 'free',
  tags: ['board', 'minutes', 'meeting', 'directors', 'governance'],
  signatories: [{ label: 'Chair of the Meeting' }, { label: 'Company Secretary' }],
  sections: [
    {
      id: 'company',
      title: 'Company Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'registeredAddress', label: 'Registered Address', type: 'textarea', required: false },
      ],
    },
    {
      id: 'meeting',
      title: 'Meeting Details',
      fields: [
        { id: 'meetingDate', label: 'Date of Meeting', type: 'date', required: true },
        { id: 'meetingTime', label: 'Time of Meeting', type: 'text', required: false, placeholder: 'e.g. 10:00 AM' },
        { id: 'meetingLocation', label: 'Location / Platform', type: 'text', required: false, placeholder: 'e.g. Registered Office / Zoom' },
        { id: 'chair', label: 'Chair of Meeting', type: 'text', required: true },
        { id: 'secretary', label: 'Company Secretary', type: 'text', required: false },
      ],
    },
    {
      id: 'attendance',
      title: 'Attendance',
      fields: [
        { id: 'directorsPresent', label: 'Directors Present (one per line: Name, Role)', type: 'textarea', required: true, placeholder: 'Jane Smith, Managing Director\nJohn Brown, Finance Director' },
        { id: 'apologies', label: 'Apologies for Absence', type: 'textarea', required: false, placeholder: 'Names of those who sent apologies' },
        { id: 'alsoPresent', label: 'Also Present (advisors, observers)', type: 'textarea', required: false },
      ],
    },
    {
      id: 'business',
      title: 'Business Discussed',
      fields: [
        { id: 'quorum', label: 'Quorum Confirmed?', type: 'select', required: false, options: ['Yes — quorum confirmed', 'No — meeting inquorate'] },
        { id: 'previousMinutes', label: 'Previous Minutes', type: 'select', required: false, options: ['Approved as a true record', 'Approved with amendments', 'Not reviewed'] },
        { id: 'mattersArising', label: 'Matters Arising from Previous Minutes', type: 'textarea', required: false },
        { id: 'agendaItems', label: 'Agenda Items & Discussions (one per line)', type: 'textarea', required: true, placeholder: '1. Financial report — Q3 results reviewed and noted\n2. New contract approval — resolved to proceed' },
        { id: 'resolutions', label: 'Resolutions Passed', type: 'textarea', required: false, placeholder: 'List any formal resolutions passed during the meeting' },
        { id: 'actionItems', label: 'Action Items (Name | Action | Deadline)', type: 'textarea', required: false, placeholder: 'Jane Smith | Prepare Q4 budget | 30 Nov 2025\nJohn Brown | Review insurance renewal | 15 Nov 2025' },
        { id: 'nextMeeting', label: 'Date of Next Meeting', type: 'date', required: false },
        { id: 'aob', label: 'Any Other Business', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const directorRows = (data.directorsPresent || '')
      .split('\n').filter(Boolean)
      .map((line) => { const [name, role] = line.split(',').map((s) => s.trim()); return [name || line, role || '—']; });

    const actionRows = (data.actionItems || '')
      .split('\n').filter(Boolean)
      .map((line) => { const parts = line.split('|').map((s) => s.trim()); return [parts[0] || '', parts[1] || '', parts[2] || '']; });

    const agendaLines = (data.agendaItems || '').split('\n').filter(Boolean);

    return [
      section('Company Information', infoTable([
        ['Company Name', or(data.companyName, '[Company Name]')],
        ['Registration Number', data.companyNumber],
        ['Registered Address', data.registeredAddress],
      ])),

      section('Meeting Details', infoTable([
        ['Date', or(data.meetingDate, '[Date]')],
        ['Time', data.meetingTime],
        ['Location', data.meetingLocation],
        ['Chair', or(data.chair, '[Chair]')],
        ['Secretary', data.secretary],
      ])),

      section('Attendance',
        dataTable(['Name', 'Role'], directorRows) +
        (data.apologies ? `<p><strong>Apologies:</strong> ${nl2br(data.apologies)}</p>` : '') +
        (data.alsoPresent ? `<p><strong>Also Present:</strong> ${nl2br(data.alsoPresent)}</p>` : '')
      ),

      section('Quorum & Previous Minutes',
        infoTable([
          ['Quorum', data.quorum || 'Confirmed'],
          ['Previous Minutes', data.previousMinutes || '—'],
        ]) +
        (data.mattersArising ? `<p><strong>Matters Arising:</strong> ${nl2br(data.mattersArising)}</p>` : '')
      ),

      section('Agenda & Discussions',
        `<ol>${agendaLines.map((item) => `<li>${item}</li>`).join('')}</ol>`
      ),

      data.resolutions ? section('Resolutions Passed',
        `<p>${nl2br(data.resolutions)}</p>`
      ) : '',

      actionRows.length ? section('Action Items',
        dataTable(['Responsible', 'Action', 'Deadline'], actionRows)
      ) : '',

      data.aob ? section('Any Other Business', `<p>${nl2br(data.aob)}</p>`) : '',

      infoTable([
        ['Next Meeting', data.nextMeeting || 'To be confirmed'],
      ]),
    ].filter(Boolean).join('');
  },
};
