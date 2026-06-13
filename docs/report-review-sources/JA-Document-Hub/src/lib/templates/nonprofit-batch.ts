import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'nonprofit', icon: 'HandHeart', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const volunteerApplication = mk('volunteer-application', 'Volunteer Application Form', 'A volunteer application form for charities and community organisations.', ['volunteer', 'application', 'charity', 'nonprofit'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'address', label: 'Address', type: 'textarea', required: false },
    { id: 'phone', label: 'Phone', type: 'text', required: false },
    { id: 'email', label: 'Email', type: 'text', required: false },
    { id: 'availability', label: 'Availability', type: 'textarea', required: false },
    { id: 'skills', label: 'Relevant Skills / Experience', type: 'textarea', required: false },
    { id: 'motivation', label: 'Why Do You Want to Volunteer?', type: 'textarea', required: false },
    { id: 'references', label: 'References', type: 'textarea', required: false },
    { id: 'dbsCheck', label: 'DBS Check Required?', type: 'select', required: false, options: ['Yes', 'No', 'Already Holds Valid DBS'] },
  ]}],
  (d) => [
    section('Volunteer Application', infoTable([['Organisation', or(d.orgName,'[Org]')],['Applicant', or(d.applicantName,'[Applicant]')],['DOB', fmtDate(d.dob)],['Phone', d.phone],['Email', d.email],['DBS Check', d.dbsCheck]])),
    d.address ? section('Address', `<p>${nl2br(d.address)}</p>`) : '',
    d.availability ? section('Availability', `<p>${nl2br(d.availability)}</p>`) : '',
    d.skills ? section('Skills & Experience', `<p>${nl2br(d.skills)}</p>`) : '',
    d.motivation ? section('Motivation', `<p>${nl2br(d.motivation)}</p>`) : '',
    d.references ? section('References', `<p>${nl2br(d.references)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const volunteerRegister = mk('volunteer-register', 'Volunteer Register', 'A register of volunteers for a charity or community group.', ['volunteer', 'register', 'charity'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'volunteers', label: 'Volunteers (Name, Role, Contact, Start Date)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Volunteer Register', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)]])),
    d.volunteers ? section('Volunteers', `<p>${nl2br(d.volunteers)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const volunteerHoursLog = mk('volunteer-hours-log', 'Volunteer Hours Log', 'A log of volunteer hours for a charity or community organisation.', ['volunteer', 'hours', 'log', 'charity'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'volunteerName', label: 'Volunteer Name', type: 'text', required: true },
    { id: 'period', label: 'Period', type: 'text', required: false },
    { id: 'hoursLog', label: 'Hours Log (Date, Activity, Hours)', type: 'textarea', required: false },
    { id: 'totalHours', label: 'Total Hours', type: 'text', required: false },
    { id: 'supervisorName', label: 'Supervisor Name', type: 'text', required: false },
  ]}],
  (d) => [
    section('Volunteer Hours Log', infoTable([['Organisation', or(d.orgName,'[Org]')],['Volunteer', or(d.volunteerName,'[Volunteer]')],['Period', d.period],['Total Hours', d.totalHours],['Supervisor', d.supervisorName]])),
    d.hoursLog ? section('Hours Log', `<p>${nl2br(d.hoursLog)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const donationAcknowledgement = mk('donation-acknowledgement', 'Donation Acknowledgement Letter', 'A letter acknowledging a donation to a charity or nonprofit.', ['donation', 'acknowledgement', 'charity', 'letter'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'charityNumber', label: 'Charity Registration Number', type: 'text', required: false },
    { id: 'donorName', label: 'Donor Name', type: 'text', required: true },
    { id: 'donationAmount', label: 'Donation Amount', type: 'text', required: false },
    { id: 'donationDate', label: 'Donation Date', type: 'date', required: false },
    { id: 'purpose', label: 'Purpose / Fund', type: 'text', required: false },
    { id: 'giftAid', label: 'Gift Aid Claimed?', type: 'select', required: false, options: ['Yes', 'No'] },
    { id: 'contactName', label: 'Contact Name', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>Dear <strong>${or(d.donorName,'[Donor]')}</strong>,</p>`,
    `<p>On behalf of <strong>${or(d.orgName,'[Organisation]')}</strong>${d.charityNumber ? ` (Registered Charity No. ${d.charityNumber})` : ''}, we would like to sincerely thank you for your generous donation.</p>`,
    section('Donation Details', infoTable([['Donor', or(d.donorName,'[Donor]')],['Amount', d.donationAmount],['Date', fmtDate(d.donationDate)],['Purpose', d.purpose],['Gift Aid', d.giftAid]])),
    `<p>Your support makes a real difference to the work we do. We are grateful for your continued generosity.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${d.contactName || or(d.orgName,'[Organisation]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

export const grantApplicationForm = mk('grant-application-form', 'Grant Application Form', 'A grant application form for charities and community groups.', ['grant', 'application', 'charity', 'funding'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'charityNumber', label: 'Charity / Company Number', type: 'text', required: false },
    { id: 'contactName', label: 'Contact Name', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
    { id: 'funderName', label: 'Funder Name', type: 'text', required: false },
    { id: 'amountRequested', label: 'Amount Requested', type: 'text', required: false },
    { id: 'projectTitle', label: 'Project Title', type: 'text', required: true },
    { id: 'projectSummary', label: 'Project Summary', type: 'textarea', required: false },
    { id: 'need', label: 'Need / Problem Being Addressed', type: 'textarea', required: false },
    { id: 'activities', label: 'Planned Activities', type: 'textarea', required: false },
    { id: 'outcomes', label: 'Expected Outcomes', type: 'textarea', required: false },
    { id: 'budget', label: 'Budget Breakdown', type: 'textarea', required: false },
    { id: 'timeline', label: 'Project Timeline', type: 'text', required: false },
    { id: 'evaluation', label: 'How Will You Evaluate Success?', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Grant Application', infoTable([['Organisation', or(d.orgName,'[Org]')],['Charity No.', d.charityNumber],['Contact', d.contactName],['Email', d.contactEmail],['Funder', d.funderName],['Amount Requested', d.amountRequested],['Project', or(d.projectTitle,'[Project]')],['Timeline', d.timeline]])),
    d.projectSummary ? section('Project Summary', `<p>${nl2br(d.projectSummary)}</p>`) : '',
    d.need ? section('Need / Problem', `<p>${nl2br(d.need)}</p>`) : '',
    d.activities ? section('Planned Activities', `<p>${nl2br(d.activities)}</p>`) : '',
    d.outcomes ? section('Expected Outcomes', `<p>${nl2br(d.outcomes)}</p>`) : '',
    d.budget ? section('Budget Breakdown', `<p>${nl2br(d.budget)}</p>`) : '',
    d.evaluation ? section('Evaluation', `<p>${nl2br(d.evaluation)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const membershipApplication = mk('membership-application', 'Membership Application Form', 'A membership application form for clubs, associations or organisations.', ['membership', 'application', 'club', 'association'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'address', label: 'Address', type: 'textarea', required: false },
    { id: 'phone', label: 'Phone', type: 'text', required: false },
    { id: 'email', label: 'Email', type: 'text', required: false },
    { id: 'membershipType', label: 'Membership Type', type: 'text', required: false },
    { id: 'fee', label: 'Membership Fee', type: 'text', required: false },
    { id: 'howHeard', label: 'How Did You Hear About Us?', type: 'text', required: false },
    { id: 'declaration', label: 'Declaration / Agreement', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Membership Application', infoTable([['Organisation', or(d.orgName,'[Org]')],['Applicant', or(d.applicantName,'[Applicant]')],['DOB', fmtDate(d.dob)],['Phone', d.phone],['Email', d.email],['Membership Type', d.membershipType],['Fee', d.fee],['How Heard', d.howHeard]])),
    d.address ? section('Address', `<p>${nl2br(d.address)}</p>`) : '',
    d.declaration ? section('Declaration', `<p>${nl2br(d.declaration)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Applicant Signature</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Date</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const communityEventPlan = mk('community-event-plan', 'Community Event Plan', 'A planning document for a community event or project.', ['community', 'event', 'plan', 'charity'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'eventName', label: 'Event Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'purpose', label: 'Purpose / Objectives', type: 'textarea', required: false },
    { id: 'targetAudience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'activities', label: 'Planned Activities', type: 'textarea', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'volunteers', label: 'Volunteers Required', type: 'text', required: false },
    { id: 'riskAssessment', label: 'Risk Assessment Summary', type: 'textarea', required: false },
    { id: 'promotionPlan', label: 'Promotion Plan', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Community Event Plan', infoTable([['Organisation', or(d.orgName,'[Org]')],['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)],['Venue', d.venue],['Budget', d.budget],['Volunteers Required', d.volunteers]])),
    d.purpose ? section('Purpose & Objectives', `<p>${nl2br(d.purpose)}</p>`) : '',
    d.targetAudience ? section('Target Audience', `<p>${nl2br(d.targetAudience)}</p>`) : '',
    d.activities ? section('Planned Activities', `<p>${nl2br(d.activities)}</p>`) : '',
    d.promotionPlan ? section('Promotion Plan', `<p>${nl2br(d.promotionPlan)}</p>`) : '',
    d.riskAssessment ? section('Risk Assessment Summary', `<p>${nl2br(d.riskAssessment)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const annualReport = mk('annual-report-nonprofit', 'Annual Report (Nonprofit)', 'An annual report for a charity or nonprofit organisation.', ['annual report', 'charity', 'nonprofit'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'year', label: 'Reporting Year', type: 'text', required: true },
    { id: 'chairMessage', label: "Chair's Message", type: 'textarea', required: false },
    { id: 'achievements', label: 'Key Achievements', type: 'textarea', required: false },
    { id: 'beneficiaries', label: 'Beneficiaries Reached', type: 'text', required: false },
    { id: 'financialSummary', label: 'Financial Summary', type: 'textarea', required: false },
    { id: 'volunteers', label: 'Volunteer Summary', type: 'text', required: false },
    { id: 'lookingAhead', label: 'Looking Ahead', type: 'textarea', required: false },
    { id: 'trustees', label: 'Trustees / Board Members', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Annual Report', infoTable([['Organisation', or(d.orgName,'[Org]')],['Year', or(d.year,'[Year]')],['Beneficiaries', d.beneficiaries],['Volunteers', d.volunteers]])),
    d.chairMessage ? section("Chair's Message", `<p>${nl2br(d.chairMessage)}</p>`) : '',
    d.achievements ? section('Key Achievements', `<p>${nl2br(d.achievements)}</p>`) : '',
    d.financialSummary ? section('Financial Summary', `<p>${nl2br(d.financialSummary)}</p>`) : '',
    d.lookingAhead ? section('Looking Ahead', `<p>${nl2br(d.lookingAhead)}</p>`) : '',
    d.trustees ? section('Trustees / Board Members', `<p>${nl2br(d.trustees)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const safeguardingReferralForm = mk('safeguarding-referral', 'Safeguarding Referral Form', 'A safeguarding concern referral form for charities and community organisations.', ['safeguarding', 'referral', 'charity', 'children'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'referralDate', label: 'Date of Referral', type: 'date', required: false },
    { id: 'referrerName', label: 'Referrer Name', type: 'text', required: false },
    { id: 'referrerRole', label: 'Referrer Role', type: 'text', required: false },
    { id: 'concernedPersonName', label: 'Name of Person Concerned', type: 'text', required: false },
    { id: 'concernedPersonDob', label: 'Date of Birth (if known)', type: 'date', required: false },
    { id: 'natureOfConcern', label: 'Nature of Concern', type: 'textarea', required: false },
    { id: 'immediateAction', label: 'Immediate Action Taken', type: 'textarea', required: false },
    { id: 'referredTo', label: 'Referred To', type: 'text', required: false },
  ]}],
  (d) => [
    section('Safeguarding Referral', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.referralDate)],['Referrer', d.referrerName],['Role', d.referrerRole],['Person Concerned', d.concernedPersonName],['DOB', fmtDate(d.concernedPersonDob)],['Referred To', d.referredTo]])),
    d.natureOfConcern ? section('Nature of Concern', `<p>${nl2br(d.natureOfConcern)}</p>`) : '',
    d.immediateAction ? section('Immediate Action Taken', `<p>${nl2br(d.immediateAction)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_NONPROFIT_TEMPLATES: DocumentTemplate[] = [
  volunteerApplication, volunteerRegister, volunteerHoursLog,
  donationAcknowledgement, grantApplicationForm, membershipApplication,
  communityEventPlan, annualReport, safeguardingReferralForm,
];
