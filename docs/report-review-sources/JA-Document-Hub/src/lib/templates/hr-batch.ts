/**
 * HR & Employment batch:
 * Employment Contract, Zero Hours, Volunteer Agreement, Internship Agreement,
 * Job Description, Person Spec, Induction Checklist, Probation Review,
 * Appraisal Form, Training Plan, Holiday Request, Sickness Record,
 * Return to Work, Disciplinary Invite, Disciplinary Outcome, Grievance Form,
 * Flexible Working Request, Resignation Acknowledgement, Reference Request,
 * Equipment Issue Form, Leaver Checklist
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br, clause } from './html-helpers';
import { DISCLAIMER } from './template-factory';

// ─── Employment Contract Template ─────────────────────────────────────────────
export const employmentContract: DocumentTemplate = {
  id: 'employment-contract',
  name: 'Employment Contract Template',
  category: 'hr',
  description: 'A template employment contract covering key terms of employment.',
  icon: 'FileSignature',
  planRequired: 'free',
  tags: ['employment', 'contract', 'hr', 'terms'],
  signatories: [{ label: 'Employer' }, { label: 'Employee' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'employerName', label: 'Employer Name / Company', type: 'text', required: true },
        { id: 'employerAddress', label: 'Employer Address', type: 'textarea', required: false },
        { id: 'employeeName', label: 'Employee Full Name', type: 'text', required: true },
        { id: 'employeeAddress', label: 'Employee Address', type: 'textarea', required: false },
        { id: 'contractDate', label: 'Contract Date', type: 'date', required: true },
      ],
    },
    {
      id: 'terms',
      title: 'Employment Terms',
      fields: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: true },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'workLocation', label: 'Place of Work', type: 'text', required: false },
        { id: 'workingHours', label: 'Working Hours', type: 'text', required: false, placeholder: 'e.g. 37.5 hours per week, Mon–Fri' },
        { id: 'salary', label: 'Salary', type: 'text', required: true },
        { id: 'payFrequency', label: 'Pay Frequency', type: 'select', required: false, options: ['Monthly', 'Weekly', 'Fortnightly', 'Four-weekly'] },
        { id: 'holidayEntitlement', label: 'Holiday Entitlement', type: 'text', required: false },
        { id: 'probationPeriod', label: 'Probation Period', type: 'text', required: false },
        { id: 'noticePeriod', label: 'Notice Period', type: 'text', required: false },
        { id: 'pensionScheme', label: 'Pension Scheme', type: 'text', required: false },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Contract Details', infoTable([
      ['Employer', or(data.employerName, '[Employer]')],
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Contract Date', or(data.contractDate, '[Date]')],
    ])),
    section('1. Employment Details', infoTable([
      ['Job Title', or(data.jobTitle, '[Job Title]')],
      ['Department', data.department],
      ['Start Date', or(data.startDate, '[Start Date]')],
      ['Place of Work', data.workLocation],
      ['Working Hours', data.workingHours],
    ])),
    section('2. Remuneration', infoTable([
      ['Salary', or(data.salary, '[Salary]')],
      ['Pay Frequency', data.payFrequency],
      ['Holiday Entitlement', data.holidayEntitlement],
      ['Pension', data.pensionScheme],
    ])),
    section('3. Probation & Notice', infoTable([
      ['Probation Period', data.probationPeriod],
      ['Notice Period', data.noticePeriod],
    ])),
    data.additionalTerms ? section('4. Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
    section('5. General',
      clause('5.1', 'This contract is governed by the laws of England and Wales.') +
      clause('5.2', 'This document, together with any accompanying policies, constitutes the entire agreement between the parties.')
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Zero Hours Agreement ─────────────────────────────────────────────────────
export const zeroHoursAgreement: DocumentTemplate = {
  id: 'zero-hours-agreement',
  name: 'Zero Hours Agreement Template',
  category: 'hr',
  description: 'A zero hours worker agreement with no guaranteed minimum hours.',
  icon: 'Clock',
  planRequired: 'free',
  tags: ['zero hours', 'casual', 'worker', 'hr'],
  signatories: [{ label: 'Employer' }, { label: 'Worker' }],
  sections: [
    {
      id: 'details',
      title: 'Agreement Details',
      fields: [
        { id: 'employerName', label: 'Employer Name / Company', type: 'text', required: true },
        { id: 'workerName', label: 'Worker Full Name', type: 'text', required: true },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
        { id: 'jobTitle', label: 'Job Title / Role', type: 'text', required: true },
        { id: 'hourlyRate', label: 'Hourly Rate', type: 'text', required: true },
        { id: 'payFrequency', label: 'Pay Frequency', type: 'select', required: false, options: ['Weekly', 'Fortnightly', 'Monthly'] },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Agreement Details', infoTable([
      ['Employer', or(data.employerName, '[Employer]')],
      ['Worker', or(data.workerName, '[Worker]')],
      ['Date', or(data.agreementDate, '[Date]')],
      ['Role', or(data.jobTitle, '[Role]')],
      ['Hourly Rate', or(data.hourlyRate, '[Rate]')],
      ['Pay Frequency', data.payFrequency],
    ])),
    section('1. Nature of Engagement',
      clause('1.1', 'This is a zero hours agreement. There is no obligation on the employer to offer work, and no obligation on the worker to accept any work offered.') +
      clause('1.2', 'The worker is not an employee and is not entitled to statutory employment rights that require a minimum period of continuous employment.')
    ),
    section('2. Pay',
      clause('2.1', `The worker will be paid at the rate of ${or(data.hourlyRate, '[hourly rate]')} per hour for hours actually worked.`) +
      clause('2.2', 'The worker is entitled to National Minimum Wage / National Living Wage as applicable.')
    ),
    data.additionalTerms ? section('3. Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Volunteer Agreement ──────────────────────────────────────────────────────
export const volunteerAgreement: DocumentTemplate = {
  id: 'volunteer-agreement',
  name: 'Volunteer Agreement',
  category: 'hr',
  description: 'A volunteer agreement setting out the role, expectations, and arrangements for a volunteer.',
  icon: 'Heart',
  planRequired: 'free',
  tags: ['volunteer', 'agreement', 'charity', 'hr'],
  signatories: [{ label: 'Organisation Representative' }, { label: 'Volunteer' }],
  sections: [
    {
      id: 'details',
      title: 'Agreement Details',
      fields: [
        { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
        { id: 'volunteerName', label: 'Volunteer Full Name', type: 'text', required: true },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
        { id: 'role', label: 'Volunteer Role', type: 'text', required: true },
        { id: 'commitment', label: 'Expected Time Commitment', type: 'text', required: false, placeholder: 'e.g. 4 hours per week' },
        { id: 'responsibilities', label: 'Responsibilities', type: 'textarea', required: false },
        { id: 'expenses', label: 'Expenses Policy', type: 'textarea', required: false },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    `<div class="pdf-notice"><p><strong>Note:</strong> This is a volunteer agreement, not a contract of employment. Volunteers are not employees and are not entitled to payment for their time.</p></div>`,
    section('Agreement Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Volunteer', or(data.volunteerName, '[Volunteer]')],
      ['Date', or(data.agreementDate, '[Date]')],
      ['Role', or(data.role, '[Role]')],
      ['Time Commitment', data.commitment],
    ])),
    data.responsibilities ? section('Responsibilities', `<p>${nl2br(data.responsibilities)}</p>`) : '',
    data.expenses ? section('Expenses', `<p>${nl2br(data.expenses)}</p>`) : '',
    section('Our Commitments to You',
      `<ul>
        <li>Provide a safe and supportive volunteering environment</li>
        <li>Provide appropriate training and supervision</li>
        <li>Reimburse agreed out-of-pocket expenses</li>
        <li>Treat you with respect and dignity</li>
      </ul>`
    ),
    data.additionalTerms ? section('Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Internship Agreement ─────────────────────────────────────────────────────
export const internshipAgreement: DocumentTemplate = {
  id: 'internship-agreement',
  name: 'Internship Agreement',
  category: 'hr',
  description: 'An internship agreement setting out the terms of an internship placement.',
  icon: 'GraduationCap',
  planRequired: 'free',
  tags: ['internship', 'placement', 'hr', 'agreement'],
  signatories: [{ label: 'Employer' }, { label: 'Intern' }],
  sections: [
    {
      id: 'details',
      title: 'Agreement Details',
      fields: [
        { id: 'employerName', label: 'Employer Name / Company', type: 'text', required: true },
        { id: 'internName', label: 'Intern Full Name', type: 'text', required: true },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'endDate', label: 'End Date', type: 'date', required: true },
        { id: 'role', label: 'Internship Role / Title', type: 'text', required: true },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'supervisor', label: 'Supervisor Name', type: 'text', required: false },
        { id: 'compensation', label: 'Compensation / Stipend', type: 'text', required: false, placeholder: 'e.g. Unpaid / £X per week / National Minimum Wage' },
        { id: 'learningObjectives', label: 'Learning Objectives', type: 'textarea', required: false },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Internship Details', infoTable([
      ['Employer', or(data.employerName, '[Employer]')],
      ['Intern', or(data.internName, '[Intern]')],
      ['Role', or(data.role, '[Role]')],
      ['Department', data.department],
      ['Supervisor', data.supervisor],
      ['Start Date', or(data.startDate, '[Start Date]')],
      ['End Date', or(data.endDate, '[End Date]')],
      ['Compensation', data.compensation],
    ])),
    data.learningObjectives ? section('Learning Objectives', `<p>${nl2br(data.learningObjectives)}</p>`) : '',
    section('Terms',
      clause('1.', 'This internship is for a fixed term as stated above.') +
      clause('2.', 'The intern is not an employee unless separately confirmed in writing.') +
      clause('3.', 'The intern agrees to maintain confidentiality regarding the employer\'s business.')
    ),
    data.additionalTerms ? section('Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Job Description ──────────────────────────────────────────────────────────
export const jobDescription: DocumentTemplate = {
  id: 'job-description',
  name: 'Job Description',
  category: 'hr',
  description: 'A job description setting out the role, responsibilities, and requirements.',
  icon: 'Briefcase',
  planRequired: 'free',
  tags: ['job description', 'recruitment', 'hr', 'role'],
  sections: [
    {
      id: 'details',
      title: 'Role Details',
      fields: [
        { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: true },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'reportingTo', label: 'Reports To', type: 'text', required: false },
        { id: 'location', label: 'Location', type: 'text', required: false },
        { id: 'salary', label: 'Salary Range', type: 'text', required: false },
        { id: 'contractType', label: 'Contract Type', type: 'select', required: false, options: ['Permanent', 'Fixed Term', 'Part-Time', 'Casual / Zero Hours'] },
        { id: 'purpose', label: 'Purpose of Role', type: 'textarea', required: true },
        { id: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: true, placeholder: 'List each responsibility on a new line' },
        { id: 'requirements', label: 'Essential Requirements', type: 'textarea', required: false },
        { id: 'desirable', label: 'Desirable Requirements', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Role Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Job Title', or(data.jobTitle, '[Job Title]')],
      ['Department', data.department],
      ['Reports To', data.reportingTo],
      ['Location', data.location],
      ['Salary Range', data.salary],
      ['Contract Type', data.contractType],
    ])),
    section('Purpose of Role', `<p>${nl2br(or(data.purpose, '[Purpose]'))}</p>`),
    section('Key Responsibilities',
      `<ul>${(data.responsibilities || '[Responsibilities]').split('\n').filter(Boolean).map(r => `<li>${r}</li>`).join('')}</ul>`
    ),
    data.requirements ? section('Essential Requirements',
      `<ul>${data.requirements.split('\n').filter(Boolean).map(r => `<li>${r}</li>`).join('')}</ul>`
    ) : '',
    data.desirable ? section('Desirable Requirements',
      `<ul>${data.desirable.split('\n').filter(Boolean).map(r => `<li>${r}</li>`).join('')}</ul>`
    ) : '',
  ].filter(Boolean).join(''),
};

// ─── Induction Checklist ──────────────────────────────────────────────────────
export const inductionChecklist: DocumentTemplate = {
  id: 'induction-checklist',
  name: 'Induction Checklist',
  category: 'hr',
  description: 'A new employee induction checklist covering all key onboarding steps.',
  icon: 'ClipboardList',
  planRequired: 'free',
  tags: ['induction', 'onboarding', 'checklist', 'hr'],
  signatories: [{ label: 'Manager' }, { label: 'New Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'customItems', label: 'Additional Checklist Items (one per line)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const standardItems = [
      ['Welcome & introductions to team', 'Day 1'],
      ['Office / workplace tour', 'Day 1'],
      ['IT setup — computer, email, systems access', 'Day 1'],
      ['Health & safety briefing', 'Day 1'],
      ['Fire evacuation procedure', 'Day 1'],
      ['Employee handbook provided', 'Day 1'],
      ['Contract of employment signed', 'Week 1'],
      ['Right to work documents checked', 'Week 1'],
      ['Payroll / bank details submitted', 'Week 1'],
      ['Pension auto-enrolment information provided', 'Week 1'],
      ['Key policies reviewed (data protection, H&S, etc.)', 'Week 1'],
      ['Role overview and objectives discussed', 'Week 1'],
      ['Probation period explained', 'Week 1'],
      ['Training plan agreed', 'Week 2'],
      ['1-to-1 meeting with manager scheduled', 'Week 2'],
    ];
    const customItems = (data.customItems || '').split('\n').filter(Boolean).map(item => [item, '']);
    const allItems = [...standardItems, ...customItems];
    return [
      section('Induction Details', infoTable([
        ['Employee', or(data.employeeName, '[Employee]')],
        ['Job Title', data.jobTitle],
        ['Start Date', or(data.startDate, '[Start Date]')],
        ['Manager', data.manager],
      ])),
      section('Induction Checklist',
        `<table class="pdf-table"><thead><tr><th style="width:40px;">Done</th><th>Item</th><th style="width:80px;">When</th><th style="width:100px;">Completed By</th></tr></thead><tbody>${allItems.map(([item, when]) =>
          `<tr><td><span style="display:inline-block;width:14px;height:14px;border:1.5px solid #1B4F8A;border-radius:2px;"></span></td><td>${item}</td><td>${when}</td><td></td></tr>`
        ).join('')}</tbody></table>`
      ),
    ].join('');
  },
};

// ─── Probation Review Form ────────────────────────────────────────────────────
export const probationReviewForm: DocumentTemplate = {
  id: 'probation-review-form',
  name: 'Probation Review Form',
  category: 'hr',
  description: 'A form for reviewing an employee\'s performance during their probation period.',
  icon: 'ClipboardCheck',
  planRequired: 'free',
  tags: ['probation', 'review', 'hr', 'performance'],
  signatories: [{ label: 'Manager' }, { label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Review Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'reviewDate', label: 'Review Date', type: 'date', required: true },
        { id: 'probationEndDate', label: 'Probation End Date', type: 'date', required: false },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'performance', label: 'Performance Assessment', type: 'textarea', required: true },
        { id: 'strengths', label: 'Strengths', type: 'textarea', required: false },
        { id: 'areasForImprovement', label: 'Areas for Improvement', type: 'textarea', required: false },
        { id: 'outcome', label: 'Probation Outcome', type: 'select', required: true, options: ['Probation passed — confirmed in post', 'Probation extended — review in [period]', 'Probation not passed — employment to end'] },
        { id: 'nextSteps', label: 'Next Steps / Actions', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Review Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Job Title', data.jobTitle],
      ['Manager', data.manager],
      ['Review Date', or(data.reviewDate, '[Date]')],
      ['Probation End Date', data.probationEndDate],
    ])),
    section('Performance Assessment', `<p>${nl2br(or(data.performance, '[Assessment]'))}</p>`),
    data.strengths ? section('Strengths', `<p>${nl2br(data.strengths)}</p>`) : '',
    data.areasForImprovement ? section('Areas for Improvement', `<p>${nl2br(data.areasForImprovement)}</p>`) : '',
    section('Outcome',
      `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:12px 16px;border-radius:2px;"><p style="font-weight:700;margin:0;">${or(data.outcome, '[Outcome]')}</p></div>`
    ),
    data.nextSteps ? section('Next Steps', `<p>${nl2br(data.nextSteps)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Appraisal Form ───────────────────────────────────────────────────────────
export const appraisalForm: DocumentTemplate = {
  id: 'appraisal-form',
  name: 'Appraisal Form',
  category: 'hr',
  description: 'An annual or mid-year performance appraisal form.',
  icon: 'Star',
  planRequired: 'free',
  tags: ['appraisal', 'performance review', 'hr', 'annual review'],
  signatories: [{ label: 'Manager' }, { label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Appraisal Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'appraisalDate', label: 'Appraisal Date', type: 'date', required: true },
        { id: 'period', label: 'Review Period', type: 'text', required: false, placeholder: 'e.g. April 2025 – March 2026' },
        { id: 'overallRating', label: 'Overall Performance Rating', type: 'select', required: false, options: ['Exceeds expectations', 'Meets expectations', 'Partially meets expectations', 'Does not meet expectations'] },
        { id: 'achievements', label: 'Key Achievements', type: 'textarea', required: false },
        { id: 'objectives', label: 'Objectives for Next Period', type: 'textarea', required: false },
        { id: 'developmentNeeds', label: 'Development Needs / Training', type: 'textarea', required: false },
        { id: 'employeeComments', label: 'Employee Comments', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Appraisal Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Job Title', data.jobTitle],
      ['Manager', data.manager],
      ['Date', or(data.appraisalDate, '[Date]')],
      ['Review Period', data.period],
      ['Overall Rating', data.overallRating],
    ])),
    data.achievements ? section('Key Achievements', `<p>${nl2br(data.achievements)}</p>`) : '',
    data.objectives ? section('Objectives for Next Period', `<p>${nl2br(data.objectives)}</p>`) : '',
    data.developmentNeeds ? section('Development Needs & Training', `<p>${nl2br(data.developmentNeeds)}</p>`) : '',
    data.employeeComments ? section('Employee Comments', `<p>${nl2br(data.employeeComments)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Holiday Request Form ─────────────────────────────────────────────────────
export const holidayRequestForm: DocumentTemplate = {
  id: 'holiday-request-form',
  name: 'Holiday Request Form',
  category: 'hr',
  description: 'A form for requesting annual leave.',
  icon: 'Umbrella',
  planRequired: 'free',
  tags: ['holiday', 'annual leave', 'request', 'hr'],
  signatories: [{ label: 'Employee' }, { label: 'Manager (Approval)' }],
  sections: [
    {
      id: 'details',
      title: 'Request Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'requestDate', label: 'Date of Request', type: 'date', required: true },
        { id: 'leaveFrom', label: 'Leave From', type: 'date', required: true },
        { id: 'leaveTo', label: 'Leave To', type: 'date', required: true },
        { id: 'totalDays', label: 'Total Days Requested', type: 'text', required: false },
        { id: 'remainingEntitlement', label: 'Remaining Entitlement (before this request)', type: 'text', required: false },
        { id: 'coverArrangements', label: 'Cover Arrangements', type: 'textarea', required: false },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Request Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Department', data.department],
      ['Manager', data.manager],
      ['Date of Request', or(data.requestDate, '[Date]')],
    ])),
    section('Leave Details', infoTable([
      ['Leave From', or(data.leaveFrom, '[From]')],
      ['Leave To', or(data.leaveTo, '[To]')],
      ['Total Days', data.totalDays],
      ['Remaining Entitlement', data.remainingEntitlement],
    ])),
    data.coverArrangements ? section('Cover Arrangements', `<p>${nl2br(data.coverArrangements)}</p>`) : '',
    data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    section('Manager Decision',
      `<table class="pdf-table"><thead><tr><th>Decision</th><th>Manager Signature</th><th>Date</th></tr></thead><tbody><tr><td><span style="display:inline-block;width:14px;height:14px;border:1.5px solid #1B4F8A;border-radius:2px;margin-right:6px;"></span>Approved &nbsp;&nbsp; <span style="display:inline-block;width:14px;height:14px;border:1.5px solid #1B4F8A;border-radius:2px;margin-right:6px;"></span>Declined</td><td></td><td></td></tr></tbody></table>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Disciplinary Invite Letter ───────────────────────────────────────────────
export const disciplinaryInviteLetter: DocumentTemplate = {
  id: 'disciplinary-invite-letter',
  name: 'Disciplinary Invite Letter',
  category: 'hr',
  description: 'A letter inviting an employee to a disciplinary hearing.',
  icon: 'Mail',
  planRequired: 'free',
  tags: ['disciplinary', 'invite', 'hearing', 'hr'],
  signatories: [{ label: 'Manager / HR' }],
  sections: [
    {
      id: 'details',
      title: 'Letter Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'managerName', label: 'Manager / HR Name', type: 'text', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'hearingDate', label: 'Hearing Date', type: 'date', required: true },
        { id: 'hearingTime', label: 'Hearing Time', type: 'text', required: false },
        { id: 'hearingLocation', label: 'Hearing Location', type: 'text', required: false },
        { id: 'allegations', label: 'Allegations / Issues to be Discussed', type: 'textarea', required: true },
        { id: 'companionRight', label: 'Right to be Accompanied', type: 'select', required: false, options: ['Yes — employee may bring a trade union representative or colleague', 'No — internal meeting only'] },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['To', or(data.employeeName, '[Employee]')],
      ['From', `${or(data.managerName, '[Manager]')}, ${or(data.companyName, '[Company]')}`],
      ['Date', or(data.letterDate, '[Date]')],
    ])),
    section('Invitation to Disciplinary Hearing',
      `<p>Dear <strong>${or(data.employeeName, '[Employee]')}</strong>,</p>
      <p>I am writing to invite you to attend a disciplinary hearing to discuss the following matter(s):</p>
      <div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:12px 16px;margin:8px 0;border-radius:2px;"><p style="margin:0;">${nl2br(or(data.allegations, '[Allegations]'))}</p></div>
      <p>The hearing will take place on <strong>${or(data.hearingDate, '[Date]')}</strong>${data.hearingTime ? ` at ${data.hearingTime}` : ''}${data.hearingLocation ? `, at ${data.hearingLocation}` : ''}.</p>
      ${data.companionRight === 'Yes — employee may bring a trade union representative or colleague'
        ? '<p>You have the right to be accompanied by a trade union representative or a work colleague at this hearing.</p>'
        : ''
      }
      <p>Please confirm your attendance. If you are unable to attend on the proposed date, please contact me as soon as possible to arrange an alternative.</p>
      <p>Yours sincerely,<br><strong>${or(data.managerName, '[Manager]')}</strong><br>${or(data.companyName, '[Company]')}</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Disciplinary Outcome Letter ──────────────────────────────────────────────
export const disciplinaryOutcomeLetter: DocumentTemplate = {
  id: 'disciplinary-outcome-letter',
  name: 'Disciplinary Outcome Letter',
  category: 'hr',
  description: 'A letter confirming the outcome of a disciplinary hearing.',
  icon: 'FileCheck',
  planRequired: 'free',
  tags: ['disciplinary', 'outcome', 'hr', 'letter'],
  signatories: [{ label: 'Manager / HR' }],
  sections: [
    {
      id: 'details',
      title: 'Letter Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'managerName', label: 'Manager / HR Name', type: 'text', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'hearingDate', label: 'Hearing Date', type: 'date', required: false },
        { id: 'outcome', label: 'Outcome', type: 'select', required: true, options: ['No further action', 'First Written Warning', 'Second Written Warning', 'Final Written Warning', 'Dismissal with notice', 'Summary dismissal'] },
        { id: 'summary', label: 'Summary of Findings', type: 'textarea', required: true },
        { id: 'improvement', label: 'Required Improvement (if applicable)', type: 'textarea', required: false },
        { id: 'appealRights', label: 'Appeal Rights', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['To', or(data.employeeName, '[Employee]')],
      ['From', `${or(data.managerName, '[Manager]')}, ${or(data.companyName, '[Company]')}`],
      ['Date', or(data.letterDate, '[Date]')],
      ['Hearing Date', data.hearingDate],
    ])),
    section('Disciplinary Outcome',
      `<p>Dear <strong>${or(data.employeeName, '[Employee]')}</strong>,</p>
      <p>I am writing to confirm the outcome of the disciplinary hearing held on ${data.hearingDate || '[date]'}.</p>
      <p><strong>Outcome: ${or(data.outcome, '[Outcome]')}</strong></p>
      <p>${nl2br(or(data.summary, '[Summary of findings]'))}</p>` +
      (data.improvement ? `<p><strong>Required improvement:</strong><br>${nl2br(data.improvement)}</p>` : '')
    ),
    section('Appeal Rights',
      `<p>${data.appealRights || `You have the right to appeal this decision. If you wish to appeal, please do so in writing to ${or(data.managerName, '[Manager]')} within 5 working days of receiving this letter.`}</p>
      <p>Yours sincerely,<br><strong>${or(data.managerName, '[Manager]')}</strong><br>${or(data.companyName, '[Company]')}</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Grievance Form ───────────────────────────────────────────────────────────
export const grievanceForm: DocumentTemplate = {
  id: 'grievance-form',
  name: 'Grievance Form',
  category: 'hr',
  description: 'A form for employees to formally raise a grievance.',
  icon: 'AlertCircle',
  planRequired: 'free',
  tags: ['grievance', 'complaint', 'hr', 'employee'],
  signatories: [{ label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Grievance Details',
      fields: [
        { id: 'employeeName', label: 'Your Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Your Job Title', type: 'text', required: false },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'submissionDate', label: 'Date Submitted', type: 'date', required: true },
        { id: 'grievanceType', label: 'Nature of Grievance', type: 'select', required: true, options: ['Bullying or harassment', 'Discrimination', 'Working conditions', 'Pay or benefits', 'Management behaviour', 'Workload', 'Other'] },
        { id: 'description', label: 'Description of Grievance', type: 'textarea', required: true },
        { id: 'datesIncidents', label: 'Dates of Incidents', type: 'textarea', required: false },
        { id: 'witnesses', label: 'Witnesses (if any)', type: 'textarea', required: false },
        { id: 'resolution', label: 'Desired Resolution', type: 'textarea', required: false },
        { id: 'previousSteps', label: 'Steps Already Taken to Resolve', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Grievance Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Job Title', data.jobTitle],
      ['Department', data.department],
      ['Date Submitted', or(data.submissionDate, '[Date]')],
      ['Nature of Grievance', or(data.grievanceType, '[Type]')],
    ])),
    section('Description of Grievance', `<p>${nl2br(or(data.description, '[Description]'))}</p>`),
    data.datesIncidents ? section('Dates of Incidents', `<p>${nl2br(data.datesIncidents)}</p>`) : '',
    data.witnesses ? section('Witnesses', `<p>${nl2br(data.witnesses)}</p>`) : '',
    data.previousSteps ? section('Steps Already Taken', `<p>${nl2br(data.previousSteps)}</p>`) : '',
    data.resolution ? section('Desired Resolution', `<p>${nl2br(data.resolution)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Flexible Working Request ─────────────────────────────────────────────────
export const flexibleWorkingRequest: DocumentTemplate = {
  id: 'flexible-working-request',
  name: 'Flexible Working Request Form',
  category: 'hr',
  description: 'A statutory flexible working request form.',
  icon: 'Clock',
  planRequired: 'free',
  tags: ['flexible working', 'request', 'hr', 'part-time'],
  signatories: [{ label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Request Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'requestDate', label: 'Date of Request', type: 'date', required: true },
        { id: 'changeRequested', label: 'Change Requested', type: 'select', required: true, options: ['Reduced hours', 'Change of working days', 'Change of start/finish times', 'Compressed hours', 'Remote / home working', 'Job share', 'Other'] },
        { id: 'currentPattern', label: 'Current Working Pattern', type: 'textarea', required: true },
        { id: 'proposedPattern', label: 'Proposed Working Pattern', type: 'textarea', required: true },
        { id: 'proposedStartDate', label: 'Proposed Start Date', type: 'date', required: false },
        { id: 'businessImpact', label: 'How the Change Could be Accommodated', type: 'textarea', required: false },
        { id: 'previousRequests', label: 'Previous Flexible Working Requests in Last 12 Months', type: 'select', required: false, options: ['None', 'Yes — one request made'] },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Request Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Job Title', data.jobTitle],
      ['Date', or(data.requestDate, '[Date]')],
      ['Change Requested', or(data.changeRequested, '[Change]')],
      ['Proposed Start Date', data.proposedStartDate],
      ['Previous Requests', data.previousRequests],
    ])),
    section('Working Pattern', infoTable([
      ['Current Pattern', or(data.currentPattern, '[Current]')],
      ['Proposed Pattern', or(data.proposedPattern, '[Proposed]')],
    ])),
    data.businessImpact ? section('How the Change Could be Accommodated', `<p>${nl2br(data.businessImpact)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Resignation Acknowledgement ──────────────────────────────────────────────
export const resignationAcknowledgement: DocumentTemplate = {
  id: 'resignation-acknowledgement',
  name: 'Resignation Acknowledgement Letter',
  category: 'hr',
  description: 'A letter acknowledging receipt of an employee\'s resignation.',
  icon: 'CheckCircle',
  planRequired: 'free',
  tags: ['resignation', 'acknowledgement', 'hr', 'letter'],
  signatories: [{ label: 'Manager / HR' }],
  sections: [
    {
      id: 'details',
      title: 'Letter Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'managerName', label: 'Manager / HR Name', type: 'text', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'resignationDate', label: 'Date Resignation Received', type: 'date', required: false },
        { id: 'lastWorkingDay', label: 'Last Working Day', type: 'date', required: true },
        { id: 'noticePeriod', label: 'Notice Period', type: 'text', required: false },
        { id: 'additionalInfo', label: 'Additional Information (handover, exit interview, etc.)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['To', or(data.employeeName, '[Employee]')],
      ['From', `${or(data.managerName, '[Manager]')}, ${or(data.companyName, '[Company]')}`],
      ['Date', or(data.letterDate, '[Date]')],
    ])),
    section('Acknowledgement of Resignation',
      `<p>Dear <strong>${or(data.employeeName, '[Employee]')}</strong>,</p>
      <p>I am writing to acknowledge receipt of your resignation${data.resignationDate ? ` received on ${data.resignationDate}` : ''}.</p>
      <p>We confirm that your last working day will be <strong>${or(data.lastWorkingDay, '[Last Working Day]')}</strong>${data.noticePeriod ? `, in accordance with your ${data.noticePeriod} notice period` : ''}.</p>` +
      (data.additionalInfo ? `<p>${nl2br(data.additionalInfo)}</p>` : '') +
      `<p>We wish you well in your future endeavours.</p>
      <p>Yours sincerely,<br><strong>${or(data.managerName, '[Manager]')}</strong><br>${or(data.companyName, '[Company]')}</p>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Reference Request Letter ─────────────────────────────────────────────────
export const referenceRequestLetter: DocumentTemplate = {
  id: 'reference-request-letter',
  name: 'Reference Request Letter',
  category: 'hr',
  description: 'A letter requesting a reference for a former employee or candidate.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['reference', 'request', 'hr', 'letter'],
  signatories: [{ label: 'Requester' }],
  sections: [
    {
      id: 'details',
      title: 'Letter Details',
      fields: [
        { id: 'requesterName', label: 'Your Name', type: 'text', required: true },
        { id: 'requesterOrg', label: 'Your Organisation', type: 'text', required: false },
        { id: 'requesterEmail', label: 'Your Email', type: 'email', required: false },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'refereeName', label: 'Referee Name', type: 'text', required: true },
        { id: 'refereeOrg', label: 'Referee Organisation', type: 'text', required: false },
        { id: 'candidateName', label: 'Candidate Name', type: 'text', required: true },
        { id: 'roleAppliedFor', label: 'Role Applied For', type: 'text', required: false },
        { id: 'responseDeadline', label: 'Response Requested By', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['From', [or(data.requesterName, '[Requester]'), data.requesterOrg].filter(Boolean).join(', ')],
      ['Email', data.requesterEmail],
      ['Date', or(data.letterDate, '[Date]')],
      ['To', [or(data.refereeName, '[Referee]'), data.refereeOrg].filter(Boolean).join(', ')],
    ])),
    section('Reference Request',
      `<p>Dear <strong>${or(data.refereeName, '[Referee]')}</strong>,</p>
      <p>I am writing to request a reference for <strong>${or(data.candidateName, '[Candidate]')}</strong>${data.roleAppliedFor ? `, who has applied for the position of ${data.roleAppliedFor}` : ''} at ${or(data.requesterOrg, 'our organisation')}.</p>
      <p>I understand that ${or(data.candidateName, '[Candidate]')} was previously employed by or associated with your organisation, and I would be grateful for your assessment of their suitability for this role.</p>
      <p>Please feel free to comment on their performance, reliability, skills, and any other relevant matters. All information will be treated in confidence.</p>
      ${data.responseDeadline ? `<p>I would be grateful if you could respond by <strong>${data.responseDeadline}</strong>.</p>` : ''}
      <p>Thank you for your time and assistance.</p>
      <p>Yours sincerely,<br><strong>${or(data.requesterName, '[Your Name]')}</strong>${data.requesterOrg ? `<br>${data.requesterOrg}` : ''}</p>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Equipment Issue Form ─────────────────────────────────────────────────────
export const equipmentIssueForm: DocumentTemplate = {
  id: 'equipment-issue-form',
  name: 'Equipment Issue Form',
  category: 'hr',
  description: 'A form recording equipment issued to an employee.',
  icon: 'Laptop',
  planRequired: 'free',
  tags: ['equipment', 'issue', 'hr', 'assets'],
  signatories: [{ label: 'Issuing Manager' }, { label: 'Employee (Receipt)' }],
  sections: [
    {
      id: 'details',
      title: 'Issue Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'issueDate', label: 'Date of Issue', type: 'date', required: true },
        { id: 'issuedBy', label: 'Issued By', type: 'text', required: false },
        { id: 'equipment', label: 'Equipment Issued (Item | Serial/Asset No. | Condition)', type: 'textarea', required: true, placeholder: 'Laptop | SN123456 | Good\nMobile phone | SN789012 | Good\nAccess card | AC001 | New' },
        { id: 'returnDate', label: 'Expected Return Date (if applicable)', type: 'date', required: false },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.equipment || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Issue Details', infoTable([
        ['Employee', or(data.employeeName, '[Employee]')],
        ['Job Title', data.jobTitle],
        ['Date of Issue', or(data.issueDate, '[Date]')],
        ['Issued By', data.issuedBy],
        ['Expected Return', data.returnDate],
      ])),
      section('Equipment Issued', dataTable(['Item', 'Serial / Asset No.', 'Condition'], rows)),
      data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
      `<p style="font-size:9pt;color:#6b7280;margin-top:12px;">By signing below, the employee confirms receipt of the above equipment and agrees to return it in good condition when required.</p>`,
    ].filter(Boolean).join('');
  },
};

// ─── Leaver Checklist ─────────────────────────────────────────────────────────
export const leaverChecklist: DocumentTemplate = {
  id: 'leaver-checklist',
  name: 'Leaver Checklist',
  category: 'hr',
  description: 'A checklist for managing the offboarding of a departing employee.',
  icon: 'LogOut',
  planRequired: 'free',
  tags: ['leaver', 'offboarding', 'checklist', 'hr'],
  signatories: [{ label: 'Manager' }, { label: 'HR' }],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'lastWorkingDay', label: 'Last Working Day', type: 'date', required: true },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'customItems', label: 'Additional Checklist Items (one per line)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const standardItems = [
      'Resignation letter received and acknowledged',
      'Last working day confirmed',
      'Payroll notified — final pay calculated',
      'P45 prepared',
      'Holiday balance calculated and paid',
      'All company equipment returned (laptop, phone, access card, etc.)',
      'System access revoked (email, IT systems, building access)',
      'Handover notes completed',
      'Exit interview conducted',
      'Reference policy confirmed',
      'Confidentiality obligations reminded',
      'Company files and data returned / deleted',
      'LinkedIn / social media profile updated (if applicable)',
    ];
    const customItems = (data.customItems || '').split('\n').filter(Boolean);
    const allItems = [...standardItems, ...customItems];
    return [
      section('Leaver Details', infoTable([
        ['Employee', or(data.employeeName, '[Employee]')],
        ['Job Title', data.jobTitle],
        ['Last Working Day', or(data.lastWorkingDay, '[Date]')],
        ['Manager', data.manager],
      ])),
      section('Leaver Checklist',
        `<table class="pdf-table"><thead><tr><th style="width:40px;">Done</th><th>Item</th><th style="width:120px;">Completed By</th><th style="width:80px;">Date</th></tr></thead><tbody>${allItems.map(item =>
          `<tr><td><span style="display:inline-block;width:14px;height:14px;border:1.5px solid #1B4F8A;border-radius:2px;"></span></td><td>${item}</td><td></td><td></td></tr>`
        ).join('')}</tbody></table>`
      ),
    ].join('');
  },
};

// ─── Return to Work Form ──────────────────────────────────────────────────────
export const returnToWorkForm: DocumentTemplate = {
  id: 'return-to-work-form',
  name: 'Return to Work Form',
  category: 'hr',
  description: 'A return to work interview form following a period of sickness absence.',
  icon: 'UserCheck',
  planRequired: 'free',
  tags: ['return to work', 'sickness', 'absence', 'hr'],
  signatories: [{ label: 'Manager' }, { label: 'Employee' }],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
        { id: 'manager', label: 'Manager Name', type: 'text', required: false },
        { id: 'returnDate', label: 'Date of Return', type: 'date', required: true },
        { id: 'absenceFrom', label: 'Absence From', type: 'date', required: false },
        { id: 'absenceTo', label: 'Absence To', type: 'date', required: false },
        { id: 'totalDays', label: 'Total Days Absent', type: 'text', required: false },
        { id: 'reasonForAbsence', label: 'Reason for Absence', type: 'textarea', required: false },
        { id: 'fitForWork', label: 'Employee Confirms Fit for Work?', type: 'select', required: false, options: ['Yes — fully fit', 'Yes — with adjustments', 'No — further absence required'] },
        { id: 'adjustments', label: 'Adjustments Required (if any)', type: 'textarea', required: false },
        { id: 'notes', label: 'Manager Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Return to Work Details', infoTable([
      ['Employee', or(data.employeeName, '[Employee]')],
      ['Job Title', data.jobTitle],
      ['Manager', data.manager],
      ['Date of Return', or(data.returnDate, '[Date]')],
      ['Absence Period', data.absenceFrom && data.absenceTo ? `${data.absenceFrom} to ${data.absenceTo}` : ''],
      ['Total Days Absent', data.totalDays],
    ])),
    data.reasonForAbsence ? section('Reason for Absence', `<p>${nl2br(data.reasonForAbsence)}</p>`) : '',
    section('Fitness for Work', infoTable([
      ['Employee Confirms Fit for Work', data.fitForWork || '—'],
      ['Adjustments Required', data.adjustments || 'None'],
    ])),
    data.notes ? section('Manager Notes', `<p>${nl2br(data.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
};
