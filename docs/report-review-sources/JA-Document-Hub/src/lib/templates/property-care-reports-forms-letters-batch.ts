/**
 * Property/Home + Care/Support + Reports + Forms + Letters batches
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br } from './html-helpers';
import { letterHeader, DISCLAIMER } from './template-factory';

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY / HOME
// ═══════════════════════════════════════════════════════════════════════════════

export const repairRequestLetter: DocumentTemplate = {
  id: 'repair-request-letter', name: 'Repair Request Letter', category: 'property',
  description: 'A letter requesting repairs to a rented or managed property.',
  icon: 'Wrench', planRequired: 'free', tags: ['repair', 'property', 'landlord', 'letter'],
  signatories: [{ label: 'Tenant / Resident' }],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'senderName', label: 'Your Name', type: 'text', required: true },
        { id: 'senderAddress', label: 'Property Address', type: 'textarea', required: false },
        { id: 'senderEmail', label: 'Your Email', type: 'email', required: false },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'recipientName', label: 'Landlord / Agent Name', type: 'text', required: true },
        { id: 'recipientAddress', label: 'Landlord / Agent Address', type: 'textarea', required: false },
        { id: 'repairDetails', label: 'Description of Repairs Required', type: 'textarea', required: true },
        { id: 'urgency', label: 'Urgency', type: 'select', required: false, options: ['Urgent — health/safety risk', 'High — significant inconvenience', 'Routine — when convenient'] },
        { id: 'responseDeadline', label: 'Response Requested By', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    letterHeader(data),
    section('Repair Request',
      `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>
      <p>I am writing to formally request repairs to the above property. The following issues require attention:</p>
      <p>${nl2br(or(data.repairDetails, '[Repair details]'))}</p>
      ${data.urgency ? `<p><strong>Urgency: ${data.urgency}</strong></p>` : ''}
      ${data.responseDeadline ? `<p>I would be grateful for a response by <strong>${data.responseDeadline}</strong>.</p>` : ''}
      <p>Please confirm receipt of this letter and advise when the repairs will be carried out.</p>
      <p>Yours faithfully,<br><strong>${or(data.senderName, '[Your Name]')}</strong></p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

export const inspectionChecklist: DocumentTemplate = {
  id: 'inspection-checklist', name: 'Property Inspection Checklist', category: 'property',
  description: 'A checklist for inspecting a property — for landlords, tenants, or agents.',
  icon: 'ClipboardCheck', planRequired: 'free', tags: ['inspection', 'property', 'checklist', 'landlord'],
  signatories: [{ label: 'Inspector' }, { label: 'Tenant / Occupant' }],
  sections: [
    {
      id: 'details', title: 'Inspection Details',
      fields: [
        { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
        { id: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true },
        { id: 'inspector', label: 'Inspector Name', type: 'text', required: false },
        { id: 'tenantName', label: 'Tenant Name', type: 'text', required: false },
        { id: 'customItems', label: 'Additional Items to Check (one per line)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const standardItems = [
      ['Entrance / Hallway', 'Condition of walls, floor, lighting'],
      ['Living Room', 'Walls, floor, windows, fixtures'],
      ['Kitchen', 'Appliances, surfaces, plumbing, ventilation'],
      ['Bathroom', 'Plumbing, tiles, ventilation, fixtures'],
      ['Bedroom(s)', 'Walls, floor, windows, storage'],
      ['Exterior', 'Roof, gutters, windows, doors'],
      ['Garden / Outdoor', 'Condition, maintenance'],
      ['Utilities', 'Gas, electricity, water meters'],
      ['Safety', 'Smoke alarms, CO detectors, fire extinguisher'],
      ['Meter Readings', 'Gas, electricity, water'],
    ];
    const customItems = (data.customItems || '').split('\n').filter(Boolean).map(item => [item, '']);
    const allItems = [...standardItems, ...customItems];
    return [
      section('Inspection Details', infoTable([
        ['Property', or(data.propertyAddress, '[Address]')],
        ['Date', or(data.inspectionDate, '[Date]')],
        ['Inspector', data.inspector],
        ['Tenant', data.tenantName],
      ])),
      section('Inspection Checklist',
        `<table class="pdf-table"><thead><tr><th>Area / Item</th><th>Notes</th><th>Condition</th></tr></thead><tbody>${allItems.map(([area, notes]) =>
          `<tr><td><strong>${area}</strong>${notes ? `<br><span style="font-size:8.5pt;color:#6b7280;">${notes}</span>` : ''}</td><td></td><td></td></tr>`
        ).join('')}</tbody></table>`
      ),
    ].join('');
  },
};

export const inventoryChecklist: DocumentTemplate = {
  id: 'inventory-checklist', name: 'Inventory Checklist', category: 'property',
  description: 'A property inventory listing contents, condition, and meter readings.',
  icon: 'List', planRequired: 'free', tags: ['inventory', 'property', 'tenancy', 'checklist'],
  signatories: [{ label: 'Landlord / Agent' }, { label: 'Tenant' }],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
        { id: 'inventoryDate', label: 'Inventory Date', type: 'date', required: true },
        { id: 'tenantName', label: 'Tenant Name', type: 'text', required: false },
        { id: 'items', label: 'Inventory Items (Room | Item | Quantity | Condition)', type: 'textarea', required: true, placeholder: 'Living Room | Sofa | 1 | Good\nKitchen | Fridge-freezer | 1 | Good\nBedroom | Double bed frame | 1 | Good' },
        { id: 'meterReadings', label: 'Meter Readings', type: 'textarea', required: false, placeholder: 'Gas: 12345\nElectricity: 67890\nWater: 11111' },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.items || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    return [
      section('Inventory Details', infoTable([
        ['Property', or(data.propertyAddress, '[Address]')],
        ['Date', or(data.inventoryDate, '[Date]')],
        ['Tenant', data.tenantName],
      ])),
      section('Inventory', dataTable(['Room', 'Item', 'Qty', 'Condition'], rows)),
      data.meterReadings ? section('Meter Readings', `<p>${nl2br(data.meterReadings)}</p>`) : '',
      data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

export const maintenanceLog: DocumentTemplate = {
  id: 'maintenance-log', name: 'Maintenance Log', category: 'property',
  description: 'A log of maintenance and repair work carried out on a property.',
  icon: 'Wrench', planRequired: 'free', tags: ['maintenance', 'log', 'property', 'repairs'],
  sections: [
    {
      id: 'details', title: 'Log Details',
      fields: [
        { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
        { id: 'logDate', label: 'Log Date', type: 'date', required: true },
        { id: 'entries', label: 'Maintenance Entries (Date | Description | Contractor | Cost | Status)', type: 'textarea', required: true, placeholder: '01 Jun 2026 | Boiler service | ABC Heating | £120 | Complete\n05 Jun 2026 | Roof tile repair | XYZ Builders | £250 | Complete' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.entries || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || ''];
    });
    return [
      section('Log Details', infoTable([
        ['Property', or(data.propertyAddress, '[Address]')],
        ['Date', or(data.logDate, '[Date]')],
      ])),
      section('Maintenance Log', dataTable(['Date', 'Description', 'Contractor', 'Cost', 'Status'], rows)),
    ].join('');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARE / SUPPORT ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const careSupportPlan: DocumentTemplate = {
  id: 'care-support-plan', name: 'Care Support Plan', category: 'care',
  description: 'A personalised care and support plan for an individual receiving care or support services.',
  icon: 'Heart', planRequired: 'free', tags: ['care', 'support plan', 'social care'],
  sections: [
    {
      id: 'details', title: 'Plan Details',
      fields: [
        { id: 'personName', label: 'Person\'s Full Name', type: 'text', required: true },
        { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
        { id: 'address', label: 'Address', type: 'textarea', required: false },
        { id: 'planDate', label: 'Plan Date', type: 'date', required: true },
        { id: 'reviewDate', label: 'Review Date', type: 'date', required: false },
        { id: 'keyWorker', label: 'Key Worker / Care Coordinator', type: 'text', required: false },
        { id: 'goals', label: 'Goals and Aspirations', type: 'textarea', required: false },
        { id: 'needs', label: 'Support Needs', type: 'textarea', required: true },
        { id: 'supportProvided', label: 'Support to be Provided', type: 'textarea', required: true },
        { id: 'emergencyContacts', label: 'Emergency Contacts', type: 'textarea', required: false },
        { id: 'medicalInfo', label: 'Medical Information / Conditions', type: 'textarea', required: false },
        { id: 'preferences', label: 'Personal Preferences & Wishes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Plan Details', infoTable([
      ['Person', or(data.personName, '[Name]')],
      ['Date of Birth', data.dob],
      ['Address', data.address],
      ['Plan Date', or(data.planDate, '[Date]')],
      ['Review Date', data.reviewDate],
      ['Key Worker', data.keyWorker],
    ])),
    data.goals ? section('Goals and Aspirations', `<p>${nl2br(data.goals)}</p>`) : '',
    section('Support Needs', `<p>${nl2br(or(data.needs, '[Support needs]'))}</p>`),
    section('Support to be Provided', `<p>${nl2br(or(data.supportProvided, '[Support provided]'))}</p>`),
    data.medicalInfo ? section('Medical Information', `<p>${nl2br(data.medicalInfo)}</p>`) : '',
    data.preferences ? section('Personal Preferences & Wishes', `<p>${nl2br(data.preferences)}</p>`) : '',
    data.emergencyContacts ? section('Emergency Contacts', `<p>${nl2br(data.emergencyContacts)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

export const emergencyContactSheet: DocumentTemplate = {
  id: 'emergency-contact-sheet', name: 'Emergency Contact Sheet', category: 'care',
  description: 'An emergency contact information sheet for an individual.',
  icon: 'Phone', planRequired: 'free', tags: ['emergency', 'contact', 'care', 'safety'],
  sections: [
    {
      id: 'details', title: 'Details',
      fields: [
        { id: 'personName', label: 'Person\'s Full Name', type: 'text', required: true },
        { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
        { id: 'address', label: 'Address', type: 'textarea', required: false },
        { id: 'medicalConditions', label: 'Medical Conditions / Allergies', type: 'textarea', required: false },
        { id: 'medications', label: 'Current Medications', type: 'textarea', required: false },
        { id: 'contacts', label: 'Emergency Contacts (Name | Relationship | Phone | Email)', type: 'textarea', required: true, placeholder: 'Jane Smith | Daughter | 07700 900000 | jane@email.com\nDr Brown | GP | 01234 567890 | —' },
        { id: 'gp', label: 'GP Name & Surgery', type: 'text', required: false },
        { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const contactRows = (data.contacts || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    return [
      section('Personal Details', infoTable([
        ['Name', or(data.personName, '[Name]')],
        ['Date of Birth', data.dob],
        ['Address', data.address],
        ['GP', data.gp],
      ])),
      data.medicalConditions ? section('Medical Conditions & Allergies', `<p>${nl2br(data.medicalConditions)}</p>`) : '',
      data.medications ? section('Current Medications', `<p>${nl2br(data.medications)}</p>`) : '',
      section('Emergency Contacts', dataTable(['Name', 'Relationship', 'Phone', 'Email'], contactRows)),
      data.notes ? section('Additional Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

export const reasonableAdjustmentRequest: DocumentTemplate = {
  id: 'reasonable-adjustment-request', name: 'Reasonable Adjustment Request', category: 'care',
  description: 'A formal request for reasonable adjustments under the Equality Act 2010.',
  icon: 'Accessibility', planRequired: 'free', tags: ['reasonable adjustment', 'disability', 'equality', 'request'],
  signatories: [{ label: 'Requester' }],
  sections: [
    {
      id: 'details', title: 'Request Details',
      fields: [
        { id: 'requesterName', label: 'Your Name', type: 'text', required: true },
        { id: 'requesterAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'letterDate', label: 'Date', type: 'date', required: true },
        { id: 'recipientName', label: 'Recipient Name / Organisation', type: 'text', required: true },
        { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: false },
        { id: 'adjustmentDetails', label: 'Adjustments Requested', type: 'textarea', required: true },
        { id: 'reason', label: 'Reason for Request', type: 'textarea', required: false },
        { id: 'supportingEvidence', label: 'Supporting Evidence Available', type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    letterHeader(data),
    section('Reasonable Adjustment Request — Equality Act 2010',
      `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>
      <p>I am writing to request reasonable adjustments under the Equality Act 2010.</p>
      <p><strong>Adjustments requested:</strong><br>${nl2br(or(data.adjustmentDetails, '[Adjustments]'))}</p>
      ${data.reason ? `<p><strong>Reason:</strong><br>${nl2br(data.reason)}</p>` : ''}
      ${data.supportingEvidence ? `<p><strong>Supporting evidence:</strong> ${data.supportingEvidence}</p>` : ''}
      <p>I would be grateful for your response at your earliest convenience.</p>
      <p>Yours faithfully,<br><strong>${or(data.requesterName, '[Your Name]')}</strong></p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

function reportTemplate(opts: {
  id: string; name: string; description: string; icon: string; tags: string[];
  extraFields?: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'date' | 'select'; required: boolean; placeholder?: string; options?: string[] }>;
  generateBody: (data: Record<string, string>) => string;
}): DocumentTemplate {
  return {
    id: opts.id, name: opts.name, category: 'reports', description: opts.description,
    icon: opts.icon, planRequired: 'free', tags: opts.tags,
    signatories: [{ label: 'Report Author' }],
    sections: [
      {
        id: 'header', title: 'Report Details',
        fields: [
          { id: 'orgName', label: 'Organisation', type: 'text', required: true },
          { id: 'reportTitle', label: 'Report Title', type: 'text', required: true },
          { id: 'reportDate', label: 'Report Date', type: 'date', required: true },
          { id: 'preparedBy', label: 'Prepared By', type: 'text', required: false },
          { id: 'reportPeriod', label: 'Reporting Period', type: 'text', required: false },
          ...(opts.extraFields || []),
        ],
      },
    ],
    generateDocument: (data) => [
      section('Report Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Report Title', or(data.reportTitle, '[Title]')],
        ['Date', or(data.reportDate, '[Date]')],
        ['Prepared By', data.preparedBy],
        ['Reporting Period', data.reportPeriod],
      ])),
      opts.generateBody(data),
      DISCLAIMER,
    ].filter(Boolean).join(''),
  };
}

export const incidentReport = reportTemplate({
  id: 'incident-report', name: 'Incident Report', description: 'A formal report of an incident or near-miss.',
  icon: 'Siren', tags: ['incident', 'report', 'safety'],
  extraFields: [
    { id: 'incidentDate', label: 'Date of Incident', type: 'date', required: false },
    { id: 'incidentLocation', label: 'Location', type: 'text', required: false },
    { id: 'incidentDescription', label: 'Description of Incident', type: 'textarea', required: true },
    { id: 'injuriesDamage', label: 'Injuries / Damage', type: 'textarea', required: false },
    { id: 'immediateAction', label: 'Immediate Action Taken', type: 'textarea', required: false },
    { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: false },
  ],
  generateBody: (data) => [
    section('Incident Details', infoTable([
      ['Date of Incident', data.incidentDate],
      ['Location', data.incidentLocation],
    ])),
    section('Description', `<p>${nl2br(or(data.incidentDescription, '[Description]'))}</p>`),
    data.injuriesDamage ? section('Injuries / Damage', `<p>${nl2br(data.injuriesDamage)}</p>`) : '',
    data.immediateAction ? section('Immediate Action Taken', `<p>${nl2br(data.immediateAction)}</p>`) : '',
    data.recommendations ? section('Recommendations', `<p>${nl2br(data.recommendations)}</p>`) : '',
  ].filter(Boolean).join(''),
});

export const monthlyReport = reportTemplate({
  id: 'monthly-report', name: 'Monthly Report', description: 'A monthly progress and activity report.',
  icon: 'BarChart2', tags: ['monthly', 'report', 'progress'],
  extraFields: [
    { id: 'summary', label: 'Executive Summary', type: 'textarea', required: true },
    { id: 'achievements', label: 'Key Achievements', type: 'textarea', required: false },
    { id: 'challenges', label: 'Challenges / Issues', type: 'textarea', required: false },
    { id: 'nextMonth', label: 'Plans for Next Month', type: 'textarea', required: false },
    { id: 'metrics', label: 'Key Metrics / KPIs', type: 'textarea', required: false },
  ],
  generateBody: (data) => [
    section('Executive Summary', `<p>${nl2br(or(data.summary, '[Summary]'))}</p>`),
    data.achievements ? section('Key Achievements', `<p>${nl2br(data.achievements)}</p>`) : '',
    data.challenges ? section('Challenges & Issues', `<p>${nl2br(data.challenges)}</p>`) : '',
    data.metrics ? section('Key Metrics / KPIs', `<p>${nl2br(data.metrics)}</p>`) : '',
    data.nextMonth ? section('Plans for Next Month', `<p>${nl2br(data.nextMonth)}</p>`) : '',
  ].filter(Boolean).join(''),
});

export const auditReport = reportTemplate({
  id: 'audit-report', name: 'Audit Report', description: 'A formal audit report with findings and recommendations.',
  icon: 'Search', tags: ['audit', 'report', 'compliance'],
  extraFields: [
    { id: 'auditScope', label: 'Audit Scope', type: 'textarea', required: false },
    { id: 'methodology', label: 'Methodology', type: 'textarea', required: false },
    { id: 'findings', label: 'Key Findings', type: 'textarea', required: true },
    { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: false },
    { id: 'conclusion', label: 'Conclusion', type: 'textarea', required: false },
  ],
  generateBody: (data) => [
    data.auditScope ? section('Audit Scope', `<p>${nl2br(data.auditScope)}</p>`) : '',
    data.methodology ? section('Methodology', `<p>${nl2br(data.methodology)}</p>`) : '',
    section('Key Findings', `<p>${nl2br(or(data.findings, '[Findings]'))}</p>`),
    data.recommendations ? section('Recommendations', `<p>${nl2br(data.recommendations)}</p>`) : '',
    data.conclusion ? section('Conclusion', `<p>${nl2br(data.conclusion)}</p>`) : '',
  ].filter(Boolean).join(''),
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════════════════════════════

function genericForm(opts: {
  id: string; name: string; description: string; icon: string; tags: string[];
  fields: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'date' | 'select' | 'email' | 'phone'; required: boolean; placeholder?: string; options?: string[] }>;
}): DocumentTemplate {
  return {
    id: opts.id, name: opts.name, category: 'forms', description: opts.description,
    icon: opts.icon, planRequired: 'free', tags: opts.tags,
    signatories: [{ label: 'Submitter' }],
    sections: [{ id: 'form', title: 'Form Details', fields: opts.fields }],
    generateDocument: (data) => [
      section('Form Details', infoTable(
        opts.fields.map(f => [f.label, data[f.id]] as [string, string | undefined])
      )),
    ].join(''),
  };
}

export const feedbackForm = genericForm({
  id: 'feedback-form', name: 'Feedback Form', description: 'A general feedback form.',
  icon: 'MessageSquare', tags: ['feedback', 'form'],
  fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'email', label: 'Your Email', type: 'email', required: false },
    { id: 'date', label: 'Date', type: 'date', required: true },
    { id: 'subject', label: 'Subject / Service', type: 'text', required: false },
    { id: 'rating', label: 'Overall Rating', type: 'select', required: false, options: ['5 — Excellent', '4 — Good', '3 — Satisfactory', '2 — Poor', '1 — Very Poor'] },
    { id: 'comments', label: 'Comments / Feedback', type: 'textarea', required: true },
    { id: 'improvements', label: 'Suggestions for Improvement', type: 'textarea', required: false },
  ],
});

export const registrationForm = genericForm({
  id: 'registration-form', name: 'Registration Form', description: 'A general registration form for events, services, or memberships.',
  icon: 'UserPlus', tags: ['registration', 'form', 'membership'],
  fields: [
    { id: 'fullName', label: 'Full Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'phone', required: false },
    { id: 'address', label: 'Address', type: 'textarea', required: false },
    { id: 'registeringFor', label: 'Registering For', type: 'text', required: false },
    { id: 'additionalInfo', label: 'Additional Information', type: 'textarea', required: false },
  ],
});

export const bookingForm = genericForm({
  id: 'booking-form', name: 'Booking Form', description: 'A booking form for appointments, rooms, or services.',
  icon: 'CalendarCheck', tags: ['booking', 'form', 'appointment'],
  fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: false },
    { id: 'phone', label: 'Phone', type: 'phone', required: false },
    { id: 'bookingDate', label: 'Requested Date', type: 'date', required: true },
    { id: 'bookingTime', label: 'Requested Time', type: 'text', required: false },
    { id: 'service', label: 'Service / Room / Resource', type: 'text', required: true },
    { id: 'duration', label: 'Duration', type: 'text', required: false },
    { id: 'notes', label: 'Notes / Special Requirements', type: 'textarea', required: false },
  ],
});

export const referralForm = genericForm({
  id: 'referral-form', name: 'Referral Form', description: 'A referral form for referring an individual to a service or organisation.',
  icon: 'Share', tags: ['referral', 'form', 'social care'],
  fields: [
    { id: 'referrerName', label: 'Referrer Name', type: 'text', required: true },
    { id: 'referrerOrg', label: 'Referrer Organisation', type: 'text', required: false },
    { id: 'referrerContact', label: 'Referrer Contact', type: 'text', required: false },
    { id: 'referralDate', label: 'Referral Date', type: 'date', required: true },
    { id: 'personName', label: 'Person Being Referred', type: 'text', required: true },
    { id: 'personDOB', label: 'Date of Birth', type: 'date', required: false },
    { id: 'personContact', label: 'Person\'s Contact Details', type: 'textarea', required: false },
    { id: 'referralReason', label: 'Reason for Referral', type: 'textarea', required: true },
    { id: 'urgency', label: 'Urgency', type: 'select', required: false, options: ['Urgent', 'High', 'Routine'] },
    { id: 'consent', label: 'Consent Given?', type: 'select', required: false, options: ['Yes — person has consented to this referral', 'No — referral made without consent (reason below)'] },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// LETTERS
// ═══════════════════════════════════════════════════════════════════════════════

function simpleLetter(opts: {
  id: string; name: string; description: string; icon: string; tags: string[];
  subject: string;
  bodyField: string; bodyLabel: string;
  extraFields?: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'date' | 'select'; required: boolean; placeholder?: string; options?: string[] }>;
  generateBody: (data: Record<string, string>) => string;
}): DocumentTemplate {
  return {
    id: opts.id, name: opts.name, category: 'letters', description: opts.description,
    icon: opts.icon, planRequired: 'free', tags: opts.tags,
    signatories: [{ label: 'Sender' }],
    sections: [
      {
        id: 'sender', title: 'Your Details',
        fields: [
          { id: 'senderName', label: 'Your Name', type: 'text', required: true },
          { id: 'senderOrg', label: 'Organisation (if applicable)', type: 'text', required: false },
          { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: false },
          { id: 'letterDate', label: 'Date', type: 'date', required: true },
        ],
      },
      {
        id: 'recipient', title: 'Recipient',
        fields: [
          { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
          { id: 'recipientOrg', label: 'Organisation', type: 'text', required: false },
          { id: 'recipientAddress', label: 'Address', type: 'textarea', required: false },
        ],
      },
      ...(opts.extraFields ? [{ id: 'extra', title: 'Details', fields: opts.extraFields }] : []),
      { id: 'content', title: 'Letter Content', fields: [{ id: opts.bodyField, label: opts.bodyLabel, type: 'textarea' as const, required: true }] },
    ],
    generateDocument: (data) => [
      letterHeader(data),
      section(`Re: ${opts.subject}`,
        `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>` +
        opts.generateBody(data) +
        `<p>${data.signOff || 'Yours sincerely'},<br><strong>${or(data.senderName, '[Your Name]')}</strong>${data.senderOrg ? `<br>${data.senderOrg}` : ''}</p>`
      ),
    ].join(''),
  };
}

export const apologyLetter = simpleLetter({
  id: 'apology-letter', name: 'Apology Letter', description: 'A formal apology letter.',
  icon: 'Heart', tags: ['apology', 'letter', 'formal'],
  subject: 'Apology', bodyField: 'apologyDetails', bodyLabel: 'Details of Your Apology',
  generateBody: (data) => `<p>I am writing to sincerely apologise for ${nl2br(or(data.apologyDetails, '[details]'))}.</p><p>I understand the impact this has had and take full responsibility. I am committed to ensuring this does not happen again.</p>`,
});

export const invitationLetter = simpleLetter({
  id: 'invitation-letter', name: 'Invitation Letter', description: 'A formal invitation letter for an event, meeting, or occasion.',
  icon: 'Mail', tags: ['invitation', 'letter', 'event'],
  subject: 'Invitation', bodyField: 'invitationDetails', bodyLabel: 'Invitation Details',
  extraFields: [
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'eventLocation', label: 'Event Location', type: 'text', required: false },
    { id: 'rsvpDeadline', label: 'RSVP Deadline', type: 'date', required: false },
  ],
  generateBody: (data) => `<p>${nl2br(or(data.invitationDetails, '[Invitation details]'))}</p>` +
    (data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}${data.eventLocation ? ` | <strong>Location:</strong> ${data.eventLocation}` : ''}</p>` : '') +
    (data.rsvpDeadline ? `<p>Please RSVP by <strong>${data.rsvpDeadline}</strong>.</p>` : ''),
});

export const confirmationLetter = simpleLetter({
  id: 'confirmation-letter', name: 'Confirmation Letter', description: 'A letter confirming an arrangement, booking, or agreement.',
  icon: 'CheckCircle', tags: ['confirmation', 'letter', 'formal'],
  subject: 'Confirmation', bodyField: 'confirmationDetails', bodyLabel: 'Details to Confirm',
  generateBody: (data) => `<p>I am writing to confirm the following:</p><p>${nl2br(or(data.confirmationDetails, '[Details]'))}</p><p>Please do not hesitate to contact me if you have any questions.</p>`,
});

export const reminderLetter = simpleLetter({
  id: 'reminder-letter', name: 'Reminder Letter', description: 'A polite reminder letter for outstanding actions, payments, or deadlines.',
  icon: 'Bell', tags: ['reminder', 'letter', 'formal'],
  subject: 'Reminder', bodyField: 'reminderDetails', bodyLabel: 'Details of the Reminder',
  extraFields: [
    { id: 'deadline', label: 'Deadline / Due Date', type: 'date', required: false },
  ],
  generateBody: (data) => `<p>I am writing as a reminder regarding the following matter:</p><p>${nl2br(or(data.reminderDetails, '[Details]'))}</p>` +
    (data.deadline ? `<p>This matter requires your attention by <strong>${data.deadline}</strong>.</p>` : ''),
});

export const thankYouLetter = simpleLetter({
  id: 'thank-you-letter', name: 'Thank You Letter', description: 'A formal thank you letter.',
  icon: 'Star', tags: ['thank you', 'letter', 'formal'],
  subject: 'Thank You', bodyField: 'thankYouDetails', bodyLabel: 'Details',
  generateBody: (data) => `<p>I am writing to express my sincere thanks for ${nl2br(or(data.thankYouDetails, '[details]'))}.</p><p>Your support is greatly appreciated.</p>`,
});

export const referenceLetter = simpleLetter({
  id: 'reference-letter', name: 'Reference Letter', description: 'A professional reference or character reference letter.',
  icon: 'FileText', tags: ['reference', 'letter', 'recommendation'],
  subject: 'Reference Letter', bodyField: 'referenceContent', bodyLabel: 'Reference Content',
  extraFields: [
    { id: 'subjectName', label: 'Name of Person Being Referenced', type: 'text', required: true },
    { id: 'relationship', label: 'Your Relationship to Them', type: 'text', required: false },
    { id: 'duration', label: 'How Long You Have Known Them', type: 'text', required: false },
  ],
  generateBody: (data) => `<p>I am pleased to provide this reference for <strong>${or(data.subjectName, '[Name]')}</strong>${data.relationship ? `, whom I have known as their ${data.relationship}` : ''}${data.duration ? ` for ${data.duration}` : ''}.</p><p>${nl2br(or(data.referenceContent, '[Reference content]'))}</p><p>I am happy to be contacted if further information is required.</p>`,
});

export const followUpLetter = simpleLetter({
  id: 'follow-up-letter', name: 'Follow-Up Letter', description: 'A follow-up letter after a meeting, application, or previous correspondence.',
  icon: 'ArrowRight', tags: ['follow-up', 'letter', 'formal'],
  subject: 'Follow-Up', bodyField: 'followUpDetails', bodyLabel: 'Follow-Up Details',
  extraFields: [
    { id: 'previousContact', label: 'Previous Contact / Meeting Date', type: 'date', required: false },
  ],
  generateBody: (data) => `<p>I am writing to follow up on our ${data.previousContact ? `correspondence / meeting of ${data.previousContact}` : 'previous correspondence'}.</p><p>${nl2br(or(data.followUpDetails, '[Follow-up details]'))}</p><p>I look forward to hearing from you.</p>`,
});

export const disputeLetter = simpleLetter({
  id: 'dispute-letter', name: 'Dispute Letter', description: 'A formal letter disputing a charge, decision, or claim.',
  icon: 'Scale', tags: ['dispute', 'letter', 'formal'],
  subject: 'Formal Dispute', bodyField: 'disputeDetails', bodyLabel: 'Details of the Dispute',
  generateBody: (data) => `<p>I am writing to formally dispute the following:</p><p>${nl2br(or(data.disputeDetails, '[Dispute details]'))}</p><p>I request that you review this matter and provide a written response within 14 days.</p>`,
});
