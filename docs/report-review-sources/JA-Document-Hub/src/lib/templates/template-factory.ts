/**
 * Template factory helpers for quickly building common document patterns.
 * Used by the many simpler templates that share the same structure.
 */
import type { DocumentTemplate, TemplateCategory, TemplateSection } from '../document-types';
import { section, infoTable, or, nl2br, clause, dataTable } from './html-helpers';

export { section, infoTable, or, nl2br, clause, dataTable };

/** Build a simple letter template */
export function letterTemplate(opts: {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: string;
  tags: string[];
  extraSections?: TemplateSection[];
  generate: (data: Record<string, string>) => string;
}): DocumentTemplate {
  return {
    id: opts.id,
    name: opts.name,
    category: opts.category,
    description: opts.description,
    icon: opts.icon,
    planRequired: 'free',
    tags: opts.tags,
    signatories: [{ label: 'Sender' }],
    sections: [
      {
        id: 'sender',
        title: 'Your Details',
        fields: [
          { id: 'senderName', label: 'Your Full Name', type: 'text', required: true },
          { id: 'senderOrg', label: 'Organisation (if applicable)', type: 'text', required: false },
          { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: false },
          { id: 'senderEmail', label: 'Your Email', type: 'email', required: false },
          { id: 'senderPhone', label: 'Your Phone', type: 'phone', required: false },
          { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        ],
      },
      {
        id: 'recipient',
        title: 'Recipient Details',
        fields: [
          { id: 'recipientName', label: 'Recipient Name / Title', type: 'text', required: true },
          { id: 'recipientOrg', label: 'Organisation (if applicable)', type: 'text', required: false },
          { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: false },
        ],
      },
      ...(opts.extraSections || []),
    ],
    generateDocument: opts.generate,
  };
}

/** Build a standard form/checklist template */
export function formTemplate(opts: {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: string;
  tags: string[];
  sections: TemplateSection[];
  generate: (data: Record<string, string>) => string;
}): DocumentTemplate {
  return {
    id: opts.id,
    name: opts.name,
    category: opts.category,
    description: opts.description,
    icon: opts.icon,
    planRequired: 'free',
    tags: opts.tags,
    sections: opts.sections,
    generateDocument: opts.generate,
  };
}

/** Shared letter header block */
export function letterHeader(data: Record<string, string>): string {
  return section('Correspondence Details', infoTable([
    ['From', [or(data.senderName, '[Sender Name]'), data.senderOrg].filter(Boolean).join(', ')],
    ['Address', data.senderAddress],
    ['Email', data.senderEmail],
    ['Phone', data.senderPhone],
    ['Date', or(data.letterDate, '[Date]')],
    ['To', [or(data.recipientName, '[Recipient]'), data.recipientOrg].filter(Boolean).join(', ')],
    ['Recipient Address', data.recipientAddress],
  ]));
}

/** Shared disclaimer footer */
export const DISCLAIMER = `<div class="pdf-notice" style="margin-top:20px;padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-size:7.5pt;color:#9ca3af;font-family:Arial,sans-serif;">
  <strong>Disclaimer:</strong> This template is for general document preparation only and does not replace professional legal, financial, medical, tax, immigration, or regulated advice.
</div>`;
