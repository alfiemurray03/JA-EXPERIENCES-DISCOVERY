import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'real-estate', icon: 'Building', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const propertyViewingRequest = mk('property-viewing-request', 'Property Viewing Request', 'A letter requesting a property viewing.', ['property', 'viewing', 'request', 'real estate'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'applicantName', label: 'Your Name', type: 'text', required: true },
    { id: 'agentName', label: 'Agent / Landlord Name', type: 'text', required: false },
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'preferredDates', label: 'Preferred Viewing Dates / Times', type: 'textarea', required: false },
    { id: 'contactPhone', label: 'Your Phone', type: 'text', required: false },
    { id: 'contactEmail', label: 'Your Email', type: 'text', required: false },
    { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.agentName,'[Agent/Landlord]')}</strong>,</p>`,
    `<p>I am writing to request a viewing of the property at <strong>${or(d.propertyAddress,'[Address]')}</strong>.</p>`,
    d.preferredDates ? `<p>I am available on the following dates and times: ${nl2br(d.preferredDates)}</p>` : '',
    `<p>Please contact me${d.contactPhone ? ` on <strong>${d.contactPhone}</strong>` : ''}${d.contactEmail ? ` or by email at <strong>${d.contactEmail}</strong>` : ''} to confirm a suitable time.</p>`,
    d.notes ? `<p>${nl2br(d.notes)}</p>` : '',
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.applicantName,'[Applicant]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const tenancyRenewalLetter = mk('tenancy-renewal-letter', 'Tenancy Renewal Letter', 'A letter to a tenant offering or requesting a tenancy renewal.', ['tenancy', 'renewal', 'letter', 'landlord'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'landlordName', label: 'Landlord / Agent Name', type: 'text', required: true },
    { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: false },
    { id: 'currentEndDate', label: 'Current Tenancy End Date', type: 'date', required: false },
    { id: 'newStartDate', label: 'Proposed New Start Date', type: 'date', required: false },
    { id: 'newEndDate', label: 'Proposed New End Date', type: 'date', required: false },
    { id: 'newRent', label: 'New Monthly Rent', type: 'text', required: false },
    { id: 'responseDeadline', label: 'Response Deadline', type: 'date', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
    { id: 'contactPhone', label: 'Contact Phone', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>Dear <strong>${or(d.tenantName,'[Tenant]')}</strong>,</p>`,
    `<p>I am writing regarding the tenancy of <strong>${or(d.propertyAddress,'[Property]')}</strong>, which is due to expire on <strong>${fmtDate(d.currentEndDate)}</strong>.</p>`,
    `<p>We would like to offer you a renewal of your tenancy on the following terms:</p>`,
    section('Renewal Terms', infoTable([['New Start Date', fmtDate(d.newStartDate)],['New End Date', fmtDate(d.newEndDate)],['Monthly Rent', d.newRent]])),
    `<p>Please confirm whether you wish to accept this renewal by <strong>${fmtDate(d.responseDeadline,'[deadline]')}</strong>.</p>`,
    `<p>If you have any questions, please contact us${d.contactEmail ? ` at <strong>${d.contactEmail}</strong>` : ''}${d.contactPhone ? ` or on <strong>${d.contactPhone}</strong>` : ''}.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.landlordName,'[Landlord]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const rentIncreaseNotice = mk('rent-increase-notice', 'Rent Increase Notice', 'A formal notice to a tenant of a rent increase.', ['rent increase', 'notice', 'landlord', 'tenancy'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'landlordName', label: 'Landlord / Agent Name', type: 'text', required: true },
    { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: false },
    { id: 'date', label: 'Date of Notice', type: 'date', required: false },
    { id: 'currentRent', label: 'Current Monthly Rent', type: 'text', required: false },
    { id: 'newRent', label: 'New Monthly Rent', type: 'text', required: false },
    { id: 'effectiveDate', label: 'Effective Date of Increase', type: 'date', required: false },
    { id: 'noticePeriod', label: 'Notice Period Given', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.tenantName,'[Tenant]')}</strong>,</p>`,
    `<p>I am writing to give you formal notice of a rent increase for the property at <strong>${or(d.propertyAddress,'[Property]')}</strong>.</p>`,
    section('Rent Increase Details', infoTable([['Current Rent', d.currentRent],['New Rent', d.newRent],['Effective Date', fmtDate(d.effectiveDate)],['Notice Period', d.noticePeriod]])),
    `<p>If you have any questions, please contact us${d.contactEmail ? ` at <strong>${d.contactEmail}</strong>` : ''}.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.landlordName,'[Landlord]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const propertyInspectionReport = mk('property-inspection-report', 'Property Inspection Report', 'A property inspection report for landlords or letting agents.', ['property', 'inspection', 'report', 'landlord'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
    { id: 'inspectionDate', label: 'Inspection Date', type: 'date', required: false },
    { id: 'inspector', label: 'Inspector Name', type: 'text', required: false },
    { id: 'tenantName', label: 'Tenant Name', type: 'text', required: false },
    { id: 'overallCondition', label: 'Overall Condition', type: 'select', required: false, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
    { id: 'exterior', label: 'Exterior Condition', type: 'textarea', required: false },
    { id: 'interior', label: 'Interior Condition', type: 'textarea', required: false },
    { id: 'kitchen', label: 'Kitchen', type: 'textarea', required: false },
    { id: 'bathroom', label: 'Bathroom(s)', type: 'textarea', required: false },
    { id: 'garden', label: 'Garden / Outdoor Space', type: 'textarea', required: false },
    { id: 'maintenanceRequired', label: 'Maintenance Required', type: 'textarea', required: false },
    { id: 'nextInspection', label: 'Next Inspection Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Property Inspection Report', infoTable([['Property', or(d.propertyAddress,'[Property]')],['Date', fmtDate(d.inspectionDate)],['Inspector', d.inspector],['Tenant', d.tenantName],['Overall Condition', d.overallCondition],['Next Inspection', fmtDate(d.nextInspection)]])),
    d.exterior ? section('Exterior', `<p>${nl2br(d.exterior)}</p>`) : '',
    d.interior ? section('Interior', `<p>${nl2br(d.interior)}</p>`) : '',
    d.kitchen ? section('Kitchen', `<p>${nl2br(d.kitchen)}</p>`) : '',
    d.bathroom ? section('Bathroom(s)', `<p>${nl2br(d.bathroom)}</p>`) : '',
    d.garden ? section('Garden / Outdoor Space', `<p>${nl2br(d.garden)}</p>`) : '',
    d.maintenanceRequired ? section('Maintenance Required', `<p>${nl2br(d.maintenanceRequired)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const maintenanceRequestLetter = mk('maintenance-request-letter', 'Maintenance Request Letter', 'A letter from a tenant requesting repairs or maintenance.', ['maintenance', 'repair', 'tenant', 'letter'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: false },
    { id: 'landlordName', label: 'Landlord / Agent Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'issueDescription', label: 'Description of Issue(s)', type: 'textarea', required: true },
    { id: 'urgency', label: 'Urgency', type: 'select', required: false, options: ['Emergency', 'Urgent', 'Routine'] },
    { id: 'contactPhone', label: 'Contact Phone', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.landlordName,'[Landlord/Agent]')}</strong>,</p>`,
    `<p>I am writing to report the following maintenance issue(s) at <strong>${or(d.propertyAddress,'[Property]')}</strong>:</p>`,
    section('Issue Details', `<p>${nl2br(or(d.issueDescription,'[Issue Description]'))}</p>`),
    d.urgency ? `<p><strong>Urgency:</strong> ${d.urgency}</p>` : '',
    `<p>Please contact me to arrange access${d.contactPhone ? ` on <strong>${d.contactPhone}</strong>` : ''}${d.contactEmail ? ` or at <strong>${d.contactEmail}</strong>` : ''}.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.tenantName,'[Tenant]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const depositDisputeLetter = mk('deposit-dispute-letter', 'Deposit Dispute Letter', 'A letter disputing deductions from a tenancy deposit.', ['deposit', 'dispute', 'tenant', 'letter'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
    { id: 'landlordName', label: 'Landlord / Agent Name', type: 'text', required: false },
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'depositAmount', label: 'Original Deposit Amount', type: 'text', required: false },
    { id: 'deductionAmount', label: 'Amount Deducted', type: 'text', required: false },
    { id: 'disputedItems', label: 'Items Being Disputed', type: 'textarea', required: false },
    { id: 'evidence', label: 'Evidence Available', type: 'textarea', required: false },
    { id: 'amountClaimed', label: 'Amount Being Claimed Back', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.landlordName,'[Landlord/Agent]')}</strong>,</p>`,
    `<p>I am writing to formally dispute deductions made from my tenancy deposit for the property at <strong>${or(d.propertyAddress,'[Property]')}</strong>.</p>`,
    section('Deposit Details', infoTable([['Original Deposit', d.depositAmount],['Amount Deducted', d.deductionAmount],['Amount Claimed Back', d.amountClaimed]])),
    d.disputedItems ? section('Disputed Items', `<p>${nl2br(d.disputedItems)}</p>`) : '',
    d.evidence ? section('Evidence', `<p>${nl2br(d.evidence)}</p>`) : '',
    `<p>I request that the disputed amount be returned to me within 14 days. If this matter cannot be resolved, I will refer it to the relevant deposit protection scheme for adjudication.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.tenantName,'[Tenant]')}</strong>${d.contactEmail ? `<br>${d.contactEmail}` : ''}</p>`,
  ].filter(Boolean).join(''),
);

export const propertyManagementChecklist = mk('property-management-checklist', 'Property Management Checklist', 'A checklist for managing a rental property.', ['property management', 'checklist', 'landlord'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
    { id: 'landlordName', label: 'Landlord Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'preLetChecklist', label: 'Pre-Let Checklist', type: 'textarea', required: false },
    { id: 'duringTenancy', label: 'During Tenancy Tasks', type: 'textarea', required: false },
    { id: 'endOfTenancy', label: 'End of Tenancy Tasks', type: 'textarea', required: false },
    { id: 'annualTasks', label: 'Annual Tasks', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Property Management Checklist', infoTable([['Property', or(d.propertyAddress,'[Property]')],['Landlord', d.landlordName],['Date', fmtDate(d.date)]])),
    d.preLetChecklist ? section('Pre-Let Checklist', `<p>${nl2br(d.preLetChecklist)}</p>`) : '',
    d.duringTenancy ? section('During Tenancy', `<p>${nl2br(d.duringTenancy)}</p>`) : '',
    d.endOfTenancy ? section('End of Tenancy', `<p>${nl2br(d.endOfTenancy)}</p>`) : '',
    d.annualTasks ? section('Annual Tasks', `<p>${nl2br(d.annualTasks)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_REAL_ESTATE_TEMPLATES: DocumentTemplate[] = [
  propertyViewingRequest, tenancyRenewalLetter, rentIncreaseNotice,
  propertyInspectionReport, maintenanceRequestLetter, depositDisputeLetter,
  propertyManagementChecklist,
];
