import type { BuilderTemplate } from '@/lib/builder-framework';

export const CONTRACT_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'contract-service-agreement',
    builderId: 'contract',
    name: 'Service Agreement',
    description: 'General services agreement between a provider and client',
    category: 'Service Agreement',
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    showDocHeader: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'provider_name', label: 'Service Provider Name', type: 'text', placeholder: 'Your business name', required: true },
      { id: 'provider_address', label: 'Provider Address', type: 'textarea', placeholder: 'Full address', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Client or company name', required: true },
      { id: 'client_address', label: 'Client Address', type: 'textarea', placeholder: 'Full address', required: true },
      { id: 'services_description', label: 'Services Description', type: 'textarea', placeholder: 'Describe the services to be provided in detail', required: true },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'end_date', label: 'End Date / Duration', type: 'text', placeholder: 'e.g. 31 December 2026 or ongoing' },
      { id: 'fee_amount', label: 'Fee / Rate', type: 'text', placeholder: 'e.g. £1,500 per month or £75 per hour', required: true },
      { id: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. 30 days from invoice date' },
      { id: 'notice_period', label: 'Notice Period', type: 'text', placeholder: 'e.g. 30 days written notice', defaultValue: '30 days written notice' },
      { id: 'governing_law', label: 'Governing Law', type: 'text', placeholder: 'e.g. England and Wales', defaultValue: 'England and Wales' },
      { id: 'additional_terms', label: 'Additional Terms', type: 'textarea', placeholder: 'Any additional terms or special conditions' },
      { id: 'signatory_name', label: 'Provider Signatory Name', type: 'text', placeholder: 'Name of person signing' },
      { id: 'signatory_title', label: 'Provider Signatory Title', type: 'text', placeholder: 'e.g. Director' },
      { id: 'signatory_date', label: 'Date of Signing', type: 'date' },
    ],
    bodyTemplate: `## SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{start_date}} between:

**{{provider_name}}** of {{provider_address}} ("Service Provider")

and

**{{client_name}}** of {{client_address}} ("Client")

---

## 1. Services

The Service Provider agrees to provide the following services to the Client:

{{services_description}}

## 2. Term

This Agreement shall commence on {{start_date}} and shall continue until {{end_date}}, unless terminated earlier in accordance with this Agreement.

## 3. Fees and Payment

The Client agrees to pay the Service Provider {{fee_amount}}.

Payment terms: {{payment_terms}}.

Invoices shall be paid within the agreed payment terms. Late payments may attract interest at 8% above the Bank of England base rate under the Late Payment of Commercial Debts (Interest) Act 1998.

## 4. Confidentiality

Each party agrees to keep confidential all information received from the other party that is marked as confidential or that would reasonably be understood to be confidential, and shall not disclose such information to any third party without prior written consent.

## 5. Intellectual Property

All intellectual property created by the Service Provider in the course of providing the Services shall remain the property of the Service Provider unless otherwise agreed in writing.

## 6. Limitation of Liability

The Service Provider's total liability under this Agreement shall not exceed the total fees paid by the Client in the three months preceding the claim.

## 7. Termination

Either party may terminate this Agreement by giving {{notice_period}} written notice to the other party. Either party may terminate immediately in the event of a material breach by the other party.

## 8. Governing Law

This Agreement shall be governed by and construed in accordance with the laws of {{governing_law}}.

{{additional_terms}}

---

This Agreement constitutes the entire agreement between the parties with respect to its subject matter.`,
  },

  {
    id: 'contract-contractor-agreement',
    builderId: 'contract',
    name: 'Contractor Agreement',
    description: 'Independent contractor / freelancer agreement',
    category: 'Contractor',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'company_name', label: 'Company / Client Name', type: 'text', required: true },
      { id: 'company_address', label: 'Company Address', type: 'textarea', required: true },
      { id: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
      { id: 'contractor_address', label: 'Contractor Address', type: 'textarea', required: true },
      { id: 'project_description', label: 'Project / Work Description', type: 'textarea', required: true },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'end_date', label: 'End Date', type: 'text', placeholder: 'e.g. 31 December 2026 or project completion' },
      { id: 'day_rate', label: 'Day Rate / Fee', type: 'text', placeholder: 'e.g. £450 per day', required: true },
      { id: 'payment_schedule', label: 'Payment Schedule', type: 'text', placeholder: 'e.g. Monthly on invoice', defaultValue: 'Monthly on invoice' },
      { id: 'ir35_status', label: 'IR35 Status', type: 'select', options: ['Outside IR35', 'Inside IR35', 'To be determined'], defaultValue: 'Outside IR35' },
      { id: 'notice_period', label: 'Notice Period', type: 'text', defaultValue: '14 days written notice' },
      { id: 'signatory_name', label: 'Authorised Signatory', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is made between **{{company_name}}** ("Company") of {{company_address}} and **{{contractor_name}}** ("Contractor") of {{contractor_address}}.

---

## 1. Engagement

The Company engages the Contractor as an independent contractor to perform the following work:

{{project_description}}

## 2. Term

The engagement commences on {{start_date}} and is expected to continue until {{end_date}}.

## 3. Fees

The Contractor will be paid {{day_rate}}. Payment schedule: {{payment_schedule}}.

## 4. Independent Contractor Status

The Contractor is an independent contractor and not an employee of the Company. The Contractor is responsible for their own tax, National Insurance, and any other statutory obligations. IR35 Status: **{{ir35_status}}**.

## 5. Confidentiality

The Contractor agrees to keep all Company information confidential during and after the engagement.

## 6. Intellectual Property

All work product created by the Contractor under this Agreement shall be the property of the Company upon full payment of fees.

## 7. Termination

Either party may terminate this Agreement by giving {{notice_period}} to the other party.

## 8. Governing Law

This Agreement is governed by the laws of England and Wales.`,
  },

  {
    id: 'contract-nda',
    builderId: 'contract',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Mutual or one-way confidentiality agreement',
    category: 'NDA',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'nda_type', label: 'NDA Type', type: 'select', options: ['Mutual (both parties)', 'One-way (disclosing party only)'], defaultValue: 'Mutual (both parties)' },
      { id: 'party_one_name', label: 'Party One Name', type: 'text', required: true },
      { id: 'party_one_address', label: 'Party One Address', type: 'textarea', required: true },
      { id: 'party_two_name', label: 'Party Two Name', type: 'text', required: true },
      { id: 'party_two_address', label: 'Party Two Address', type: 'textarea', required: true },
      { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the business purpose for sharing confidential information', required: true },
      { id: 'duration_years', label: 'Confidentiality Duration', type: 'text', placeholder: 'e.g. 2 years', defaultValue: '2 years' },
      { id: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Signatory (Party One)', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} between:

**{{party_one_name}}** of {{party_one_address}} ("Party One")

and

**{{party_two_name}}** of {{party_two_address}} ("Party Two")

NDA Type: **{{nda_type}}**

---

## 1. Purpose

The parties wish to explore a potential business relationship and may disclose confidential information to each other for the following purpose:

{{purpose}}

## 2. Definition of Confidential Information

"Confidential Information" means any information disclosed by either party to the other, either directly or indirectly, in writing, orally, or by inspection of tangible objects, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.

## 3. Obligations

Each receiving party agrees to: (a) hold the Confidential Information in strict confidence; (b) not disclose the Confidential Information to any third party without prior written consent; (c) use the Confidential Information only for the Purpose stated above; (d) protect the Confidential Information using at least the same degree of care used to protect its own confidential information.

## 4. Exclusions

Obligations do not apply to information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was rightfully known before disclosure; (c) is independently developed without use of Confidential Information; (d) is required to be disclosed by law or court order.

## 5. Duration

The obligations of confidentiality shall remain in effect for **{{duration_years}}** from the date of this Agreement.

## 6. Return of Information

Upon request, each party shall promptly return or destroy all Confidential Information received from the other party.

## 7. Governing Law

This Agreement shall be governed by the laws of England and Wales.`,
  },

  {
    id: 'contract-supplier-agreement',
    builderId: 'contract',
    name: 'Supplier Agreement',
    description: 'Terms and conditions for supplier relationships',
    category: 'Supplier',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'buyer_name', label: 'Buyer / Company Name', type: 'text', required: true },
      { id: 'buyer_address', label: 'Buyer Address', type: 'textarea', required: true },
      { id: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
      { id: 'supplier_address', label: 'Supplier Address', type: 'textarea', required: true },
      { id: 'goods_services', label: 'Goods / Services to be Supplied', type: 'textarea', required: true },
      { id: 'pricing_terms', label: 'Pricing and Payment Terms', type: 'textarea', required: true },
      { id: 'delivery_terms', label: 'Delivery Terms', type: 'textarea', placeholder: 'Lead times, delivery method, etc.' },
      { id: 'quality_standards', label: 'Quality Standards', type: 'textarea', placeholder: 'Any quality or compliance requirements' },
      { id: 'agreement_date', label: 'Agreement Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Authorised Signatory', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## SUPPLIER AGREEMENT

This Supplier Agreement is entered into as of {{agreement_date}} between:

**{{buyer_name}}** of {{buyer_address}} ("Buyer")

and

**{{supplier_name}}** of {{supplier_address}} ("Supplier")

---

## 1. Supply of Goods / Services

The Supplier agrees to supply the following to the Buyer:

{{goods_services}}

## 2. Pricing and Payment

{{pricing_terms}}

## 3. Delivery

{{delivery_terms}}

## 4. Quality and Standards

{{quality_standards}}

## 5. Warranties

The Supplier warrants that all goods and services supplied shall: (a) conform to any agreed specification; (b) be of satisfactory quality; (c) be fit for purpose; (d) comply with all applicable laws and regulations.

## 6. Liability

The Supplier shall indemnify the Buyer against any losses, damages, or costs arising from the Supplier's breach of this Agreement.

## 7. Termination

Either party may terminate this Agreement with 30 days written notice. Either party may terminate immediately in the event of material breach or insolvency.

## 8. Governing Law

This Agreement is governed by the laws of England and Wales.`,
  },

  {
    id: 'contract-partnership',
    builderId: 'contract',
    name: 'Partnership Agreement',
    description: 'Business partnership agreement between two or more parties',
    category: 'Partnership',
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'partnership_name', label: 'Partnership / Business Name', type: 'text', required: true },
      { id: 'partner_one_name', label: 'Partner One Name', type: 'text', required: true },
      { id: 'partner_one_share', label: 'Partner One Profit Share (%)', type: 'text', required: true },
      { id: 'partner_two_name', label: 'Partner Two Name', type: 'text', required: true },
      { id: 'partner_two_share', label: 'Partner Two Profit Share (%)', type: 'text', required: true },
      { id: 'business_purpose', label: 'Business Purpose', type: 'textarea', required: true },
      { id: 'capital_contribution', label: 'Capital Contributions', type: 'textarea', placeholder: 'Describe each partner\'s initial capital contribution' },
      { id: 'management_decisions', label: 'Management and Decision Making', type: 'textarea', placeholder: 'How will decisions be made?' },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Signatory (Partner One)', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## PARTNERSHIP AGREEMENT

This Partnership Agreement is entered into as of {{start_date}} between:

**{{partner_one_name}}** ("Partner One") and **{{partner_two_name}}** ("Partner Two")

collectively referred to as the "Partners".

---

## 1. Partnership Name and Purpose

The Partners agree to carry on business together under the name **{{partnership_name}}** for the following purpose:

{{business_purpose}}

## 2. Capital Contributions

{{capital_contribution}}

## 3. Profit and Loss Sharing

Profits and losses shall be shared as follows:
- **{{partner_one_name}}**: {{partner_one_share}}%
- **{{partner_two_name}}**: {{partner_two_share}}%

## 4. Management

{{management_decisions}}

## 5. Banking

The partnership shall maintain a bank account in the partnership name. Withdrawals shall require the signature of at least one Partner.

## 6. Accounts

The Partners shall maintain proper books of account and prepare annual accounts.

## 7. Dissolution

The partnership may be dissolved by mutual written agreement of all Partners, or by any Partner giving 90 days written notice to the other Partners.

## 8. Governing Law

This Agreement is governed by the laws of England and Wales and the Partnership Act 1890 (as amended).`,
  },

  {
    id: 'contract-client-agreement',
    builderId: 'contract',
    name: 'Client Agreement',
    description: 'Standard terms of engagement for client work',
    category: 'Client Agreement',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'provider_name', label: 'Provider / Firm Name', type: 'text', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'scope_of_work', label: 'Scope of Work', type: 'textarea', required: true },
      { id: 'fees', label: 'Fees', type: 'textarea', required: true },
      { id: 'timeline', label: 'Timeline / Milestones', type: 'textarea', placeholder: 'Key dates and deliverables' },
      { id: 'revisions_policy', label: 'Revisions Policy', type: 'text', placeholder: 'e.g. Up to 2 rounds of revisions included', defaultValue: 'Up to 2 rounds of revisions included' },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'signatory_name', label: 'Provider Signatory', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## CLIENT AGREEMENT

This Client Agreement is entered into between **{{provider_name}}** ("Provider") and **{{client_name}}** ("Client"), effective {{start_date}}.

---

## 1. Scope of Work

{{scope_of_work}}

## 2. Timeline and Deliverables

{{timeline}}

## 3. Fees and Payment

{{fees}}

## 4. Revisions

{{revisions_policy}}

## 5. Client Responsibilities

The Client agrees to: (a) provide timely feedback and approvals; (b) supply all necessary materials, content, and access; (c) make payments on time.

## 6. Intellectual Property

Upon receipt of full payment, all deliverables created specifically for the Client shall become the property of the Client. The Provider retains the right to display the work in their portfolio.

## 7. Confidentiality

Both parties agree to keep confidential any proprietary information shared during the engagement.

## 8. Termination

Either party may terminate this Agreement with 14 days written notice. The Client shall pay for all work completed to the date of termination.

## 9. Governing Law

This Agreement is governed by the laws of England and Wales.`,
  },

  {
    id: 'contract-freelance',
    builderId: 'contract',
    name: 'Freelance Agreement',
    description: 'Short-form freelance project agreement',
    category: 'Freelance',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'freelancer_name', label: 'Freelancer Name', type: 'text', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'project_name', label: 'Project Name', type: 'text', required: true },
      { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: true },
      { id: 'project_fee', label: 'Project Fee', type: 'text', required: true },
      { id: 'deposit_amount', label: 'Deposit (if any)', type: 'text', placeholder: 'e.g. 50% upfront' },
      { id: 'deadline', label: 'Deadline / Delivery Date', type: 'date' },
      { id: 'signatory_name', label: 'Freelancer Signature', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `## FREELANCE PROJECT AGREEMENT

**Freelancer:** {{freelancer_name}}
**Client:** {{client_name}}
**Project:** {{project_name}}

---

## 1. Deliverables

{{deliverables}}

## 2. Deadline

Delivery date: {{deadline}}

## 3. Payment

Project fee: **{{project_fee}}**
Deposit: {{deposit_amount}}

The balance is due upon delivery of the final files. Late payments attract interest at 8% above the Bank of England base rate.

## 4. Revisions

Minor revisions are included. Significant changes to scope will be quoted separately.

## 5. Intellectual Property

All rights transfer to the Client upon receipt of full payment.

## 6. Governing Law

England and Wales.`,
  },

  // ── Subcontractor ─────────────────────────────────────────────────────────
  {
    id: 'contract-subcontractor',
    builderId: 'contract',
    name: 'Subcontractor Agreement',
    description: 'Agreement between a contractor and subcontractor for specific works',
    category: 'Subcontractor',
    industries: ['Construction', 'Business', 'IT'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    showDocHeader: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'contractor_name',   label: 'Main Contractor Name',       type: 'text',     required: true },
      { id: 'contractor_address',label: 'Contractor Address',         type: 'textarea', required: true },
      { id: 'sub_name',          label: 'Subcontractor Name',         type: 'text',     required: true },
      { id: 'sub_address',       label: 'Subcontractor Address',      type: 'textarea', required: true },
      { id: 'works_description', label: 'Description of Works',       type: 'textarea', required: true },
      { id: 'project_address',   label: 'Project / Site Address',     type: 'textarea' },
      { id: 'start_date',        label: 'Start Date',                 type: 'date',     required: true },
      { id: 'completion_date',   label: 'Completion Date',            type: 'date' },
      { id: 'contract_sum',      label: 'Contract Sum (£)',           type: 'text',     required: true },
      { id: 'payment_terms',     label: 'Payment Terms',              type: 'textarea', defaultValue: 'Payment within 30 days of invoice, subject to satisfactory completion of works.' },
      { id: 'insurance',         label: 'Insurance Requirements',     type: 'textarea', defaultValue: 'The Subcontractor must hold valid public liability insurance of at least £2,000,000.' },
    ],
    bodyTemplate: `# SUBCONTRACTOR AGREEMENT

**Main Contractor:** {{contractor_name}}, {{contractor_address}}
**Subcontractor:** {{sub_name}}, {{sub_address}}

**Date:** {{start_date}}

---

## 1. Works

The Subcontractor agrees to carry out the following works at {{project_address}}:

{{works_description}}

## 2. Programme

**Start Date:** {{start_date}}
**Completion Date:** {{completion_date}}

## 3. Contract Sum

The agreed contract sum is **£{{contract_sum}}** (exclusive of VAT where applicable).

## 4. Payment Terms

{{payment_terms}}

## 5. Insurance

{{insurance}}

## 6. Health & Safety

The Subcontractor must comply with all applicable health and safety legislation and the Main Contractor's site rules.

## 7. Governing Law

England and Wales.

---

**Signed for and on behalf of {{contractor_name}}:**

Signature: _________________________ Date: _____________

**Signed for and on behalf of {{sub_name}}:**

Signature: _________________________ Date: _____________`,
  },

  // ── Consultancy ───────────────────────────────────────────────────────────
  {
    id: 'contract-consultancy',
    builderId: 'contract',
    name: 'Consultancy Agreement',
    description: 'Agreement for consultancy or advisory services',
    category: 'Consultancy',
    industries: ['Business', 'IT', 'Finance', 'Legal'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    showDocHeader: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea', required: true },
      { id: 'consultant_name',   label: 'Consultant Name',            type: 'text',     required: true },
      { id: 'consultant_address',label: 'Consultant Address',         type: 'textarea', required: true },
      { id: 'services',          label: 'Consultancy Services',       type: 'textarea', required: true },
      { id: 'start_date',        label: 'Start Date',                 type: 'date',     required: true },
      { id: 'end_date',          label: 'End Date / Duration',        type: 'text' },
      { id: 'fee',               label: 'Fee (£)',                    type: 'text',     required: true },
      { id: 'fee_basis',         label: 'Fee Basis',                  type: 'select',   options: ['Per day', 'Per hour', 'Fixed project fee', 'Monthly retainer'] },
      { id: 'expenses',          label: 'Expenses Policy',            type: 'textarea', defaultValue: 'Reasonable pre-approved expenses will be reimbursed.' },
      { id: 'confidentiality',   label: 'Confidentiality',            type: 'textarea', defaultValue: 'The Consultant agrees to keep all client information strictly confidential.' },
    ],
    bodyTemplate: `# CONSULTANCY AGREEMENT

**Client:** {{client_name}}, {{client_address}}
**Consultant:** {{consultant_name}}, {{consultant_address}}

**Date:** {{start_date}}

---

## 1. Services

The Consultant agrees to provide the following services:

{{services}}

## 2. Term

**Start Date:** {{start_date}}
**Duration / End Date:** {{end_date}}

## 3. Fees

**Fee:** £{{fee}} ({{fee_basis}})

## 4. Expenses

{{expenses}}

## 5. Confidentiality

{{confidentiality}}

## 6. Independent Contractor

The Consultant is an independent contractor and not an employee of the Client. The Consultant is responsible for their own tax and National Insurance contributions.

## 7. Governing Law

England and Wales.

---

**Signed for and on behalf of {{client_name}}:**

Signature: _________________________ Date: _____________

**Signed by {{consultant_name}}:**

Signature: _________________________ Date: _____________`,
  },

  // ── Website & Digital ─────────────────────────────────────────────────────
  {
    id: 'contract-website-project',
    builderId: 'contract',
    name: 'Website / Digital Project Agreement',
    description: 'Agreement for website design, development, or digital projects',
    category: 'Website & Digital',
    industries: ['IT', 'Business', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    showDocHeader: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'agency_name',       label: 'Agency / Developer Name',    type: 'text',     required: true },
      { id: 'agency_address',    label: 'Agency Address',             type: 'textarea', required: true },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea', required: true },
      { id: 'project_name',      label: 'Project Name',               type: 'text',     required: true },
      { id: 'scope',             label: 'Project Scope',              type: 'textarea', required: true },
      { id: 'deliverables',      label: 'Deliverables',               type: 'textarea', required: true },
      { id: 'timeline',          label: 'Timeline / Milestones',      type: 'textarea' },
      { id: 'project_fee',       label: 'Project Fee (£)',            type: 'text',     required: true },
      { id: 'payment_schedule',  label: 'Payment Schedule',           type: 'textarea', defaultValue: '50% deposit on signing; 50% on completion.' },
      { id: 'revisions',         label: 'Revision Policy',            type: 'textarea', defaultValue: 'Up to 3 rounds of revisions are included. Additional revisions charged at £[rate]/hour.' },
      { id: 'ip_ownership',      label: 'IP / Ownership',             type: 'textarea', defaultValue: 'All intellectual property transfers to the Client upon receipt of full payment.' },
    ],
    bodyTemplate: `# WEBSITE / DIGITAL PROJECT AGREEMENT

**Agency / Developer:** {{agency_name}}, {{agency_address}}
**Client:** {{client_name}}, {{client_address}}

**Project:** {{project_name}}

---

## 1. Scope of Work

{{scope}}

## 2. Deliverables

{{deliverables}}

## 3. Timeline

{{timeline}}

## 4. Fees

**Project Fee:** £{{project_fee}}

**Payment Schedule:**
{{payment_schedule}}

## 5. Revisions

{{revisions}}

## 6. Intellectual Property

{{ip_ownership}}

## 7. Governing Law

England and Wales.

---

**Signed for and on behalf of {{agency_name}}:**

Signature: _________________________ Date: _____________

**Signed for and on behalf of {{client_name}}:**

Signature: _________________________ Date: _____________`,
  },

  // ── Tenancy-Style ─────────────────────────────────────────────────────────
  {
    id: 'contract-tenancy-licence',
    builderId: 'contract',
    name: 'Licence to Occupy',
    description: 'Licence agreement for temporary occupation of premises',
    category: 'Tenancy-Style',
    industries: ['Property', 'Business'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    showDocHeader: true,
    accentColor: '#dc2626',
    fields: [
      { id: 'licensor_name',     label: 'Licensor Name',              type: 'text',     required: true },
      { id: 'licensor_address',  label: 'Licensor Address',           type: 'textarea' },
      { id: 'licensee_name',     label: 'Licensee Name',              type: 'text',     required: true },
      { id: 'licensee_address',  label: 'Licensee Address',           type: 'textarea' },
      { id: 'premises',          label: 'Premises Description',       type: 'textarea', required: true },
      { id: 'start_date',        label: 'Start Date',                 type: 'date',     required: true },
      { id: 'end_date',          label: 'End Date',                   type: 'date' },
      { id: 'licence_fee',       label: 'Licence Fee (£/month)',      type: 'text',     required: true },
      { id: 'permitted_use',     label: 'Permitted Use',              type: 'textarea', required: true },
      { id: 'notice_period',     label: 'Notice Period',              type: 'text',     defaultValue: '1 month' },
    ],
    bodyTemplate: `# LICENCE TO OCCUPY

**Licensor:** {{licensor_name}}, {{licensor_address}}
**Licensee:** {{licensee_name}}, {{licensee_address}}

---

## 1. Premises

{{premises}}

## 2. Term

**Start Date:** {{start_date}}
**End Date:** {{end_date}}

## 3. Licence Fee

£{{licence_fee}} per month, payable in advance.

## 4. Permitted Use

{{permitted_use}}

## 5. Termination

Either party may terminate this licence by giving {{notice_period}} written notice.

## 6. Nature of Agreement

This agreement creates a licence only and does not create a tenancy or any other interest in land.

## 7. Governing Law

England and Wales.

---

**Signed by {{licensor_name}}:**

Signature: _________________________ Date: _____________

**Signed by {{licensee_name}}:**

Signature: _________________________ Date: _____________`,
  },
];
