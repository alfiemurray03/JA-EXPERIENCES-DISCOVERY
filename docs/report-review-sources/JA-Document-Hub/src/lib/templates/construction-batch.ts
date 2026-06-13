import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'construction', icon: 'HardHat', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const constructionQuote = mk('construction-quote', 'Construction Quote', 'A quote for construction, building or trade work.', ['quote', 'construction', 'trade', 'estimate'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Your Company Name', type: 'text', required: true },
    { id: 'clientName', label: 'Client Name', type: 'text', required: true },
    { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: false },
    { id: 'quoteDate', label: 'Quote Date', type: 'date', required: false },
    { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
    { id: 'projectAddress', label: 'Project / Site Address', type: 'textarea', required: false },
    { id: 'workDescription', label: 'Description of Work', type: 'textarea', required: true },
    { id: 'materials', label: 'Materials Included', type: 'textarea', required: false },
    { id: 'labour', label: 'Labour', type: 'text', required: false },
    { id: 'totalPrice', label: 'Total Price (exc. VAT)', type: 'text', required: false },
    { id: 'vatAmount', label: 'VAT Amount', type: 'text', required: false },
    { id: 'totalIncVat', label: 'Total (inc. VAT)', type: 'text', required: false },
    { id: 'paymentTerms', label: 'Payment Terms', type: 'text', required: false },
    { id: 'startDate', label: 'Estimated Start Date', type: 'date', required: false },
    { id: 'duration', label: 'Estimated Duration', type: 'text', required: false },
    { id: 'exclusions', label: 'Exclusions', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Quote Details', infoTable([['Company', or(d.companyName,'[Company]')],['Client', or(d.clientName,'[Client]')],['Date', fmtDate(d.quoteDate)],['Valid Until', fmtDate(d.validUntil)],['Site Address', d.projectAddress]])),
    section('Description of Work', `<p>${nl2br(or(d.workDescription,'[Work Description]'))}</p>`),
    d.materials ? section('Materials', `<p>${nl2br(d.materials)}</p>`) : '',
    section('Pricing', infoTable([['Labour', d.labour],['Total (exc. VAT)', d.totalPrice],['VAT', d.vatAmount],['Total (inc. VAT)', d.totalIncVat],['Payment Terms', d.paymentTerms]])),
    section('Programme', infoTable([['Estimated Start', fmtDate(d.startDate)],['Estimated Duration', d.duration]])),
    d.exclusions ? section('Exclusions', `<p>${nl2br(d.exclusions)}</p>`) : '',
    divider(),
    `<p style="font-size:8.5pt;color:#6b7280;">This quote is valid until ${fmtDate(d.validUntil,'[date]')}. All prices are subject to survey and site conditions.</p>`,
  ].filter(Boolean).join(''),
);

export const siteInspectionReport = mk('site-inspection-report', 'Site Inspection Report', 'A site inspection report for construction or property projects.', ['site inspection', 'report', 'construction'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'siteAddress', label: 'Site Address', type: 'textarea', required: false },
    { id: 'inspectionDate', label: 'Inspection Date', type: 'date', required: false },
    { id: 'inspector', label: 'Inspector Name', type: 'text', required: false },
    { id: 'weather', label: 'Weather Conditions', type: 'text', required: false },
    { id: 'workInProgress', label: 'Work in Progress', type: 'textarea', required: false },
    { id: 'observations', label: 'Observations', type: 'textarea', required: false },
    { id: 'issues', label: 'Issues / Non-Conformances', type: 'textarea', required: false },
    { id: 'actions', label: 'Required Actions', type: 'textarea', required: false },
    { id: 'nextInspection', label: 'Next Inspection Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Site Inspection Report', infoTable([['Project', or(d.projectName,'[Project]')],['Site', d.siteAddress],['Date', fmtDate(d.inspectionDate)],['Inspector', d.inspector],['Weather', d.weather],['Next Inspection', fmtDate(d.nextInspection)]])),
    d.workInProgress ? section('Work in Progress', `<p>${nl2br(d.workInProgress)}</p>`) : '',
    d.observations ? section('Observations', `<p>${nl2br(d.observations)}</p>`) : '',
    d.issues ? section('Issues / Non-Conformances', `<p>${nl2br(d.issues)}</p>`) : '',
    d.actions ? section('Required Actions', `<p>${nl2br(d.actions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const constructionRiskAssessment = mk('construction-risk-assessment', 'Construction Risk Assessment', 'A risk assessment for construction and trade activities.', ['risk assessment', 'construction', 'health and safety'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Company Name', type: 'text', required: true },
    { id: 'projectName', label: 'Project / Activity', type: 'text', required: true },
    { id: 'assessmentDate', label: 'Assessment Date', type: 'date', required: false },
    { id: 'assessor', label: 'Assessor', type: 'text', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'hazards', label: 'Hazards Identified', type: 'textarea', required: false },
    { id: 'whoAtRisk', label: 'Who Is at Risk', type: 'textarea', required: false },
    { id: 'controlMeasures', label: 'Control Measures', type: 'textarea', required: false },
    { id: 'ppe', label: 'PPE Required', type: 'textarea', required: false },
    { id: 'residualRisk', label: 'Residual Risk', type: 'select', required: false, options: ['Low', 'Medium', 'High'] },
    { id: 'reviewDate', label: 'Review Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Risk Assessment', infoTable([['Company', or(d.companyName,'[Company]')],['Project', or(d.projectName,'[Project]')],['Date', fmtDate(d.assessmentDate)],['Assessor', d.assessor],['Location', d.location],['Residual Risk', d.residualRisk],['Review Date', fmtDate(d.reviewDate)]])),
    d.hazards ? section('Hazards Identified', `<p>${nl2br(d.hazards)}</p>`) : '',
    d.whoAtRisk ? section('Who Is at Risk', `<p>${nl2br(d.whoAtRisk)}</p>`) : '',
    d.controlMeasures ? section('Control Measures', `<p>${nl2br(d.controlMeasures)}</p>`) : '',
    d.ppe ? section('PPE Required', `<p>${nl2br(d.ppe)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const methodStatement = mk('method-statement', 'Method Statement', 'A method statement for a construction or trade task.', ['method statement', 'construction', 'safe working'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Company Name', type: 'text', required: true },
    { id: 'taskName', label: 'Task / Activity', type: 'text', required: true },
    { id: 'projectName', label: 'Project Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'supervisor', label: 'Supervisor', type: 'text', required: false },
    { id: 'scope', label: 'Scope of Work', type: 'textarea', required: false },
    { id: 'sequence', label: 'Sequence of Operations', type: 'textarea', required: false },
    { id: 'equipment', label: 'Plant & Equipment', type: 'textarea', required: false },
    { id: 'ppe', label: 'PPE Required', type: 'textarea', required: false },
    { id: 'emergencyProcedures', label: 'Emergency Procedures', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Method Statement', infoTable([['Company', or(d.companyName,'[Company]')],['Task', or(d.taskName,'[Task]')],['Project', d.projectName],['Date', fmtDate(d.date)],['Supervisor', d.supervisor]])),
    d.scope ? section('Scope of Work', `<p>${nl2br(d.scope)}</p>`) : '',
    d.sequence ? section('Sequence of Operations', `<p>${nl2br(d.sequence)}</p>`) : '',
    d.equipment ? section('Plant & Equipment', `<p>${nl2br(d.equipment)}</p>`) : '',
    d.ppe ? section('PPE Required', `<p>${nl2br(d.ppe)}</p>`) : '',
    d.emergencyProcedures ? section('Emergency Procedures', `<p>${nl2br(d.emergencyProcedures)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const snaggingList = mk('snagging-list', 'Snagging List', 'A snagging list for construction or property handover.', ['snagging', 'defects', 'construction', 'handover'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'address', label: 'Property Address', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'inspector', label: 'Inspector / Client', type: 'text', required: false },
    { id: 'contractor', label: 'Contractor', type: 'text', required: false },
    { id: 'items', label: 'Snagging Items (Room, Issue, Priority)', type: 'textarea', required: false },
    { id: 'completionDeadline', label: 'Completion Deadline', type: 'date', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Snagging List', infoTable([['Project', or(d.projectName,'[Project]')],['Address', d.address],['Date', fmtDate(d.date)],['Inspector', d.inspector],['Contractor', d.contractor],['Completion Deadline', fmtDate(d.completionDeadline)]])),
    d.items ? section('Snagging Items', `<p>${nl2br(d.items)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const subcontractorAgreement = mk('subcontractor-agreement', 'Subcontractor Agreement', 'An agreement between a contractor and subcontractor for trade work.', ['subcontractor', 'agreement', 'construction', 'trade'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'contractorName', label: 'Main Contractor Name', type: 'text', required: true },
    { id: 'subcontractorName', label: 'Subcontractor Name', type: 'text', required: true },
    { id: 'projectName', label: 'Project Name', type: 'text', required: false },
    { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: false },
    { id: 'scopeOfWork', label: 'Scope of Work', type: 'textarea', required: true },
    { id: 'startDate', label: 'Start Date', type: 'date', required: false },
    { id: 'completionDate', label: 'Completion Date', type: 'date', required: false },
    { id: 'price', label: 'Agreed Price', type: 'text', required: false },
    { id: 'paymentTerms', label: 'Payment Terms', type: 'text', required: false },
    { id: 'insurance', label: 'Insurance Requirements', type: 'textarea', required: false },
    { id: 'governingLaw', label: 'Governing Law', type: 'text', required: false, defaultValue: 'England and Wales' },
  ]}],
  (d) => [
    section('Subcontractor Agreement', infoTable([['Main Contractor', or(d.contractorName,'[Contractor]')],['Subcontractor', or(d.subcontractorName,'[Subcontractor]')],['Project', d.projectName],['Date', fmtDate(d.agreementDate)],['Start', fmtDate(d.startDate)],['Completion', fmtDate(d.completionDate)],['Price', d.price],['Payment Terms', d.paymentTerms],['Governing Law', d.governingLaw]])),
    section('Scope of Work', `<p>${nl2br(or(d.scopeOfWork,'[Scope]'))}</p>`),
    d.insurance ? section('Insurance Requirements', `<p>${nl2br(d.insurance)}</p>`) : '',
    divider(),
    `<p style="font-size:9pt;color:#6b7280;text-align:center;">Both parties agree to the terms set out above.</p>`,
  ].filter(Boolean).join(''),
);

export const dailySiteLog = mk('daily-site-log', 'Daily Site Log', 'A daily site diary / log for construction projects.', ['site log', 'diary', 'construction', 'daily'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: true },
    { id: 'siteManager', label: 'Site Manager', type: 'text', required: false },
    { id: 'weather', label: 'Weather', type: 'text', required: false },
    { id: 'workforceOnSite', label: 'Workforce on Site', type: 'text', required: false },
    { id: 'workCarriedOut', label: 'Work Carried Out', type: 'textarea', required: false },
    { id: 'materialsDelivered', label: 'Materials Delivered', type: 'textarea', required: false },
    { id: 'visitorsOnSite', label: 'Visitors on Site', type: 'textarea', required: false },
    { id: 'issues', label: 'Issues / Delays', type: 'textarea', required: false },
    { id: 'plannedTomorrow', label: 'Planned Work Tomorrow', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Daily Site Log', infoTable([['Project', or(d.projectName,'[Project]')],['Date', fmtDate(d.date)],['Site Manager', d.siteManager],['Weather', d.weather],['Workforce on Site', d.workforceOnSite]])),
    d.workCarriedOut ? section('Work Carried Out', `<p>${nl2br(d.workCarriedOut)}</p>`) : '',
    d.materialsDelivered ? section('Materials Delivered', `<p>${nl2br(d.materialsDelivered)}</p>`) : '',
    d.visitorsOnSite ? section('Visitors on Site', `<p>${nl2br(d.visitorsOnSite)}</p>`) : '',
    d.issues ? section('Issues / Delays', `<p>${nl2br(d.issues)}</p>`) : '',
    d.plannedTomorrow ? section('Planned Work Tomorrow', `<p>${nl2br(d.plannedTomorrow)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const materialDeliveryNote = mk('material-delivery-note', 'Material Delivery Note', 'A delivery note for materials delivered to a construction site.', ['delivery note', 'materials', 'construction'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
    { id: 'deliveryTo', label: 'Delivery To', type: 'text', required: true },
    { id: 'siteAddress', label: 'Site Address', type: 'textarea', required: false },
    { id: 'deliveryDate', label: 'Delivery Date', type: 'date', required: false },
    { id: 'orderRef', label: 'Order Reference', type: 'text', required: false },
    { id: 'items', label: 'Items Delivered', type: 'textarea', required: false },
    { id: 'receivedBy', label: 'Received By', type: 'text', required: false },
    { id: 'condition', label: 'Condition of Goods', type: 'select', required: false, options: ['Good', 'Damaged', 'Partial Delivery'] },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Delivery Note', infoTable([['Supplier', or(d.supplierName,'[Supplier]')],['Delivery To', or(d.deliveryTo,'[Recipient]')],['Site Address', d.siteAddress],['Date', fmtDate(d.deliveryDate)],['Order Ref', d.orderRef],['Received By', d.receivedBy],['Condition', d.condition]])),
    d.items ? section('Items Delivered', `<p>${nl2br(d.items)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const toolboxTalkRecord = mk('toolbox-talk-record', 'Toolbox Talk Record', 'A record of a toolbox talk / safety briefing on site.', ['toolbox talk', 'safety', 'construction', 'briefing'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Company Name', type: 'text', required: true },
    { id: 'topic', label: 'Topic', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'presenter', label: 'Presenter', type: 'text', required: false },
    { id: 'keyPoints', label: 'Key Points Covered', type: 'textarea', required: false },
    { id: 'attendees', label: 'Attendees (names)', type: 'textarea', required: false },
    { id: 'questions', label: 'Questions / Actions Raised', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Toolbox Talk Record', infoTable([['Company', or(d.companyName,'[Company]')],['Topic', or(d.topic,'[Topic]')],['Date', fmtDate(d.date)],['Location', d.location],['Presenter', d.presenter]])),
    d.keyPoints ? section('Key Points Covered', `<p>${nl2br(d.keyPoints)}</p>`) : '',
    d.attendees ? section('Attendees', `<p>${nl2br(d.attendees)}</p>`) : '',
    d.questions ? section('Questions / Actions', `<p>${nl2br(d.questions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const projectHandoverCertificate = mk('project-handover-certificate', 'Project Handover Certificate', 'A certificate of practical completion / project handover.', ['handover', 'completion', 'certificate', 'construction'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'address', label: 'Property / Site Address', type: 'textarea', required: false },
    { id: 'contractor', label: 'Contractor', type: 'text', required: false },
    { id: 'client', label: 'Client', type: 'text', required: false },
    { id: 'completionDate', label: 'Date of Practical Completion', type: 'date', required: false },
    { id: 'defectsLiabilityPeriod', label: 'Defects Liability Period', type: 'text', required: false, placeholder: 'e.g. 12 months from date of completion' },
    { id: 'outstandingItems', label: 'Outstanding Items (if any)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Project Handover Certificate', infoTable([['Project', or(d.projectName,'[Project]')],['Address', d.address],['Contractor', d.contractor],['Client', d.client],['Completion Date', fmtDate(d.completionDate)],['Defects Liability Period', d.defectsLiabilityPeriod]])),
    d.outstandingItems ? section('Outstanding Items', `<p>${nl2br(d.outstandingItems)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Contractor Signature</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Client Signature</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const ALL_CONSTRUCTION_TEMPLATES: DocumentTemplate[] = [
  constructionQuote, siteInspectionReport, constructionRiskAssessment,
  methodStatement, snaggingList, subcontractorAgreement, dailySiteLog,
  materialDeliveryNote, toolboxTalkRecord, projectHandoverCertificate,
];
