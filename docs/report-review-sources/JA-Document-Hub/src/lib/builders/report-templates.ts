import type { BuilderTemplate } from '@/lib/builder-framework';

export const REPORT_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'report-incident',
    builderId: 'report',
    name: 'Incident Report',
    description: 'Formal incident investigation and findings report',
    category: 'Incident',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'report_title', label: 'Report Title', type: 'text', required: true },
      { id: 'incident_date', label: 'Date of Incident', type: 'date', required: true },
      { id: 'report_date', label: 'Date of Report', type: 'date', required: true },
      { id: 'prepared_by', label: 'Prepared By', type: 'text', required: true },
      { id: 'incident_description', label: 'Incident Description', type: 'textarea', required: true },
      { id: 'immediate_causes', label: 'Immediate Causes', type: 'textarea', placeholder: 'What directly caused the incident?' },
      { id: 'root_causes', label: 'Root Causes', type: 'textarea', placeholder: 'Underlying factors that contributed' },
      { id: 'findings', label: 'Key Findings', type: 'textarea', required: true },
      { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
      { id: 'action_plan', label: 'Action Plan', type: 'textarea', placeholder: 'Specific actions, owners, and deadlines' },
      { id: 'signatory_name', label: 'Report Author', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# INCIDENT REPORT

**{{org_name}}**

**Report Title:** {{report_title}}
**Date of Incident:** {{incident_date}}
**Date of Report:** {{report_date}}
**Prepared By:** {{prepared_by}}

---

## 1. Executive Summary

This report documents the incident that occurred on {{incident_date}} and sets out the findings, causes, and recommended actions.

## 2. Incident Description

{{incident_description}}

## 3. Immediate Causes

{{immediate_causes}}

## 4. Root Causes

{{root_causes}}

## 5. Key Findings

{{findings}}

## 6. Recommendations

{{recommendations}}

## 7. Action Plan

{{action_plan}}

## 8. Conclusion

This report has been prepared to ensure that lessons are learned and appropriate actions are taken to prevent recurrence. All recommended actions should be implemented and reviewed within the agreed timescales.`,
  },

  {
    id: 'report-monthly',
    builderId: 'report',
    name: 'Monthly Progress Report',
    description: 'Monthly operational or project progress report',
    category: 'Monthly & Quarterly',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Organisation / Project Name', type: 'text', required: true },
      { id: 'report_period', label: 'Report Period', type: 'text', placeholder: 'e.g. May 2026', required: true },
      { id: 'prepared_by', label: 'Prepared By', type: 'text', required: true },
      { id: 'report_date', label: 'Report Date', type: 'date', required: true },
      { id: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      { id: 'achievements', label: 'Key Achievements This Period', type: 'textarea', required: true },
      { id: 'challenges', label: 'Challenges and Issues', type: 'textarea' },
      { id: 'kpis', label: 'Key Performance Indicators', type: 'textarea', placeholder: 'List KPIs and current performance' },
      { id: 'financial_summary', label: 'Financial Summary', type: 'textarea', placeholder: 'Budget vs actual, key variances' },
      { id: 'next_period_plans', label: 'Plans for Next Period', type: 'textarea', required: true },
      { id: 'risks', label: 'Risks and Mitigations', type: 'textarea' },
    ],
    bodyTemplate: `# MONTHLY PROGRESS REPORT

**{{org_name}}**

**Period:** {{report_period}} | **Date:** {{report_date}} | **Prepared by:** {{prepared_by}}

---

## 1. Executive Summary

{{executive_summary}}

## 2. Key Achievements

{{achievements}}

## 3. Key Performance Indicators

{{kpis}}

## 4. Financial Summary

{{financial_summary}}

## 5. Challenges and Issues

{{challenges}}

## 6. Risks and Mitigations

{{risks}}

## 7. Plans for Next Period

{{next_period_plans}}

---

*Report prepared by {{prepared_by}} on {{report_date}}*`,
  },

  {
    id: 'report-audit',
    builderId: 'report',
    name: 'Audit Report',
    description: 'Internal or external audit findings report',
    category: 'Audit & Inspection',
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'audit_type', label: 'Audit Type', type: 'select', options: ['Internal Audit', 'External Audit', 'Compliance Audit', 'Financial Audit', 'IT Audit', 'Quality Audit'], defaultValue: 'Internal Audit' },
      { id: 'audit_scope', label: 'Audit Scope', type: 'textarea', required: true },
      { id: 'audit_period', label: 'Audit Period', type: 'text', required: true },
      { id: 'auditor_name', label: 'Auditor Name', type: 'text', required: true },
      { id: 'report_date', label: 'Report Date', type: 'date', required: true },
      { id: 'methodology', label: 'Methodology', type: 'textarea', defaultValue: 'Document review, staff interviews, process observation, and sample testing.' },
      { id: 'key_findings', label: 'Key Findings', type: 'textarea', required: true },
      { id: 'high_risks', label: 'High Risk Issues', type: 'textarea' },
      { id: 'medium_risks', label: 'Medium Risk Issues', type: 'textarea' },
      { id: 'low_risks', label: 'Low Risk Issues', type: 'textarea' },
      { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
      { id: 'management_response', label: 'Management Response', type: 'textarea' },
      { id: 'signatory_name', label: 'Auditor Signature', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# AUDIT REPORT

**{{org_name}}**

**Audit Type:** {{audit_type}}
**Audit Period:** {{audit_period}}
**Report Date:** {{report_date}}
**Auditor:** {{auditor_name}}

---

## 1. Scope and Objectives

{{audit_scope}}

## 2. Methodology

{{methodology}}

## 3. Key Findings

{{key_findings}}

## 4. Risk Summary

### High Risk Issues
{{high_risks}}

### Medium Risk Issues
{{medium_risks}}

### Low Risk Issues
{{low_risks}}

## 5. Recommendations

{{recommendations}}

## 6. Management Response

{{management_response}}

## 7. Conclusion

This audit was conducted in accordance with applicable standards. The findings and recommendations in this report should be addressed within the agreed timescales. A follow-up review will be conducted to verify implementation.`,
  },

  {
    id: 'report-risk-assessment',
    builderId: 'report',
    name: 'Risk Assessment',
    description: 'Workplace or activity risk assessment report',
    category: 'Risk Assessment',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'activity_location', label: 'Activity / Location', type: 'text', required: true },
      { id: 'assessment_date', label: 'Assessment Date', type: 'date', required: true },
      { id: 'review_date', label: 'Review Date', type: 'date', required: true },
      { id: 'assessed_by', label: 'Assessed By', type: 'text', required: true },
      { id: 'persons_at_risk', label: 'Persons at Risk', type: 'textarea', defaultValue: 'Employees, contractors, visitors, members of the public' },
      { id: 'hazard_1', label: 'Hazard 1', type: 'text', placeholder: 'e.g. Slips and trips' },
      { id: 'control_1', label: 'Control Measures for Hazard 1', type: 'textarea' },
      { id: 'hazard_2', label: 'Hazard 2', type: 'text' },
      { id: 'control_2', label: 'Control Measures for Hazard 2', type: 'textarea' },
      { id: 'hazard_3', label: 'Hazard 3', type: 'text' },
      { id: 'control_3', label: 'Control Measures for Hazard 3', type: 'textarea' },
      { id: 'residual_risk', label: 'Overall Residual Risk Level', type: 'select', options: ['Low', 'Medium', 'High'], defaultValue: 'Low' },
      { id: 'signatory_name', label: 'Assessor Signature', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# RISK ASSESSMENT

**{{org_name}}**

**Activity / Location:** {{activity_location}}
**Assessment Date:** {{assessment_date}}
**Review Date:** {{review_date}}
**Assessed By:** {{assessed_by}}

---

## Persons at Risk

{{persons_at_risk}}

---

## Hazards and Control Measures

### Hazard 1: {{hazard_1}}

**Control Measures:**
{{control_1}}

---

### Hazard 2: {{hazard_2}}

**Control Measures:**
{{control_2}}

---

### Hazard 3: {{hazard_3}}

**Control Measures:**
{{control_3}}

---

## Risk Rating Matrix

| Rating | Likelihood | Severity | Action Required |
|--------|-----------|----------|-----------------|
| Low    | Unlikely  | Minor    | Monitor         |
| Medium | Possible  | Moderate | Review controls |
| High   | Likely    | Serious  | Immediate action|

**Overall Residual Risk Level: {{residual_risk}}**

---

## Declaration

I confirm that this risk assessment has been carried out and that the control measures identified are in place or will be implemented.`,
  },

  {
    id: 'report-client',
    builderId: 'report',
    name: 'Client Report',
    description: 'Professional client-facing project or service report',
    category: 'Client Report',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Your Organisation Name', type: 'text', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'report_title', label: 'Report Title', type: 'text', required: true },
      { id: 'report_period', label: 'Report Period', type: 'text', required: true },
      { id: 'prepared_by', label: 'Prepared By', type: 'text', required: true },
      { id: 'report_date', label: 'Report Date', type: 'date', required: true },
      { id: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      { id: 'work_completed', label: 'Work Completed This Period', type: 'textarea', required: true },
      { id: 'results_outcomes', label: 'Results and Outcomes', type: 'textarea', required: true },
      { id: 'next_steps', label: 'Next Steps', type: 'textarea', required: true },
      { id: 'contact_details', label: 'Your Contact Details', type: 'textarea' },
    ],
    bodyTemplate: `# CLIENT REPORT

**Prepared by:** {{org_name}}
**For:** {{client_name}}
**Report:** {{report_title}}
**Period:** {{report_period}}
**Date:** {{report_date}}

---

## Executive Summary

{{executive_summary}}

## Work Completed This Period

{{work_completed}}

## Results and Outcomes

{{results_outcomes}}

## Next Steps

{{next_steps}}

---

*Prepared by {{prepared_by}} | {{contact_details}}*`,
  },

  {
    id: 'report-inspection',
    builderId: 'report',
    name: 'Inspection Report',
    description: 'Property, equipment, or premises inspection report',
    category: 'Audit & Inspection',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name', label: 'Organisation / Inspector Name', type: 'text', required: true },
      { id: 'inspection_type', label: 'Inspection Type', type: 'text', placeholder: 'e.g. Property Inspection, Equipment Check', required: true },
      { id: 'property_address', label: 'Property / Location', type: 'textarea', required: true },
      { id: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
      { id: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
      { id: 'overall_condition', label: 'Overall Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Requires immediate attention'], defaultValue: 'Good' },
      { id: 'findings', label: 'Detailed Findings', type: 'textarea', required: true },
      { id: 'defects', label: 'Defects / Issues Found', type: 'textarea' },
      { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
      { id: 'next_inspection', label: 'Next Inspection Due', type: 'date' },
      { id: 'signatory_name', label: 'Inspector Signature', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# INSPECTION REPORT

**{{org_name}}**

**Inspection Type:** {{inspection_type}}
**Location:** {{property_address}}
**Date:** {{inspection_date}}
**Inspector:** {{inspector_name}}

---

## Overall Condition: {{overall_condition}}

---

## Detailed Findings

{{findings}}

## Defects and Issues

{{defects}}

## Recommendations

{{recommendations}}

---

**Next Inspection Due:** {{next_inspection}}`,
  },

  // ── Finance Report ────────────────────────────────────────────────────────
  {
    id: 'report-finance',
    builderId: 'report',
    name: 'Financial Summary Report',
    description: 'Monthly or quarterly financial summary for management or trustees',
    category: 'Finance Report',
    industries: ['Finance', 'Business', 'Charity', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'report_period',     label: 'Reporting Period',           type: 'text',     required: true, placeholder: 'e.g. April 2026' },
      { id: 'report_date',       label: 'Report Date',                type: 'date',     required: true },
      { id: 'prepared_by',       label: 'Prepared By',                type: 'text',     required: true },
      { id: 'income_summary',    label: 'Income Summary',             type: 'textarea', required: true },
      { id: 'expenditure_summary', label: 'Expenditure Summary',      type: 'textarea', required: true },
      { id: 'net_position',      label: 'Net Position / Surplus / Deficit', type: 'text', required: true },
      { id: 'cash_position',     label: 'Cash / Bank Position',       type: 'text' },
      { id: 'budget_variance',   label: 'Budget Variance Notes',      type: 'textarea' },
      { id: 'forecast',          label: 'Forecast / Outlook',         type: 'textarea' },
      { id: 'risks',             label: 'Financial Risks',            type: 'textarea' },
      { id: 'recommendations',   label: 'Recommendations',            type: 'textarea' },
    ],
    bodyTemplate: `# Financial Summary Report

**Organisation:** {{org_name}}
**Period:** {{report_period}}
**Date:** {{report_date}}
**Prepared By:** {{prepared_by}}

---

## Income

{{income_summary}}

---

## Expenditure

{{expenditure_summary}}

---

## Net Position

**{{net_position}}**

**Cash / Bank Position:** {{cash_position}}

---

## Budget Variance

{{budget_variance}}

---

## Forecast & Outlook

{{forecast}}

---

## Financial Risks

{{risks}}

---

## Recommendations

{{recommendations}}`,
  },

  // ── Compliance Report ─────────────────────────────────────────────────────
  {
    id: 'report-compliance',
    builderId: 'report',
    name: 'Compliance Report',
    description: 'Report on regulatory or policy compliance status',
    category: 'Compliance Report',
    industries: ['Business', 'Healthcare', 'Finance', 'Charity', 'General'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'report_title',      label: 'Report Title',               type: 'text',     required: true },
      { id: 'report_date',       label: 'Report Date',                type: 'date',     required: true },
      { id: 'prepared_by',       label: 'Prepared By',                type: 'text',     required: true },
      { id: 'scope',             label: 'Scope of Review',            type: 'textarea', required: true },
      { id: 'regulations',       label: 'Regulations / Standards Reviewed', type: 'textarea', required: true },
      { id: 'compliant_areas',   label: 'Areas of Compliance',        type: 'textarea', required: true },
      { id: 'non_compliant',     label: 'Areas of Non-Compliance',    type: 'textarea' },
      { id: 'action_plan',       label: 'Action Plan',                type: 'textarea' },
      { id: 'next_review',       label: 'Next Review Date',           type: 'date' },
    ],
    bodyTemplate: `# Compliance Report

**Organisation:** {{org_name}}
**Report:** {{report_title}}
**Date:** {{report_date}}
**Prepared By:** {{prepared_by}}

---

## Scope

{{scope}}

## Regulations / Standards Reviewed

{{regulations}}

---

## Areas of Compliance

{{compliant_areas}}

---

## Areas of Non-Compliance

{{non_compliant}}

---

## Action Plan

{{action_plan}}

---

**Next Review Date:** {{next_review}}`,
  },

  // ── Board Report ──────────────────────────────────────────────────────────
  {
    id: 'report-board',
    builderId: 'report',
    name: 'Board Report',
    description: 'Executive summary report for board or trustee meetings',
    category: 'Board Report',
    industries: ['Business', 'Charity', 'Finance', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'report_date',       label: 'Report Date',                type: 'date',     required: true },
      { id: 'meeting_date',      label: 'Board Meeting Date',         type: 'date' },
      { id: 'prepared_by',       label: 'Prepared By',                type: 'text',     required: true },
      { id: 'executive_summary', label: 'Executive Summary',          type: 'textarea', required: true },
      { id: 'operational_update',label: 'Operational Update',         type: 'textarea', required: true },
      { id: 'financial_summary', label: 'Financial Summary',          type: 'textarea', required: true },
      { id: 'risks',             label: 'Key Risks',                  type: 'textarea' },
      { id: 'strategic_items',   label: 'Strategic Items for Discussion', type: 'textarea' },
      { id: 'decisions_required',label: 'Decisions Required',         type: 'textarea' },
      { id: 'next_steps',        label: 'Next Steps / Actions',       type: 'textarea' },
    ],
    bodyTemplate: `# Board Report

**Organisation:** {{org_name}}
**Report Date:** {{report_date}}
**Board Meeting:** {{meeting_date}}
**Prepared By:** {{prepared_by}}

---

## Executive Summary

{{executive_summary}}

---

## Operational Update

{{operational_update}}

---

## Financial Summary

{{financial_summary}}

---

## Key Risks

{{risks}}

---

## Strategic Items for Discussion

{{strategic_items}}

---

## Decisions Required

{{decisions_required}}

---

## Next Steps & Actions

{{next_steps}}`,
  },

  // ── Project Update ────────────────────────────────────────────────────────
  {
    id: 'report-project-update',
    builderId: 'report',
    name: 'Project Status Update',
    description: 'Regular project status and progress report for stakeholders',
    category: 'Project Update',
    industries: ['Business', 'IT', 'Construction', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#ea580c',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'project_name',      label: 'Project Name',               type: 'text',     required: true },
      { id: 'report_date',       label: 'Report Date',                type: 'date',     required: true },
      { id: 'project_manager',   label: 'Project Manager',            type: 'text',     required: true },
      { id: 'overall_status',    label: 'Overall Status',             type: 'select',   options: ['On Track', 'At Risk', 'Delayed', 'Completed'] },
      { id: 'progress_summary',  label: 'Progress Summary',           type: 'textarea', required: true },
      { id: 'completed_this_period', label: 'Completed This Period',  type: 'textarea' },
      { id: 'planned_next_period',   label: 'Planned Next Period',    type: 'textarea' },
      { id: 'risks_issues',      label: 'Risks & Issues',             type: 'textarea' },
      { id: 'budget_status',     label: 'Budget Status',              type: 'textarea' },
      { id: 'decisions_needed',  label: 'Decisions / Escalations',    type: 'textarea' },
    ],
    bodyTemplate: `# Project Status Update

**Organisation:** {{org_name}}
**Project:** {{project_name}}
**Date:** {{report_date}}
**Project Manager:** {{project_manager}}
**Overall Status:** {{overall_status}}

---

## Progress Summary

{{progress_summary}}

---

## Completed This Period

{{completed_this_period}}

---

## Planned Next Period

{{planned_next_period}}

---

## Risks & Issues

{{risks_issues}}

---

## Budget Status

{{budget_status}}

---

## Decisions / Escalations Required

{{decisions_needed}}`,
  },
];
