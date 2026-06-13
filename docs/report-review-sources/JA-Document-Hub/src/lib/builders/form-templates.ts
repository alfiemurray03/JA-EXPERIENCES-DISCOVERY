import type { BuilderTemplate } from '@/lib/builder-framework';

export const FORM_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'form-booking',
    builderId: 'form',
    name: 'Booking Form',
    description: 'General appointment or service booking form',
    category: 'Booking & Registration',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation / Business Name', type: 'text', required: true },
      { id: 'service_name', label: 'Service / Event Name', type: 'text', required: true },
      { id: 'service_description', label: 'Service Description', type: 'textarea', placeholder: 'Brief description of what is being booked' },
      { id: 'available_slots', label: 'Available Dates / Times', type: 'textarea', placeholder: 'List available slots or leave blank for open booking' },
      { id: 'price', label: 'Price / Fee', type: 'text', placeholder: 'e.g. £50 per session or Free' },
      { id: 'cancellation_policy', label: 'Cancellation Policy', type: 'textarea', defaultValue: 'Cancellations must be made at least 48 hours in advance. Late cancellations may be charged in full.' },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'contact_phone', label: 'Contact Phone', type: 'phone' },
    ],
    bodyTemplate: `# BOOKING FORM

**{{org_name}}**

---

## {{service_name}}

{{service_description}}

**Price:** {{price}}

---

## Your Details

**Full Name:** _______________________________________________

**Email Address:** _______________________________________________

**Phone Number:** _______________________________________________

**Address:** _______________________________________________

---

## Booking Details

**Preferred Date:** _______________________________________________

**Preferred Time:** _______________________________________________

**Alternative Date:** _______________________________________________

{{available_slots}}

---

## Additional Information

**Special requirements or notes:**

_______________________________________________

_______________________________________________

---

## Cancellation Policy

{{cancellation_policy}}

---

## Declaration

I confirm that the information provided is accurate and I agree to the terms and conditions.

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

*Return this form to: {{contact_email}} | {{contact_phone}}*`,
  },

  {
    id: 'form-consent',
    builderId: 'form',
    name: 'Consent Form',
    description: 'General consent form for activities, treatments, or data use',
    category: 'Consent',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'activity_name', label: 'Activity / Treatment / Purpose', type: 'text', required: true },
      { id: 'activity_description', label: 'Description', type: 'textarea', required: true },
      { id: 'risks', label: 'Risks / Considerations', type: 'textarea', placeholder: 'Any risks the person should be aware of' },
      { id: 'consent_type', label: 'Consent Type', type: 'select', options: ['Adult self-consent', 'Parental consent (under 16)', 'Parental consent (under 18)', 'Next of kin consent'], defaultValue: 'Adult self-consent' },
      { id: 'data_consent', label: 'Include Data Processing Consent', type: 'toggle', placeholder: 'Add GDPR data consent section', defaultValue: 'true' },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
    ],
    bodyTemplate: `# CONSENT FORM

**{{org_name}}**

---

## {{activity_name}}

{{activity_description}}

---

## Risks and Considerations

{{risks}}

---

## Consent Declaration

I, the undersigned, confirm that:

- I have read and understood the information provided above
- I have had the opportunity to ask questions
- I give my consent to participate in / receive **{{activity_name}}**
- I understand I may withdraw my consent at any time

**Full Name:** _______________________________________________

**Date of Birth:** _______________________________________________

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

## Parental / Guardian Consent (if applicable — {{consent_type}})

I am the parent/guardian of the above-named individual and give consent on their behalf.

**Parent / Guardian Name:** _______________________________________________

**Relationship:** _______________________________________________

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

## Data Processing Consent

I consent to {{org_name}} collecting and storing my personal data for the purpose of administering this activity. My data will be handled in accordance with the organisation's Privacy Policy.

**Signature:** _______________________________________________

---

*Queries: {{contact_email}}*`,
  },

  {
    id: 'form-feedback',
    builderId: 'form',
    name: 'Feedback Form',
    description: 'Customer or service user feedback form',
    category: 'Feedback',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'service_name', label: 'Service / Product / Event Name', type: 'text', required: true },
      { id: 'feedback_purpose', label: 'Purpose of Feedback', type: 'textarea', placeholder: 'What will this feedback be used for?' },
      { id: 'custom_questions', label: 'Additional Questions', type: 'textarea', placeholder: 'Add any specific questions you want to ask' },
      { id: 'contact_email', label: 'Return Email', type: 'email', required: true },
    ],
    bodyTemplate: `# FEEDBACK FORM

**{{org_name}}** — {{service_name}}

{{feedback_purpose}}

*Your feedback is anonymous unless you choose to provide your name.*

---

## Overall Experience

How would you rate your overall experience?

☐ Excellent  ☐ Good  ☐ Satisfactory  ☐ Poor  ☐ Very Poor

---

## Quality of Service

How would you rate the quality of service you received?

☐ Excellent  ☐ Good  ☐ Satisfactory  ☐ Poor  ☐ Very Poor

---

## Staff / Communication

How would you rate the helpfulness and communication of our team?

☐ Excellent  ☐ Good  ☐ Satisfactory  ☐ Poor  ☐ Very Poor

---

## What did we do well?

_______________________________________________

_______________________________________________

---

## What could we improve?

_______________________________________________

_______________________________________________

---

## Additional Questions

{{custom_questions}}

_______________________________________________

_______________________________________________

---

## Would you recommend us?

☐ Yes, definitely  ☐ Probably  ☐ Not sure  ☐ Probably not  ☐ No

---

## Your Details (optional)

**Name:** _______________________________________________

**Email:** _______________________________________________

---

*Return to: {{contact_email}}*`,
  },

  {
    id: 'form-incident',
    builderId: 'form',
    name: 'Incident / Accident Form',
    description: 'Workplace or event incident and accident report form',
    category: 'Incident & Accident',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'form_ref', label: 'Form Reference', type: 'text', placeholder: 'Auto-assigned or manual ref' },
      { id: 'incident_types', label: 'Types of Incident Covered', type: 'textarea', defaultValue: 'Accident, near miss, dangerous occurrence, occupational disease, security incident' },
      { id: 'contact_email', label: 'Submit To (Email)', type: 'email', required: true },
    ],
    bodyTemplate: `# INCIDENT / ACCIDENT REPORT FORM

**{{org_name}}**

**Form Reference:** {{form_ref}}

*Complete this form as soon as possible after the incident. All sections must be completed.*

---

## Section 1 — Incident Details

**Date of Incident:** _______________________________________________

**Time of Incident:** _______________________________________________

**Location:** _______________________________________________

**Type of Incident:**
☐ Accident  ☐ Near Miss  ☐ Dangerous Occurrence  ☐ Security Incident  ☐ Other: _______________

---

## Section 2 — Person(s) Involved

**Name:** _______________________________________________

**Role / Relationship:** ☐ Employee  ☐ Contractor  ☐ Visitor  ☐ Member of Public

**Contact Details:** _______________________________________________

**Date of Birth:** _______________________________________________

---

## Section 3 — Description of Incident

*Describe what happened in your own words. Include what you were doing, what went wrong, and any contributing factors.*

_______________________________________________

_______________________________________________

_______________________________________________

---

## Section 4 — Injuries / Damage

**Were any injuries sustained?** ☐ Yes  ☐ No

**Nature of injury:** _______________________________________________

**Body part affected:** _______________________________________________

**Was first aid administered?** ☐ Yes  ☐ No

**Was medical attention required?** ☐ Yes  ☐ No

**Was any property damaged?** ☐ Yes  ☐ No

**Details of damage:** _______________________________________________

---

## Section 5 — Witnesses

**Witness 1 Name:** _______________________________________________

**Contact:** _______________________________________________

**Witness 2 Name:** _______________________________________________

**Contact:** _______________________________________________

---

## Section 6 — Immediate Action Taken

_______________________________________________

_______________________________________________

---

## Section 7 — Reported By

**Name:** _______________________________________________

**Role:** _______________________________________________

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

## Section 8 — Manager Review (to be completed by manager)

**Reviewed by:** _______________________________________________

**Date:** _______________________________________________

**RIDDOR reportable?** ☐ Yes  ☐ No

**Corrective actions required:**

_______________________________________________

**Signature:** _______________________________________________

---

*Submit to: {{contact_email}}*`,
  },

  {
    id: 'form-registration',
    builderId: 'form',
    name: 'Registration Form',
    description: 'Event, course, or membership registration form',
    category: 'Booking & Registration',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'event_name', label: 'Event / Course / Programme Name', type: 'text', required: true },
      { id: 'event_date', label: 'Date(s)', type: 'text', placeholder: 'e.g. 15 July 2026 or 6-week course starting 1 September' },
      { id: 'event_location', label: 'Location / Venue', type: 'text' },
      { id: 'fee', label: 'Registration Fee', type: 'text', placeholder: 'e.g. £25 or Free' },
      { id: 'capacity', label: 'Maximum Capacity', type: 'text', placeholder: 'e.g. 20 places available' },
      { id: 'additional_fields', label: 'Additional Information Required', type: 'textarea', placeholder: 'e.g. dietary requirements, emergency contact, qualifications' },
      { id: 'contact_email', label: 'Return Email', type: 'email', required: true },
    ],
    bodyTemplate: `# REGISTRATION FORM

**{{org_name}}**

---

## {{event_name}}

**Date(s):** {{event_date}}
**Location:** {{event_location}}
**Fee:** {{fee}}
**Capacity:** {{capacity}}

---

## Personal Details

**Full Name:** _______________________________________________

**Date of Birth:** _______________________________________________

**Email Address:** _______________________________________________

**Phone Number:** _______________________________________________

**Address:** _______________________________________________

---

## Additional Information

{{additional_fields}}

_______________________________________________

_______________________________________________

---

## Emergency Contact

**Name:** _______________________________________________

**Relationship:** _______________________________________________

**Phone:** _______________________________________________

---

## Payment

**Payment method:** ☐ Bank Transfer  ☐ Card  ☐ Cash  ☐ Invoice

**Amount paid:** _______________________________________________

---

## Declaration

I confirm that the information provided is accurate and I agree to the terms and conditions of this registration.

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

*Return to: {{contact_email}}*`,
  },

  {
    id: 'form-application',
    builderId: 'form',
    name: 'Application Form',
    description: 'Job, volunteer, or membership application form',
    category: 'Application',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'role_name', label: 'Role / Position Applied For', type: 'text', required: true },
      { id: 'application_type', label: 'Application Type', type: 'select', options: ['Employment', 'Volunteer', 'Membership', 'Grant / Funding', 'Other'], defaultValue: 'Employment' },
      { id: 'closing_date', label: 'Closing Date', type: 'date' },
      { id: 'key_requirements', label: 'Key Requirements / Questions', type: 'textarea', placeholder: 'List the key questions or requirements applicants should address' },
      { id: 'contact_email', label: 'Submit To', type: 'email', required: true },
    ],
    bodyTemplate: `# APPLICATION FORM

**{{org_name}}**

**Role:** {{role_name}}
**Application Type:** {{application_type}}
**Closing Date:** {{closing_date}}

---

## Personal Details

**Full Name:** _______________________________________________

**Email Address:** _______________________________________________

**Phone Number:** _______________________________________________

**Address:** _______________________________________________

---

## Eligibility

**Are you eligible to work in the UK?** ☐ Yes  ☐ No

**Do you require a work permit?** ☐ Yes  ☐ No

---

## Education and Qualifications

| Qualification | Institution | Year | Grade |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

---

## Employment / Experience History

**Most Recent Role:**

**Organisation:** _______________________________________________

**Role:** _______________________________________________

**Dates:** _______________________________________________

**Responsibilities:** _______________________________________________

---

## Supporting Statement

*Please address the following:*

{{key_requirements}}

_______________________________________________

_______________________________________________

_______________________________________________

---

## References

**Reference 1 Name:** _______________________________________________

**Organisation / Relationship:** _______________________________________________

**Email / Phone:** _______________________________________________

**Reference 2 Name:** _______________________________________________

**Organisation / Relationship:** _______________________________________________

**Email / Phone:** _______________________________________________

---

## Declaration

I confirm that the information provided in this application is true and accurate. I understand that providing false information may result in my application being rejected or, if appointed, dismissal.

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

*Submit to: {{contact_email}}*`,
  },

  {
    id: 'form-onboarding',
    builderId: 'form',
    name: 'Staff Onboarding Form',
    description: 'New employee or volunteer onboarding information form',
    category: 'Onboarding',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'role_name', label: 'Role / Job Title', type: 'text', required: true },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'line_manager', label: 'Line Manager Name', type: 'text' },
      { id: 'department', label: 'Department / Team', type: 'text' },
      { id: 'additional_fields', label: 'Additional Information Required', type: 'textarea', placeholder: 'e.g. uniform size, IT equipment preferences, access requirements' },
      { id: 'hr_email', label: 'HR / Admin Email', type: 'email', required: true },
    ],
    bodyTemplate: `# STAFF ONBOARDING FORM

**{{org_name}}**

**Role:** {{role_name}} | **Start Date:** {{start_date}}
**Department:** {{department}} | **Line Manager:** {{line_manager}}

*Please complete all sections and return to {{hr_email}} before your start date.*

---

## Personal Details

**Full Name:** _______________________________________________

**Preferred Name:** _______________________________________________

**Date of Birth:** _______________________________________________

**National Insurance Number:** _______________________________________________

**Home Address:** _______________________________________________

**Personal Email:** _______________________________________________

**Personal Phone:** _______________________________________________

---

## Bank Details (for payroll)

**Bank Name:** _______________________________________________

**Account Name:** _______________________________________________

**Sort Code:** _______________________________________________

**Account Number:** _______________________________________________

---

## Emergency Contact

**Name:** _______________________________________________

**Relationship:** _______________________________________________

**Phone:** _______________________________________________

---

## Right to Work

**Nationality:** _______________________________________________

**Documents provided:** ☐ Passport  ☐ Birth Certificate + NI  ☐ Visa / BRP  ☐ Other

---

## Additional Information

{{additional_fields}}

_______________________________________________

---

## Declaration

I confirm that the information provided is accurate and complete.

**Signature:** _______________________________________________

**Date:** _______________________________________________

---

*Return to: {{hr_email}}*`,
  },

  // ── Internal Request ──────────────────────────────────────────────────────
  {
    id: 'form-it-request',
    builderId: 'form',
    name: 'IT Support Request Form',
    description: 'Internal form for logging IT support or equipment requests',
    category: 'Internal Request',
    industries: ['IT', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'it_contact',        label: 'IT Department / Contact',    type: 'text' },
      { id: 'it_email',          label: 'IT Email',                   type: 'email' },
      { id: 'priority_options',  label: 'Priority Levels',            type: 'textarea', defaultValue: 'Low, Medium, High, Critical' },
      { id: 'request_types',     label: 'Request Types',              type: 'textarea', defaultValue: 'Hardware fault, Software issue, New equipment request, Access request, Network issue, Other' },
    ],
    bodyTemplate: `# IT Support Request Form

**Organisation:** {{org_name}}
**IT Contact:** {{it_contact}} — {{it_email}}

---

## Requester Details

**Full Name:** _______________________________________________

**Department:** _______________________________________________

**Email:** _______________________________________________

**Phone / Extension:** _______________________________________________

**Date of Request:** _______________________________________________

---

## Request Details

**Request Type:**
☐ Hardware fault  ☐ Software issue  ☐ New equipment request
☐ Access request  ☐ Network issue  ☐ Other: _______________

**Priority:**
☐ Low  ☐ Medium  ☐ High  ☐ Critical

**Description of Issue / Request:**

_______________________________________________
_______________________________________________
_______________________________________________

**Asset / Device (if applicable):** _______________________________________________

**When did the issue start?** _______________________________________________

**Steps already taken:** _______________________________________________

---

## For IT Use Only

**Ticket Number:** _______________  **Assigned To:** _______________

**Status:** ☐ Open  ☐ In Progress  ☐ Resolved  ☐ Closed

**Resolution Notes:** _______________________________________________

**Date Resolved:** _______________________________________________`,
  },

  // ── Medical & Care ────────────────────────────────────────────────────────
  {
    id: 'form-medical-consent',
    builderId: 'form',
    name: 'Medical Consent Form',
    description: 'Consent form for medical treatment or procedures',
    category: 'Medical & Care',
    industries: ['Healthcare', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Organisation / Practice Name', type: 'text',   required: true },
      { id: 'org_address',       label: 'Organisation Address',       type: 'textarea' },
      { id: 'treatment_types',   label: 'Treatment / Procedure Types',type: 'textarea', defaultValue: 'Consultation, Treatment, Procedure, Photography / Recording' },
    ],
    bodyTemplate: `# Medical Consent Form

**{{org_name}}**
{{org_address}}

---

## Patient Details

**Full Name:** _______________________________________________

**Date of Birth:** _______________________________________________

**Address:** _______________________________________________

**Phone:** _______________________________________________

**GP Name & Practice:** _______________________________________________

---

## Medical History

**Current medications:** _______________________________________________

**Known allergies:** _______________________________________________

**Relevant medical conditions:** _______________________________________________

---

## Consent

I consent to the following:

☐ Consultation and examination
☐ Treatment / procedure as discussed
☐ Photography / recording for clinical records
☐ Sharing of information with other healthcare providers involved in my care

**I confirm that:**
- I have been given the opportunity to ask questions
- The risks and benefits have been explained to me
- I understand I may withdraw consent at any time

**Patient Signature:** _______________________________________________

**Date:** _______________________________________________

**Parent / Guardian Signature (if under 18):** _______________________________________________

---

*This form is held in confidence in accordance with our Privacy Policy and GDPR.*`,
  },

  // ── Survey ────────────────────────────────────────────────────────────────
  {
    id: 'form-employee-survey',
    builderId: 'form',
    name: 'Employee Satisfaction Survey',
    description: 'Anonymous survey to gauge employee satisfaction and engagement',
    category: 'Survey',
    industries: ['HR', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'survey_period',     label: 'Survey Period',              type: 'text',     placeholder: 'e.g. Q2 2026' },
      { id: 'return_by',         label: 'Return By Date',             type: 'date' },
      { id: 'hr_email',          label: 'Return To (HR Email)',       type: 'email' },
    ],
    bodyTemplate: `# Employee Satisfaction Survey

**{{org_name}}**
**Survey Period:** {{survey_period}}
**Please return by:** {{return_by}} to {{hr_email}}

*This survey is anonymous. Please answer honestly — your feedback helps us improve.*

---

## Section 1: Overall Satisfaction

**1. How satisfied are you with your role overall?**
☐ Very satisfied  ☐ Satisfied  ☐ Neutral  ☐ Dissatisfied  ☐ Very dissatisfied

**2. How likely are you to recommend {{org_name}} as a place to work?**
☐ Very likely  ☐ Likely  ☐ Neutral  ☐ Unlikely  ☐ Very unlikely

---

## Section 2: Your Role

**3. Do you feel your work is valued?**
☐ Always  ☐ Usually  ☐ Sometimes  ☐ Rarely  ☐ Never

**4. Do you have the resources and support to do your job effectively?**
☐ Yes, always  ☐ Usually  ☐ Sometimes  ☐ Rarely  ☐ No

---

## Section 3: Management & Communication

**5. How would you rate communication from senior management?**
☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**6. Do you feel your manager supports your development?**
☐ Yes  ☐ Mostly  ☐ Sometimes  ☐ No

---

## Section 4: Wellbeing

**7. How would you rate your work-life balance?**
☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**8. Do you feel comfortable raising concerns at work?**
☐ Yes  ☐ Usually  ☐ Sometimes  ☐ No

---

## Section 5: Open Feedback

**9. What is working well at {{org_name}}?**

_______________________________________________
_______________________________________________

**10. What could be improved?**

_______________________________________________
_______________________________________________

**11. Any other comments?**

_______________________________________________
_______________________________________________

---

*Thank you for completing this survey.*`,
  },

  // ── Inspection ────────────────────────────────────────────────────────────
  {
    id: 'form-vehicle-inspection',
    builderId: 'form',
    name: 'Vehicle Inspection Form',
    description: 'Pre-use or periodic vehicle safety inspection checklist',
    category: 'Inspection',
    industries: ['Construction', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'fleet_contact',     label: 'Fleet Manager / Contact',    type: 'text' },
    ],
    bodyTemplate: `# Vehicle Inspection Form

**Organisation:** {{org_name}}
**Fleet Contact:** {{fleet_contact}}

---

## Vehicle Details

**Registration:** _______________  **Make / Model:** _______________

**Mileage:** _______________  **Date of Inspection:** _______________

**Driver Name:** _______________________________________________

---

## Exterior Check

| Item | Pass | Fail | N/A | Notes |
|------|------|------|-----|-------|
| Bodywork (no damage) | ☐ | ☐ | ☐ | |
| Windscreen (no cracks) | ☐ | ☐ | ☐ | |
| All lights working | ☐ | ☐ | ☐ | |
| Tyres (tread & pressure) | ☐ | ☐ | ☐ | |
| Mirrors (clean & adjusted) | ☐ | ☐ | ☐ | |
| Number plates (clean & secure) | ☐ | ☐ | ☐ | |

---

## Interior Check

| Item | Pass | Fail | N/A | Notes |
|------|------|------|-----|-------|
| Seatbelts working | ☐ | ☐ | ☐ | |
| Horn working | ☐ | ☐ | ☐ | |
| Windscreen wipers | ☐ | ☐ | ☐ | |
| Dashboard warning lights | ☐ | ☐ | ☐ | |
| First aid kit present | ☐ | ☐ | ☐ | |
| Fire extinguisher (if required) | ☐ | ☐ | ☐ | |

---

## Fluid Levels

| Item | OK | Low | Notes |
|------|----|-----|-------|
| Engine oil | ☐ | ☐ | |
| Coolant | ☐ | ☐ | |
| Brake fluid | ☐ | ☐ | |
| Screen wash | ☐ | ☐ | |

---

## Overall Result

☐ **Pass** — Vehicle is safe to use
☐ **Fail** — Vehicle must not be used until defects are rectified
☐ **Advisory** — Minor issues noted; monitor closely

**Defects / Notes:** _______________________________________________

**Driver Signature:** _______________  **Date:** _______________`,
  },

  // ── Application ───────────────────────────────────────────────────────────
  {
    id: 'form-grant-application',
    builderId: 'form',
    name: 'Grant Application Form',
    description: 'Application form for grants or funding',
    category: 'Application',
    industries: ['Charity', 'Education', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0891b2',
    fields: [
      { id: 'org_name',          label: 'Funding Organisation Name',  type: 'text',     required: true },
      { id: 'fund_name',         label: 'Fund / Grant Name',          type: 'text',     required: true },
      { id: 'max_grant',         label: 'Maximum Grant Available',    type: 'text' },
      { id: 'deadline',          label: 'Application Deadline',       type: 'date' },
      { id: 'contact_email',     label: 'Submission Email',           type: 'email' },
    ],
    bodyTemplate: `# Grant Application Form

**{{org_name}}**
**Fund:** {{fund_name}}
**Maximum Grant:** {{max_grant}}
**Deadline:** {{deadline}}
**Submit to:** {{contact_email}}

---

## Section 1: Applicant Details

**Organisation / Individual Name:** _______________________________________________

**Registered Charity / Company Number (if applicable):** _______________

**Address:** _______________________________________________

**Contact Name:** _______________________________________________

**Email:** _______________________________________________  **Phone:** _______________

---

## Section 2: Project Details

**Project Title:** _______________________________________________

**Project Summary (max 200 words):**

_______________________________________________
_______________________________________________
_______________________________________________

**Project Start Date:** _______________  **End Date:** _______________

**Geographic Area Covered:** _______________________________________________

---

## Section 3: Budget

**Amount Requested (£):** _______________

**Total Project Cost (£):** _______________

**Other Funding Sources:**

| Source | Amount | Confirmed? |
|--------|--------|------------|
| | | ☐ Yes ☐ No |
| | | ☐ Yes ☐ No |

**Budget Breakdown:**

_______________________________________________
_______________________________________________

---

## Section 4: Impact

**Who will benefit and how?**

_______________________________________________
_______________________________________________

**How will you measure success?**

_______________________________________________

---

## Declaration

I confirm that the information provided is accurate and that the organisation will use any grant awarded for the stated purpose.

**Signature:** _______________________________________________

**Name (print):** _______________________________________________

**Date:** _______________________________________________`,
  },
];
