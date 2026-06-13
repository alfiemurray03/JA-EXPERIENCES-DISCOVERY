import type { BuilderTemplate } from '@/lib/builder-framework';

export const PROPOSAL_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'proposal-business',
    builderId: 'proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal for new opportunities',
    category: 'Business Proposal',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Your Organisation Name', type: 'text', required: true },
      { id: 'client_name', label: 'Prospect / Client Name', type: 'text', required: true },
      { id: 'proposal_title', label: 'Proposal Title', type: 'text', required: true },
      { id: 'proposal_date', label: 'Proposal Date', type: 'date', required: true },
      { id: 'valid_until', label: 'Valid Until', type: 'date' },
      { id: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      { id: 'problem_statement', label: 'Problem / Opportunity', type: 'textarea', required: true },
      { id: 'proposed_solution', label: 'Proposed Solution', type: 'textarea', required: true },
      { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: true },
      { id: 'timeline', label: 'Timeline', type: 'textarea', placeholder: 'Key milestones and dates' },
      { id: 'investment', label: 'Investment / Pricing', type: 'textarea', required: true },
      { id: 'about_us', label: 'About Us', type: 'textarea', placeholder: 'Brief company overview and relevant experience' },
      { id: 'next_steps', label: 'Next Steps', type: 'textarea', required: true },
      { id: 'contact_name', label: 'Contact Name', type: 'text' },
      { id: 'contact_email', label: 'Contact Email', type: 'email' },
      { id: 'contact_phone', label: 'Contact Phone', type: 'phone' },
    ],
    bodyTemplate: `# BUSINESS PROPOSAL

**Prepared by:** {{org_name}}
**For:** {{client_name}}
**Proposal:** {{proposal_title}}
**Date:** {{proposal_date}}
**Valid Until:** {{valid_until}}

---

## Executive Summary

{{executive_summary}}

## The Challenge

{{problem_statement}}

## Our Proposed Solution

{{proposed_solution}}

## Deliverables

{{deliverables}}

## Timeline

{{timeline}}

## Investment

{{investment}}

## About {{org_name}}

{{about_us}}

## Next Steps

{{next_steps}}

---

*To proceed, please contact us at {{contact_email}} | {{contact_phone}}*

*Prepared by {{contact_name}}, {{org_name}}*`,
  },

  {
    id: 'proposal-service',
    builderId: 'proposal',
    name: 'Service Proposal',
    description: 'Proposal for a specific service or consultancy engagement',
    category: 'Service Proposal',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Provider Name', type: 'text', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'service_name', label: 'Service Name', type: 'text', required: true },
      { id: 'proposal_date', label: 'Date', type: 'date', required: true },
      { id: 'service_description', label: 'Service Description', type: 'textarea', required: true },
      { id: 'scope', label: 'Scope of Work', type: 'textarea', required: true },
      { id: 'methodology', label: 'Approach / Methodology', type: 'textarea' },
      { id: 'fees', label: 'Fees and Payment Terms', type: 'textarea', required: true },
      { id: 'timeline', label: 'Timeline', type: 'textarea' },
      { id: 'terms', label: 'Key Terms', type: 'textarea', defaultValue: 'This proposal is valid for 30 days. Work commences upon signed acceptance and receipt of deposit.' },
      { id: 'contact_email', label: 'Contact Email', type: 'email' },
    ],
    bodyTemplate: `# SERVICE PROPOSAL

**{{org_name}}** → **{{client_name}}**

**Service:** {{service_name}}
**Date:** {{proposal_date}}

---

## Service Overview

{{service_description}}

## Scope of Work

{{scope}}

## Our Approach

{{methodology}}

## Fees

{{fees}}

## Timeline

{{timeline}}

## Terms

{{terms}}

---

*Questions? Contact us at {{contact_email}}*`,
  },

  {
    id: 'proposal-grant',
    builderId: 'proposal',
    name: 'Grant Proposal',
    description: 'Funding application or grant proposal for charities and organisations',
    category: 'Grant Proposal',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Applying Organisation', type: 'text', required: true },
      { id: 'funder_name', label: 'Funder / Grant Body', type: 'text', required: true },
      { id: 'project_title', label: 'Project Title', type: 'text', required: true },
      { id: 'amount_requested', label: 'Amount Requested', type: 'text', required: true },
      { id: 'project_period', label: 'Project Period', type: 'text', required: true },
      { id: 'project_summary', label: 'Project Summary', type: 'textarea', required: true },
      { id: 'need_statement', label: 'Statement of Need', type: 'textarea', required: true },
      { id: 'objectives', label: 'Objectives and Outcomes', type: 'textarea', required: true },
      { id: 'activities', label: 'Activities and Methodology', type: 'textarea', required: true },
      { id: 'budget_breakdown', label: 'Budget Breakdown', type: 'textarea', required: true },
      { id: 'evaluation', label: 'Evaluation and Monitoring', type: 'textarea' },
      { id: 'sustainability', label: 'Sustainability', type: 'textarea', placeholder: 'How will the project continue after the grant period?' },
      { id: 'org_overview', label: 'About the Organisation', type: 'textarea', required: true },
      { id: 'contact_name', label: 'Contact Name', type: 'text' },
      { id: 'contact_email', label: 'Contact Email', type: 'email' },
    ],
    bodyTemplate: `# GRANT PROPOSAL

**Applying Organisation:** {{org_name}}
**Funder:** {{funder_name}}
**Project:** {{project_title}}
**Amount Requested:** {{amount_requested}}
**Project Period:** {{project_period}}

---

## Project Summary

{{project_summary}}

## Statement of Need

{{need_statement}}

## Objectives and Outcomes

{{objectives}}

## Activities and Methodology

{{activities}}

## Budget

{{budget_breakdown}}

## Evaluation and Monitoring

{{evaluation}}

## Sustainability

{{sustainability}}

## About {{org_name}}

{{org_overview}}

---

*Contact: {{contact_name}} | {{contact_email}}*`,
  },

  {
    id: 'proposal-sponsorship',
    builderId: 'proposal',
    name: 'Sponsorship Proposal',
    description: 'Sponsorship proposal for events, projects, or organisations',
    category: 'Sponsorship',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Your Organisation', type: 'text', required: true },
      { id: 'sponsor_name', label: 'Prospective Sponsor', type: 'text', required: true },
      { id: 'event_project', label: 'Event / Project Name', type: 'text', required: true },
      { id: 'event_date', label: 'Date / Period', type: 'text' },
      { id: 'audience', label: 'Audience / Reach', type: 'textarea', required: true },
      { id: 'sponsorship_packages', label: 'Sponsorship Packages', type: 'textarea', required: true },
      { id: 'benefits', label: 'Benefits to Sponsor', type: 'textarea', required: true },
      { id: 'about_us', label: 'About Us', type: 'textarea', required: true },
      { id: 'contact_name', label: 'Contact Name', type: 'text' },
      { id: 'contact_email', label: 'Contact Email', type: 'email' },
    ],
    bodyTemplate: `# SPONSORSHIP PROPOSAL

**{{org_name}}** invites **{{sponsor_name}}** to become a sponsor of **{{event_project}}**

**Date / Period:** {{event_date}}

---

## About {{org_name}}

{{about_us}}

## Our Audience

{{audience}}

## Sponsorship Packages

{{sponsorship_packages}}

## Benefits to You

{{benefits}}

## Next Steps

We would love to discuss this opportunity with you. Please contact us to arrange a conversation.

**{{contact_name}}** | {{contact_email}}`,
  },

  {
    id: 'proposal-tender',
    builderId: 'proposal',
    name: 'Tender Response',
    description: 'Response to a tender or request for proposal (RFP)',
    category: 'Tender Response',
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Tendering Organisation', type: 'text', required: true },
      { id: 'client_name', label: 'Contracting Authority', type: 'text', required: true },
      { id: 'tender_ref', label: 'Tender Reference', type: 'text', required: true },
      { id: 'tender_title', label: 'Tender Title', type: 'text', required: true },
      { id: 'submission_date', label: 'Submission Date', type: 'date', required: true },
      { id: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      { id: 'technical_approach', label: 'Technical Approach', type: 'textarea', required: true },
      { id: 'methodology', label: 'Methodology', type: 'textarea', required: true },
      { id: 'team_experience', label: 'Team and Experience', type: 'textarea', required: true },
      { id: 'pricing', label: 'Pricing Schedule', type: 'textarea', required: true },
      { id: 'added_value', label: 'Added Value', type: 'textarea' },
      { id: 'contact_name', label: 'Contact Name', type: 'text' },
      { id: 'contact_email', label: 'Contact Email', type: 'email' },
    ],
    bodyTemplate: `# TENDER RESPONSE

**Submitted by:** {{org_name}}
**To:** {{client_name}}
**Tender Reference:** {{tender_ref}}
**Tender Title:** {{tender_title}}
**Submission Date:** {{submission_date}}

---

## Executive Summary

{{executive_summary}}

## Technical Approach

{{technical_approach}}

## Methodology

{{methodology}}

## Our Team and Experience

{{team_experience}}

## Pricing

{{pricing}}

## Added Value

{{added_value}}

---

*Contact: {{contact_name}} | {{contact_email}}*`,
  },

  {
    id: 'proposal-project',
    builderId: 'proposal',
    name: 'Project Proposal',
    description: 'Internal or external project proposal document',
    category: 'Project Proposal',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'project_title', label: 'Project Title', type: 'text', required: true },
      { id: 'proposed_by', label: 'Proposed By', type: 'text', required: true },
      { id: 'proposal_date', label: 'Date', type: 'date', required: true },
      { id: 'project_background', label: 'Background and Rationale', type: 'textarea', required: true },
      { id: 'objectives', label: 'Objectives', type: 'textarea', required: true },
      { id: 'scope', label: 'Scope', type: 'textarea', required: true },
      { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: true },
      { id: 'timeline', label: 'Timeline', type: 'textarea', required: true },
      { id: 'budget', label: 'Budget', type: 'textarea', required: true },
      { id: 'risks', label: 'Risks', type: 'textarea' },
      { id: 'success_criteria', label: 'Success Criteria', type: 'textarea' },
    ],
    bodyTemplate: `# PROJECT PROPOSAL

**{{org_name}}**

**Project:** {{project_title}}
**Proposed By:** {{proposed_by}}
**Date:** {{proposal_date}}

---

## Background and Rationale

{{project_background}}

## Objectives

{{objectives}}

## Scope

{{scope}}

## Deliverables

{{deliverables}}

## Timeline

{{timeline}}

## Budget

{{budget}}

## Risks

{{risks}}

## Success Criteria

{{success_criteria}}`,
  },

  // ── Sales Proposal ────────────────────────────────────────────────────────
  {
    id: 'proposal-sales',
    builderId: 'proposal',
    name: 'Sales Proposal',
    description: 'Persuasive sales proposal for a product or service',
    category: 'Sales Proposal',
    industries: ['Business', 'Retail', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'org_address',       label: 'Your Address',               type: 'textarea' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_org',        label: 'Client Organisation',        type: 'text' },
      { id: 'proposal_date',     label: 'Proposal Date',              type: 'date',     required: true },
      { id: 'valid_until',       label: 'Valid Until',                type: 'date' },
      { id: 'executive_summary', label: 'Executive Summary',          type: 'textarea', required: true },
      { id: 'client_challenge',  label: 'Client Challenge / Need',    type: 'textarea', required: true },
      { id: 'proposed_solution', label: 'Proposed Solution',          type: 'textarea', required: true },
      { id: 'key_benefits',      label: 'Key Benefits',               type: 'textarea' },
      { id: 'pricing',           label: 'Pricing / Investment',       type: 'textarea', required: true },
      { id: 'timeline',          label: 'Proposed Timeline',          type: 'textarea' },
      { id: 'why_us',            label: 'Why Choose Us',              type: 'textarea' },
      { id: 'next_steps',        label: 'Next Steps',                 type: 'textarea', defaultValue: 'To proceed, please sign and return this proposal or contact us to discuss further.' },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
    ],
    bodyTemplate: `# Sales Proposal

**Prepared by:** {{org_name}}
{{org_address}}

**Prepared for:** {{client_name}}, {{client_org}}

**Date:** {{proposal_date}}
**Valid Until:** {{valid_until}}

---

## Executive Summary

{{executive_summary}}

---

## Understanding Your Challenge

{{client_challenge}}

---

## Our Proposed Solution

{{proposed_solution}}

---

## Key Benefits

{{key_benefits}}

---

## Investment

{{pricing}}

---

## Timeline

{{timeline}}

---

## Why Choose {{org_name}}

{{why_us}}

---

## Next Steps

{{next_steps}}

**Contact:** {{contact_name}} — {{contact_email}}`,
  },

  // ── Partnership Proposal ──────────────────────────────────────────────────
  {
    id: 'proposal-partnership',
    builderId: 'proposal',
    name: 'Partnership Proposal',
    description: 'Proposal for a strategic partnership or collaboration',
    category: 'Partnership Proposal',
    industries: ['Business', 'Charity', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name',          label: 'Your Organisation',          type: 'text',     required: true },
      { id: 'partner_name',      label: 'Proposed Partner',           type: 'text',     required: true },
      { id: 'proposal_date',     label: 'Proposal Date',              type: 'date',     required: true },
      { id: 'about_us',          label: 'About Your Organisation',    type: 'textarea', required: true },
      { id: 'partnership_vision',label: 'Partnership Vision',         type: 'textarea', required: true },
      { id: 'mutual_benefits',   label: 'Mutual Benefits',            type: 'textarea', required: true },
      { id: 'proposed_structure',label: 'Proposed Structure',         type: 'textarea' },
      { id: 'commitments',       label: 'Proposed Commitments',       type: 'textarea' },
      { id: 'next_steps',        label: 'Next Steps',                 type: 'textarea', defaultValue: 'We would welcome the opportunity to discuss this proposal further. Please contact us at your earliest convenience.' },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
    ],
    bodyTemplate: `# Partnership Proposal

**From:** {{org_name}}
**To:** {{partner_name}}
**Date:** {{proposal_date}}

---

## About {{org_name}}

{{about_us}}

---

## Our Vision for Partnership

{{partnership_vision}}

---

## Mutual Benefits

{{mutual_benefits}}

---

## Proposed Structure

{{proposed_structure}}

---

## Proposed Commitments

{{commitments}}

---

## Next Steps

{{next_steps}}

**Contact:** {{contact_name}} — {{contact_email}}`,
  },

  // ── Tender Response ───────────────────────────────────────────────────────
  {
    id: 'proposal-tender-full',
    builderId: 'proposal',
    name: 'Full Tender Response',
    description: 'Comprehensive tender response / bid document',
    category: 'Tender Response',
    industries: ['Business', 'Construction', 'IT', 'General'],
    popular: true,
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#be185d',
    fields: [
      { id: 'org_name',          label: 'Bidding Organisation',       type: 'text',     required: true },
      { id: 'org_address',       label: 'Organisation Address',       type: 'textarea' },
      { id: 'tender_ref',        label: 'Tender Reference',           type: 'text',     required: true },
      { id: 'tender_title',      label: 'Tender Title',               type: 'text',     required: true },
      { id: 'contracting_auth',  label: 'Contracting Authority',      type: 'text',     required: true },
      { id: 'submission_date',   label: 'Submission Date',            type: 'date',     required: true },
      { id: 'executive_summary', label: 'Executive Summary',          type: 'textarea', required: true },
      { id: 'understanding',     label: 'Understanding of Requirements', type: 'textarea', required: true },
      { id: 'methodology',       label: 'Methodology / Approach',     type: 'textarea', required: true },
      { id: 'team_experience',   label: 'Team & Experience',          type: 'textarea', required: true },
      { id: 'pricing',           label: 'Pricing / Commercial Offer', type: 'textarea', required: true },
      { id: 'added_value',       label: 'Added Value / Social Value', type: 'textarea' },
      { id: 'references',        label: 'References / Case Studies',  type: 'textarea' },
      { id: 'contact_name',      label: 'Contact Name',               type: 'text' },
      { id: 'contact_email',     label: 'Contact Email',              type: 'email' },
    ],
    bodyTemplate: `# Tender Response

**Tender Reference:** {{tender_ref}}
**Tender Title:** {{tender_title}}
**Contracting Authority:** {{contracting_auth}}
**Submitted By:** {{org_name}}, {{org_address}}
**Submission Date:** {{submission_date}}

---

## Executive Summary

{{executive_summary}}

---

## Understanding of Requirements

{{understanding}}

---

## Methodology & Approach

{{methodology}}

---

## Team & Experience

{{team_experience}}

---

## Pricing / Commercial Offer

{{pricing}}

---

## Added Value / Social Value

{{added_value}}

---

## References & Case Studies

{{references}}

---

**Contact:** {{contact_name}} — {{contact_email}}`,
  },
];
