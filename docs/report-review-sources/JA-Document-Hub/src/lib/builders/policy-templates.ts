import type { BuilderTemplate } from '@/lib/builder-framework';

export const POLICY_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'policy-privacy',
    builderId: 'policy',
    name: 'Privacy Policy',
    description: 'GDPR-compliant privacy policy for websites and businesses',
    category: 'Privacy & Data',
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation / Business Name', type: 'text', required: true },
      { id: 'org_address', label: 'Registered Address', type: 'textarea', required: true },
      { id: 'website_url', label: 'Website URL', type: 'text', placeholder: 'https://www.example.com' },
      { id: 'contact_email', label: 'Privacy Contact Email', type: 'email', required: true },
      { id: 'data_types', label: 'Types of Data Collected', type: 'textarea', placeholder: 'e.g. Name, email address, phone number, payment information', defaultValue: 'Name, email address, phone number, IP address, cookies and usage data' },
      { id: 'data_purposes', label: 'Purposes of Processing', type: 'textarea', defaultValue: 'To provide our services, process payments, send marketing communications (with consent), improve our website, and comply with legal obligations' },
      { id: 'retention_period', label: 'Data Retention Period', type: 'text', defaultValue: '7 years for financial records; 3 years for marketing data; 1 year for website analytics' },
      { id: 'third_parties', label: 'Third Parties Data is Shared With', type: 'textarea', defaultValue: 'Payment processors, email marketing platforms, cloud hosting providers, analytics services' },
      { id: 'dpo_name', label: 'Data Protection Officer (if applicable)', type: 'text', placeholder: 'Name or "Not applicable"' },
      { id: 'last_updated', label: 'Last Updated Date', type: 'date', required: true },
    ],
    bodyTemplate: `# PRIVACY POLICY

**{{org_name}}** is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information.

**Last updated:** {{last_updated}}

---

## 1. Who We Are

**{{org_name}}**
{{org_address}}
{{website_url}}

Contact: {{contact_email}}

{{dpo_name}}

## 2. What Data We Collect

We may collect and process the following personal data:

{{data_types}}

## 3. How We Use Your Data

We use your personal data for the following purposes:

{{data_purposes}}

## 4. Legal Basis for Processing

We process your personal data on the following legal bases under UK GDPR:
- **Contract performance** — to fulfil our contractual obligations to you
- **Legitimate interests** — to improve our services and prevent fraud
- **Legal obligation** — to comply with applicable laws
- **Consent** — where you have given explicit consent (e.g. marketing emails)

## 5. Data Retention

We retain your personal data for the following periods:

{{retention_period}}

After these periods, data is securely deleted or anonymised.

## 6. Sharing Your Data

We may share your data with:

{{third_parties}}

We do not sell your personal data to third parties.

## 7. Your Rights

Under UK GDPR, you have the right to:
- **Access** your personal data
- **Rectify** inaccurate data
- **Erase** your data ("right to be forgotten")
- **Restrict** processing
- **Data portability**
- **Object** to processing
- **Withdraw consent** at any time

To exercise any of these rights, contact us at {{contact_email}}.

## 8. Cookies

We use cookies to improve your experience on our website. You can control cookies through your browser settings. For more information, see our Cookie Policy.

## 9. Security

We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or destruction.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website.

## 11. Complaints

If you have concerns about how we handle your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at www.ico.org.uk.`,
  },

  {
    id: 'policy-cookie',
    builderId: 'policy',
    name: 'Cookie Policy',
    description: 'Cookie policy for websites explaining cookie usage',
    category: 'Website Policies',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'website_url', label: 'Website URL', type: 'text', required: true },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'analytics_tool', label: 'Analytics Tool Used', type: 'text', placeholder: 'e.g. Google Analytics', defaultValue: 'Google Analytics' },
      { id: 'last_updated', label: 'Last Updated', type: 'date', required: true },
    ],
    bodyTemplate: `# COOKIE POLICY

**{{org_name}}** | {{website_url}}

**Last updated:** {{last_updated}}

---

## What Are Cookies?

Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and improve your experience.

## How We Use Cookies

We use the following types of cookies on {{website_url}}:

### Essential Cookies
These cookies are necessary for the website to function and cannot be disabled. They are usually set in response to actions you take, such as logging in or filling in forms.

### Analytics Cookies
We use **{{analytics_tool}}** to understand how visitors interact with our website. These cookies collect information anonymously, including the number of visitors, where visitors came from, and the pages they visited.

### Preference Cookies
These cookies allow our website to remember choices you make (such as your language or region) and provide enhanced, personalised features.

### Marketing Cookies
We may use marketing cookies to track visitors across websites and display relevant advertisements. These are only set with your consent.

## Managing Cookies

You can control and manage cookies in several ways:

- **Browser settings** — Most browsers allow you to refuse or delete cookies. See your browser's help documentation for instructions.
- **Cookie consent tool** — When you first visit our website, you can choose which non-essential cookies to accept.
- **Opt-out tools** — For analytics cookies, you can opt out via {{analytics_tool}}'s opt-out tools.

Please note that disabling certain cookies may affect the functionality of our website.

## Contact

If you have questions about our use of cookies, contact us at {{contact_email}}.`,
  },

  {
    id: 'policy-complaints',
    builderId: 'policy',
    name: 'Complaints Policy',
    description: 'Formal complaints handling policy for businesses',
    category: 'Complaints',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'complaints_contact', label: 'Complaints Contact Name / Role', type: 'text', required: true },
      { id: 'complaints_email', label: 'Complaints Email', type: 'email', required: true },
      { id: 'complaints_phone', label: 'Complaints Phone', type: 'phone' },
      { id: 'response_time', label: 'Initial Response Time', type: 'text', defaultValue: '5 working days' },
      { id: 'resolution_time', label: 'Resolution Time', type: 'text', defaultValue: '28 working days' },
      { id: 'escalation_body', label: 'External Escalation Body', type: 'text', placeholder: 'e.g. Ombudsman, regulator name' },
      { id: 'last_updated', label: 'Last Updated', type: 'date', required: true },
    ],
    bodyTemplate: `# COMPLAINTS POLICY

**{{org_name}}**

**Last updated:** {{last_updated}}

---

## Our Commitment

{{org_name}} is committed to providing a high-quality service. We take all complaints seriously and aim to resolve them fairly, consistently, and promptly.

## How to Make a Complaint

You can make a complaint by:

- **Email:** {{complaints_email}}
- **Phone:** {{complaints_phone}}
- **In writing to:** {{complaints_contact}}, {{org_name}}

Please provide: your name and contact details, a clear description of your complaint, any relevant dates or reference numbers, and what outcome you are seeking.

## How We Handle Complaints

### Stage 1 — Initial Response
We will acknowledge your complaint within **{{response_time}}** of receiving it.

### Stage 2 — Investigation
We will investigate your complaint thoroughly and aim to provide a full response within **{{resolution_time}}**.

### Stage 3 — Final Response
If you are not satisfied with our response, you may request a review by a senior manager. We will provide a final response within 14 working days of your request.

## Escalation

If you remain dissatisfied after exhausting our internal complaints process, you may refer your complaint to:

**{{escalation_body}}**

## Learning from Complaints

We use complaints to improve our services. All complaints are recorded and reviewed regularly by management.

## Confidentiality

All complaints are handled in confidence. Information will only be shared with those who need it to investigate and resolve your complaint.`,
  },

  {
    id: 'policy-refund',
    builderId: 'policy',
    name: 'Refund Policy',
    description: 'Refund and returns policy for businesses',
    category: 'Finance',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Business Name', type: 'text', required: true },
      { id: 'product_type', label: 'Type of Products / Services', type: 'select', options: ['Physical goods', 'Digital products', 'Services', 'Mixed (goods and services)'], defaultValue: 'Services' },
      { id: 'refund_window', label: 'Refund Window', type: 'text', defaultValue: '14 days from purchase' },
      { id: 'refund_conditions', label: 'Conditions for Refund', type: 'textarea', defaultValue: 'Items must be unused and in original condition. Digital products are non-refundable once downloaded. Services are non-refundable once commenced unless there is a fault on our part.' },
      { id: 'refund_process', label: 'How to Request a Refund', type: 'textarea', defaultValue: 'Contact us by email with your order number and reason for the refund request. We will respond within 5 working days.' },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'last_updated', label: 'Last Updated', type: 'date', required: true },
    ],
    bodyTemplate: `# REFUND POLICY

**{{org_name}}**

**Last updated:** {{last_updated}}

---

## Overview

This policy covers refunds for {{product_type}} sold by {{org_name}}.

## Refund Window

You may request a refund within **{{refund_window}}** of your purchase.

## Conditions

{{refund_conditions}}

## Statutory Rights

Nothing in this policy affects your statutory rights under the Consumer Rights Act 2015 or the Consumer Contracts Regulations 2013. If you are a consumer, you have the right to cancel most purchases within 14 days without giving a reason.

## How to Request a Refund

{{refund_process}}

Contact: {{contact_email}}

## Processing Time

Approved refunds will be processed within 10 working days and returned to your original payment method.

## Faulty or Incorrect Items

If you receive a faulty or incorrect item, please contact us immediately. We will arrange a replacement or full refund at no cost to you.`,
  },

  {
    id: 'policy-health-safety',
    builderId: 'policy',
    name: 'Health & Safety Policy',
    description: 'Workplace health and safety policy statement',
    category: 'Health & Safety',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'responsible_person', label: 'Person Responsible for H&S', type: 'text', required: true },
      { id: 'responsible_title', label: 'Their Title / Role', type: 'text', required: true },
      { id: 'business_activities', label: 'Main Business Activities', type: 'textarea', required: true },
      { id: 'key_hazards', label: 'Key Hazards / Risks', type: 'textarea', placeholder: 'List the main hazards in your workplace' },
      { id: 'emergency_procedures', label: 'Emergency Procedures', type: 'textarea', defaultValue: 'In the event of an emergency, all staff must follow the evacuation procedure. Fire exits are clearly marked. First aid kits are located at reception and in the staff room.' },
      { id: 'review_date', label: 'Policy Review Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Signed By', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# HEALTH AND SAFETY POLICY

**{{org_name}}**

---

## Statement of Intent

{{org_name}} is committed to ensuring the health, safety, and welfare of all employees, contractors, visitors, and anyone else who may be affected by our activities.

We will, so far as is reasonably practicable:
- Provide and maintain safe working conditions, equipment, and systems of work
- Ensure safe use, handling, storage, and transport of articles and substances
- Provide information, instruction, training, and supervision
- Maintain safe and healthy working conditions
- Review and revise this policy as necessary

## Responsibilities

**Overall responsibility for health and safety rests with:**

{{responsible_person}}, {{responsible_title}}

All managers and supervisors are responsible for implementing this policy in their areas. All employees are responsible for cooperating with management on health and safety matters and for taking reasonable care of their own and others' safety.

## Our Business Activities

{{business_activities}}

## Key Hazards and Controls

{{key_hazards}}

## Emergency Procedures

{{emergency_procedures}}

## Reporting

All accidents, near misses, and dangerous occurrences must be reported to {{responsible_person}} and recorded in the accident book. Reportable incidents will be reported to the Health and Safety Executive (HSE) under RIDDOR.

## Review

This policy will be reviewed annually or following any significant change in our activities.

**Next review date:** {{review_date}}`,
  },

  {
    id: 'policy-safeguarding',
    builderId: 'policy',
    name: 'Safeguarding Policy',
    description: 'Child and adult safeguarding policy for organisations',
    category: 'Safeguarding',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'org_type', label: 'Organisation Type', type: 'select', options: ['School / Academy', 'Charity', 'Sports Club', 'Community Organisation', 'Healthcare Provider', 'Other'], defaultValue: 'Charity' },
      { id: 'dsl_name', label: 'Designated Safeguarding Lead (DSL)', type: 'text', required: true },
      { id: 'dsl_contact', label: 'DSL Contact Details', type: 'text', required: true },
      { id: 'deputy_dsl', label: 'Deputy DSL (if applicable)', type: 'text' },
      { id: 'scope', label: 'Who This Policy Covers', type: 'textarea', defaultValue: 'This policy applies to all staff, volunteers, trustees, and contractors working with or on behalf of the organisation.' },
      { id: 'reporting_procedure', label: 'Reporting Procedure', type: 'textarea', defaultValue: 'Any concerns about a child or vulnerable adult must be reported immediately to the DSL. Do not investigate concerns yourself. Record all concerns in writing.' },
      { id: 'review_date', label: 'Policy Review Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Approved By', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# SAFEGUARDING POLICY

**{{org_name}}** | {{org_type}}

---

## Policy Statement

{{org_name}} is committed to safeguarding and promoting the welfare of children and vulnerable adults. We believe that all children and vulnerable adults have the right to be protected from harm.

## Scope

{{scope}}

## Designated Safeguarding Lead

**{{dsl_name}}**
Contact: {{dsl_contact}}

Deputy DSL: {{deputy_dsl}}

## Our Responsibilities

We will:
- Create and maintain a safe environment for all children and vulnerable adults
- Respond appropriately to all concerns or allegations of abuse
- Ensure all staff and volunteers are appropriately vetted (DBS checked where required)
- Provide safeguarding training to all relevant staff and volunteers
- Work in partnership with statutory agencies when required

## Types of Abuse

Staff should be aware of the following types of abuse: physical abuse, emotional abuse, sexual abuse, neglect, financial abuse, and exploitation.

## Reporting Concerns

{{reporting_procedure}}

If a child or vulnerable adult is in immediate danger, call **999** immediately.

For non-emergency concerns, contact the local authority children's or adult services, or the NSPCC helpline on **0808 800 5000**.

## Confidentiality

Safeguarding concerns are not subject to normal confidentiality rules. Information will be shared with appropriate agencies to protect the individual.

## Review

This policy will be reviewed annually.

**Next review date:** {{review_date}}`,
  },

  {
    id: 'policy-data-protection',
    builderId: 'policy',
    name: 'Data Protection Policy',
    description: 'Internal data protection policy for staff and operations',
    category: 'Privacy & Data',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'dpo_name', label: 'Data Protection Officer / Lead', type: 'text', required: true },
      { id: 'dpo_email', label: 'DPO Email', type: 'email', required: true },
      { id: 'data_systems', label: 'Key Data Systems Used', type: 'textarea', placeholder: 'e.g. CRM, HR system, email platform, cloud storage' },
      { id: 'breach_procedure', label: 'Data Breach Procedure', type: 'textarea', defaultValue: 'Any suspected data breach must be reported to the DPO immediately. The DPO will assess the breach and, if required, notify the ICO within 72 hours.' },
      { id: 'review_date', label: 'Review Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Approved By', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# DATA PROTECTION POLICY

**{{org_name}}**

---

## Introduction

{{org_name}} is committed to processing personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

## Data Protection Principles

We adhere to the following principles. Personal data must be:
1. Processed lawfully, fairly, and transparently
2. Collected for specified, explicit, and legitimate purposes
3. Adequate, relevant, and limited to what is necessary
4. Accurate and kept up to date
5. Retained only as long as necessary
6. Processed securely

## Data Protection Officer

**{{dpo_name}}**
Email: {{dpo_email}}

## Data Systems

{{data_systems}}

## Individual Rights

We will respond to requests from individuals exercising their rights under UK GDPR within one calendar month. Rights include: access, rectification, erasure, restriction, portability, and objection.

## Data Breach Procedure

{{breach_procedure}}

## Staff Responsibilities

All staff who handle personal data must: complete data protection training, follow this policy, report breaches immediately, and not share personal data without authorisation.

## Review

This policy will be reviewed annually or following any significant change.

**Next review date:** {{review_date}}`,
  },

  {
    id: 'policy-acceptable-use',
    builderId: 'policy',
    name: 'Acceptable Use Policy',
    description: 'IT and internet acceptable use policy for staff',
    category: 'HR Policies',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'it_contact', label: 'IT Contact / Helpdesk', type: 'text', required: true },
      { id: 'monitoring_statement', label: 'Monitoring Statement', type: 'textarea', defaultValue: 'The organisation reserves the right to monitor use of its IT systems and internet access for security and compliance purposes. Users should have no expectation of privacy when using organisation systems.' },
      { id: 'prohibited_activities', label: 'Prohibited Activities', type: 'textarea', defaultValue: 'Accessing illegal content, downloading unlicensed software, sharing confidential data without authorisation, using systems for personal commercial gain, sending offensive or harassing communications.' },
      { id: 'review_date', label: 'Review Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Approved By', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# ACCEPTABLE USE POLICY

**{{org_name}}**

---

## Purpose

This policy sets out the acceptable use of {{org_name}}'s IT systems, including computers, mobile devices, email, internet access, and cloud services.

## Scope

This policy applies to all employees, contractors, volunteers, and anyone else who uses {{org_name}}'s IT systems.

## Acceptable Use

IT systems are provided for business purposes. Limited personal use is permitted provided it does not interfere with work, consume excessive resources, or breach this policy.

## Prohibited Activities

The following are strictly prohibited:

{{prohibited_activities}}

## Monitoring

{{monitoring_statement}}

## Security

Users must:
- Use strong, unique passwords and not share them
- Lock their screen when leaving their workstation
- Not install unauthorised software
- Report security incidents immediately to {{it_contact}}
- Not connect personal devices to the network without authorisation

## Social Media

Staff must not post content that could damage the organisation's reputation or disclose confidential information.

## Consequences

Breach of this policy may result in disciplinary action, up to and including dismissal.

## Contact

IT queries: {{it_contact}}

**Review date:** {{review_date}}`,
  },

  {
    id: 'policy-terms-of-service',
    builderId: 'policy',
    name: 'Terms of Service',
    description: 'Website or app terms of service / terms and conditions',
    category: 'Website Policies',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name', label: 'Company / Organisation Name', type: 'text', required: true },
      { id: 'website_url', label: 'Website / App URL', type: 'text', required: true },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'service_description', label: 'Description of Service', type: 'textarea', required: true },
      { id: 'user_obligations', label: 'User Obligations', type: 'textarea', defaultValue: 'Users must provide accurate information, not misuse the service, not attempt to gain unauthorised access, and comply with all applicable laws.' },
      { id: 'payment_terms', label: 'Payment Terms (if applicable)', type: 'textarea', placeholder: 'Leave blank if free service' },
      { id: 'last_updated', label: 'Last Updated', type: 'date', required: true },
    ],
    bodyTemplate: `# TERMS OF SERVICE

**{{org_name}}** | {{website_url}}

**Last updated:** {{last_updated}}

---

## 1. Acceptance of Terms

By accessing or using {{website_url}}, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.

## 2. Our Service

{{service_description}}

## 3. User Obligations

{{user_obligations}}

## 4. Account Registration

If you create an account, you are responsible for maintaining the security of your account and for all activities that occur under your account.

## 5. Payment

{{payment_terms}}

## 6. Intellectual Property

All content on {{website_url}}, including text, graphics, logos, and software, is the property of {{org_name}} and is protected by copyright law.

## 7. Limitation of Liability

To the maximum extent permitted by law, {{org_name}} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.

## 8. Termination

We reserve the right to suspend or terminate your access to the service at any time for breach of these Terms.

## 9. Changes to Terms

We may update these Terms from time to time. Continued use of the service after changes constitutes acceptance of the new Terms.

## 10. Governing Law

These Terms are governed by the laws of England and Wales.

## 11. Contact

{{contact_email}}`,
  },

  // ── Remote Working Policy ─────────────────────────────────────────────────
  {
    id: 'policy-remote-working',
    builderId: 'policy',
    name: 'Remote Working Policy',
    description: 'Policy governing home and remote working arrangements',
    category: 'Remote Working',
    industries: ['HR', 'Business', 'IT', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'eligibility',       label: 'Eligibility Criteria',       type: 'textarea', defaultValue: 'Remote working is available to employees whose role is suitable for home working, subject to manager approval.' },
      { id: 'approval_process',  label: 'Approval Process',           type: 'textarea', defaultValue: 'Requests must be submitted in writing to the line manager and approved by HR.' },
      { id: 'working_hours',     label: 'Expected Working Hours',     type: 'textarea', defaultValue: 'Employees are expected to maintain their contracted hours and be contactable during core hours (10am–4pm).' },
      { id: 'equipment',         label: 'Equipment & Technology',     type: 'textarea', defaultValue: 'The organisation will provide a laptop and necessary software. Employees are responsible for a suitable workspace and internet connection.' },
      { id: 'data_security',     label: 'Data Security Requirements', type: 'textarea', defaultValue: 'Employees must follow the organisation\'s data protection policy, use a secure Wi-Fi connection, and lock screens when not in use.' },
      { id: 'health_safety',     label: 'Health & Safety',            type: 'textarea', defaultValue: 'Employees must complete a home workstation self-assessment and report any concerns to their manager.' },
      { id: 'expenses',          label: 'Expenses',                   type: 'textarea', defaultValue: 'Reasonable pre-approved expenses for home working (e.g. broadband contribution) may be reimbursed in line with the expenses policy.' },
      { id: 'review',            label: 'Policy Review',              type: 'text',     defaultValue: 'This policy will be reviewed annually.' },
      { id: 'contact_hr',        label: 'HR Contact',                 type: 'email' },
    ],
    bodyTemplate: `# Remote Working Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Purpose

This policy sets out {{org_name}}'s approach to remote and home working, ensuring that employees can work effectively while maintaining productivity, security, and wellbeing.

## 2. Eligibility

{{eligibility}}

## 3. Approval Process

{{approval_process}}

## 4. Working Hours & Availability

{{working_hours}}

## 5. Equipment & Technology

{{equipment}}

## 6. Data Security

{{data_security}}

## 7. Health & Safety

{{health_safety}}

## 8. Expenses

{{expenses}}

## 9. Review

{{review}}

**Contact:** {{contact_hr}}`,
  },

  // ── Social Media Policy ───────────────────────────────────────────────────
  {
    id: 'policy-social-media',
    builderId: 'policy',
    name: 'Social Media Policy',
    description: 'Policy governing employee and organisational use of social media',
    category: 'Social Media',
    industries: ['HR', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'scope',             label: 'Scope',                      type: 'textarea', defaultValue: 'This policy applies to all employees, contractors, and volunteers who use social media in a personal or professional capacity in a way that could be associated with the organisation.' },
      { id: 'official_accounts', label: 'Official Accounts',          type: 'textarea', defaultValue: 'Only authorised staff may post on behalf of the organisation\'s official social media accounts.' },
      { id: 'personal_use',      label: 'Personal Use Guidelines',    type: 'textarea', defaultValue: 'Employees must not post content that could bring the organisation into disrepute, disclose confidential information, or harass colleagues or clients.' },
      { id: 'confidentiality',   label: 'Confidentiality',            type: 'textarea', defaultValue: 'Do not share confidential business information, client details, or internal matters on any social media platform.' },
      { id: 'breaches',          label: 'Breaches & Consequences',    type: 'textarea', defaultValue: 'Breaches of this policy may result in disciplinary action, up to and including dismissal.' },
      { id: 'contact_hr',        label: 'HR / Policy Contact',        type: 'email' },
    ],
    bodyTemplate: `# Social Media Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Scope

{{scope}}

## 2. Official Social Media Accounts

{{official_accounts}}

## 3. Personal Use of Social Media

{{personal_use}}

## 4. Confidentiality

{{confidentiality}}

## 5. Breaches

{{breaches}}

## 6. Contact

For questions about this policy, contact: {{contact_hr}}`,
  },

  // ── Whistleblowing Policy ─────────────────────────────────────────────────
  {
    id: 'policy-whistleblowing',
    builderId: 'policy',
    name: 'Whistleblowing Policy',
    description: 'Policy for reporting wrongdoing or malpractice (Public Interest Disclosure)',
    category: 'Whistleblowing',
    industries: ['HR', 'Business', 'Charity', 'Healthcare', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'scope',             label: 'Scope',                      type: 'textarea', defaultValue: 'This policy applies to all employees, contractors, trustees, and volunteers.' },
      { id: 'what_to_report',    label: 'What Can Be Reported',       type: 'textarea', defaultValue: 'Concerns may include: criminal activity, failure to comply with legal obligations, health and safety risks, financial irregularities, or cover-ups of any of the above.' },
      { id: 'how_to_report',     label: 'How to Raise a Concern',     type: 'textarea', defaultValue: 'Concerns should be raised with your line manager, HR, or the designated whistleblowing officer. Reports can be made verbally or in writing.' },
      { id: 'whistleblowing_officer', label: 'Whistleblowing Officer', type: 'text' },
      { id: 'confidentiality',   label: 'Confidentiality',            type: 'textarea', defaultValue: 'All disclosures will be treated in confidence. The identity of the person raising a concern will be protected wherever possible.' },
      { id: 'protection',        label: 'Protection from Retaliation',type: 'textarea', defaultValue: 'The organisation will not tolerate any retaliation against individuals who raise concerns in good faith. Any such behaviour will be treated as a disciplinary matter.' },
      { id: 'external_bodies',   label: 'External Reporting Bodies',  type: 'textarea', defaultValue: 'If internal channels are not appropriate, concerns may be reported to relevant external bodies such as the Health and Safety Executive, the Charity Commission, or the Financial Conduct Authority.' },
    ],
    bodyTemplate: `# Whistleblowing Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Introduction

{{org_name}} is committed to the highest standards of openness, integrity, and accountability. This policy encourages and enables employees and others to raise concerns about malpractice.

## 2. Scope

{{scope}}

## 3. What Can Be Reported

{{what_to_report}}

## 4. How to Raise a Concern

{{how_to_report}}

**Whistleblowing Officer:** {{whistleblowing_officer}}

## 5. Confidentiality

{{confidentiality}}

## 6. Protection from Retaliation

{{protection}}

## 7. External Reporting

{{external_bodies}}

## 8. Governing Law

This policy is made in accordance with the Public Interest Disclosure Act 1998.`,
  },

  // ── Finance Policy ────────────────────────────────────────────────────────
  {
    id: 'policy-expenses',
    builderId: 'policy',
    name: 'Expenses Policy',
    description: 'Policy governing employee expense claims and reimbursement',
    category: 'Finance',
    industries: ['Finance', 'Business', 'HR', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'eligible_expenses', label: 'Eligible Expenses',          type: 'textarea', defaultValue: 'Travel (economy class / standard rail), accommodation (up to £150/night), meals (up to £30/day), business entertainment (pre-approved only).' },
      { id: 'ineligible',        label: 'Ineligible Expenses',        type: 'textarea', defaultValue: 'Personal items, alcohol (unless pre-approved entertainment), fines, first-class travel without prior approval.' },
      { id: 'approval',          label: 'Approval Process',           type: 'textarea', defaultValue: 'All expenses must be pre-approved by the line manager. Claims must be submitted within 30 days of the expense being incurred.' },
      { id: 'receipts',          label: 'Receipt Requirements',       type: 'textarea', defaultValue: 'Original receipts or digital copies must be provided for all claims over £10.' },
      { id: 'payment',           label: 'Payment Process',            type: 'textarea', defaultValue: 'Approved claims will be reimbursed via payroll within 30 days of submission.' },
      { id: 'contact_finance',   label: 'Finance Contact',            type: 'email' },
    ],
    bodyTemplate: `# Expenses Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Purpose

This policy sets out the rules for claiming reimbursement of expenses incurred in the course of employment.

## 2. Eligible Expenses

{{eligible_expenses}}

## 3. Ineligible Expenses

{{ineligible}}

## 4. Approval Process

{{approval}}

## 5. Receipts

{{receipts}}

## 6. Payment

{{payment}}

## 7. Contact

Finance queries: {{contact_finance}}`,
  },

  // ── HR Policies ───────────────────────────────────────────────────────────
  {
    id: 'policy-equal-opportunities',
    builderId: 'policy',
    name: 'Equal Opportunities Policy',
    description: 'Policy promoting equality, diversity, and inclusion in the workplace',
    category: 'HR Policies',
    industries: ['HR', 'Business', 'Charity', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'commitment',        label: 'Commitment Statement',       type: 'textarea', defaultValue: '{{org_name}} is committed to promoting equality of opportunity for all employees and job applicants. We aim to create a working environment free from discrimination, harassment, and victimisation.' },
      { id: 'protected_chars',   label: 'Protected Characteristics',  type: 'textarea', defaultValue: 'We will not discriminate on the grounds of age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, or sexual orientation.' },
      { id: 'responsibilities',  label: 'Responsibilities',           type: 'textarea', defaultValue: 'All managers are responsible for implementing this policy. All employees are responsible for treating colleagues with dignity and respect.' },
      { id: 'breaches',          label: 'Breaches',                   type: 'textarea', defaultValue: 'Any breach of this policy will be treated as a disciplinary matter.' },
      { id: 'contact_hr',        label: 'HR Contact',                 type: 'email' },
    ],
    bodyTemplate: `# Equal Opportunities Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Commitment

{{commitment}}

## 2. Protected Characteristics

{{protected_chars}}

## 3. Responsibilities

{{responsibilities}}

## 4. Breaches

{{breaches}}

## 5. Legal Framework

This policy is made in accordance with the Equality Act 2010.

## 6. Contact

{{contact_hr}}`,
  },

  // ── Health & Safety ───────────────────────────────────────────────────────
  {
    id: 'policy-lone-working',
    builderId: 'policy',
    name: 'Lone Working Policy',
    description: 'Policy for managing the safety of employees working alone',
    category: 'Health & Safety',
    industries: ['HR', 'Business', 'Healthcare', 'Construction', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#16a34a',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'effective_date',    label: 'Effective Date',             type: 'date',     required: true },
      { id: 'scope',             label: 'Scope / Who This Applies To',type: 'textarea', defaultValue: 'This policy applies to all employees and contractors who work alone, whether at the organisation\'s premises, at client sites, or in the community.' },
      { id: 'risk_assessment',   label: 'Risk Assessment Requirements',type: 'textarea', defaultValue: 'A risk assessment must be completed before any lone working activity. Risks must be reviewed regularly and after any incident.' },
      { id: 'check_in',          label: 'Check-in Procedures',        type: 'textarea', defaultValue: 'Lone workers must check in with their manager at the start and end of each lone working period. Agreed check-in intervals must be maintained.' },
      { id: 'emergency',         label: 'Emergency Procedures',       type: 'textarea', defaultValue: 'Lone workers must carry a charged mobile phone at all times. Emergency contact details must be provided before each lone working session.' },
      { id: 'prohibited',        label: 'Prohibited Activities',      type: 'textarea', defaultValue: 'Certain high-risk activities must not be carried out alone. These will be identified in the relevant risk assessment.' },
      { id: 'contact_hs',        label: 'H&S Contact',                type: 'email' },
    ],
    bodyTemplate: `# Lone Working Policy

**Organisation:** {{org_name}}
**Effective Date:** {{effective_date}}

---

## 1. Scope

{{scope}}

## 2. Risk Assessment

{{risk_assessment}}

## 3. Check-in Procedures

{{check_in}}

## 4. Emergency Procedures

{{emergency}}

## 5. Prohibited Activities

{{prohibited}}

## 6. Legal Framework

This policy is made in accordance with the Health and Safety at Work Act 1974 and the Management of Health and Safety at Work Regulations 1999.

## 7. Contact

{{contact_hs}}`,
  },
];
