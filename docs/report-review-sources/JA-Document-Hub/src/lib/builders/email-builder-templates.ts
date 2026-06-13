import type { BuilderTemplate } from '@/lib/builder-framework';

export const EMAIL_BUILDER_TEMPLATES: BuilderTemplate[] = [
  // ── Customer Service ──────────────────────────────────────────────────────
  {
    id: 'email-welcome',
    builderId: 'email',
    name: 'Welcome Email',
    description: 'Welcome a new customer, member, or subscriber',
    category: 'Customer Service',
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Customer Name]' },
      { id: 'subject',         label: 'Email Subject',            type: 'text',     defaultValue: 'Welcome to {{org_name}}!', required: true },
      { id: 'welcome_message', label: 'Welcome Message',          type: 'textarea', required: true },
      { id: 'next_steps',      label: 'Next Steps / Getting Started', type: 'textarea' },
      { id: 'contact_info',    label: 'Contact / Support Info',   type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
      { id: 'sender_title',    label: 'Sender Title',             type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

{{welcome_message}}

**Getting started:**
{{next_steps}}

**Need help?**
{{contact_info}}

Warm regards,

{{sender_name}}
{{sender_title}}
{{org_name}}`,
  },

  {
    id: 'email-thank-you',
    builderId: 'email',
    name: 'Thank You Email',
    description: 'Thank a customer, client, or partner',
    category: 'Customer Service',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',         label: 'Email Subject',            type: 'text',     defaultValue: 'Thank you from {{org_name}}', required: true },
      { id: 'reason',          label: 'Reason for Thanks',        type: 'textarea', required: true },
      { id: 'impact',          label: 'Impact / What It Means',   type: 'textarea' },
      { id: 'next_action',     label: 'Next Steps (optional)',    type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

{{reason}}

{{impact}}

{{next_action}}

With gratitude,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-order-confirmation',
    builderId: 'email',
    name: 'Order Confirmation',
    description: 'Confirm a customer order or booking',
    category: 'Customer Service',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#1B4F8A',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Customer Name',            type: 'text',     defaultValue: '[Customer Name]' },
      { id: 'order_ref',       label: 'Order / Booking Reference',type: 'text',     required: true },
      { id: 'order_date',      label: 'Order Date',               type: 'date',     required: true },
      { id: 'order_details',   label: 'Order Details',            type: 'textarea', required: true },
      { id: 'total_amount',    label: 'Total Amount',             type: 'text' },
      { id: 'delivery_info',   label: 'Delivery / Fulfilment Info',type: 'textarea' },
      { id: 'contact_info',    label: 'Contact / Support Info',   type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Order Confirmation — Ref: {{order_ref}}

Dear {{recipient_name}},

Thank you for your order. We are pleased to confirm the following:

**Order Reference:** {{order_ref}}
**Order Date:** {{order_date}}

**Order Details:**
{{order_details}}

**Total:** {{total_amount}}

**Delivery / Fulfilment:**
{{delivery_info}}

If you have any questions, please contact us:
{{contact_info}}

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Complaints ────────────────────────────────────────────────────────────
  {
    id: 'email-complaint-acknowledgement',
    builderId: 'email',
    name: 'Complaint Acknowledgement',
    description: 'Acknowledge receipt of a customer complaint',
    category: 'Complaints',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Customer Name',            type: 'text',     defaultValue: '[Customer Name]' },
      { id: 'complaint_ref',   label: 'Complaint Reference',      type: 'text',     required: true },
      { id: 'complaint_summary',label: 'Brief Summary of Complaint',type: 'textarea', required: true },
      { id: 'response_timeline',label: 'Response Timeline',       type: 'text',     defaultValue: 'within 5 working days' },
      { id: 'contact_name',    label: 'Contact Name',             type: 'text' },
      { id: 'contact_email',   label: 'Contact Email',            type: 'email' },
    ],
    bodyTemplate: `Subject: Complaint Acknowledgement — Ref: {{complaint_ref}}

Dear {{recipient_name}},

Thank you for contacting us. We have received your complaint and want to assure you that we take all feedback seriously.

**Complaint Reference:** {{complaint_ref}}

**Summary of your complaint:**
{{complaint_summary}}

We will investigate this matter thoroughly and aim to provide a full response **{{response_timeline}}**.

In the meantime, if you have any questions, please contact {{contact_name}} at {{contact_email}}.

Yours sincerely,

{{contact_name}}
{{org_name}}`,
  },

  {
    id: 'email-complaint-resolution',
    builderId: 'email',
    name: 'Complaint Resolution',
    description: 'Provide the outcome and resolution of a complaint',
    category: 'Complaints',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Customer Name',            type: 'text',     defaultValue: '[Customer Name]' },
      { id: 'complaint_ref',   label: 'Complaint Reference',      type: 'text',     required: true },
      { id: 'outcome',         label: 'Outcome',                  type: 'select',   options: ['Complaint upheld', 'Complaint partially upheld', 'Complaint not upheld'], defaultValue: 'Complaint upheld' },
      { id: 'resolution',      label: 'Resolution / Action Taken',type: 'textarea', required: true },
      { id: 'apology',         label: 'Apology (if applicable)',  type: 'textarea' },
      { id: 'escalation',      label: 'Escalation Rights',        type: 'textarea', defaultValue: 'If you remain dissatisfied, you may escalate this matter to the relevant ombudsman.' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Complaint Resolution — Ref: {{complaint_ref}}

Dear {{recipient_name}},

Thank you for your patience while we investigated your complaint (Ref: {{complaint_ref}}).

**Outcome: {{outcome}}**

{{apology}}

**Resolution:**
{{resolution}}

{{escalation}}

Yours sincerely,

{{sender_name}}
{{org_name}}`,
  },

  // ── Finance & Billing ─────────────────────────────────────────────────────
  {
    id: 'email-invoice',
    builderId: 'email',
    name: 'Invoice Email',
    description: 'Send an invoice to a client or customer',
    category: 'Finance & Billing',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Client Name',              type: 'text',     defaultValue: '[Client Name]' },
      { id: 'invoice_number',  label: 'Invoice Number',           type: 'text',     required: true },
      { id: 'invoice_amount',  label: 'Invoice Amount',           type: 'text',     required: true },
      { id: 'due_date',        label: 'Payment Due Date',         type: 'date',     required: true },
      { id: 'payment_details', label: 'Payment Details',          type: 'textarea', required: true, placeholder: 'Bank name, sort code, account number, reference' },
      { id: 'services',        label: 'Services / Description',   type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Invoice {{invoice_number}} from {{org_name}}

Dear {{recipient_name}},

Please find attached Invoice {{invoice_number}} for the amount of **{{invoice_amount}}**, due by **{{due_date}}**.

**Services:**
{{services}}

**Payment details:**
{{payment_details}}

If you have any questions regarding this invoice, please do not hesitate to contact us.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-payment-reminder',
    builderId: 'email',
    name: 'Payment Reminder',
    description: 'Polite reminder for an outstanding payment',
    category: 'Finance & Billing',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Client Name',              type: 'text',     defaultValue: '[Client Name]' },
      { id: 'invoice_number',  label: 'Invoice Number',           type: 'text',     required: true },
      { id: 'invoice_amount',  label: 'Amount Outstanding',       type: 'text',     required: true },
      { id: 'original_due',    label: 'Original Due Date',        type: 'date',     required: true },
      { id: 'reminder_type',   label: 'Reminder Type',            type: 'select',   options: ['Friendly Reminder', 'Second Reminder', 'Final Notice'], defaultValue: 'Friendly Reminder' },
      { id: 'payment_details', label: 'Payment Details',          type: 'textarea', required: true },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: {{reminder_type}} — Invoice {{invoice_number}} — {{invoice_amount}} Outstanding

Dear {{recipient_name}},

This is a {{reminder_type}} regarding Invoice {{invoice_number}} for **{{invoice_amount}}**, which was due on {{original_due}}.

If you have already made payment, please disregard this email. If not, we would be grateful if you could arrange payment at your earliest convenience.

**Payment details:**
{{payment_details}}

If you have any queries, please do not hesitate to contact us.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Appointment ───────────────────────────────────────────────────────────
  {
    id: 'email-appointment-confirmation',
    builderId: 'email',
    name: 'Appointment Confirmation',
    description: 'Confirm an appointment, meeting, or booking',
    category: 'Appointment',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Name]' },
      { id: 'appointment_type',label: 'Appointment Type',         type: 'text',     required: true, placeholder: 'e.g. Consultation, Meeting, Service' },
      { id: 'appointment_date',label: 'Date',                     type: 'date',     required: true },
      { id: 'appointment_time',label: 'Time',                     type: 'text',     required: true },
      { id: 'location',        label: 'Location / Platform',      type: 'text' },
      { id: 'preparation',     label: 'What to Bring / Prepare',  type: 'textarea' },
      { id: 'cancellation',    label: 'Cancellation Policy',      type: 'textarea', defaultValue: 'If you need to cancel or rearrange, please give us at least 24 hours\' notice.' },
      { id: 'contact_info',    label: 'Contact Info',             type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Appointment Confirmation — {{appointment_type}} on {{appointment_date}}

Dear {{recipient_name}},

We are pleased to confirm your {{appointment_type}} with {{org_name}}.

**Date:** {{appointment_date}}
**Time:** {{appointment_time}}
**Location:** {{location}}

**What to bring / prepare:**
{{preparation}}

**Cancellation policy:**
{{cancellation}}

If you have any questions, please contact us:
{{contact_info}}

We look forward to seeing you.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-appointment-reminder',
    builderId: 'email',
    name: 'Appointment Reminder',
    description: 'Remind a client or customer of an upcoming appointment',
    category: 'Appointment',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Name]' },
      { id: 'appointment_type',label: 'Appointment Type',         type: 'text',     required: true },
      { id: 'appointment_date',label: 'Date',                     type: 'date',     required: true },
      { id: 'appointment_time',label: 'Time',                     type: 'text',     required: true },
      { id: 'location',        label: 'Location / Platform',      type: 'text' },
      { id: 'contact_info',    label: 'Contact / Rescheduling Info', type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Reminder — {{appointment_type}} on {{appointment_date}}

Dear {{recipient_name}},

This is a friendly reminder of your upcoming {{appointment_type}} with {{org_name}}.

**Date:** {{appointment_date}}
**Time:** {{appointment_time}}
**Location:** {{location}}

If you need to reschedule or have any questions:
{{contact_info}}

We look forward to seeing you.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Follow-up ─────────────────────────────────────────────────────────────
  {
    id: 'email-follow-up',
    builderId: 'email',
    name: 'Follow-Up Email',
    description: 'Follow up after a meeting, call, or proposal',
    category: 'Follow-up',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Name]' },
      { id: 'context',         label: 'Context (what you\'re following up on)', type: 'textarea', required: true },
      { id: 'summary',         label: 'Summary / Key Points',     type: 'textarea' },
      { id: 'action_items',    label: 'Action Items / Next Steps',type: 'textarea' },
      { id: 'cta',             label: 'Call to Action',           type: 'textarea', placeholder: 'What do you want the recipient to do?' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Following up — {{context}}

Dear {{recipient_name}},

I wanted to follow up regarding {{context}}.

{{summary}}

**Next steps / action items:**
{{action_items}}

{{cta}}

Please do not hesitate to get in touch if you have any questions.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Internal ──────────────────────────────────────────────────────────────
  {
    id: 'email-internal-announcement',
    builderId: 'email',
    name: 'Internal Announcement',
    description: 'Announce news, changes, or updates to staff',
    category: 'Internal',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#374151',
    fields: [
      { id: 'org_name',        label: 'Organisation Name',        type: 'text',     required: true },
      { id: 'subject',         label: 'Email Subject',            type: 'text',     required: true },
      { id: 'announcement',    label: 'Announcement Details',     type: 'textarea', required: true },
      { id: 'action_required', label: 'Action Required (if any)',type: 'textarea' },
      { id: 'effective_date',  label: 'Effective Date',           type: 'date' },
      { id: 'contact_for_questions', label: 'Contact for Questions', type: 'text' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
      { id: 'sender_title',    label: 'Sender Title',             type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear Team,

{{announcement}}

**Effective date:** {{effective_date}}

**Action required:**
{{action_required}}

If you have any questions, please contact {{contact_for_questions}}.

Kind regards,

{{sender_name}}
{{sender_title}}
{{org_name}}`,
  },

  {
    id: 'email-meeting-invite',
    builderId: 'email',
    name: 'Meeting Invitation',
    description: 'Invite colleagues or clients to a meeting',
    category: 'Internal',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#374151',
    fields: [
      { id: 'org_name',        label: 'Your Organisation',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: '[Name]' },
      { id: 'meeting_title',   label: 'Meeting Title',            type: 'text',     required: true },
      { id: 'meeting_date',    label: 'Date',                     type: 'date',     required: true },
      { id: 'meeting_time',    label: 'Time',                     type: 'text',     required: true },
      { id: 'location',        label: 'Location / Platform',      type: 'text' },
      { id: 'agenda',          label: 'Agenda',                   type: 'textarea' },
      { id: 'preparation',     label: 'Preparation Required',     type: 'textarea' },
      { id: 'rsvp_by',         label: 'RSVP By',                  type: 'date' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Meeting Invitation — {{meeting_title}} — {{meeting_date}}

Dear {{recipient_name}},

You are invited to attend the following meeting:

**{{meeting_title}}**
**Date:** {{meeting_date}}
**Time:** {{meeting_time}}
**Location:** {{location}}

**Agenda:**
{{agenda}}

**Preparation required:**
{{preparation}}

Please RSVP by {{rsvp_by}}.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    id: 'email-new-employee',
    builderId: 'email',
    name: 'New Employee Welcome',
    description: 'Welcome a new employee on their first day',
    category: 'Onboarding',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',        label: 'Organisation Name',        type: 'text',     required: true },
      { id: 'employee_name',   label: 'Employee Name',            type: 'text',     required: true },
      { id: 'job_title',       label: 'Job Title',                type: 'text',     required: true },
      { id: 'start_date',      label: 'Start Date',               type: 'date',     required: true },
      { id: 'manager_name',    label: 'Line Manager Name',        type: 'text' },
      { id: 'first_day_info',  label: 'First Day Information',    type: 'textarea', required: true, placeholder: 'Where to go, what time, who to ask for' },
      { id: 'it_access',       label: 'IT / System Access Info',  type: 'textarea' },
      { id: 'useful_contacts', label: 'Useful Contacts',          type: 'textarea' },
      { id: 'sender_name',     label: 'Sender Name',              type: 'text' },
    ],
    bodyTemplate: `Subject: Welcome to {{org_name}}, {{employee_name}}!

Dear {{employee_name}},

We are delighted to welcome you to {{org_name}} as our new {{job_title}}. We are looking forward to you joining us on {{start_date}}.

**Your first day:**
{{first_day_info}}

**IT and system access:**
{{it_access}}

**Useful contacts:**
{{useful_contacts}}

Your line manager is {{manager_name}}, who will be in touch to help you settle in.

If you have any questions before you start, please do not hesitate to reach out.

Warm regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── School & Education ────────────────────────────────────────────────────
  {
    id: 'email-school-newsletter',
    builderId: 'email',
    name: 'School Newsletter',
    description: 'School newsletter or parent communication email',
    category: 'School & Education',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'school_name',     label: 'School Name',              type: 'text',     required: true },
      { id: 'issue_date',      label: 'Issue Date',               type: 'date',     required: true },
      { id: 'head_teacher',    label: 'Head Teacher / Principal', type: 'text' },
      { id: 'news_items',      label: 'News & Updates',           type: 'textarea', required: true },
      { id: 'upcoming_events', label: 'Upcoming Events',          type: 'textarea' },
      { id: 'reminders',       label: 'Reminders',                type: 'textarea' },
      { id: 'contact_info',    label: 'Contact Information',      type: 'textarea' },
    ],
    bodyTemplate: `Subject: {{school_name}} Newsletter — {{issue_date}}

Dear Parents and Carers,

Welcome to our latest newsletter from {{school_name}}.

**News & Updates:**
{{news_items}}

**Upcoming Events:**
{{upcoming_events}}

**Reminders:**
{{reminders}}

**Contact us:**
{{contact_info}}

Kind regards,

{{head_teacher}}
{{school_name}}`,
  },

  // ── Charity & Voluntary ───────────────────────────────────────────────────
  {
    id: 'email-volunteer-recruitment',
    builderId: 'email',
    name: 'Volunteer Recruitment',
    description: 'Recruit volunteers for your charity or organisation',
    category: 'Charity & Voluntary',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',        label: 'Organisation Name',        type: 'text',     required: true },
      { id: 'recipient_name',  label: 'Recipient Name',           type: 'text',     defaultValue: 'Dear Friend' },
      { id: 'cause',           label: 'Your Cause',               type: 'textarea', required: true },
      { id: 'volunteer_roles', label: 'Volunteer Roles Available',type: 'textarea', required: true },
      { id: 'commitment',      label: 'Time Commitment',          type: 'text' },
      { id: 'benefits',        label: 'Benefits of Volunteering', type: 'textarea' },
      { id: 'how_to_apply',    label: 'How to Apply / Get Involved', type: 'textarea', required: true },
      { id: 'contact_name',    label: 'Contact Name',             type: 'text' },
      { id: 'contact_email',   label: 'Contact Email',            type: 'email' },
    ],
    bodyTemplate: `Subject: Volunteer with {{org_name}} — Make a Difference

{{recipient_name}},

{{cause}}

**We are looking for volunteers to help with:**
{{volunteer_roles}}

**Time commitment:** {{commitment}}

**Benefits of volunteering with us:**
{{benefits}}

**How to get involved:**
{{how_to_apply}}

For more information, contact {{contact_name}} at {{contact_email}}.

Thank you for considering volunteering with us.

Warm regards,

{{contact_name}}
{{org_name}}`,
  },

  // ── HR & Employment ───────────────────────────────────────────────────────
  {
    id: 'email-hr-interview-invite',
    builderId: 'email',
    name: 'Interview Invitation',
    description: 'Invite a candidate to attend a job interview',
    category: 'HR & Employment',
    industries: ['HR', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'candidate_name',    label: 'Candidate Name',             type: 'text',     defaultValue: '[Candidate Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Interview Invitation — [Job Title]', required: true },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'interview_date',    label: 'Interview Date & Time',      type: 'text',     required: true },
      { id: 'interview_location',label: 'Location / Video Link',      type: 'text',     required: true },
      { id: 'interview_format',  label: 'Interview Format',           type: 'textarea', defaultValue: 'The interview will last approximately 45 minutes and will include a competency-based discussion.' },
      { id: 'what_to_bring',     label: 'What to Bring',              type: 'textarea', placeholder: 'e.g. ID, portfolio, references' },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
      { id: 'sender_title',      label: 'Sender Title',               type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{candidate_name}},

Thank you for your application for the position of **{{job_title}}** at {{org_name}}.

We are pleased to invite you to attend an interview:

**Date & Time:** {{interview_date}}
**Location:** {{interview_location}}

**Interview format:**
{{interview_format}}

**What to bring:**
{{what_to_bring}}

Please confirm your attendance by replying to this email or contacting {{contact_name}} at {{contact_email}}.

We look forward to meeting you.

Kind regards,

{{sender_name}}
{{sender_title}}
{{org_name}}`,
  },

  {
    id: 'email-hr-rejection',
    builderId: 'email',
    name: 'Job Application Rejection',
    description: 'Politely decline a job applicant',
    category: 'HR & Employment',
    industries: ['HR', 'Business'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'candidate_name',    label: 'Candidate Name',             type: 'text',     defaultValue: '[Candidate Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Your Application — [Job Title]', required: true },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'feedback',          label: 'Brief Feedback (optional)',  type: 'textarea', placeholder: 'Optional constructive feedback' },
      { id: 'future_roles',      label: 'Future Roles Note',          type: 'text',     defaultValue: 'We will keep your details on file for future opportunities.' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{candidate_name}},

Thank you for taking the time to apply for the position of {{job_title}} at {{org_name}} and for attending our selection process.

After careful consideration, we regret to inform you that on this occasion your application has been unsuccessful.

{{feedback}}

{{future_roles}}

We wish you every success in your job search.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-hr-contract-offer',
    builderId: 'email',
    name: 'Employment Contract Offer',
    description: 'Send an employment contract offer by email',
    category: 'HR & Employment',
    industries: ['HR', 'Business'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'candidate_name',    label: 'Candidate Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Employment Offer — [Job Title]', required: true },
      { id: 'job_title',         label: 'Job Title',                  type: 'text',     required: true },
      { id: 'start_date',        label: 'Start Date',                 type: 'text' },
      { id: 'salary',            label: 'Salary',                     type: 'text' },
      { id: 'deadline',          label: 'Acceptance Deadline',        type: 'text',     defaultValue: 'Please confirm acceptance within 5 working days.' },
      { id: 'hr_contact',        label: 'HR Contact',                 type: 'text' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{candidate_name}},

I am delighted to offer you the position of **{{job_title}}** at {{org_name}}.

**Start date:** {{start_date}}
**Salary:** {{salary}}

Please find your contract of employment attached. {{deadline}}

If you have any questions, please contact {{hr_contact}}.

We look forward to welcoming you to the team.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Supplier & Procurement ────────────────────────────────────────────────
  {
    id: 'email-supplier-order',
    builderId: 'email',
    name: 'Purchase Order Email',
    description: 'Send a purchase order to a supplier',
    category: 'Supplier & Procurement',
    industries: ['Business', 'Finance', 'Retail', 'Construction'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'supplier_name',     label: 'Supplier Name',              type: 'text',     required: true },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Purchase Order — PO-[Reference]', required: true },
      { id: 'po_number',         label: 'PO Number',                  type: 'text',     required: true },
      { id: 'order_details',     label: 'Order Details',              type: 'textarea', required: true, placeholder: 'Item, quantity, unit price, total' },
      { id: 'delivery_address',  label: 'Delivery Address',           type: 'textarea' },
      { id: 'required_by',       label: 'Required By Date',           type: 'text' },
      { id: 'payment_terms',     label: 'Payment Terms',              type: 'text',     defaultValue: '30 days net' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{supplier_name}},

Please find below our purchase order (PO Number: **{{po_number}}**) from {{org_name}}.

**Order details:**
{{order_details}}

**Delivery address:**
{{delivery_address}}

**Required by:** {{required_by}}
**Payment terms:** {{payment_terms}}

Please confirm receipt of this order and advise of any queries.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Appointments & Reminders ──────────────────────────────────────────────
  {
    id: 'email-appointment-confirmation-v2',
    builderId: 'email',
    name: 'Appointment Confirmation',
    description: 'Confirm an appointment with a client or patient',
    category: 'Appointments & Reminders',
    industries: ['Healthcare', 'Business', 'General', 'Hospitality'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Appointment Confirmation — [Date]', required: true },
      { id: 'appointment_type',  label: 'Appointment Type',           type: 'text',     required: true, placeholder: 'e.g. Consultation, Service, Meeting' },
      { id: 'appointment_date',  label: 'Date & Time',                type: 'text',     required: true },
      { id: 'location',          label: 'Location / Address',         type: 'textarea' },
      { id: 'duration',          label: 'Duration',                   type: 'text',     placeholder: 'e.g. 30 minutes' },
      { id: 'preparation',       label: 'What to Bring / Prepare',    type: 'textarea' },
      { id: 'cancellation',      label: 'Cancellation Policy',        type: 'textarea', defaultValue: 'If you need to cancel or rearrange, please give us at least 24 hours notice.' },
      { id: 'contact_phone',     label: 'Contact Phone',              type: 'phone' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

This email confirms your {{appointment_type}} with {{org_name}}.

**Date & Time:** {{appointment_date}}
**Location:** {{location}}
**Duration:** {{duration}}

**What to bring / prepare:**
{{preparation}}

**Cancellation policy:**
{{cancellation}}

If you have any questions, please call us on {{contact_phone}}.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-appointment-reminder-v2',
    builderId: 'email',
    name: 'Appointment Reminder',
    description: 'Remind a client or patient of an upcoming appointment',
    category: 'Appointments & Reminders',
    industries: ['Healthcare', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Reminder: Your Appointment Tomorrow', required: true },
      { id: 'appointment_date',  label: 'Appointment Date & Time',    type: 'text',     required: true },
      { id: 'location',          label: 'Location',                   type: 'text' },
      { id: 'contact_phone',     label: 'Contact Phone',              type: 'phone' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

This is a friendly reminder of your upcoming appointment with {{org_name}}.

**Date & Time:** {{appointment_date}}
**Location:** {{location}}

If you need to cancel or rearrange, please contact us as soon as possible on {{contact_phone}}.

We look forward to seeing you.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Overdue & Debt ────────────────────────────────────────────────────────
  {
    id: 'email-overdue-payment-first',
    builderId: 'email',
    name: 'Overdue Payment — First Reminder',
    description: 'Polite first reminder for an overdue invoice',
    category: 'Overdue & Debt',
    industries: ['Finance', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Friendly Reminder — Invoice [Invoice Number] Overdue', required: true },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'amount_due',        label: 'Amount Due (£)',             type: 'text',     required: true },
      { id: 'due_date',          label: 'Original Due Date',          type: 'text',     required: true },
      { id: 'payment_details',   label: 'Payment Details',            type: 'textarea', placeholder: 'Bank name, sort code, account number, reference' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

I hope this email finds you well. I am writing to draw your attention to invoice **{{invoice_number}}** for **£{{amount_due}}**, which was due on {{due_date}}.

It appears this may have been overlooked. Could you please arrange payment at your earliest convenience?

**Payment details:**
{{payment_details}}

If payment has already been made, please disregard this email and accept our thanks. If you have any queries, please do not hesitate to get in touch.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  {
    id: 'email-overdue-payment-final',
    builderId: 'email',
    name: 'Overdue Payment — Final Notice',
    description: 'Final notice before escalating an overdue invoice',
    category: 'Overdue & Debt',
    industries: ['Finance', 'Business', 'Legal'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Recipient Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'FINAL NOTICE — Invoice [Invoice Number]', required: true },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'amount_due',        label: 'Amount Due (£)',             type: 'text',     required: true },
      { id: 'due_date',          label: 'Original Due Date',          type: 'text',     required: true },
      { id: 'payment_deadline',  label: 'Final Payment Deadline',     type: 'text',     required: true },
      { id: 'payment_details',   label: 'Payment Details',            type: 'textarea' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

Despite previous reminders, invoice **{{invoice_number}}** for **£{{amount_due}}** (due {{due_date}}) remains unpaid.

**This is our final notice.** Unless payment is received by **{{payment_deadline}}**, we will have no alternative but to escalate this matter, which may include referral to a debt recovery agency or legal proceedings.

**Payment details:**
{{payment_details}}

To avoid further action, please make payment immediately or contact us to discuss a payment arrangement.

Yours faithfully,

{{sender_name}}
{{org_name}}`,
  },

  // ── IT & Technical ────────────────────────────────────────────────────────
  {
    id: 'email-it-system-maintenance',
    builderId: 'email',
    name: 'System Maintenance Notice',
    description: 'Notify users of planned system downtime or maintenance',
    category: 'IT & Technical',
    industries: ['IT', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Planned System Maintenance — [Date]', required: true },
      { id: 'system_name',       label: 'System / Service Name',      type: 'text',     required: true },
      { id: 'maintenance_date',  label: 'Maintenance Date & Time',    type: 'text',     required: true },
      { id: 'duration',          label: 'Expected Duration',          type: 'text',     required: true },
      { id: 'impact',            label: 'Impact on Users',            type: 'textarea', required: true },
      { id: 'reason',            label: 'Reason for Maintenance',     type: 'textarea' },
      { id: 'contact',           label: 'Contact for Queries',        type: 'text' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear Team,

Please be advised that **{{system_name}}** will be undergoing planned maintenance.

**Date & Time:** {{maintenance_date}}
**Expected Duration:** {{duration}}

**Impact:**
{{impact}}

**Reason:**
{{reason}}

We apologise for any inconvenience. For queries, please contact {{contact}}.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Property ──────────────────────────────────────────────────────────────
  {
    id: 'email-property-viewing-confirmation',
    builderId: 'email',
    name: 'Property Viewing Confirmation',
    description: 'Confirm a property viewing appointment',
    category: 'Property',
    industries: ['Property', 'Business'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Agency / Landlord Name',     type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Applicant Name',             type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Property Viewing Confirmation', required: true },
      { id: 'property_address',  label: 'Property Address',           type: 'textarea', required: true },
      { id: 'viewing_date',      label: 'Viewing Date & Time',        type: 'text',     required: true },
      { id: 'agent_name',        label: 'Agent / Contact Name',       type: 'text' },
      { id: 'agent_phone',       label: 'Agent Phone',                type: 'phone' },
      { id: 'parking',           label: 'Parking / Access Notes',     type: 'textarea' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

Thank you for your interest in the property at {{property_address}}.

We are pleased to confirm your viewing:

**Date & Time:** {{viewing_date}}
**Address:** {{property_address}}
**Agent:** {{agent_name}} — {{agent_phone}}

**Access / Parking:**
{{parking}}

Please contact us if you need to rearrange. We look forward to seeing you.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Healthcare ────────────────────────────────────────────────────────────
  {
    id: 'email-healthcare-referral',
    builderId: 'email',
    name: 'Patient Referral Email',
    description: 'Refer a patient to a specialist or service',
    category: 'Healthcare',
    industries: ['Healthcare', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Referring Organisation',     type: 'text',     required: true },
      { id: 'recipient_name',    label: 'Recipient / Specialist Name',type: 'text',     required: true },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Patient Referral — [Patient Name]', required: true },
      { id: 'patient_name',      label: 'Patient Name',               type: 'text',     required: true },
      { id: 'patient_dob',       label: 'Patient Date of Birth',      type: 'text' },
      { id: 'reason',            label: 'Reason for Referral',        type: 'textarea', required: true },
      { id: 'clinical_notes',    label: 'Relevant Clinical Notes',    type: 'textarea' },
      { id: 'urgency',           label: 'Urgency',                    type: 'select',   options: ['Routine', 'Urgent', '2-Week Wait', 'Emergency'] },
      { id: 'sender_name',       label: 'Referring Clinician',        type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{recipient_name}},

I am writing to refer the following patient for your assessment.

**Patient:** {{patient_name}}
**Date of Birth:** {{patient_dob}}
**Urgency:** {{urgency}}

**Reason for referral:**
{{reason}}

**Clinical notes:**
{{clinical_notes}}

Please do not hesitate to contact me if you require further information.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },

  // ── Sales & Marketing ─────────────────────────────────────────────────────
  {
    id: 'email-sales-proposal',
    builderId: 'email',
    name: 'Sales Proposal Email',
    description: 'Send a sales proposal or quote to a prospect',
    category: 'Sales & Marketing',
    industries: ['Business', 'Retail', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'prospect_name',     label: 'Prospect Name',              type: 'text',     defaultValue: '[Name]' },
      { id: 'subject',           label: 'Email Subject',              type: 'text',     defaultValue: 'Proposal from [Your Organisation]', required: true },
      { id: 'solution',          label: 'Solution / Offering',        type: 'textarea', required: true },
      { id: 'benefits',          label: 'Key Benefits',               type: 'textarea' },
      { id: 'pricing',           label: 'Pricing / Investment',       type: 'textarea' },
      { id: 'next_step',         label: 'Proposed Next Step',         type: 'text',     defaultValue: 'I would welcome a call to discuss this further.' },
      { id: 'sender_name',       label: 'Sender Name',                type: 'text' },
    ],
    bodyTemplate: `Subject: {{subject}}

Dear {{prospect_name}},

Thank you for your time. Following our recent conversation, I am pleased to share our proposal.

**Our solution:**
{{solution}}

**Key benefits:**
{{benefits}}

**Investment:**
{{pricing}}

**Next step:** {{next_step}}

Please find our full proposal attached. I look forward to hearing from you.

Kind regards,

{{sender_name}}
{{org_name}}`,
  },
];
