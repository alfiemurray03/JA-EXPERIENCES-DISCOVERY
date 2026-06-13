/**
 * Charity/Community + School/Youth/Training batches
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br } from './html-helpers';
import { DISCLAIMER } from './template-factory';

// ─── Trustee Meeting Minutes ──────────────────────────────────────────────────
export const trusteeMeetingMinutes: DocumentTemplate = {
  id: 'trustee-meeting-minutes', name: 'Trustee Meeting Minutes', category: 'charity',
  description: 'Minutes of a trustee board meeting for a charity or non-profit organisation.',
  icon: 'Users', planRequired: 'free', tags: ['trustee', 'minutes', 'charity', 'governance'],
  signatories: [{ label: 'Chair' }, { label: 'Secretary' }],
  sections: [
    {
      id: 'details', title: 'Meeting Details',
      fields: [
        { id: 'orgName', label: 'Charity / Organisation Name', type: 'text', required: true },
        { id: 'meetingDate', label: 'Date', type: 'date', required: true },
        { id: 'chair', label: 'Chair', type: 'text', required: false },
        { id: 'trustees', label: 'Trustees Present', type: 'textarea', required: false },
        { id: 'apologies', label: 'Apologies', type: 'textarea', required: false },
        { id: 'agendaItems', label: 'Agenda Items & Discussions', type: 'textarea', required: true },
        { id: 'resolutions', label: 'Resolutions Passed', type: 'textarea', required: false },
        { id: 'actions', label: 'Actions (Name | Action | Deadline)', type: 'textarea', required: false },
        { id: 'nextMeeting', label: 'Next Meeting Date', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const actionRows = (data.actions || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Meeting Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Date', or(data.meetingDate, '[Date]')],
        ['Chair', data.chair],
        ['Trustees Present', data.trustees],
        ['Apologies', data.apologies],
      ])),
      section('Agenda & Discussions', `<p>${nl2br(or(data.agendaItems, '[Agenda items]'))}</p>`),
      data.resolutions ? section('Resolutions Passed', `<p>${nl2br(data.resolutions)}</p>`) : '',
      actionRows.length ? section('Actions', dataTable(['Responsible', 'Action', 'Deadline'], actionRows)) : '',
      data.nextMeeting ? section('Next Meeting', infoTable([['Date', data.nextMeeting]])) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Trustee Resolution ───────────────────────────────────────────────────────
export const trusteeResolution: DocumentTemplate = {
  id: 'trustee-resolution', name: 'Trustee Resolution', category: 'charity',
  description: 'A written resolution of the trustees of a charity.',
  icon: 'FileCheck', planRequired: 'free', tags: ['trustee', 'resolution', 'charity'],
  signatories: [{ label: 'Trustee 1' }, { label: 'Trustee 2' }],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'orgName', label: 'Charity / Organisation Name', type: 'text', required: true },
        { id: 'resolutionDate', label: 'Date', type: 'date', required: true },
        { id: 'resolutionText', label: 'Resolution Text', type: 'textarea', required: true, placeholder: 'IT IS RESOLVED THAT...' },
        { id: 'trustees', label: 'Signing Trustees', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Resolution Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Date', or(data.resolutionDate, '[Date]')],
    ])),
    section('Resolution',
      `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
        <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
        <p style="margin:0;">${nl2br(or(data.resolutionText, '[Resolution text]'))}</p>
      </div>`
    ),
    data.trustees ? section('Signed by Trustees', `<p>${nl2br(data.trustees)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Donation Receipt ─────────────────────────────────────────────────────────
export const donationReceipt: DocumentTemplate = {
  id: 'donation-receipt', name: 'Donation Receipt', category: 'charity',
  description: 'A receipt for a charitable donation.',
  icon: 'Heart', planRequired: 'free', tags: ['donation', 'receipt', 'charity'],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'orgName', label: 'Charity / Organisation Name', type: 'text', required: true },
        { id: 'charityNumber', label: 'Charity Registration Number', type: 'text', required: false },
        { id: 'donorName', label: 'Donor Name', type: 'text', required: true },
        { id: 'donorAddress', label: 'Donor Address', type: 'textarea', required: false },
        { id: 'receiptDate', label: 'Receipt Date', type: 'date', required: true },
        { id: 'amount', label: 'Amount Donated', type: 'text', required: true },
        { id: 'paymentMethod', label: 'Payment Method', type: 'select', required: false, options: ['Bank Transfer', 'Cash', 'Cheque', 'Card', 'Online', 'Other'] },
        { id: 'giftAid', label: 'Gift Aid Declaration', type: 'select', required: false, options: ['Yes — Gift Aid declaration provided', 'No Gift Aid'] },
        { id: 'purpose', label: 'Purpose / Fund (if restricted)', type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Donation Receipt', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Charity Number', data.charityNumber],
      ['Date', or(data.receiptDate, '[Date]')],
      ['Donor', or(data.donorName, '[Donor]')],
      ['Donor Address', data.donorAddress],
      ['Amount', or(data.amount, '—')],
      ['Payment Method', data.paymentMethod],
      ['Gift Aid', data.giftAid],
      ['Purpose', data.purpose],
    ])),
    `<p style="margin-top:16px;font-size:9pt;color:#6b7280;">Thank you for your generous donation to ${or(data.orgName, '[Organisation]')}. This receipt confirms that the above donation has been received.</p>`,
  ].filter(Boolean).join(''),
};

// ─── Risk Assessment ──────────────────────────────────────────────────────────
export const riskAssessment: DocumentTemplate = {
  id: 'risk-assessment', name: 'Risk Assessment', category: 'charity',
  description: 'A risk assessment for activities, events, or projects.',
  icon: 'AlertTriangle', planRequired: 'free', tags: ['risk assessment', 'safety', 'event', 'charity'],
  signatories: [{ label: 'Assessor' }, { label: 'Manager / Approver' }],
  sections: [
    {
      id: 'details', title: 'Assessment Details',
      fields: [
        { id: 'orgName', label: 'Organisation', type: 'text', required: true },
        { id: 'activityName', label: 'Activity / Event Name', type: 'text', required: true },
        { id: 'assessmentDate', label: 'Assessment Date', type: 'date', required: true },
        { id: 'assessor', label: 'Assessor Name', type: 'text', required: false },
        { id: 'location', label: 'Location', type: 'text', required: false },
        { id: 'risks', label: 'Risks (Hazard | Who at Risk | Likelihood | Severity | Controls | Residual Risk)', type: 'textarea', required: true, placeholder: 'Slipping on wet floor | Staff & visitors | Medium | High | Non-slip mats, wet floor signs | Low\nFire | All | Low | High | Fire exits clear, extinguishers checked | Low' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.risks || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || ''];
    });
    return [
      section('Assessment Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Activity / Event', or(data.activityName, '[Activity]')],
        ['Date', or(data.assessmentDate, '[Date]')],
        ['Assessor', data.assessor],
        ['Location', data.location],
      ])),
      section('Risk Assessment', dataTable(['Hazard', 'Who at Risk', 'Likelihood', 'Severity', 'Controls', 'Residual Risk'], rows)),
      DISCLAIMER,
    ].filter(Boolean).join('');
  },
};

// ─── Event Plan ───────────────────────────────────────────────────────────────
export const eventPlan: DocumentTemplate = {
  id: 'event-plan', name: 'Event Plan', category: 'charity',
  description: 'A plan for organising a community, charity, or business event.',
  icon: 'Calendar', planRequired: 'free', tags: ['event', 'plan', 'community', 'charity'],
  sections: [
    {
      id: 'details', title: 'Event Details',
      fields: [
        { id: 'eventName', label: 'Event Name', type: 'text', required: true },
        { id: 'orgName', label: 'Organising Organisation', type: 'text', required: false },
        { id: 'eventDate', label: 'Event Date', type: 'date', required: true },
        { id: 'eventTime', label: 'Event Time', type: 'text', required: false },
        { id: 'location', label: 'Location / Venue', type: 'text', required: false },
        { id: 'expectedAttendance', label: 'Expected Attendance', type: 'text', required: false },
        { id: 'objectives', label: 'Event Objectives', type: 'textarea', required: false },
        { id: 'programme', label: 'Programme / Schedule', type: 'textarea', required: false },
        { id: 'budget', label: 'Budget', type: 'text', required: false },
        { id: 'tasks', label: 'Tasks (Task | Owner | Deadline)', type: 'textarea', required: false },
        { id: 'risks', label: 'Key Risks', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const taskRows = (data.tasks || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Event Details', infoTable([
        ['Event', or(data.eventName, '[Event]')],
        ['Organiser', data.orgName],
        ['Date', or(data.eventDate, '[Date]')],
        ['Time', data.eventTime],
        ['Location', data.location],
        ['Expected Attendance', data.expectedAttendance],
        ['Budget', data.budget],
      ])),
      data.objectives ? section('Objectives', `<p>${nl2br(data.objectives)}</p>`) : '',
      data.programme ? section('Programme / Schedule', `<p>${nl2br(data.programme)}</p>`) : '',
      taskRows.length ? section('Tasks', dataTable(['Task', 'Owner', 'Deadline'], taskRows)) : '',
      data.risks ? section('Key Risks', `<p>${nl2br(data.risks)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Grant Application Draft ──────────────────────────────────────────────────
export const grantApplicationDraft: DocumentTemplate = {
  id: 'grant-application-draft', name: 'Grant Application Draft', category: 'charity',
  description: 'A draft grant application for funding from a trust, foundation, or public body.',
  icon: 'PoundSterling', planRequired: 'free', tags: ['grant', 'funding', 'application', 'charity'],
  sections: [
    {
      id: 'details', title: 'Application Details',
      fields: [
        { id: 'orgName', label: 'Applying Organisation', type: 'text', required: true },
        { id: 'charityNumber', label: 'Charity / Company Number', type: 'text', required: false },
        { id: 'funderName', label: 'Funder Name', type: 'text', required: false },
        { id: 'applicationDate', label: 'Application Date', type: 'date', required: true },
        { id: 'projectTitle', label: 'Project Title', type: 'text', required: true },
        { id: 'amountRequested', label: 'Amount Requested', type: 'text', required: false },
        { id: 'projectSummary', label: 'Project Summary', type: 'textarea', required: true },
        { id: 'need', label: 'Need / Problem Being Addressed', type: 'textarea', required: false },
        { id: 'activities', label: 'Proposed Activities', type: 'textarea', required: false },
        { id: 'outcomes', label: 'Expected Outcomes & Impact', type: 'textarea', required: false },
        { id: 'budget', label: 'Budget Summary', type: 'textarea', required: false },
        { id: 'timeline', label: 'Project Timeline', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Application Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Charity / Company Number', data.charityNumber],
      ['Funder', data.funderName],
      ['Date', or(data.applicationDate, '[Date]')],
      ['Project Title', or(data.projectTitle, '[Project]')],
      ['Amount Requested', data.amountRequested],
    ])),
    section('Project Summary', `<p>${nl2br(or(data.projectSummary, '[Summary]'))}</p>`),
    data.need ? section('Need / Problem', `<p>${nl2br(data.need)}</p>`) : '',
    data.activities ? section('Proposed Activities', `<p>${nl2br(data.activities)}</p>`) : '',
    data.outcomes ? section('Expected Outcomes & Impact', `<p>${nl2br(data.outcomes)}</p>`) : '',
    data.budget ? section('Budget Summary', `<p>${nl2br(data.budget)}</p>`) : '',
    data.timeline ? section('Project Timeline', `<p>${nl2br(data.timeline)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Lesson Plan ──────────────────────────────────────────────────────────────
export const lessonPlan: DocumentTemplate = {
  id: 'lesson-plan', name: 'Lesson Plan', category: 'education',
  description: 'A structured lesson plan for teachers, trainers, or youth workers.',
  icon: 'BookOpen', planRequired: 'free', tags: ['lesson plan', 'teaching', 'education', 'training'],
  sections: [
    {
      id: 'details', title: 'Lesson Details',
      fields: [
        { id: 'subject', label: 'Subject / Topic', type: 'text', required: true },
        { id: 'teacher', label: 'Teacher / Trainer', type: 'text', required: false },
        { id: 'date', label: 'Date', type: 'date', required: true },
        { id: 'duration', label: 'Duration', type: 'text', required: false, placeholder: 'e.g. 60 minutes' },
        { id: 'ageGroup', label: 'Age Group / Level', type: 'text', required: false },
        { id: 'objectives', label: 'Learning Objectives', type: 'textarea', required: true },
        { id: 'resources', label: 'Resources Required', type: 'textarea', required: false },
        { id: 'activities', label: 'Activities / Structure (Time | Activity | Notes)', type: 'textarea', required: true, placeholder: '0–10 min | Introduction & warm-up | Ask prior knowledge questions\n10–30 min | Main activity | Group work\n30–50 min | Practice | Individual tasks\n50–60 min | Review & close | Q&A' },
        { id: 'assessment', label: 'Assessment / How Learning Will Be Checked', type: 'textarea', required: false },
        { id: 'differentiation', label: 'Differentiation / Inclusion Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const activityRows = (data.activities || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Lesson Details', infoTable([
        ['Subject / Topic', or(data.subject, '[Subject]')],
        ['Teacher / Trainer', data.teacher],
        ['Date', or(data.date, '[Date]')],
        ['Duration', data.duration],
        ['Age Group / Level', data.ageGroup],
      ])),
      section('Learning Objectives', `<p>${nl2br(or(data.objectives, '[Objectives]'))}</p>`),
      data.resources ? section('Resources Required', `<p>${nl2br(data.resources)}</p>`) : '',
      section('Lesson Structure', dataTable(['Time', 'Activity', 'Notes'], activityRows)),
      data.assessment ? section('Assessment', `<p>${nl2br(data.assessment)}</p>`) : '',
      data.differentiation ? section('Differentiation & Inclusion', `<p>${nl2br(data.differentiation)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Trip Consent Form ────────────────────────────────────────────────────────
export const tripConsentForm: DocumentTemplate = {
  id: 'trip-consent-form', name: 'Trip Consent Form', category: 'education',
  description: 'A parental / guardian consent form for a school or youth group trip.',
  icon: 'Bus', planRequired: 'free', tags: ['consent', 'trip', 'school', 'youth'],
  signatories: [{ label: 'Parent / Guardian' }],
  sections: [
    {
      id: 'details', title: 'Trip Details',
      fields: [
        { id: 'orgName', label: 'School / Organisation', type: 'text', required: true },
        { id: 'tripName', label: 'Trip Name / Destination', type: 'text', required: true },
        { id: 'tripDate', label: 'Trip Date', type: 'date', required: true },
        { id: 'returnTime', label: 'Expected Return Time', type: 'text', required: false },
        { id: 'cost', label: 'Cost (if applicable)', type: 'text', required: false },
        { id: 'supervisors', label: 'Supervising Staff', type: 'text', required: false },
        { id: 'childName', label: 'Child\'s Full Name', type: 'text', required: true },
        { id: 'parentName', label: 'Parent / Guardian Name', type: 'text', required: true },
        { id: 'emergencyContact', label: 'Emergency Contact Number', type: 'phone', required: false },
        { id: 'medicalInfo', label: 'Medical Information / Allergies', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Trip Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Trip / Destination', or(data.tripName, '[Trip]')],
      ['Date', or(data.tripDate, '[Date]')],
      ['Expected Return', data.returnTime],
      ['Cost', data.cost],
      ['Supervising Staff', data.supervisors],
    ])),
    section('Child Details', infoTable([
      ['Child\'s Name', or(data.childName, '[Child Name]')],
      ['Parent / Guardian', or(data.parentName, '[Parent/Guardian]')],
      ['Emergency Contact', data.emergencyContact],
      ['Medical Information', data.medicalInfo || 'None declared'],
    ])),
    section('Consent',
      `<p>I give consent for <strong>${or(data.childName, '[Child Name]')}</strong> to participate in the above trip. I confirm that the medical information provided is accurate.</p>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Attendance Sheet ─────────────────────────────────────────────────────────
export const attendanceSheet: DocumentTemplate = {
  id: 'attendance-sheet', name: 'Attendance Sheet', category: 'education',
  description: 'An attendance register for classes, training sessions, or group activities.',
  icon: 'ClipboardList', planRequired: 'free', tags: ['attendance', 'register', 'education', 'training'],
  sections: [
    {
      id: 'details', title: 'Session Details',
      fields: [
        { id: 'sessionName', label: 'Session / Class Name', type: 'text', required: true },
        { id: 'date', label: 'Date', type: 'date', required: true },
        { id: 'time', label: 'Time', type: 'text', required: false },
        { id: 'facilitator', label: 'Teacher / Facilitator', type: 'text', required: false },
        { id: 'participants', label: 'Participants (one per line)', type: 'textarea', required: true },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.participants || '').split('\n').filter(Boolean).map((name, i) => [
      `${i + 1}`, name, '', ''
    ]);
    return [
      section('Session Details', infoTable([
        ['Session', or(data.sessionName, '[Session]')],
        ['Date', or(data.date, '[Date]')],
        ['Time', data.time],
        ['Facilitator', data.facilitator],
      ])),
      section('Attendance Register', dataTable(['#', 'Name', 'Present (✓/✗)', 'Notes'], rows)),
    ].join('');
  },
};

// ─── Certificate Template ─────────────────────────────────────────────────────
export const certificateTemplate: DocumentTemplate = {
  id: 'certificate-template', name: 'Certificate Template', category: 'education',
  description: 'A certificate of achievement, completion, or participation.',
  icon: 'Award', planRequired: 'free', tags: ['certificate', 'achievement', 'training', 'education'],
  sections: [
    {
      id: 'details', title: 'Certificate Details',
      fields: [
        { id: 'orgName', label: 'Issuing Organisation', type: 'text', required: true },
        { id: 'certificateType', label: 'Certificate Type', type: 'select', required: true, options: ['Certificate of Achievement', 'Certificate of Completion', 'Certificate of Participation', 'Certificate of Attendance', 'Certificate of Excellence'] },
        { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
        { id: 'courseName', label: 'Course / Programme / Achievement', type: 'text', required: true },
        { id: 'issueDate', label: 'Issue Date', type: 'date', required: true },
        { id: 'signatoryName', label: 'Signatory Name', type: 'text', required: false },
        { id: 'signatoryTitle', label: 'Signatory Title', type: 'text', required: false },
        { id: 'additionalText', label: 'Additional Text', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => `
    <div style="text-align:center;padding:32px 24px;border:3px solid #1B4F8A;border-radius:8px;margin:8px 0;">
      <p style="font-size:9pt;text-transform:uppercase;letter-spacing:2px;color:#1B4F8A;font-family:Arial,sans-serif;margin:0 0 8px;">${or(data.orgName, '[Organisation]')}</p>
      <h2 style="font-size:22pt;color:#1B4F8A;font-family:Georgia,serif;margin:0 0 16px;font-weight:400;">${or(data.certificateType, 'Certificate')}</h2>
      <p style="font-size:10pt;color:#374151;margin:0 0 8px;font-family:Arial,sans-serif;">This is to certify that</p>
      <p style="font-size:18pt;font-family:Georgia,serif;color:#1a1a1a;margin:8px 0;border-bottom:2px solid #1B4F8A;display:inline-block;padding:0 24px 4px;">${or(data.recipientName, '[Recipient Name]')}</p>
      <p style="font-size:10pt;color:#374151;margin:12px 0 4px;font-family:Arial,sans-serif;">has successfully completed</p>
      <p style="font-size:13pt;font-weight:700;color:#1B4F8A;font-family:Arial,sans-serif;margin:4px 0 16px;">${or(data.courseName, '[Course / Achievement]')}</p>
      ${data.additionalText ? `<p style="font-size:9.5pt;color:#6b7280;font-family:Arial,sans-serif;margin:0 0 16px;">${data.additionalText}</p>` : ''}
      <p style="font-size:9pt;color:#6b7280;font-family:Arial,sans-serif;margin:0 0 24px;">Date: ${or(data.issueDate, '[Date]')}</p>
      <div style="display:inline-block;border-top:1.5px solid #374151;padding-top:8px;min-width:180px;">
        <p style="font-size:9.5pt;font-weight:700;margin:0;font-family:Arial,sans-serif;">${data.signatoryName || '[Signatory]'}</p>
        ${data.signatoryTitle ? `<p style="font-size:8.5pt;color:#6b7280;margin:2px 0 0;font-family:Arial,sans-serif;">${data.signatoryTitle}</p>` : ''}
      </div>
    </div>
  `,
};
