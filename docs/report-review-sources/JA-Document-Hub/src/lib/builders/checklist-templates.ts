import type { BuilderTemplate } from '@/lib/builder-framework';

export const CHECKLIST_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'checklist-onboarding',
    builderId: 'checklist',
    name: 'Staff Onboarding Checklist',
    description: 'New employee onboarding tasks and completion checklist',
    category: 'Onboarding',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'employee_name', label: 'New Employee Name', type: 'text', required: true },
      { id: 'role_name', label: 'Role / Job Title', type: 'text', required: true },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'line_manager', label: 'Line Manager', type: 'text', required: true },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'additional_tasks', label: 'Additional Role-Specific Tasks', type: 'textarea', placeholder: 'Any tasks specific to this role or department' },
    ],
    bodyTemplate: `# STAFF ONBOARDING CHECKLIST

**{{org_name}}**

**Employee:** {{employee_name}}
**Role:** {{role_name}}
**Start Date:** {{start_date}}
**Line Manager:** {{line_manager}}
**Department:** {{department}}

---

## Before Start Date

☐ Offer letter and contract sent and signed
☐ Right to work documents verified
☐ DBS check initiated (if required)
☐ IT equipment ordered
☐ System access set up (email, systems, building access)
☐ Induction schedule prepared
☐ Desk / workspace arranged
☐ Welcome email sent to team

---

## Day One

☐ Welcome meeting with line manager
☐ Office / site tour completed
☐ Introductions to team members
☐ IT equipment and login credentials provided
☐ Health and safety induction completed
☐ Fire evacuation procedure explained
☐ Employee handbook provided and reviewed
☐ Payroll and HR forms completed

---

## First Week

☐ Role overview and expectations discussed
☐ Key contacts and stakeholders introduced
☐ Systems and tools training completed
☐ Probation period and review dates confirmed
☐ Initial objectives set
☐ Any mandatory training completed

---

## First Month

☐ One-to-one meetings scheduled
☐ Performance expectations confirmed
☐ Any outstanding training completed
☐ Feedback session with line manager

---

## Additional Tasks

{{additional_tasks}}

---

**Completed by:** _______________________________________________

**Date:** _______________________________________________`,
  },

  {
    id: 'checklist-compliance',
    builderId: 'checklist',
    name: 'Compliance Checklist',
    description: 'Regulatory and legal compliance checklist for businesses',
    category: 'Compliance',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'compliance_area', label: 'Compliance Area', type: 'select', options: ['General Business', 'Data Protection / GDPR', 'Health & Safety', 'Financial Compliance', 'Employment Law', 'Charity Compliance'], defaultValue: 'General Business' },
      { id: 'review_date', label: 'Review Date', type: 'date', required: true },
      { id: 'reviewed_by', label: 'Reviewed By', type: 'text', required: true },
      { id: 'additional_items', label: 'Additional Compliance Items', type: 'textarea' },
    ],
    bodyTemplate: `# COMPLIANCE CHECKLIST

**{{org_name}}**

**Area:** {{compliance_area}}
**Review Date:** {{review_date}}
**Reviewed By:** {{reviewed_by}}

---

## Data Protection / GDPR

☐ Privacy policy published and up to date
☐ Cookie policy in place
☐ Data processing register maintained
☐ Staff data protection training completed
☐ Data breach procedure documented
☐ Subject access request procedure in place
☐ Third-party data processor agreements in place
☐ ICO registration current (if required)

---

## Health & Safety

☐ Health and safety policy reviewed and signed
☐ Risk assessments completed and up to date
☐ Fire risk assessment completed
☐ First aid provision adequate
☐ Accident book maintained
☐ RIDDOR reporting procedure in place
☐ Staff H&S training completed
☐ Equipment inspections up to date

---

## Employment

☐ Employment contracts in place for all staff
☐ Right to work checks completed
☐ DBS checks current (where required)
☐ Equality and diversity policy in place
☐ Disciplinary and grievance procedures documented
☐ Payroll compliant with National Minimum Wage
☐ Auto-enrolment pension obligations met

---

## Financial

☐ Annual accounts filed on time
☐ VAT returns submitted (if applicable)
☐ Corporation tax / self-assessment up to date
☐ Insurance policies current
☐ Anti-money laundering procedures in place (if applicable)

---

## Additional Items

{{additional_items}}

---

**Overall Status:** ☐ Compliant  ☐ Actions Required  ☐ Non-Compliant

**Notes:** _______________________________________________`,
  },

  {
    id: 'checklist-property-inspection',
    builderId: 'checklist',
    name: 'Property Inspection Checklist',
    description: 'Landlord or letting agent property inspection checklist',
    category: 'Property Inspection',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Landlord / Agent Name', type: 'text', required: true },
      { id: 'property_address', label: 'Property Address', type: 'textarea', required: true },
      { id: 'tenant_name', label: 'Tenant Name', type: 'text' },
      { id: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
      { id: 'inspection_type', label: 'Inspection Type', type: 'select', options: ['Check-in', 'Routine Inspection', 'Check-out', 'Maintenance Visit'], defaultValue: 'Routine Inspection' },
      { id: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
      { id: 'additional_notes', label: 'Additional Notes', type: 'textarea' },
    ],
    bodyTemplate: `# PROPERTY INSPECTION CHECKLIST

**{{org_name}}**

**Property:** {{property_address}}
**Tenant:** {{tenant_name}}
**Inspection Type:** {{inspection_type}}
**Date:** {{inspection_date}}
**Inspector:** {{inspector_name}}

*Condition: G = Good, F = Fair, P = Poor, N/A = Not Applicable*

---

## Exterior

| Item | Condition | Notes |
|------|-----------|-------|
| Front door and locks | | |
| Windows (exterior) | | |
| Gutters and drains | | |
| Garden / outdoor space | | |
| Bins and waste area | | |

---

## Entrance / Hallway

| Item | Condition | Notes |
|------|-----------|-------|
| Flooring | | |
| Walls and ceiling | | |
| Lighting | | |
| Smoke alarm | | |

---

## Living Room

| Item | Condition | Notes |
|------|-----------|-------|
| Flooring | | |
| Walls and ceiling | | |
| Windows and blinds | | |
| Heating | | |
| Electrical sockets | | |

---

## Kitchen

| Item | Condition | Notes |
|------|-----------|-------|
| Units and worktops | | |
| Appliances | | |
| Sink and taps | | |
| Flooring | | |
| Ventilation | | |

---

## Bathroom(s)

| Item | Condition | Notes |
|------|-----------|-------|
| Bath / shower | | |
| Toilet | | |
| Sink and taps | | |
| Tiles and grouting | | |
| Ventilation | | |

---

## Bedroom(s)

| Item | Condition | Notes |
|------|-----------|-------|
| Flooring | | |
| Walls and ceiling | | |
| Windows | | |
| Wardrobes / storage | | |

---

## Safety

☐ Smoke alarms tested and working
☐ Carbon monoxide alarm present (if applicable)
☐ Gas safety certificate current
☐ Electrical safety certificate current
☐ No signs of damp or mould

---

## Additional Notes

{{additional_notes}}

---

**Inspector Signature:** _______________________________________________

**Tenant Signature (if present):** _______________________________________________

**Date:** _______________________________________________`,
  },

  {
    id: 'checklist-health-safety',
    builderId: 'checklist',
    name: 'Health & Safety Checklist',
    description: 'Workplace health and safety inspection checklist',
    category: 'Health & Safety',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'location', label: 'Location / Department', type: 'text', required: true },
      { id: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
      { id: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
      { id: 'additional_items', label: 'Additional Items', type: 'textarea' },
    ],
    bodyTemplate: `# HEALTH & SAFETY INSPECTION CHECKLIST

**{{org_name}}**

**Location:** {{location}}
**Date:** {{inspection_date}}
**Inspector:** {{inspector_name}}

*Status: ✓ = Satisfactory, ✗ = Action Required, N/A = Not Applicable*

---

## Fire Safety

| Item | Status | Action Required |
|------|--------|-----------------|
| Fire exits clear and unobstructed | | |
| Fire extinguishers in place and in date | | |
| Fire alarm tested recently | | |
| Evacuation plan displayed | | |
| Emergency lighting working | | |

---

## First Aid

| Item | Status | Action Required |
|------|--------|-----------------|
| First aid kit stocked and in date | | |
| First aider names displayed | | |
| Accident book available | | |
| AED defibrillator accessible (if applicable) | | |

---

## Electrical Safety

| Item | Status | Action Required |
|------|--------|-----------------|
| No trailing cables or trip hazards | | |
| Electrical equipment PAT tested | | |
| No overloaded sockets | | |
| Electrical panels accessible | | |

---

## Manual Handling

| Item | Status | Action Required |
|------|--------|-----------------|
| Manual handling training completed | | |
| Lifting aids available | | |
| Storage areas organised safely | | |

---

## General Housekeeping

| Item | Status | Action Required |
|------|--------|-----------------|
| Floors clean and dry | | |
| Walkways clear | | |
| Waste disposed of correctly | | |
| Hazardous substances stored correctly | | |

---

## Additional Items

{{additional_items}}

---

**Overall Assessment:** ☐ Satisfactory  ☐ Actions Required  ☐ Urgent Action Required

**Inspector Signature:** _______________________________________________

**Date:** _______________________________________________`,
  },

  {
    id: 'checklist-event',
    builderId: 'checklist',
    name: 'Event Planning Checklist',
    description: 'Comprehensive event planning and day-of checklist',
    category: 'Event',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'event_name', label: 'Event Name', type: 'text', required: true },
      { id: 'event_date', label: 'Event Date', type: 'date', required: true },
      { id: 'event_location', label: 'Venue / Location', type: 'text', required: true },
      { id: 'expected_attendance', label: 'Expected Attendance', type: 'text' },
      { id: 'event_manager', label: 'Event Manager', type: 'text', required: true },
      { id: 'additional_tasks', label: 'Additional Tasks', type: 'textarea' },
    ],
    bodyTemplate: `# EVENT PLANNING CHECKLIST

**{{org_name}}**

**Event:** {{event_name}}
**Date:** {{event_date}}
**Venue:** {{event_location}}
**Expected Attendance:** {{expected_attendance}}
**Event Manager:** {{event_manager}}

---

## 8+ Weeks Before

☐ Event concept and objectives confirmed
☐ Budget approved
☐ Venue booked and contract signed
☐ Date confirmed and promoted
☐ Key speakers / performers booked
☐ Catering requirements confirmed
☐ AV and technical requirements assessed

---

## 4–8 Weeks Before

☐ Invitations / tickets sent
☐ Agenda / programme drafted
☐ Volunteer / staff roles assigned
☐ Risk assessment completed
☐ Insurance confirmed
☐ Accessibility requirements assessed
☐ Marketing and promotion underway

---

## 1–2 Weeks Before

☐ Final attendee numbers confirmed
☐ Catering numbers confirmed
☐ Briefing notes prepared for staff and volunteers
☐ Equipment and materials ordered
☐ Venue layout confirmed
☐ Emergency procedures reviewed

---

## Day Before

☐ Venue set up
☐ AV and technical equipment tested
☐ Registration / check-in system ready
☐ Signage in place
☐ Staff briefed

---

## Day of Event

☐ Staff / volunteers in position
☐ Registration open
☐ Catering delivered and set up
☐ Programme running to schedule
☐ Incident log available

---

## After the Event

☐ Venue cleared and returned to original condition
☐ Thank you messages sent
☐ Feedback collected
☐ Budget reconciled
☐ Debrief meeting held
☐ Lessons learned documented

---

## Additional Tasks

{{additional_tasks}}`,
  },

  {
    id: 'checklist-due-diligence',
    builderId: 'checklist',
    name: 'Due Diligence Checklist',
    description: 'Business acquisition or partnership due diligence checklist',
    category: 'Due Diligence',
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Your Organisation', type: 'text', required: true },
      { id: 'target_name', label: 'Target / Partner Organisation', type: 'text', required: true },
      { id: 'review_date', label: 'Review Date', type: 'date', required: true },
      { id: 'reviewed_by', label: 'Reviewed By', type: 'text', required: true },
      { id: 'additional_items', label: 'Additional Items', type: 'textarea' },
    ],
    bodyTemplate: `# DUE DILIGENCE CHECKLIST

**{{org_name}}** reviewing **{{target_name}}**

**Date:** {{review_date}} | **Reviewed By:** {{reviewed_by}}

*Status: ✓ = Obtained, ✗ = Outstanding, N/A = Not Applicable*

---

## Corporate and Legal

| Item | Status | Notes |
|------|--------|-------|
| Certificate of incorporation | | |
| Memorandum and articles of association | | |
| Shareholder register | | |
| Director details and service agreements | | |
| Statutory filings (Companies House) | | |
| Litigation history | | |
| Regulatory licences and permits | | |

---

## Financial

| Item | Status | Notes |
|------|--------|-------|
| Last 3 years audited accounts | | |
| Management accounts (current year) | | |
| Bank statements (last 6 months) | | |
| Outstanding debts and liabilities | | |
| Tax compliance (HMRC) | | |
| VAT registration and returns | | |
| Pension obligations | | |

---

## Commercial

| Item | Status | Notes |
|------|--------|-------|
| Key customer contracts | | |
| Key supplier contracts | | |
| Intellectual property register | | |
| Insurance policies | | |
| Lease agreements | | |

---

## Employment

| Item | Status | Notes |
|------|--------|-------|
| Employee list and contracts | | |
| TUPE obligations assessed | | |
| Outstanding employment claims | | |
| Pension arrangements | | |

---

## Data and IT

| Item | Status | Notes |
|------|--------|-------|
| GDPR compliance review | | |
| IT systems and licences | | |
| Cybersecurity posture | | |

---

## Additional Items

{{additional_items}}

---

**Overall Assessment:** _______________________________________________`,
  },

  {
    id: 'checklist-training',
    builderId: 'checklist',
    name: 'Training Checklist',
    description: 'Staff training completion and sign-off checklist',
    category: 'Training',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'trainee_name', label: 'Trainee Name', type: 'text', required: true },
      { id: 'role_name', label: 'Role', type: 'text', required: true },
      { id: 'trainer_name', label: 'Trainer / Assessor', type: 'text', required: true },
      { id: 'training_period', label: 'Training Period', type: 'text', required: true },
      { id: 'training_modules', label: 'Training Modules / Topics', type: 'textarea', required: true, helpText: 'List each module or topic to be covered' },
    ],
    bodyTemplate: `# TRAINING CHECKLIST

**{{org_name}}**

**Trainee:** {{trainee_name}} | **Role:** {{role_name}}
**Trainer:** {{trainer_name}} | **Period:** {{training_period}}

---

## Training Modules

{{training_modules}}

---

## Sign-Off Record

| Module / Topic | Date Completed | Trainee Initials | Trainer Initials |
|----------------|---------------|------------------|------------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

## Assessment

**Competency confirmed:** ☐ Yes  ☐ No  ☐ Further training required

**Notes:** _______________________________________________

---

**Trainee Signature:** _______________________________________________

**Trainer Signature:** _______________________________________________

**Date:** _______________________________________________`,
  },

  // ── Launch Checklist ──────────────────────────────────────────────────────
  {
    id: 'checklist-product-launch',
    builderId: 'checklist',
    name: 'Product / Service Launch Checklist',
    description: 'Pre-launch checklist for a new product, service, or campaign',
    category: 'Launch',
    industries: ['Business', 'Retail', 'IT', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'launch_name',       label: 'Product / Service Name',     type: 'text',     required: true },
      { id: 'launch_date',       label: 'Target Launch Date',         type: 'date',     required: true },
      { id: 'owner',             label: 'Launch Owner',               type: 'text' },
      { id: 'custom_items',      label: 'Additional Custom Items',    type: 'textarea', placeholder: 'Any additional checklist items specific to your launch' },
    ],
    bodyTemplate: `# Product / Service Launch Checklist

**Organisation:** {{org_name}}
**Launch:** {{launch_name}}
**Target Date:** {{launch_date}}
**Owner:** {{owner}}

---

## Strategy & Planning

☐ Launch objectives defined and agreed
☐ Target audience identified
☐ Competitive analysis completed
☐ Pricing confirmed
☐ Launch budget approved

---

## Product / Service Readiness

☐ Product / service fully tested and signed off
☐ Quality assurance completed
☐ Documentation / user guides prepared
☐ Support processes in place
☐ Inventory / capacity confirmed

---

## Marketing & Communications

☐ Marketing materials designed and approved
☐ Website / landing page live and tested
☐ Social media content scheduled
☐ Email campaign prepared
☐ Press release drafted (if applicable)
☐ Internal communications sent

---

## Sales & Operations

☐ Sales team briefed and trained
☐ CRM / systems updated
☐ Order / fulfilment process tested
☐ Customer service team briefed
☐ FAQs prepared

---

## Legal & Compliance

☐ Terms and conditions reviewed
☐ Privacy policy updated (if applicable)
☐ Regulatory requirements checked
☐ Contracts / agreements in place

---

## Post-Launch

☐ Monitoring plan in place
☐ Success metrics defined
☐ Feedback mechanism set up
☐ Post-launch review date scheduled

---

## Additional Items

{{custom_items}}

---

**Signed off by:** _______________________________________________  **Date:** _______________`,
  },

  // ── IT & Security Checklist ───────────────────────────────────────────────
  {
    id: 'checklist-it-security',
    builderId: 'checklist',
    name: 'IT Security Checklist',
    description: 'Checklist for IT and cybersecurity best practices',
    category: 'IT & Security',
    industries: ['IT', 'Business', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'review_date',       label: 'Review Date',                type: 'date',     required: true },
      { id: 'reviewed_by',       label: 'Reviewed By',                type: 'text' },
      { id: 'scope',             label: 'Scope',                      type: 'text',     placeholder: 'e.g. All systems / specific department' },
    ],
    bodyTemplate: `# IT Security Checklist

**Organisation:** {{org_name}}
**Review Date:** {{review_date}}
**Reviewed By:** {{reviewed_by}}
**Scope:** {{scope}}

---

## Access Control

☐ All user accounts reviewed and unnecessary accounts removed
☐ Strong password policy enforced (min 12 characters, complexity)
☐ Multi-factor authentication (MFA) enabled for all critical systems
☐ Privileged access reviewed and limited to authorised personnel
☐ Leavers' accounts disabled promptly

---

## Devices & Endpoints

☐ All devices have up-to-date antivirus / endpoint protection
☐ Operating systems and software patched and up to date
☐ Full-disk encryption enabled on laptops and mobile devices
☐ Screen lock enabled (max 5 minutes inactivity)
☐ Remote wipe capability in place for mobile devices

---

## Network Security

☐ Firewall configured and active
☐ Wi-Fi uses WPA3 or WPA2 encryption
☐ Guest Wi-Fi separated from internal network
☐ VPN required for remote access to internal systems
☐ Unused ports and services disabled

---

## Data Protection

☐ Data classification policy in place
☐ Sensitive data encrypted at rest and in transit
☐ Regular backups performed and tested
☐ Backup copies stored offsite or in cloud
☐ Data retention and disposal policy followed

---

## Email & Phishing

☐ Spam / phishing filters active
☐ DMARC, DKIM, and SPF records configured
☐ Staff trained on phishing awareness
☐ Suspicious email reporting process in place

---

## Incident Response

☐ Incident response plan documented and tested
☐ Security incidents logged and reviewed
☐ Contact details for IT security team / provider up to date
☐ Cyber insurance in place (if applicable)

---

**Overall Status:** ☐ Satisfactory  ☐ Requires Attention  ☐ Critical Issues Found

**Notes:** _______________________________________________

**Signed:** _______________________________________________  **Date:** _______________`,
  },

  // ── Audit Checklist ───────────────────────────────────────────────────────
  {
    id: 'checklist-internal-audit',
    builderId: 'checklist',
    name: 'Internal Audit Checklist',
    description: 'General internal audit checklist for business processes',
    category: 'Audit',
    industries: ['Finance', 'Business', 'Charity', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#65a30d',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'audit_area',        label: 'Audit Area',                 type: 'text',     required: true, placeholder: 'e.g. Finance, HR, Operations' },
      { id: 'audit_date',        label: 'Audit Date',                 type: 'date',     required: true },
      { id: 'auditor',           label: 'Auditor Name',               type: 'text',     required: true },
      { id: 'auditee',           label: 'Auditee / Department Head',  type: 'text' },
      { id: 'custom_items',      label: 'Area-Specific Audit Items',  type: 'textarea', required: true, placeholder: 'List specific items to audit for this area' },
    ],
    bodyTemplate: `# Internal Audit Checklist

**Organisation:** {{org_name}}
**Audit Area:** {{audit_area}}
**Date:** {{audit_date}}
**Auditor:** {{auditor}}
**Auditee:** {{auditee}}

---

## General Controls

| Item | Compliant | Non-Compliant | N/A | Evidence / Notes |
|------|-----------|---------------|-----|-----------------|
| Policies and procedures documented and current | ☐ | ☐ | ☐ | |
| Roles and responsibilities clearly defined | ☐ | ☐ | ☐ | |
| Staff training records up to date | ☐ | ☐ | ☐ | |
| Records maintained and accessible | ☐ | ☐ | ☐ | |
| Previous audit findings addressed | ☐ | ☐ | ☐ | |

---

## Area-Specific Items

{{custom_items}}

---

## Summary

**Findings:** _______________________________________________

**Recommendations:** _______________________________________________

**Risk Rating:** ☐ Low  ☐ Medium  ☐ High  ☐ Critical

**Follow-up Required:** ☐ Yes  ☐ No

**Follow-up Date:** _______________

---

**Auditor Signature:** _______________________________________________  **Date:** _______________

**Auditee Signature:** _______________________________________________  **Date:** _______________`,
  },
];
