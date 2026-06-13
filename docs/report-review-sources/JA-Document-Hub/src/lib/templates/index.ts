// ─── Original templates ───────────────────────────────────────────────────────
import { boardMeetingMinutes } from './board-meeting-minutes';
import { directorResolution } from './director-resolution';
import { shareholderResolution } from './shareholder-resolution';
import { employmentOfferLetter } from './employment-offer-letter';
import { privacyPolicy } from './privacy-policy';
import { complaintResponse } from './complaint-response';
import { travelAuthorisation } from './travel-authorisation';
import { consentLetter } from './consent-letter';
import { generalFormalLetter } from './general-formal-letter';
import { warningLetter } from './warning-letter';
import { appointmentOfDirector } from './appointment-of-director';
import { complaintsPolicy } from './complaints-policy';
import { freelanceContractorAgreement } from './freelance-contractor-agreement';
import { serviceAgreement } from './service-agreement';
import { invoiceTemplate } from './invoice-template';
import { nonDisclosureAgreement } from './non-disclosure-agreement';
import { resignationLetter } from './resignation-letter';
import { tenancyAgreement } from './tenancy-agreement';

// ─── Invoice-family templates ─────────────────────────────────────────────────
import { ALL_INVOICE_TEMPLATES } from './invoices-batch';

// ─── Business Documents ───────────────────────────────────────────────────────
import {
  meetingAgenda, meetingNotes, actionLog, decisionLog, projectPlan, businessPlan,
  serviceProposal, quoteTemplate, estimateTemplate, receiptTemplate, purchaseOrder,
  deliveryNote, clientAgreement, supplierAgreement, partnershipAgreement,
  memorandumOfUnderstanding, businessLetter, formalNotice, internalMemo,
  companyAnnouncement, riskRegister, issueRegister, incidentLog, complaintLog,
} from './business-documents';

// ─── Company Admin ────────────────────────────────────────────────────────────
import {
  boardResolution, changeOfRegisteredOffice, dividendVoucher, dividendMinute,
  conflictOfInterestDeclaration, directorDeclaration, companyFileNote,
  annualReviewChecklist, expenseApprovalForm, pettyCashRecord,
  meetingAttendanceSheet, documentControlSheet,
} from './company-admin';

// ─── Policies ─────────────────────────────────────────────────────────────────
import {
  dataProtectionPolicy, cookiePolicy, retentionPolicy, infoSecurityPolicy,
  acceptableUsePolicy, refundPolicy, shippingPolicy, termsAndConditions,
  websiteTermsOfUse, accessibilityStatement, equalityDiversityPolicy,
  safeguardingPolicy, healthSafetyPolicy, loneWorkingPolicy, remoteWorkingPolicy,
  antiBullyingPolicy, antiHarassmentPolicy, whistleblowingPolicy, socialMediaPolicy,
  modernSlaveryStatement, environmentalPolicy, codeOfConduct, fireSafetyPolicy,
} from './policies-batch';

// ─── HR & Employment ──────────────────────────────────────────────────────────
import {
  employmentContract, zeroHoursAgreement, volunteerAgreement, internshipAgreement,
  jobDescription, inductionChecklist, probationReviewForm, appraisalForm,
  holidayRequestForm, disciplinaryInviteLetter, disciplinaryOutcomeLetter,
  grievanceForm, flexibleWorkingRequest, resignationAcknowledgement,
  referenceRequestLetter, equipmentIssueForm, leaverChecklist, returnToWorkForm,
} from './hr-batch';

// ─── Consumer Documents ───────────────────────────────────────────────────────
import {
  complaintLetter, refundRequestLetter, cancellationLetter, formalRequestLetter,
  letterBeforeComplaint, consumerRightsComplaint, deliveryIssueLetter,
  faultyGoodsLetter, subjectAccessRequest, dataDeletionRequest,
  witnessStatement, timelineOfEvents,
} from './consumer-batch';

// ─── Charity / Community ──────────────────────────────────────────────────────
import {
  trusteeMeetingMinutes, trusteeResolution, donationReceipt, riskAssessment,
  eventPlan, grantApplicationDraft,
} from './charity-education-batch';

// ─── Education / School / Youth ───────────────────────────────────────────────
import {
  lessonPlan, tripConsentForm, attendanceSheet, certificateTemplate,
} from './charity-education-batch';

// ─── Property / Home ─────────────────────────────────────────────────────────
import {
  repairRequestLetter, inspectionChecklist, inventoryChecklist, maintenanceLog,
} from './property-care-reports-forms-letters-batch';

// ─── Care / Support ───────────────────────────────────────────────────────────
import {
  careSupportPlan, emergencyContactSheet, reasonableAdjustmentRequest,
} from './property-care-reports-forms-letters-batch';

// ─── Reports ──────────────────────────────────────────────────────────────────
import {
  incidentReport, monthlyReport, auditReport,
} from './property-care-reports-forms-letters-batch';

// ─── Forms ────────────────────────────────────────────────────────────────────
import {
  feedbackForm, registrationForm, bookingForm, referralForm,
} from './property-care-reports-forms-letters-batch';

// ─── Letters ─────────────────────────────────────────────────────────────────
import {
  apologyLetter, invitationLetter, confirmationLetter, reminderLetter,
  thankYouLetter, referenceLetter, followUpLetter, disputeLetter,
} from './property-care-reports-forms-letters-batch';

// ─── NEW: Marketing ───────────────────────────────────────────────────────────
import { ALL_MARKETING_TEMPLATES } from './marketing-batch';

// ─── NEW: IT & Technology ─────────────────────────────────────────────────────
import { ALL_IT_TECH_TEMPLATES } from './it-tech-batch';

// ─── NEW: Healthcare ──────────────────────────────────────────────────────────
import { ALL_HEALTHCARE_TEMPLATES } from './healthcare-batch';

// ─── NEW: Construction & Trades ───────────────────────────────────────────────
import { ALL_CONSTRUCTION_TEMPLATES } from './construction-batch';

// ─── NEW: Hospitality & Events ────────────────────────────────────────────────
import { ALL_HOSPITALITY_TEMPLATES } from './hospitality-batch';

// ─── NEW: Nonprofit & Voluntary ───────────────────────────────────────────────
import { ALL_NONPROFIT_TEMPLATES } from './nonprofit-batch';

// ─── NEW: Real Estate ─────────────────────────────────────────────────────────
import { ALL_REAL_ESTATE_TEMPLATES } from './real-estate-batch';

// ─── NEW: Personal Finance ────────────────────────────────────────────────────
import { ALL_PERSONAL_FINANCE_TEMPLATES } from './personal-finance-batch';

// ─── NEW: Creative & Media ────────────────────────────────────────────────────
import { ALL_CREATIVE_TEMPLATES } from './creative-batch';

// ─── NEW: Logistics & Supply Chain ────────────────────────────────────────────
import { ALL_LOGISTICS_TEMPLATES } from './logistics-batch';

// ─── NEW: General (personal planners, sports, education, ops) ─────────────────
import { ALL_GENERAL_TEMPLATES } from './general-batch';

import type { DocumentTemplate, TemplateCategory } from '../document-types';

export const ALL_TEMPLATES: DocumentTemplate[] = [
  // ── Corporate & Governance ──────────────────────────────────────────────────
  boardMeetingMinutes,
  boardResolution,
  directorResolution,
  shareholderResolution,
  appointmentOfDirector,
  // ── Company Admin ───────────────────────────────────────────────────────────
  changeOfRegisteredOffice,
  dividendVoucher,
  dividendMinute,
  conflictOfInterestDeclaration,
  directorDeclaration,
  companyFileNote,
  annualReviewChecklist,
  expenseApprovalForm,
  pettyCashRecord,
  meetingAttendanceSheet,
  documentControlSheet,
  // ── Business Documents ──────────────────────────────────────────────────────
  meetingAgenda,
  meetingNotes,
  actionLog,
  decisionLog,
  projectPlan,
  businessPlan,
  serviceProposal,
  internalMemo,
  companyAnnouncement,
  riskRegister,
  issueRegister,
  incidentLog,
  complaintLog,
  // ── Finance ─────────────────────────────────────────────────────────────────
  invoiceTemplate,
  quoteTemplate,
  estimateTemplate,
  receiptTemplate,
  purchaseOrder,
  deliveryNote,
  // ── Contracts & Agreements ──────────────────────────────────────────────────
  freelanceContractorAgreement,
  serviceAgreement,
  clientAgreement,
  supplierAgreement,
  partnershipAgreement,
  memorandumOfUnderstanding,
  nonDisclosureAgreement,
  tenancyAgreement,
  // ── HR & Employment ─────────────────────────────────────────────────────────
  employmentOfferLetter,
  employmentContract,
  zeroHoursAgreement,
  volunteerAgreement,
  internshipAgreement,
  jobDescription,
  inductionChecklist,
  probationReviewForm,
  appraisalForm,
  holidayRequestForm,
  warningLetter,
  disciplinaryInviteLetter,
  disciplinaryOutcomeLetter,
  grievanceForm,
  flexibleWorkingRequest,
  resignationLetter,
  resignationAcknowledgement,
  referenceRequestLetter,
  equipmentIssueForm,
  leaverChecklist,
  returnToWorkForm,
  // ── Policies & Compliance ───────────────────────────────────────────────────
  privacyPolicy,
  dataProtectionPolicy,
  cookiePolicy,
  retentionPolicy,
  infoSecurityPolicy,
  acceptableUsePolicy,
  complaintsPolicy,
  refundPolicy,
  shippingPolicy,
  termsAndConditions,
  websiteTermsOfUse,
  accessibilityStatement,
  equalityDiversityPolicy,
  safeguardingPolicy,
  healthSafetyPolicy,
  loneWorkingPolicy,
  fireSafetyPolicy,
  remoteWorkingPolicy,
  antiBullyingPolicy,
  antiHarassmentPolicy,
  whistleblowingPolicy,
  socialMediaPolicy,
  modernSlaveryStatement,
  environmentalPolicy,
  codeOfConduct,
  // ── Consumer Documents ──────────────────────────────────────────────────────
  complaintLetter,
  refundRequestLetter,
  cancellationLetter,
  formalRequestLetter,
  letterBeforeComplaint,
  consumerRightsComplaint,
  deliveryIssueLetter,
  faultyGoodsLetter,
  subjectAccessRequest,
  dataDeletionRequest,
  witnessStatement,
  timelineOfEvents,
  // ── Complaints ──────────────────────────────────────────────────────────────
  complaintResponse,
  // ── Charity & Community ─────────────────────────────────────────────────────
  trusteeMeetingMinutes,
  trusteeResolution,
  donationReceipt,
  riskAssessment,
  eventPlan,
  grantApplicationDraft,
  // ── Education / School / Youth ──────────────────────────────────────────────
  lessonPlan,
  tripConsentForm,
  attendanceSheet,
  certificateTemplate,
  // ── Property & Home ─────────────────────────────────────────────────────────
  repairRequestLetter,
  inspectionChecklist,
  inventoryChecklist,
  maintenanceLog,
  // ── Care & Support ──────────────────────────────────────────────────────────
  careSupportPlan,
  emergencyContactSheet,
  reasonableAdjustmentRequest,
  // ── Reports ─────────────────────────────────────────────────────────────────
  incidentReport,
  monthlyReport,
  auditReport,
  // ── Forms ───────────────────────────────────────────────────────────────────
  feedbackForm,
  registrationForm,
  bookingForm,
  referralForm,
  // ── Letters ─────────────────────────────────────────────────────────────────
  businessLetter,
  formalNotice,
  apologyLetter,
  invitationLetter,
  confirmationLetter,
  reminderLetter,
  thankYouLetter,
  referenceLetter,
  followUpLetter,
  disputeLetter,
  // ── Personal / General ──────────────────────────────────────────────────────
  consentLetter,
  travelAuthorisation,
  generalFormalLetter,
  // ── NEW CATEGORIES ──────────────────────────────────────────────────────────
  ...ALL_MARKETING_TEMPLATES,
  ...ALL_IT_TECH_TEMPLATES,
  ...ALL_HEALTHCARE_TEMPLATES,
  ...ALL_CONSTRUCTION_TEMPLATES,
  ...ALL_HOSPITALITY_TEMPLATES,
  ...ALL_NONPROFIT_TEMPLATES,
  ...ALL_REAL_ESTATE_TEMPLATES,
  ...ALL_PERSONAL_FINANCE_TEMPLATES,
  ...ALL_CREATIVE_TEMPLATES,
  ...ALL_LOGISTICS_TEMPLATES,
  ...ALL_GENERAL_TEMPLATES,
  // Invoice-family
  ...ALL_INVOICE_TEMPLATES,
];

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): DocumentTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string): DocumentTemplate[] {
  const q = query.toLowerCase();
  return ALL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
  );
}

/** Group templates by category, returning only categories that have templates */
export function getTemplatesByGroup(): Array<{ category: TemplateCategory; templates: DocumentTemplate[] }> {
  const groups = new Map<TemplateCategory, DocumentTemplate[]>();
  for (const t of ALL_TEMPLATES) {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category)!.push(t);
  }
  return Array.from(groups.entries()).map(([category, templates]) => ({ category, templates }));
}

/** Total template count — useful for display */
export const TEMPLATE_COUNT = ALL_TEMPLATES.length;
