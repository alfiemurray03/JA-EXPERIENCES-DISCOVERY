import type { BuilderTemplate } from '@/lib/builder-framework';

export const LETTER_TEMPLATES: BuilderTemplate[] = [
  // ── Business ──────────────────────────────────────────────────────────────
  {
    id: 'letter-formal-business',
    builderId: 'letter',
    name: 'Formal Business Letter',
    description: 'Standard UK formal business letter for any professional purpose',
    category: 'Business',
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea', placeholder: 'Street, City, Postcode' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'sender_phone',      label: 'Your Phone',                 type: 'phone' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     required: true },
      { id: 'recipient_title',   label: 'Recipient Title / Role',     type: 'text' },
      { id: 'recipient_org',     label: 'Recipient Organisation',     type: 'text' },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea' },
      { id: 'reference',         label: 'Reference (optional)',       type: 'text',     placeholder: 'e.g. Ref: INV-2026-001' },
      { id: 'subject',           label: 'Subject',                    type: 'text',     required: true },
      { id: 'salutation',        label: 'Salutation',                 type: 'text',     defaultValue: 'Dear', required: true },
      { id: 'body',              label: 'Letter Body',                type: 'textarea', required: true },
      { id: 'closing',           label: 'Closing',                    type: 'text',     defaultValue: 'Yours sincerely,' },
      { id: 'signatory_name',    label: 'Signatory Name',             type: 'text' },
      { id: 'signatory_title',   label: 'Signatory Title',            type: 'text' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}
{{sender_phone}}

{{letter_date}}

{{recipient_name}}
{{recipient_title}}
{{recipient_org}}
{{recipient_address}}

{{reference}}

**{{subject}}**

{{salutation}} {{recipient_name}},

{{body}}

{{closing}}

{{signatory_name}}
{{signatory_title}}`,
  },

  {
    id: 'letter-business-inquiry',
    builderId: 'letter',
    name: 'Business Enquiry Letter',
    description: 'Enquire about products, services, or business opportunities',
    category: 'Business',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     required: true },
      { id: 'recipient_org',     label: 'Recipient Organisation',     type: 'text' },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea' },
      { id: 'subject',           label: 'Subject',                    type: 'text',     defaultValue: 'Business Enquiry', required: true },
      { id: 'enquiry_details',   label: 'Enquiry Details',            type: 'textarea', required: true, placeholder: 'Describe what you are enquiring about' },
      { id: 'specific_questions',label: 'Specific Questions',         type: 'textarea', placeholder: 'List any specific questions you have' },
      { id: 'next_steps',        label: 'Requested Next Steps',       type: 'textarea', placeholder: 'e.g. Please send a brochure / arrange a call' },
      { id: 'signatory_name',    label: 'Your Name',                  type: 'text' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}

{{letter_date}}

{{recipient_name}}
{{recipient_org}}
{{recipient_address}}

**{{subject}}**

Dear {{recipient_name}},

I am writing to enquire about the following:

{{enquiry_details}}

{{specific_questions}}

{{next_steps}}

I look forward to hearing from you.

Yours sincerely,

{{signatory_name}}`,
  },

  {
    id: 'letter-reference',
    builderId: 'letter',
    name: 'Reference Letter',
    description: 'Professional reference or character reference letter',
    category: 'Business',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name',                  type: 'text',     required: true },
      { id: 'sender_title',      label: 'Your Title / Role',          type: 'text' },
      { id: 'sender_org',        label: 'Your Organisation',          type: 'text' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'subject_name',      label: 'Subject\'s Full Name',       type: 'text',     required: true },
      { id: 'relationship',      label: 'Your Relationship',          type: 'text',     placeholder: 'e.g. Line Manager, Colleague, Tutor', required: true },
      { id: 'duration',          label: 'Duration Known',             type: 'text',     placeholder: 'e.g. 3 years' },
      { id: 'qualities',         label: 'Key Qualities & Strengths',  type: 'textarea', required: true },
      { id: 'achievements',      label: 'Notable Achievements',       type: 'textarea' },
      { id: 'recommendation',    label: 'Recommendation Statement',   type: 'textarea', required: true },
      { id: 'contact_offer',     label: 'Contact Offer',              type: 'text',     defaultValue: 'Please do not hesitate to contact me if you require any further information.' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_title}}, {{sender_org}}
{{sender_email}}

{{letter_date}}

To Whom It May Concern,

**Re: Reference for {{subject_name}}**

I am pleased to provide this reference for {{subject_name}}, whom I have known as {{relationship}} for {{duration}}.

{{qualities}}

{{achievements}}

{{recommendation}}

{{contact_offer}}

Yours faithfully,

{{sender_name}}
{{sender_title}}
{{sender_org}}`,
  },

  // ── Complaints ────────────────────────────────────────────────────────────
  {
    id: 'letter-complaint',
    builderId: 'letter',
    name: 'Formal Complaint Letter',
    description: 'Formal complaint to a business, organisation, or service provider',
    category: 'Complaints',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#dc2626',
    fields: [
      { id: 'sender_name',       label: 'Your Full Name',             type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea', required: true },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'sender_phone',      label: 'Your Phone',                 type: 'phone' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Complaints Manager / Name',  type: 'text',     defaultValue: 'The Complaints Manager' },
      { id: 'recipient_org',     label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'recipient_address', label: 'Organisation Address',       type: 'textarea' },
      { id: 'account_ref',       label: 'Account / Reference Number', type: 'text' },
      { id: 'complaint_subject', label: 'Complaint Subject',          type: 'text',     required: true },
      { id: 'incident_date',     label: 'Date of Incident',           type: 'date' },
      { id: 'complaint_details', label: 'Full Details of Complaint',  type: 'textarea', required: true },
      { id: 'previous_contact',  label: 'Previous Contact / Attempts',type: 'textarea', placeholder: 'Describe any previous attempts to resolve this' },
      { id: 'resolution_sought', label: 'Resolution Sought',          type: 'textarea', required: true, placeholder: 'What outcome are you seeking?' },
      { id: 'deadline',          label: 'Response Deadline',          type: 'text',     defaultValue: '14 days' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}
{{sender_phone}}

{{letter_date}}

{{recipient_name}}
{{recipient_org}}
{{recipient_address}}

**FORMAL COMPLAINT: {{complaint_subject}}**
Account / Reference: {{account_ref}}

Dear {{recipient_name}},

I am writing to formally complain about {{complaint_subject}}, which occurred on {{incident_date}}.

**Details of my complaint:**

{{complaint_details}}

**Previous contact:**

{{previous_contact}}

**Resolution sought:**

{{resolution_sought}}

I expect a full written response within **{{deadline}}** of the date of this letter. If I do not receive a satisfactory response, I reserve the right to escalate this matter to the relevant ombudsman or regulatory body.

Yours faithfully,

{{sender_name}}`,
  },

  {
    id: 'letter-complaint-response',
    builderId: 'letter',
    name: 'Complaint Response Letter',
    description: 'Respond to a customer or client complaint professionally',
    category: 'Complaints',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'sender_name',       label: 'Responder Name',             type: 'text',     required: true },
      { id: 'sender_title',      label: 'Responder Title',            type: 'text' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Complainant Name',           type: 'text',     required: true },
      { id: 'recipient_address', label: 'Complainant Address',        type: 'textarea' },
      { id: 'complaint_ref',     label: 'Complaint Reference',        type: 'text' },
      { id: 'complaint_summary', label: 'Summary of Complaint',       type: 'textarea', required: true },
      { id: 'investigation',     label: 'Investigation Findings',     type: 'textarea', required: true },
      { id: 'outcome',           label: 'Outcome / Decision',         type: 'select',   options: ['Complaint upheld', 'Complaint partially upheld', 'Complaint not upheld'], defaultValue: 'Complaint upheld' },
      { id: 'remedy',            label: 'Remedy / Action Taken',      type: 'textarea', required: true },
      { id: 'apology',           label: 'Apology Statement',          type: 'textarea', defaultValue: 'We sincerely apologise for the inconvenience and distress this matter has caused.' },
      { id: 'escalation_info',   label: 'Escalation Rights',          type: 'textarea', defaultValue: 'If you remain dissatisfied with our response, you have the right to escalate this matter to the relevant ombudsman or regulatory body.' },
    ],
    bodyTemplate: `{{org_name}}

{{letter_date}}

{{recipient_name}}
{{recipient_address}}

**Re: Your Complaint — Ref: {{complaint_ref}}**

Dear {{recipient_name}},

Thank you for bringing your complaint to our attention. We have now completed our investigation and write to provide our formal response.

**Summary of your complaint:**
{{complaint_summary}}

**Our investigation:**
{{investigation}}

**Outcome: {{outcome}}**

**Action taken:**
{{remedy}}

{{apology}}

{{escalation_info}}

Yours sincerely,

{{sender_name}}
{{sender_title}}
{{org_name}}`,
  },

  // ── HR & Employment ───────────────────────────────────────────────────────
  {
    id: 'letter-offer-employment',
    builderId: 'letter',
    name: 'Job Offer Letter',
    description: 'Formal offer of employment letter',
    category: 'HR & Employment',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'candidate_name',    label: 'Candidate Full Name',        type: 'text',     required: true },
      { id: 'candidate_address', label: 'Candidate Address',          type: 'textarea' },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'department',        label: 'Department',                 type: 'text' },
      { id: 'start_date',        label: 'Start Date',                 type: 'date',     required: true },
      { id: 'salary',            label: 'Salary',                     type: 'text',     required: true, placeholder: 'e.g. £35,000 per annum' },
      { id: 'hours',             label: 'Hours of Work',              type: 'text',     defaultValue: '37.5 hours per week, Monday to Friday' },
      { id: 'probation',         label: 'Probation Period',           type: 'text',     defaultValue: '3 months' },
      { id: 'holiday',           label: 'Annual Leave',               type: 'text',     defaultValue: '25 days plus bank holidays' },
      { id: 'conditions',        label: 'Conditions of Offer',        type: 'textarea', defaultValue: 'This offer is subject to satisfactory references and right to work verification.' },
      { id: 'acceptance_deadline',label: 'Acceptance Deadline',       type: 'date' },
      { id: 'hr_contact',        label: 'HR Contact Name',            type: 'text' },
      { id: 'hr_email',          label: 'HR Email',                   type: 'email' },
    ],
    bodyTemplate: `{{org_name}}

{{letter_date}}

{{candidate_name}}
{{candidate_address}}

**OFFER OF EMPLOYMENT**

Dear {{candidate_name}},

We are delighted to offer you the position of **{{job_title}}** within the {{department}} department at {{org_name}}.

**Terms of your offer:**

- **Start Date:** {{start_date}}
- **Salary:** {{salary}}
- **Hours:** {{hours}}
- **Probation Period:** {{probation}}
- **Annual Leave:** {{holiday}}

**Conditions:**
{{conditions}}

Please confirm your acceptance of this offer in writing by {{acceptance_deadline}}.

If you have any questions, please contact {{hr_contact}} at {{hr_email}}.

We look forward to welcoming you to the team.

Yours sincerely,

{{hr_contact}}
HR Department
{{org_name}}`,
  },

  {
    id: 'letter-resignation',
    builderId: 'letter',
    name: 'Resignation Letter',
    description: 'Professional resignation letter with notice period',
    category: 'HR & Employment',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#7c3aed',
    fields: [
      { id: 'sender_name',       label: 'Your Full Name',             type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'manager_name',      label: 'Manager\'s Name',            type: 'text',     required: true },
      { id: 'manager_title',     label: 'Manager\'s Title',           type: 'text' },
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'job_title',         label: 'Your Job Title',             type: 'text',     required: true },
      { id: 'notice_period',     label: 'Notice Period',              type: 'text',     defaultValue: 'one month', required: true },
      { id: 'last_day',          label: 'Last Working Day',           type: 'date',     required: true },
      { id: 'reason',            label: 'Reason (optional)',          type: 'textarea', placeholder: 'Brief reason for leaving — keep positive' },
      { id: 'gratitude',         label: 'Gratitude Statement',        type: 'textarea', defaultValue: 'I am grateful for the opportunities and experiences I have gained during my time here.' },
      { id: 'handover_offer',    label: 'Handover Offer',             type: 'text',     defaultValue: 'I am happy to assist with the handover of my responsibilities during my notice period.' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{manager_name}}
{{manager_title}}
{{org_name}}

Dear {{manager_name}},

**Resignation — {{job_title}}**

I am writing to formally resign from my position as {{job_title}} at {{org_name}}, with effect from {{letter_date}}.

In accordance with my notice period of {{notice_period}}, my last working day will be **{{last_day}}**.

{{reason}}

{{gratitude}}

{{handover_offer}}

Yours sincerely,

{{sender_name}}`,
  },

  {
    id: 'letter-disciplinary',
    builderId: 'letter',
    name: 'Disciplinary Letter',
    description: 'Formal disciplinary letter — warning or outcome notice',
    category: 'HR & Employment',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'employee_name',     label: 'Employee Full Name',         type: 'text',     required: true },
      { id: 'employee_address',  label: 'Employee Address',           type: 'textarea' },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'warning_type',      label: 'Warning Type',               type: 'select',   options: ['First Written Warning', 'Final Written Warning', 'Dismissal Notice', 'Suspension Notice'], defaultValue: 'First Written Warning' },
      { id: 'misconduct_details',label: 'Details of Misconduct',      type: 'textarea', required: true },
      { id: 'hearing_date',      label: 'Date of Disciplinary Hearing',type: 'date' },
      { id: 'outcome',           label: 'Outcome / Decision',         type: 'textarea', required: true },
      { id: 'improvement_required',label: 'Improvement Required',     type: 'textarea' },
      { id: 'warning_duration',  label: 'Warning Duration',           type: 'text',     defaultValue: '12 months' },
      { id: 'appeal_rights',     label: 'Appeal Rights',              type: 'textarea', defaultValue: 'You have the right to appeal this decision within 5 working days by writing to the HR Manager.' },
      { id: 'hr_name',           label: 'HR / Manager Name',          type: 'text' },
    ],
    bodyTemplate: `{{org_name}}

{{letter_date}}

PRIVATE AND CONFIDENTIAL

{{employee_name}}
{{employee_address}}

Dear {{employee_name}},

**{{warning_type}} — {{job_title}}**

Following the disciplinary hearing held on {{hearing_date}}, I am writing to confirm the outcome of the disciplinary process.

**Details of the matter:**
{{misconduct_details}}

**Outcome:**
{{outcome}}

**Improvement required:**
{{improvement_required}}

This {{warning_type}} will remain on your personnel file for **{{warning_duration}}**.

**Your right to appeal:**
{{appeal_rights}}

Yours sincerely,

{{hr_name}}
{{org_name}}`,
  },

  // ── Property ──────────────────────────────────────────────────────────────
  {
    id: 'letter-tenancy-notice',
    builderId: 'letter',
    name: 'Tenancy Notice Letter',
    description: 'Section 21 or Section 8 notice, or notice to quit',
    category: 'Property',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: false,
    accentColor: '#b45309',
    fields: [
      { id: 'landlord_name',     label: 'Landlord / Agent Name',      type: 'text',     required: true },
      { id: 'landlord_address',  label: 'Landlord Address',           type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'tenant_name',       label: 'Tenant(s) Full Name(s)',     type: 'text',     required: true },
      { id: 'property_address',  label: 'Property Address',           type: 'textarea', required: true },
      { id: 'notice_type',       label: 'Notice Type',                type: 'select',   options: ['Section 21 Notice', 'Section 8 Notice', 'Notice to Quit', 'Notice of Rent Increase', 'Notice of Inspection'], defaultValue: 'Section 21 Notice' },
      { id: 'notice_details',    label: 'Notice Details',             type: 'textarea', required: true },
      { id: 'vacate_date',       label: 'Date to Vacate / Comply',    type: 'date' },
      { id: 'legal_note',        label: 'Legal Note',                 type: 'textarea', defaultValue: 'This notice is served in accordance with the Housing Act 1988 (as amended). You may wish to seek independent legal advice.' },
    ],
    bodyTemplate: `{{landlord_name}}
{{landlord_address}}

{{letter_date}}

{{tenant_name}}
{{property_address}}

**{{notice_type}}**

Dear {{tenant_name}},

I am writing regarding the tenancy at the above property.

{{notice_details}}

**Date to vacate / comply: {{vacate_date}}**

{{legal_note}}

Yours faithfully,

{{landlord_name}}`,
  },

  // ── Cover Letters ─────────────────────────────────────────────────────────
  {
    id: 'letter-cover',
    builderId: 'letter',
    name: 'Cover Letter',
    description: 'Job application cover letter',
    category: 'Cover Letters',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#0891b2',
    fields: [
      { id: 'sender_name',       label: 'Your Full Name',             type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email',    required: true },
      { id: 'sender_phone',      label: 'Your Phone',                 type: 'phone' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'hiring_manager',    label: 'Hiring Manager Name',        type: 'text',     defaultValue: 'Hiring Manager' },
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'org_address',       label: 'Organisation Address',       type: 'textarea' },
      { id: 'job_title',         label: 'Job Title Applying For',     type: 'text',     required: true },
      { id: 'job_ref',           label: 'Job Reference (if any)',     type: 'text' },
      { id: 'opening',           label: 'Opening Paragraph',          type: 'textarea', required: true, placeholder: 'Why you are applying and where you saw the role' },
      { id: 'skills_experience', label: 'Skills & Experience',        type: 'textarea', required: true, placeholder: 'Key skills and experience relevant to the role' },
      { id: 'why_company',       label: 'Why This Organisation',      type: 'textarea', required: true, placeholder: 'Why you want to work for this specific organisation' },
      { id: 'closing_statement', label: 'Closing Statement',          type: 'textarea', defaultValue: 'I would welcome the opportunity to discuss my application further and am available for interview at your convenience.' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}} | {{sender_phone}}

{{letter_date}}

{{hiring_manager}}
{{org_name}}
{{org_address}}

Dear {{hiring_manager}},

**Application for: {{job_title}}{{job_ref}}**

{{opening}}

{{skills_experience}}

{{why_company}}

{{closing_statement}}

Yours sincerely,

{{sender_name}}`,
  },

  // ── School & Education ────────────────────────────────────────────────────
  {
    id: 'letter-school-absence',
    builderId: 'letter',
    name: 'School Absence Letter',
    description: 'Letter to school explaining a child\'s absence',
    category: 'School & Education',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#16a34a',
    fields: [
      { id: 'parent_name',       label: 'Parent / Guardian Name',     type: 'text',     required: true },
      { id: 'parent_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'teacher_name',      label: 'Teacher / Head Teacher',     type: 'text',     defaultValue: 'The Class Teacher' },
      { id: 'school_name',       label: 'School Name',                type: 'text',     required: true },
      { id: 'child_name',        label: 'Child\'s Full Name',         type: 'text',     required: true },
      { id: 'child_class',       label: 'Child\'s Class / Year',      type: 'text' },
      { id: 'absence_dates',     label: 'Dates of Absence',           type: 'text',     required: true },
      { id: 'reason',            label: 'Reason for Absence',         type: 'textarea', required: true },
      { id: 'return_date',       label: 'Expected Return Date',       type: 'date' },
    ],
    bodyTemplate: `{{parent_name}}
{{parent_address}}

{{letter_date}}

{{teacher_name}}
{{school_name}}

Dear {{teacher_name}},

**Re: Absence of {{child_name}}, {{child_class}}**

I am writing to inform you that {{child_name}} was/will be absent from school on {{absence_dates}}.

**Reason for absence:**
{{reason}}

{{child_name}} is expected to return to school on {{return_date}}.

Please do not hesitate to contact me if you require any further information.

Yours sincerely,

{{parent_name}}`,
  },

  // ── Charity & Voluntary ───────────────────────────────────────────────────
  {
    id: 'letter-fundraising',
    builderId: 'letter',
    name: 'Fundraising Appeal Letter',
    description: 'Charity fundraising appeal or donation request letter',
    category: 'Charity & Voluntary',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'charity_name',      label: 'Charity / Organisation Name',type: 'text',     required: true },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     defaultValue: 'Dear Friend' },
      { id: 'cause_description', label: 'Cause Description',          type: 'textarea', required: true },
      { id: 'impact_statement',  label: 'Impact Statement',           type: 'textarea', required: true, placeholder: 'What difference will donations make?' },
      { id: 'ask',               label: 'The Ask',                    type: 'textarea', required: true, placeholder: 'What are you asking donors to do?' },
      { id: 'donation_details',  label: 'How to Donate',              type: 'textarea', required: true },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
    ],
    bodyTemplate: `{{charity_name}}

{{letter_date}}

Dear {{recipient_name}},

{{cause_description}}

{{impact_statement}}

{{ask}}

**How to donate:**
{{donation_details}}

Thank you for your generosity and support.

Yours sincerely,

{{contact_name}}
{{charity_name}}
{{contact_email}}`,
  },

  // ── Legal ─────────────────────────────────────────────────────────────────
  {
    id: 'letter-legal-notice',
    builderId: 'letter',
    name: 'Legal Notice / Letter Before Action',
    description: 'Letter before action or formal legal notice',
    category: 'Legal',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: false,
    accentColor: '#374151',
    fields: [
      { id: 'sender_name',       label: 'Your Full Name',             type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea', required: true },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Full Name',        type: 'text',     required: true },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea', required: true },
      { id: 'matter',            label: 'Subject Matter',             type: 'text',     required: true },
      { id: 'background',        label: 'Background',                 type: 'textarea', required: true },
      { id: 'claim_details',     label: 'Claim / Demand Details',     type: 'textarea', required: true },
      { id: 'amount_owed',       label: 'Amount Owed (if applicable)',type: 'text' },
      { id: 'deadline',          label: 'Response Deadline',          type: 'text',     defaultValue: '14 days' },
      { id: 'consequence',       label: 'Consequence of Non-Response',type: 'textarea', defaultValue: 'If I do not receive a satisfactory response within the stated period, I will commence legal proceedings without further notice.' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}

{{letter_date}}

{{recipient_name}}
{{recipient_address}}

**WITHOUT PREJUDICE SAVE AS TO COSTS**

**Re: {{matter}}**

Dear {{recipient_name}},

**Background:**
{{background}}

**Claim / Demand:**
{{claim_details}}

**Amount owed: {{amount_owed}}**

You are required to respond within **{{deadline}}** of the date of this letter.

{{consequence}}

Yours faithfully,

{{sender_name}}`,
  },

  // ── Resignation & Leaving ─────────────────────────────────────────────────
  {
    id: 'letter-resignation-v2',
    builderId: 'letter',
    name: 'Resignation Letter',
    description: 'Professional resignation letter with notice period',
    industries: ['HR', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name',                  type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'manager_name',      label: 'Manager / HR Name',          type: 'text',     required: true },
      { id: 'company_name',      label: 'Company Name',               type: 'text',     required: true },
      { id: 'job_title',         label: 'Your Job Title',             type: 'text' },
      { id: 'last_day',          label: 'Last Working Day',           type: 'date',     required: true },
      { id: 'notice_period',     label: 'Notice Period',              type: 'text',     defaultValue: '4 weeks' },
      { id: 'reason',            label: 'Reason (optional)',          type: 'textarea', placeholder: 'Brief reason for leaving — optional' },
      { id: 'gratitude',         label: 'Gratitude / Positive Note',  type: 'textarea', defaultValue: 'I have valued my time at the company and am grateful for the opportunities provided.' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{manager_name}}
{{company_name}}

**Resignation — {{job_title}}**

Dear {{manager_name}},

I am writing to formally resign from my position as {{job_title}} at {{company_name}}, effective {{last_day}}, in accordance with my {{notice_period}} notice period.

{{reason}}

{{gratitude}}

I will do everything I can to ensure a smooth handover during my notice period.

Yours sincerely,

{{sender_name}}`,
  },

  {
    id: 'letter-resignation-immediate',
    builderId: 'letter',
    name: 'Immediate Resignation Letter',
    description: 'Resignation without serving notice period',
    category: 'Resignation & Leaving',
    industries: ['HR', 'Business'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',    label: 'Your Name',          type: 'text',     required: true },
      { id: 'letter_date',    label: 'Date',               type: 'date',     required: true },
      { id: 'manager_name',   label: 'Manager Name',       type: 'text',     required: true },
      { id: 'company_name',   label: 'Company Name',       type: 'text',     required: true },
      { id: 'job_title',      label: 'Your Job Title',     type: 'text' },
      { id: 'reason',         label: 'Reason',             type: 'textarea', required: true, placeholder: 'Reason for immediate resignation (e.g. health, personal circumstances)' },
    ],
    bodyTemplate: `{{sender_name}}

{{letter_date}}

{{manager_name}}
{{company_name}}

**Immediate Resignation — {{job_title}}**

Dear {{manager_name}},

I am writing to inform you of my immediate resignation from my position as {{job_title}} at {{company_name}}, effective today, {{letter_date}}.

{{reason}}

I apologise for any inconvenience this may cause and will assist with handover as far as reasonably possible.

Yours sincerely,

{{sender_name}}`,
  },

  // ── Apology & Resolution ──────────────────────────────────────────────────
  {
    id: 'letter-apology-business',
    builderId: 'letter',
    name: 'Business Apology Letter',
    description: 'Formal apology to a customer or client for a service failure',
    category: 'Apology & Resolution',
    industries: ['Business', 'Retail', 'Hospitality', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     required: true },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea' },
      { id: 'incident',          label: 'What Went Wrong',            type: 'textarea', required: true },
      { id: 'impact',            label: 'Impact Acknowledged',        type: 'textarea', placeholder: 'Acknowledge the inconvenience caused' },
      { id: 'remedy',            label: 'Remedy / Resolution Offered',type: 'textarea', required: true },
      { id: 'prevention',        label: 'Steps to Prevent Recurrence',type: 'textarea' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{recipient_name}}
{{recipient_address}}

**Formal Apology**

Dear {{recipient_name}},

I am writing to sincerely apologise regarding {{incident}}.

{{impact}}

To resolve this matter, we will {{remedy}}.

{{prevention}}

We value your custom and take matters like this very seriously. Please do not hesitate to contact us if you have any further concerns.

Yours sincerely,

{{sender_name}}`,
  },

  // ── Follow-up & Chasing ───────────────────────────────────────────────────
  {
    id: 'letter-follow-up-invoice',
    builderId: 'letter',
    name: 'Invoice Follow-up Letter',
    description: 'Politely chase an outstanding invoice payment',
    category: 'Follow-up & Chasing',
    industries: ['Finance', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     required: true },
      { id: 'recipient_org',     label: 'Recipient Organisation',     type: 'text' },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date' },
      { id: 'amount_due',        label: 'Amount Due (£)',             type: 'text',     required: true },
      { id: 'due_date',          label: 'Original Due Date',          type: 'date' },
      { id: 'bank_details',      label: 'Payment / Bank Details',     type: 'textarea' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}

{{letter_date}}

{{recipient_name}}
{{recipient_org}}
{{recipient_address}}

**Outstanding Invoice — {{invoice_number}}**

Dear {{recipient_name}},

I am writing to draw your attention to invoice {{invoice_number}} dated {{invoice_date}}, for the sum of **£{{amount_due}}**, which was due for payment on {{due_date}}.

As of the date of this letter, we have not received payment. We would be grateful if you could arrange payment at your earliest convenience.

**Payment details:**
{{bank_details}}

If payment has already been made, please disregard this letter and accept our thanks. If you have any queries regarding this invoice, please do not hesitate to contact us.

Yours sincerely,

{{sender_name}}`,
  },

  {
    id: 'letter-follow-up-application',
    builderId: 'letter',
    name: 'Job Application Follow-up',
    description: 'Follow up on a submitted job application',
    category: 'Follow-up & Chasing',
    industries: ['HR', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',    label: 'Your Name',              type: 'text',     required: true },
      { id: 'sender_email',   label: 'Your Email',             type: 'email' },
      { id: 'letter_date',    label: 'Date',                   type: 'date',     required: true },
      { id: 'hiring_manager', label: 'Hiring Manager / HR',    type: 'text',     required: true },
      { id: 'company_name',   label: 'Company Name',           type: 'text',     required: true },
      { id: 'job_title',      label: 'Job Title Applied For',  type: 'text',     required: true },
      { id: 'applied_date',   label: 'Date Applied',           type: 'date' },
      { id: 'enthusiasm',     label: 'Why You Are Interested', type: 'textarea' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_email}}

{{letter_date}}

{{hiring_manager}}
{{company_name}}

**Follow-up: Application for {{job_title}}**

Dear {{hiring_manager}},

I am writing to follow up on my application for the position of {{job_title}}, submitted on {{applied_date}}.

I remain very interested in this opportunity and would welcome the chance to discuss my application further. {{enthusiasm}}

I am happy to provide any additional information you may require and look forward to hearing from you.

Yours sincerely,

{{sender_name}}`,
  },

  // ── Notices & Announcements ───────────────────────────────────────────────
  {
    id: 'letter-notice-rent-increase',
    builderId: 'letter',
    name: 'Rent Increase Notice',
    description: 'Formal notice to tenant of a rent increase',
    category: 'Notices & Announcements',
    industries: ['Property', 'Business'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'landlord_name',     label: 'Landlord / Agent Name',      type: 'text',     required: true },
      { id: 'landlord_address',  label: 'Landlord Address',           type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'tenant_name',       label: 'Tenant Name(s)',             type: 'text',     required: true },
      { id: 'property_address',  label: 'Property Address',           type: 'textarea', required: true },
      { id: 'current_rent',      label: 'Current Rent (£/month)',     type: 'text',     required: true },
      { id: 'new_rent',          label: 'New Rent (£/month)',         type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'reason',            label: 'Reason (optional)',          type: 'textarea' },
    ],
    bodyTemplate: `{{landlord_name}}
{{landlord_address}}

{{letter_date}}

{{tenant_name}}
{{property_address}}

**Notice of Rent Increase**

Dear {{tenant_name}},

I am writing to inform you that the rent for the above property will increase from **£{{current_rent}} per month** to **£{{new_rent}} per month**, effective from **{{effective_date}}**.

{{reason}}

This notice is provided in accordance with the terms of your tenancy agreement and applicable legislation. If you have any questions, please do not hesitate to contact me.

Yours sincerely,

{{landlord_name}}`,
  },

  {
    id: 'letter-notice-redundancy',
    builderId: 'letter',
    name: 'Redundancy Notice Letter',
    description: 'Formal notice of redundancy to an employee',
    category: 'Notices & Announcements',
    industries: ['HR', 'Business'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'company_name',      label: 'Company Name',               type: 'text',     required: true },
      { id: 'company_address',   label: 'Company Address',            type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'employee_name',     label: 'Employee Name',              type: 'text',     required: true },
      { id: 'employee_address',  label: 'Employee Address',           type: 'textarea' },
      { id: 'job_title',         label: 'Job Title',                  type: 'text' },
      { id: 'last_day',          label: 'Last Day of Employment',     type: 'date',     required: true },
      { id: 'notice_period',     label: 'Notice Period',              type: 'text',     defaultValue: '4 weeks' },
      { id: 'redundancy_pay',    label: 'Redundancy Pay Details',     type: 'textarea' },
      { id: 'reason',            label: 'Reason for Redundancy',      type: 'textarea', required: true },
      { id: 'appeal_rights',     label: 'Appeal Rights',              type: 'textarea', defaultValue: 'You have the right to appeal this decision within 5 working days of receiving this letter.' },
    ],
    bodyTemplate: `{{company_name}}
{{company_address}}

{{letter_date}}

{{employee_name}}
{{employee_address}}

**Notice of Redundancy — {{job_title}}**

Dear {{employee_name}},

Following the recent consultation process, I am writing to confirm that your position of {{job_title}} has been made redundant.

**Reason for redundancy:**
{{reason}}

Your employment will end on **{{last_day}}**, following your {{notice_period}} notice period.

**Redundancy pay:**
{{redundancy_pay}}

**Your right to appeal:**
{{appeal_rights}}

We thank you for your contribution to {{company_name}} and wish you well for the future.

Yours sincerely,

On behalf of {{company_name}}`,
  },

  // ── Supplier & Procurement ────────────────────────────────────────────────
  {
    id: 'letter-supplier-termination',
    builderId: 'letter',
    name: 'Supplier Contract Termination',
    description: 'Formally terminate a supplier or service contract',
    category: 'Supplier & Procurement',
    industries: ['Business', 'Finance', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'supplier_name',     label: 'Supplier Name',              type: 'text',     required: true },
      { id: 'supplier_address',  label: 'Supplier Address',           type: 'textarea' },
      { id: 'contract_ref',      label: 'Contract Reference',         type: 'text' },
      { id: 'termination_date',  label: 'Termination Date',           type: 'date',     required: true },
      { id: 'reason',            label: 'Reason for Termination',     type: 'textarea', required: true },
      { id: 'outstanding',       label: 'Outstanding Obligations',    type: 'textarea', placeholder: 'Any outstanding payments, returns, or handover requirements' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{supplier_name}}
{{supplier_address}}

**Notice of Contract Termination — {{contract_ref}}**

Dear Sir / Madam,

We are writing to formally notify you that we are terminating our contract with {{supplier_name}}, reference {{contract_ref}}, with effect from **{{termination_date}}**.

**Reason:**
{{reason}}

**Outstanding obligations:**
{{outstanding}}

Please confirm receipt of this notice and arrange for any outstanding matters to be resolved by the termination date.

Yours faithfully,

{{sender_name}}`,
  },

  // ── Customer Service ──────────────────────────────────────────────────────
  {
    id: 'letter-customer-refund',
    builderId: 'letter',
    name: 'Customer Refund Letter',
    description: 'Confirm a refund to a customer with details',
    category: 'Customer Service',
    industries: ['Retail', 'Business', 'Hospitality', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'customer_name',     label: 'Customer Name',              type: 'text',     required: true },
      { id: 'customer_address',  label: 'Customer Address',           type: 'textarea' },
      { id: 'order_ref',         label: 'Order / Reference Number',   type: 'text' },
      { id: 'refund_amount',     label: 'Refund Amount (£)',          type: 'text',     required: true },
      { id: 'refund_method',     label: 'Refund Method',              type: 'text',     defaultValue: 'original payment method' },
      { id: 'refund_timeframe',  label: 'Expected Timeframe',         type: 'text',     defaultValue: '3–5 working days' },
      { id: 'reason',            label: 'Reason for Refund',          type: 'textarea' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{customer_name}}
{{customer_address}}

**Refund Confirmation — {{order_ref}}**

Dear {{customer_name}},

Thank you for contacting us regarding your recent order ({{order_ref}}).

We are pleased to confirm that a refund of **£{{refund_amount}}** has been processed to your {{refund_method}}. You should expect to receive this within {{refund_timeframe}}.

{{reason}}

We apologise for any inconvenience caused and thank you for your patience. If you have any further questions, please do not hesitate to contact us.

Yours sincerely,

{{sender_name}}`,
  },

  // ── Debt & Finance ────────────────────────────────────────────────────────
  {
    id: 'letter-debt-final-notice',
    builderId: 'letter',
    name: 'Final Debt Notice',
    description: 'Final notice before legal action for unpaid debt',
    category: 'Debt & Finance',
    industries: ['Finance', 'Business', 'Legal'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'debtor_name',       label: 'Debtor Name',                type: 'text',     required: true },
      { id: 'debtor_address',    label: 'Debtor Address',             type: 'textarea' },
      { id: 'amount_owed',       label: 'Total Amount Owed (£)',      type: 'text',     required: true },
      { id: 'original_due',      label: 'Original Due Date',          type: 'date' },
      { id: 'payment_deadline',  label: 'Payment Deadline',           type: 'date',     required: true },
      { id: 'account_ref',       label: 'Account / Reference',        type: 'text' },
      { id: 'payment_details',   label: 'Payment Details',            type: 'textarea' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}

{{letter_date}}

{{debtor_name}}
{{debtor_address}}

**FINAL NOTICE — Outstanding Debt: £{{amount_owed}} — Ref: {{account_ref}}**

Dear {{debtor_name}},

Despite previous correspondence, the sum of **£{{amount_owed}}** remains outstanding on your account (Ref: {{account_ref}}), which was due on {{original_due}}.

**This is your final notice.** Unless full payment is received by **{{payment_deadline}}**, we will have no alternative but to pursue this matter through the courts without further notice.

**To make payment:**
{{payment_details}}

If you are experiencing financial difficulties, please contact us immediately to discuss a payment arrangement.

Yours faithfully,

{{sender_name}}`,
  },

  // ── Personal ──────────────────────────────────────────────────────────────
  {
    id: 'letter-personal-reference',
    builderId: 'letter',
    name: 'Personal Reference Letter',
    description: 'Character or personal reference for an individual',
    category: 'Personal',
    industries: ['General', 'Education', 'HR'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'referee_name',      label: 'Your Name (Referee)',        type: 'text',     required: true },
      { id: 'referee_address',   label: 'Your Address',               type: 'textarea' },
      { id: 'referee_email',     label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'subject_name',      label: 'Name of Person Being Referenced', type: 'text', required: true },
      { id: 'relationship',      label: 'Your Relationship to Them',  type: 'text',     required: true, placeholder: 'e.g. Colleague, Neighbour, Friend' },
      { id: 'duration',          label: 'How Long You Have Known Them', type: 'text',   required: true },
      { id: 'qualities',         label: 'Key Qualities / Strengths',  type: 'textarea', required: true },
      { id: 'specific_example',  label: 'Specific Example',           type: 'textarea' },
      { id: 'recommendation',    label: 'Recommendation Statement',   type: 'textarea', defaultValue: 'I have no hesitation in recommending them and am happy to be contacted for further information.' },
    ],
    bodyTemplate: `{{referee_name}}
{{referee_address}}
{{referee_email}}

{{letter_date}}

**To Whom It May Concern**

**Personal Reference for {{subject_name}}**

I am pleased to provide this reference for {{subject_name}}, whom I have known as {{relationship}} for {{duration}}.

{{qualities}}

{{specific_example}}

{{recommendation}}

Yours faithfully,

{{referee_name}}`,
  },

  // ── School & Education ────────────────────────────────────────────────────
  {
    id: 'letter-school-absence-v2',
    builderId: 'letter',
    name: 'School Absence Letter',
    description: 'Notify school of a child\'s absence',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'parent_name',       label: 'Parent / Guardian Name',     type: 'text',     required: true },
      { id: 'parent_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'teacher_name',      label: 'Teacher / Head of Year',     type: 'text',     defaultValue: 'The Class Teacher' },
      { id: 'school_name',       label: 'School Name',                type: 'text',     required: true },
      { id: 'child_name',        label: 'Child\'s Name',              type: 'text',     required: true },
      { id: 'child_class',       label: 'Class / Year Group',         type: 'text' },
      { id: 'absence_dates',     label: 'Absence Dates',              type: 'text',     required: true },
      { id: 'reason',            label: 'Reason for Absence',         type: 'textarea', required: true },
      { id: 'return_date',       label: 'Expected Return Date',       type: 'date' },
    ],
    bodyTemplate: `{{parent_name}}
{{parent_address}}

{{letter_date}}

{{teacher_name}}
{{school_name}}

**Absence Notification — {{child_name}}, {{child_class}}**

Dear {{teacher_name}},

I am writing to inform you that my child, {{child_name}} ({{child_class}}), will be absent from school on {{absence_dates}}.

**Reason:** {{reason}}

{{child_name}} is expected to return on {{return_date}}. Please let me know if any work needs to be completed during the absence.

Yours sincerely,

{{parent_name}}`,
  },

  {
    id: 'letter-school-holiday-request',
    builderId: 'letter',
    name: 'School Holiday Request',
    description: 'Request authorised absence for a family holiday',
    category: 'School & Education',
    industries: ['Education', 'Personal'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: false,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'parent_name',       label: 'Parent / Guardian Name',     type: 'text',     required: true },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'headteacher_name',  label: 'Headteacher Name',           type: 'text',     defaultValue: 'The Headteacher' },
      { id: 'school_name',       label: 'School Name',                type: 'text',     required: true },
      { id: 'child_name',        label: 'Child\'s Name',              type: 'text',     required: true },
      { id: 'child_class',       label: 'Class / Year Group',         type: 'text' },
      { id: 'holiday_dates',     label: 'Holiday Dates',              type: 'text',     required: true },
      { id: 'destination',       label: 'Destination (optional)',     type: 'text' },
      { id: 'reason',            label: 'Reason / Exceptional Circumstances', type: 'textarea', required: true },
    ],
    bodyTemplate: `{{parent_name}}

{{letter_date}}

{{headteacher_name}}
{{school_name}}

**Request for Authorised Absence — {{child_name}}, {{child_class}}**

Dear {{headteacher_name}},

I am writing to request authorised absence for my child, {{child_name}} ({{child_class}}), from {{holiday_dates}}.

**Reason:** {{reason}}

{{destination}}

I understand the importance of regular attendance and will ensure that {{child_name}} keeps up with any missed work. I would be grateful for your consideration of this request.

Yours sincerely,

{{parent_name}}`,
  },

  // ── Charity & Voluntary ───────────────────────────────────────────────────
  {
    id: 'letter-charity-donation-request',
    builderId: 'letter',
    name: 'Charity Donation Request',
    description: 'Request a donation or sponsorship from a business or individual',
    category: 'Charity & Voluntary',
    industries: ['Charity', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'charity_name',      label: 'Charity / Organisation Name',type: 'text',     required: true },
      { id: 'charity_address',   label: 'Charity Address',            type: 'textarea' },
      { id: 'charity_reg',       label: 'Charity Registration No.',   type: 'text' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     required: true },
      { id: 'recipient_org',     label: 'Recipient Organisation',     type: 'text' },
      { id: 'recipient_address', label: 'Recipient Address',          type: 'textarea' },
      { id: 'cause',             label: 'Cause / Mission',            type: 'textarea', required: true },
      { id: 'specific_ask',      label: 'Specific Request',           type: 'textarea', required: true, placeholder: 'e.g. A donation of £500 / sponsorship of our annual event' },
      { id: 'impact',            label: 'Impact of Donation',         type: 'textarea' },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
    ],
    bodyTemplate: `{{charity_name}}
{{charity_address}}
Registered Charity No: {{charity_reg}}

{{letter_date}}

{{recipient_name}}
{{recipient_org}}
{{recipient_address}}

**Request for Donation / Support**

Dear {{recipient_name}},

I am writing on behalf of {{charity_name}} to request your support for our work.

**About us:**
{{cause}}

**Our request:**
{{specific_ask}}

**The impact:**
{{impact}}

Any support you are able to provide would be greatly appreciated. For further information, please contact {{contact_name}} at {{contact_email}}.

Yours sincerely,

{{contact_name}}
{{charity_name}}`,
  },

  // ── HR & Employment ───────────────────────────────────────────────────────
  {
    id: 'letter-hr-job-offer',
    builderId: 'letter',
    name: 'Job Offer Letter',
    description: 'Formal job offer letter to a successful candidate',
    category: 'HR & Employment',
    industries: ['HR', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'company_name',      label: 'Company Name',               type: 'text',     required: true },
      { id: 'company_address',   label: 'Company Address',            type: 'textarea' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'candidate_name',    label: 'Candidate Name',             type: 'text',     required: true },
      { id: 'candidate_address', label: 'Candidate Address',          type: 'textarea' },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'start_date',        label: 'Start Date',                 type: 'date',     required: true },
      { id: 'salary',            label: 'Salary (£)',                 type: 'text',     required: true },
      { id: 'hours',             label: 'Working Hours',              type: 'text',     defaultValue: '37.5 hours per week' },
      { id: 'location',          label: 'Work Location',              type: 'text' },
      { id: 'probation',         label: 'Probation Period',           type: 'text',     defaultValue: '3 months' },
      { id: 'conditions',        label: 'Conditions of Offer',        type: 'textarea', placeholder: 'e.g. Subject to satisfactory references and DBS check' },
      { id: 'hr_contact',        label: 'HR Contact Name',            type: 'text' },
    ],
    bodyTemplate: `{{company_name}}
{{company_address}}

{{letter_date}}

{{candidate_name}}
{{candidate_address}}

**Offer of Employment — {{job_title}}**

Dear {{candidate_name}},

Following your recent interview, I am delighted to offer you the position of **{{job_title}}** at {{company_name}}.

**Key terms of your employment:**
- **Start date:** {{start_date}}
- **Salary:** £{{salary}} per annum
- **Hours:** {{hours}}
- **Location:** {{location}}
- **Probation period:** {{probation}}

**Conditions of offer:**
{{conditions}}

Please sign and return the enclosed copy of this letter to confirm your acceptance. A formal contract of employment will follow.

If you have any questions, please contact {{hr_contact}}.

We look forward to welcoming you to the team.

Yours sincerely,

On behalf of {{company_name}}`,
  },

  {
    id: 'letter-hr-disciplinary',
    builderId: 'letter',
    name: 'Disciplinary Hearing Invitation',
    description: 'Invite an employee to a formal disciplinary hearing',
    category: 'HR & Employment',
    industries: ['HR', 'Business'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'company_name',      label: 'Company Name',               type: 'text',     required: true },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'employee_name',     label: 'Employee Name',              type: 'text',     required: true },
      { id: 'employee_address',  label: 'Employee Address',           type: 'textarea' },
      { id: 'job_title',         label: 'Job Title',                  type: 'text' },
      { id: 'hearing_date',      label: 'Hearing Date & Time',        type: 'text',     required: true },
      { id: 'hearing_location',  label: 'Hearing Location',           type: 'text',     required: true },
      { id: 'allegations',       label: 'Allegations / Concerns',     type: 'textarea', required: true },
      { id: 'evidence',          label: 'Evidence to Be Considered',  type: 'textarea' },
      { id: 'companion_rights',  label: 'Companion Rights',           type: 'textarea', defaultValue: 'You have the right to be accompanied by a colleague or trade union representative.' },
    ],
    bodyTemplate: `{{company_name}}

{{letter_date}}

{{employee_name}}
{{employee_address}}

**Invitation to Disciplinary Hearing — Private & Confidential**

Dear {{employee_name}},

I am writing to invite you to attend a formal disciplinary hearing regarding the following concerns:

**Allegations:**
{{allegations}}

**The hearing will take place:**
Date & Time: {{hearing_date}}
Location: {{hearing_location}}

**Evidence to be considered:**
{{evidence}}

**Your rights:**
{{companion_rights}}

Please confirm your attendance. Failure to attend without good reason may result in the hearing proceeding in your absence.

Yours sincerely,

On behalf of {{company_name}}`,
  },

  // ── Property & Housing ────────────────────────────────────────────────────
  {
    id: 'letter-property-section21',
    builderId: 'letter',
    name: 'Section 21 Notice (No-Fault Eviction)',
    description: 'Notice to end an assured shorthold tenancy (England)',
    category: 'Property & Housing',
    industries: ['Property', 'Legal'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'landlord_name',     label: 'Landlord Name',              type: 'text',     required: true },
      { id: 'landlord_address',  label: 'Landlord Address',           type: 'textarea' },
      { id: 'letter_date',       label: 'Date of Notice',             type: 'date',     required: true },
      { id: 'tenant_name',       label: 'Tenant Name(s)',             type: 'text',     required: true },
      { id: 'property_address',  label: 'Property Address',           type: 'textarea', required: true },
      { id: 'vacate_date',       label: 'Date to Vacate',             type: 'date',     required: true },
      { id: 'tenancy_start',     label: 'Tenancy Start Date',         type: 'date' },
    ],
    bodyTemplate: `{{landlord_name}}
{{landlord_address}}

{{letter_date}}

{{tenant_name}}
{{property_address}}

**NOTICE REQUIRING POSSESSION — SECTION 21 HOUSING ACT 1988**

Dear {{tenant_name}},

I hereby give you notice that I require possession of the property known as:

**{{property_address}}**

on or after **{{vacate_date}}**, being not less than two months from the date of this notice.

This notice is served under Section 21(1)(b) of the Housing Act 1988 (as amended).

Your tenancy commenced on {{tenancy_start}}.

**Important:** This notice does not mean you must leave immediately. You may wish to seek independent legal advice.

Yours faithfully,

{{landlord_name}}`,
  },

  // ── Legal ─────────────────────────────────────────────────────────────────
  {
    id: 'letter-legal-before-action',
    builderId: 'letter',
    name: 'Letter Before Action (LBA)',
    description: 'Pre-litigation letter before taking legal action',
    category: 'Legal',
    industries: ['Legal', 'Finance', 'Business'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'sender_name',       label: 'Your Name / Organisation',   type: 'text',     required: true },
      { id: 'sender_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'sender_email',      label: 'Your Email',                 type: 'email' },
      { id: 'letter_date',       label: 'Date',                       type: 'date',     required: true },
      { id: 'respondent_name',   label: 'Respondent Name',            type: 'text',     required: true },
      { id: 'respondent_address',label: 'Respondent Address',         type: 'textarea' },
      { id: 'claim_summary',     label: 'Summary of Claim',           type: 'textarea', required: true },
      { id: 'amount_claimed',    label: 'Amount Claimed (£)',         type: 'text' },
      { id: 'remedy_sought',     label: 'Remedy Sought',              type: 'textarea', required: true },
      { id: 'response_deadline', label: 'Response Deadline (days)',   type: 'text',     defaultValue: '14' },
    ],
    bodyTemplate: `{{sender_name}}
{{sender_address}}
{{sender_email}}

{{letter_date}}

{{respondent_name}}
{{respondent_address}}

**LETTER BEFORE ACTION — WITHOUT PREJUDICE SAVE AS TO COSTS**

Dear {{respondent_name}},

We write in connection with the following matter:

**Summary of claim:**
{{claim_summary}}

**Amount claimed:** £{{amount_claimed}}

**Remedy sought:**
{{remedy_sought}}

Unless we receive a satisfactory response within **{{response_deadline}} days** of the date of this letter, we reserve the right to commence legal proceedings without further notice. In such event, we will seek to recover all costs incurred.

Yours faithfully,

{{sender_name}}`,
  },
];
