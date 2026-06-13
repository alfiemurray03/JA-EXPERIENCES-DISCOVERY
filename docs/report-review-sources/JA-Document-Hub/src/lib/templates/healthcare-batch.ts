import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider, notice } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'healthcare', icon: 'Stethoscope', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

const disclaimer = notice('This document is for administrative and operational use only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.', 'warning');

export const patientIntakeForm = mk('patient-intake-form', 'Patient Intake Form', 'A new patient intake / registration form for healthcare practices.', ['patient', 'intake', 'registration', 'healthcare'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'practiceName', label: 'Practice / Clinic Name', type: 'text', required: true },
    { id: 'patientName', label: 'Patient Full Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'address', label: 'Address', type: 'textarea', required: false },
    { id: 'phone', label: 'Phone Number', type: 'text', required: false },
    { id: 'email', label: 'Email Address', type: 'text', required: false },
    { id: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', required: false },
    { id: 'emergencyPhone', label: 'Emergency Contact Phone', type: 'text', required: false },
    { id: 'gp', label: 'Registered GP / Doctor', type: 'text', required: false },
    { id: 'allergies', label: 'Known Allergies', type: 'textarea', required: false },
    { id: 'currentMedications', label: 'Current Medications', type: 'textarea', required: false },
    { id: 'medicalHistory', label: 'Relevant Medical History', type: 'textarea', required: false },
    { id: 'reasonForVisit', label: 'Reason for Visit', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Patient Registration', infoTable([['Practice', or(d.practiceName,'[Practice]')],['Patient', or(d.patientName,'[Patient]')],['Date of Birth', fmtDate(d.dob)],['Phone', d.phone],['Email', d.email]])),
    section('Address', `<p>${nl2br(or(d.address,'[Address]'))}</p>`),
    section('Emergency Contact', infoTable([['Name', d.emergencyContact],['Phone', d.emergencyPhone]])),
    section('Medical Information', infoTable([['GP / Doctor', d.gp],['Allergies', d.allergies || 'None known'],['Current Medications', d.currentMedications || 'None']])),
    d.medicalHistory ? section('Medical History', `<p>${nl2br(d.medicalHistory)}</p>`) : '',
    d.reasonForVisit ? section('Reason for Visit', `<p>${nl2br(d.reasonForVisit)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const appointmentConfirmation = mk('appointment-confirmation', 'Appointment Confirmation Letter', 'A letter confirming a healthcare appointment.', ['appointment', 'confirmation', 'healthcare'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'practiceName', label: 'Practice / Clinic Name', type: 'text', required: true },
    { id: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { id: 'appointmentDate', label: 'Appointment Date', type: 'date', required: true },
    { id: 'appointmentTime', label: 'Appointment Time', type: 'text', required: false },
    { id: 'clinician', label: 'Clinician / Practitioner', type: 'text', required: false },
    { id: 'location', label: 'Location / Address', type: 'textarea', required: false },
    { id: 'instructions', label: 'Pre-Appointment Instructions', type: 'textarea', required: false },
    { id: 'contactPhone', label: 'Contact Phone', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>Dear <strong>${or(d.patientName,'[Patient]')}</strong>,</p>`,
    `<p>We are writing to confirm your appointment at <strong>${or(d.practiceName,'[Practice]')}</strong>.</p>`,
    section('Appointment Details', infoTable([['Date', fmtDate(d.appointmentDate)],['Time', d.appointmentTime],['Clinician', d.clinician],['Location', d.location]])),
    d.instructions ? section('Pre-Appointment Instructions', `<p>${nl2br(d.instructions)}</p>`) : '',
    `<p>If you need to cancel or rearrange your appointment, please contact us${d.contactPhone ? ` on <strong>${d.contactPhone}</strong>` : ''} as soon as possible.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.practiceName,'[Practice]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const referralLetter = mk('referral-letter', 'Referral Letter', 'A professional referral letter to another service or specialist.', ['referral', 'letter', 'healthcare'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'senderName', label: 'Referring Practitioner Name', type: 'text', required: true },
    { id: 'senderOrg', label: 'Referring Organisation', type: 'text', required: false },
    { id: 'recipientName', label: 'Recipient Name / Service', type: 'text', required: true },
    { id: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { id: 'patientDob', label: 'Patient Date of Birth', type: 'date', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'reasonForReferral', label: 'Reason for Referral', type: 'textarea', required: false },
    { id: 'background', label: 'Relevant Background', type: 'textarea', required: false },
    { id: 'urgency', label: 'Urgency', type: 'select', required: false, options: ['Routine', 'Urgent', 'Emergency'] },
    { id: 'contactDetails', label: 'Contact Details', type: 'text', required: false },
  ]}],
  (d) => [
    disclaimer,
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.recipientName,'[Recipient]')}</strong>,</p>`,
    `<p>I am writing to refer <strong>${or(d.patientName,'[Patient]')}</strong>${d.patientDob ? ` (DOB: ${fmtDate(d.patientDob)})` : ''} to your service.</p>`,
    section('Referral Details', infoTable([['Referring Practitioner', or(d.senderName,'[Sender]')],['Organisation', d.senderOrg],['Urgency', d.urgency],['Contact', d.contactDetails]])),
    d.reasonForReferral ? section('Reason for Referral', `<p>${nl2br(d.reasonForReferral)}</p>`) : '',
    d.background ? section('Relevant Background', `<p>${nl2br(d.background)}</p>`) : '',
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.senderName,'[Sender]')}</strong>${d.senderOrg ? `<br>${d.senderOrg}` : ''}</p>`,
  ].filter(Boolean).join(''),
);

export const consentToTreatment = mk('consent-to-treatment', 'Consent to Treatment Form', 'A consent to treatment form for healthcare or therapy services.', ['consent', 'treatment', 'healthcare'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'practiceName', label: 'Practice / Clinic Name', type: 'text', required: true },
    { id: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { id: 'treatmentDescription', label: 'Description of Treatment / Procedure', type: 'textarea', required: false },
    { id: 'risks', label: 'Risks Explained', type: 'textarea', required: false },
    { id: 'alternatives', label: 'Alternatives Discussed', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Consent to Treatment', infoTable([['Practice', or(d.practiceName,'[Practice]')],['Patient', or(d.patientName,'[Patient]')],['Date', fmtDate(d.date)]])),
    d.treatmentDescription ? section('Treatment / Procedure', `<p>${nl2br(d.treatmentDescription)}</p>`) : '',
    d.risks ? section('Risks Explained', `<p>${nl2br(d.risks)}</p>`) : '',
    d.alternatives ? section('Alternatives Discussed', `<p>${nl2br(d.alternatives)}</p>`) : '',
    `<div style="margin-top:20px;padding:14px;background:#f8f9fb;border:1px solid #dde1e8;border-radius:4px;">
      <p style="font-weight:700;font-size:9.5pt;margin:0 0 8px 0;">Patient Declaration</p>
      <p style="font-size:9pt;margin:0 0 16px 0;">I confirm that I have been given the opportunity to ask questions and that the treatment, risks, and alternatives have been explained to me. I consent to the treatment described above.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Patient Signature</p></div>
        <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Date</p></div>
      </div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const medicationRecord = mk('medication-record', 'Medication Administration Record', 'A medication administration record for care settings.', ['medication', 'record', 'care', 'healthcare'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'patientName', label: 'Patient / Resident Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'allergies', label: 'Known Allergies', type: 'text', required: false },
    { id: 'medications', label: 'Medications (Name, Dose, Frequency, Route)', type: 'textarea', required: false },
    { id: 'prescribedBy', label: 'Prescribed By', type: 'text', required: false },
    { id: 'reviewDate', label: 'Medication Review Date', type: 'date', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Medication Record', infoTable([['Patient', or(d.patientName,'[Patient]')],['DOB', fmtDate(d.dob)],['Allergies', d.allergies || 'None known'],['Prescribed By', d.prescribedBy],['Review Date', fmtDate(d.reviewDate)]])),
    d.medications ? section('Medications', `<p>${nl2br(d.medications)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const healthAndSafetyRiskAssessment = mk('health-safety-risk-assessment', 'Health & Safety Risk Assessment', 'A workplace health and safety risk assessment.', ['risk assessment', 'health and safety', 'workplace'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'assessmentDate', label: 'Assessment Date', type: 'date', required: false },
    { id: 'assessor', label: 'Assessor Name', type: 'text', required: false },
    { id: 'location', label: 'Location / Area', type: 'text', required: false },
    { id: 'hazards', label: 'Hazards Identified', type: 'textarea', required: false },
    { id: 'whoIsAtRisk', label: 'Who Is at Risk', type: 'textarea', required: false },
    { id: 'controlMeasures', label: 'Control Measures', type: 'textarea', required: false },
    { id: 'residualRisk', label: 'Residual Risk Level', type: 'select', required: false, options: ['Low', 'Medium', 'High'] },
    { id: 'reviewDate', label: 'Review Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Risk Assessment', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.assessmentDate)],['Assessor', d.assessor],['Location', d.location],['Residual Risk', d.residualRisk],['Review Date', fmtDate(d.reviewDate)]])),
    d.hazards ? section('Hazards Identified', `<p>${nl2br(d.hazards)}</p>`) : '',
    d.whoIsAtRisk ? section('Who Is at Risk', `<p>${nl2br(d.whoIsAtRisk)}</p>`) : '',
    d.controlMeasures ? section('Control Measures', `<p>${nl2br(d.controlMeasures)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const staffRota = mk('staff-rota', 'Staff Rota / Schedule', 'A weekly staff rota or schedule document.', ['rota', 'schedule', 'staff', 'shifts'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Department', type: 'text', required: true },
    { id: 'weekCommencing', label: 'Week Commencing', type: 'date', required: false },
    { id: 'manager', label: 'Manager / Coordinator', type: 'text', required: false },
    { id: 'rotaDetails', label: 'Rota Details (staff, days, shifts)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Staff Rota', infoTable([['Organisation', or(d.orgName,'[Org]')],['Week Commencing', fmtDate(d.weekCommencing)],['Manager', d.manager]])),
    d.rotaDetails ? section('Rota', `<p>${nl2br(d.rotaDetails)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const incidentReportHealthcare = mk('healthcare-incident-report', 'Healthcare Incident Report', 'An incident report form for healthcare and care settings.', ['incident', 'report', 'healthcare', 'safety'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'incidentDate', label: 'Date of Incident', type: 'date', required: false },
    { id: 'incidentTime', label: 'Time of Incident', type: 'text', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'reportedBy', label: 'Reported By', type: 'text', required: false },
    { id: 'involvedParties', label: 'Persons Involved', type: 'textarea', required: false },
    { id: 'description', label: 'Description of Incident', type: 'textarea', required: false },
    { id: 'immediateAction', label: 'Immediate Action Taken', type: 'textarea', required: false },
    { id: 'injuries', label: 'Injuries / Harm', type: 'textarea', required: false },
    { id: 'witnesses', label: 'Witnesses', type: 'textarea', required: false },
    { id: 'followUpRequired', label: 'Follow-Up Required', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Incident Report', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.incidentDate)],['Time', d.incidentTime],['Location', d.location],['Reported By', d.reportedBy]])),
    d.involvedParties ? section('Persons Involved', `<p>${nl2br(d.involvedParties)}</p>`) : '',
    d.description ? section('Description', `<p>${nl2br(d.description)}</p>`) : '',
    d.injuries ? section('Injuries / Harm', `<p>${nl2br(d.injuries)}</p>`) : '',
    d.immediateAction ? section('Immediate Action Taken', `<p>${nl2br(d.immediateAction)}</p>`) : '',
    d.witnesses ? section('Witnesses', `<p>${nl2br(d.witnesses)}</p>`) : '',
    d.followUpRequired ? section('Follow-Up Required', `<p>${nl2br(d.followUpRequired)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const careHandoverNote = mk('care-handover-note', 'Care Handover Note', 'A shift handover note for care and healthcare teams.', ['handover', 'care', 'shift', 'notes'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Ward', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'shiftFrom', label: 'Shift Handover From', type: 'text', required: false },
    { id: 'shiftTo', label: 'Shift Handover To', type: 'text', required: false },
    { id: 'handingOverStaff', label: 'Handing Over Staff', type: 'text', required: false },
    { id: 'receivingStaff', label: 'Receiving Staff', type: 'text', required: false },
    { id: 'patientUpdates', label: 'Patient / Resident Updates', type: 'textarea', required: false },
    { id: 'outstandingTasks', label: 'Outstanding Tasks', type: 'textarea', required: false },
    { id: 'concerns', label: 'Concerns / Escalations', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Handover Note', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)],['Shift From', d.shiftFrom],['Shift To', d.shiftTo],['Handing Over', d.handingOverStaff],['Receiving', d.receivingStaff]])),
    d.patientUpdates ? section('Patient / Resident Updates', `<p>${nl2br(d.patientUpdates)}</p>`) : '',
    d.outstandingTasks ? section('Outstanding Tasks', `<p>${nl2br(d.outstandingTasks)}</p>`) : '',
    d.concerns ? section('Concerns / Escalations', `<p>${nl2br(d.concerns)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const wellbeingActionPlan = mk('wellbeing-action-plan', 'Wellbeing Action Plan', 'A staff wellbeing action plan for workplace mental health support.', ['wellbeing', 'mental health', 'action plan', 'hr'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
    { id: 'manager', label: 'Line Manager', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'currentChallenges', label: 'Current Challenges', type: 'textarea', required: false },
    { id: 'supportNeeded', label: 'Support Needed', type: 'textarea', required: false },
    { id: 'adjustments', label: 'Agreed Adjustments', type: 'textarea', required: false },
    { id: 'reviewDate', label: 'Review Date', type: 'date', required: false },
    { id: 'emergencyContact', label: 'Emergency / Crisis Contact', type: 'text', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Wellbeing Action Plan', infoTable([['Employee', or(d.employeeName,'[Employee]')],['Manager', d.manager],['Date', fmtDate(d.date)],['Review Date', fmtDate(d.reviewDate)],['Emergency Contact', d.emergencyContact]])),
    d.currentChallenges ? section('Current Challenges', `<p>${nl2br(d.currentChallenges)}</p>`) : '',
    d.supportNeeded ? section('Support Needed', `<p>${nl2br(d.supportNeeded)}</p>`) : '',
    d.adjustments ? section('Agreed Adjustments', `<p>${nl2br(d.adjustments)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_HEALTHCARE_TEMPLATES: DocumentTemplate[] = [
  patientIntakeForm, appointmentConfirmation, referralLetter, consentToTreatment,
  medicationRecord, healthAndSafetyRiskAssessment, staffRota,
  incidentReportHealthcare, careHandoverNote, wellbeingActionPlan,
];
