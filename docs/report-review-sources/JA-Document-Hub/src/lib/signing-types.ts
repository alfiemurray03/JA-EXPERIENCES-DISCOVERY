/** Shared types for Document Signing feature */

export type SigningStatus = 'draft' | 'sent' | 'viewed' | 'partially_signed' | 'completed' | 'declined' | 'expired' | 'cancelled';
export type SignerStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
export type FieldType = 'signature' | 'initials' | 'name' | 'date' | 'checkbox' | 'text' | 'company_name' | 'job_title' | 'email_address' | 'custom';
export type SignerOrder = 'any' | 'sequential';

export interface SigningRequest {
  id: number;
  uuid: string;
  userId: number;
  title: string;
  message: string | null;
  documentPath: string | null;
  documentName: string | null;
  documentHash: string | null;
  status: SigningStatus;
  signerOrder: SignerOrder;
  expiresAt: string | null;
  reminderDays: number | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  // enriched
  signerCount?: number;
  signedCount?: number;
}

export interface SigningSigner {
  id: number;
  uuid: string;
  requestId: number;
  email: string;
  name: string;
  role: string | null;
  order: number;
  status: SignerStatus;
  token: string;
  tokenExpiresAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface SigningField {
  id?: number;
  uuid: string;
  requestId?: number;
  signerId: string; // signer UUID
  fieldType: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  label: string | null;
  value: string | null;
  filledAt?: string | null;
}

export interface SigningAuditEntry {
  id: number;
  requestId: number;
  signerId: number | null;
  userId: number | null;
  adminId: number | null;
  event: string;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  signerEmail: string | null;
  authMethod: string | null;
  createdAt: string;
}

export interface SigningAttachment {
  id: number;
  uuid: string;
  requestId: number;
  uploadedBy: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  fileHash: string | null;
  visibleToSigners: boolean;
  appendToFinalPack: boolean;
  createdAt: string;
}

export const STATUS_LABELS: Record<SigningStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partially_signed: 'Partially Signed',
  completed: 'Completed',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<SigningStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  partially_signed: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export const SIGNER_STATUS_COLORS: Record<SignerStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  signed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  signature:     'Signature',
  initials:      'Initials',
  name:          'Full Name',
  date:          'Date',
  checkbox:      'Checkbox',
  text:          'Text Field',
  company_name:  'Company Name',
  job_title:     'Job Title',
  email_address: 'Email Address',
  custom:        'Custom Field',
};

export const AUDIT_EVENT_LABELS: Record<string, string> = {
  document_created:    'Document Created',
  document_uploaded:   'Document Uploaded',
  attachment_uploaded: 'Attachment Uploaded',
  attachment_deleted:  'Attachment Deleted',
  attachment_viewed:   'Attachment Viewed',
  signer_added:        'Signer Added',
  email_sent:          'Email Sent',
  reminder_sent:       'Reminder Sent',
  email_failed:        'Email Failed',
  document_viewed:     'Document Viewed',
  page_viewed:         'Page Viewed',
  signature_added:     'Signature Added',
  field_completed:     'Field Completed',
  signed:              'Document Signed',
  declined:            'Declined',
  cancelled:           'Cancelled',
  completed:           'Completed',
  completion_email_sent: 'Completion Email Sent',
  sent:                'Request Sent',
};
