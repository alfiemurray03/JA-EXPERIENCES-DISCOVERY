/**
 * Company Administration batch:
 * Board Resolution, Change of Registered Office, Dividend Voucher,
 * Dividend Minute, Conflict of Interest Declaration, Director Declaration,
 * Company File Note, Annual Review Checklist, Expense Approval Form,
 * Petty Cash Record, Meeting Attendance Sheet, Document Control Sheet
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br } from './html-helpers';
import { DISCLAIMER } from './template-factory';

// ─── Board Resolution ─────────────────────────────────────────────────────────
export const boardResolution: DocumentTemplate = {
  id: 'board-resolution',
  name: 'Board Resolution',
  category: 'board-meeting',
  description: 'A written resolution of the board of directors on any matter requiring board approval.',
  icon: 'Gavel',
  planRequired: 'free',
  tags: ['board', 'resolution', 'directors', 'governance'],
  signatories: [{ label: 'Director 1' }, { label: 'Director 2' }],
  sections: [
    {
      id: 'company',
      title: 'Company Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'resolutionDate', label: 'Date of Resolution', type: 'date', required: true },
      ],
    },
    {
      id: 'resolution',
      title: 'Resolution',
      fields: [
        { id: 'resolutionTitle', label: 'Resolution Subject', type: 'text', required: true },
        { id: 'background', label: 'Background', type: 'textarea', required: false },
        { id: 'resolutionText', label: 'Resolution Text', type: 'textarea', required: true, placeholder: 'IT IS RESOLVED THAT...' },
        { id: 'directors', label: 'Directors Signing (one per line)', type: 'textarea', required: true, placeholder: 'Jane Smith — Managing Director\nJohn Brown — Finance Director' },
      ],
    },
  ],
  generateDocument: (data) => {
    const directorRows = (data.directors || '').split('\n').filter(Boolean).map(l => {
      const [name, role] = l.split('—').map(s => s.trim());
      return [name || l, role || '—'];
    });
    return [
      section('Company Information', infoTable([
        ['Company Name', or(data.companyName, '[Company Name]')],
        ['Registration Number', data.companyNumber],
        ['Date', or(data.resolutionDate, '[Date]')],
      ])),
      data.background ? section('Background', `<p>${nl2br(data.background)}</p>`) : '',
      section('Board Resolution',
        `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
          <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
          <p style="margin:0;">${nl2br(or(data.resolutionText, '[Resolution text]'))}</p>
        </div>`
      ),
      section('Signed by the Directors', dataTable(['Director Name', 'Role', 'Signature', 'Date'], directorRows.map(r => [...r, '', '']))),
    ].filter(Boolean).join('');
  },
};

// ─── Change of Registered Office ─────────────────────────────────────────────
export const changeOfRegisteredOffice: DocumentTemplate = {
  id: 'change-of-registered-office',
  name: 'Change of Registered Office Note',
  category: 'company-admin',
  description: 'An internal note recording a change of registered office address.',
  icon: 'MapPin',
  planRequired: 'free',
  tags: ['registered office', 'company admin', 'address change'],
  signatories: [{ label: 'Director / Company Secretary' }],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'changeDate', label: 'Effective Date of Change', type: 'date', required: true },
        { id: 'oldAddress', label: 'Previous Registered Address', type: 'textarea', required: true },
        { id: 'newAddress', label: 'New Registered Address', type: 'textarea', required: true },
        { id: 'authorisedBy', label: 'Authorised By', type: 'text', required: false },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Company Details', infoTable([
      ['Company Name', or(data.companyName, '[Company Name]')],
      ['Registration Number', data.companyNumber],
      ['Effective Date', or(data.changeDate, '[Date]')],
      ['Authorised By', data.authorisedBy],
    ])),
    section('Address Change', infoTable([
      ['Previous Address', or(data.oldAddress, '[Old Address]')],
      ['New Address', or(data.newAddress, '[New Address]')],
    ])),
    data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    `<p style="font-size:9pt;color:#6b7280;margin-top:12px;">Note: A Form AD01 must be filed at Companies House to formally register this change.</p>`,
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Dividend Voucher ─────────────────────────────────────────────────────────
export const dividendVoucher: DocumentTemplate = {
  id: 'dividend-voucher',
  name: 'Dividend Voucher',
  category: 'company-admin',
  description: 'A dividend voucher confirming a dividend payment to a shareholder.',
  icon: 'Banknote',
  planRequired: 'free',
  tags: ['dividend', 'voucher', 'shareholder', 'payment'],
  signatories: [{ label: 'Director / Company Secretary' }],
  sections: [
    {
      id: 'details',
      title: 'Dividend Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'voucherNumber', label: 'Voucher Number', type: 'text', required: false },
        { id: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
        { id: 'shareholderName', label: 'Shareholder Name', type: 'text', required: true },
        { id: 'shareholderAddress', label: 'Shareholder Address', type: 'textarea', required: false },
        { id: 'shareClass', label: 'Share Class', type: 'text', required: false, placeholder: 'e.g. Ordinary shares of £1 each' },
        { id: 'numberOfShares', label: 'Number of Shares Held', type: 'text', required: false },
        { id: 'dividendPerShare', label: 'Dividend Per Share', type: 'text', required: false },
        { id: 'grossAmount', label: 'Gross Dividend Amount', type: 'text', required: true },
        { id: 'taxCredit', label: 'Tax Credit (if applicable)', type: 'text', required: false },
        { id: 'netAmount', label: 'Net Amount Payable', type: 'text', required: true },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Company Details', infoTable([
      ['Company Name', or(data.companyName, '[Company Name]')],
      ['Registration Number', data.companyNumber],
      ['Voucher Number', data.voucherNumber],
      ['Payment Date', or(data.paymentDate, '[Date]')],
    ])),
    section('Shareholder Details', infoTable([
      ['Shareholder', or(data.shareholderName, '[Shareholder Name]')],
      ['Address', data.shareholderAddress],
      ['Share Class', data.shareClass],
      ['Shares Held', data.numberOfShares],
    ])),
    section('Dividend Payment', infoTable([
      ['Dividend Per Share', data.dividendPerShare],
      ['Gross Dividend', or(data.grossAmount, '—')],
      ['Tax Credit', data.taxCredit],
      ['Net Amount Payable', or(data.netAmount, '—')],
    ])),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Dividend Minute ──────────────────────────────────────────────────────────
export const dividendMinute: DocumentTemplate = {
  id: 'dividend-minute',
  name: 'Dividend Minute',
  category: 'company-admin',
  description: 'A board minute recording the declaration of a dividend.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['dividend', 'minute', 'board', 'company admin'],
  signatories: [{ label: 'Director' }, { label: 'Company Secretary' }],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'meetingDate', label: 'Date of Meeting / Resolution', type: 'date', required: true },
        { id: 'shareClass', label: 'Share Class', type: 'text', required: false },
        { id: 'dividendPerShare', label: 'Dividend Per Share', type: 'text', required: true },
        { id: 'totalDividend', label: 'Total Dividend Declared', type: 'text', required: true },
        { id: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
        { id: 'directors', label: 'Directors Present', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Company Details', infoTable([
      ['Company Name', or(data.companyName, '[Company Name]')],
      ['Registration Number', data.companyNumber],
      ['Date', or(data.meetingDate, '[Date]')],
    ])),
    data.directors ? section('Directors Present', `<p>${nl2br(data.directors)}</p>`) : '',
    section('Dividend Declaration',
      `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
        <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
        <p style="margin:0;">A dividend of <strong>${or(data.dividendPerShare, '[amount]')} per ${or(data.shareClass, 'ordinary share')}</strong>, totalling <strong>${or(data.totalDividend, '[total]')}</strong>, be and is hereby declared payable on <strong>${or(data.paymentDate, '[payment date]')}</strong> to shareholders on the register as at the date of this resolution.</p>
      </div>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Conflict of Interest Declaration ────────────────────────────────────────
export const conflictOfInterestDeclaration: DocumentTemplate = {
  id: 'conflict-of-interest-declaration',
  name: 'Conflict of Interest Declaration',
  category: 'company-admin',
  description: 'A declaration by a director, trustee, or employee of any actual or potential conflict of interest.',
  icon: 'Scale',
  planRequired: 'free',
  tags: ['conflict of interest', 'declaration', 'governance', 'director'],
  signatories: [{ label: 'Declarant' }, { label: 'Received By' }],
  sections: [
    {
      id: 'details',
      title: 'Declaration Details',
      fields: [
        { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
        { id: 'declarantName', label: 'Declarant Full Name', type: 'text', required: true },
        { id: 'declarantRole', label: 'Role / Position', type: 'text', required: false },
        { id: 'declarationDate', label: 'Declaration Date', type: 'date', required: true },
        { id: 'conflictDescription', label: 'Description of Conflict / Potential Conflict', type: 'textarea', required: true },
        { id: 'relationshipType', label: 'Nature of Interest', type: 'select', required: false, options: ['Financial interest', 'Personal relationship', 'Outside employment', 'Directorship / shareholding', 'Other'] },
        { id: 'proposedAction', label: 'Proposed Action to Manage Conflict', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Declaration Details', infoTable([
      ['Organisation', or(data.orgName, '[Organisation]')],
      ['Declarant', or(data.declarantName, '[Name]')],
      ['Role', data.declarantRole],
      ['Date', or(data.declarationDate, '[Date]')],
      ['Nature of Interest', data.relationshipType],
    ])),
    section('Declaration',
      `<p>I, <strong>${or(data.declarantName, '[Name]')}</strong>, hereby declare the following actual or potential conflict of interest:</p>
      <p>${nl2br(or(data.conflictDescription, '[Description]'))}</p>`
    ),
    data.proposedAction ? section('Proposed Management Action', `<p>${nl2br(data.proposedAction)}</p>`) : '',
    section('Confirmation',
      `<p>I confirm that the above information is accurate and complete to the best of my knowledge. I understand my obligation to update this declaration if circumstances change.</p>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Director Declaration ─────────────────────────────────────────────────────
export const directorDeclaration: DocumentTemplate = {
  id: 'director-declaration',
  name: 'Director Declaration',
  category: 'company-admin',
  description: 'A general declaration by a director confirming eligibility, interests, or other matters.',
  icon: 'UserCheck',
  planRequired: 'free',
  tags: ['director', 'declaration', 'company admin', 'governance'],
  signatories: [{ label: 'Director' }],
  sections: [
    {
      id: 'details',
      title: 'Declaration Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'directorName', label: 'Director Full Name', type: 'text', required: true },
        { id: 'declarationDate', label: 'Date', type: 'date', required: true },
        { id: 'declarationType', label: 'Type of Declaration', type: 'text', required: true, placeholder: 'e.g. Eligibility to Act, Interests Declaration, Fitness & Propriety' },
        { id: 'declarationContent', label: 'Declaration Content', type: 'textarea', required: true },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Declaration Details', infoTable([
      ['Company', or(data.companyName, '[Company]')],
      ['Director', or(data.directorName, '[Director]')],
      ['Date', or(data.declarationDate, '[Date]')],
      ['Type', or(data.declarationType, '[Type]')],
    ])),
    section('Declaration',
      `<p>I, <strong>${or(data.directorName, '[Director Name]')}</strong>, hereby declare as follows:</p>
      <p>${nl2br(or(data.declarationContent, '[Declaration content]'))}</p>
      <p>I confirm that the above is true and accurate to the best of my knowledge.</p>`
    ),
  ].filter(Boolean).join(''),
};

// ─── Company File Note ────────────────────────────────────────────────────────
export const companyFileNote: DocumentTemplate = {
  id: 'company-file-note',
  name: 'Company File Note',
  category: 'company-admin',
  description: 'An internal file note recording a decision, conversation, or event for the company record.',
  icon: 'StickyNote',
  planRequired: 'free',
  tags: ['file note', 'company admin', 'record', 'internal'],
  sections: [
    {
      id: 'details',
      title: 'Note Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'noteDate', label: 'Date', type: 'date', required: true },
        { id: 'preparedBy', label: 'Prepared By', type: 'text', required: true },
        { id: 'subject', label: 'Subject', type: 'text', required: true },
        { id: 'content', label: 'Note Content', type: 'textarea', required: true },
        { id: 'actionRequired', label: 'Action Required', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('File Note Details', infoTable([
      ['Company', or(data.companyName, '[Company]')],
      ['Date', or(data.noteDate, '[Date]')],
      ['Prepared By', or(data.preparedBy, '[Name]')],
      ['Subject', or(data.subject, '[Subject]')],
    ])),
    section('Note', `<p>${nl2br(or(data.content, '[Note content]'))}</p>`),
    data.actionRequired ? section('Action Required', `<p>${nl2br(data.actionRequired)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Annual Review Checklist ──────────────────────────────────────────────────
export const annualReviewChecklist: DocumentTemplate = {
  id: 'annual-review-checklist',
  name: 'Annual Review Checklist',
  category: 'company-admin',
  description: 'An annual compliance and review checklist for companies.',
  icon: 'ClipboardCheck',
  planRequired: 'free',
  tags: ['annual review', 'checklist', 'compliance', 'company admin'],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'reviewYear', label: 'Review Year', type: 'text', required: true, placeholder: 'e.g. 2026' },
        { id: 'reviewDate', label: 'Review Date', type: 'date', required: true },
        { id: 'reviewedBy', label: 'Reviewed By', type: 'text', required: false },
        { id: 'customItems', label: 'Additional Checklist Items (one per line)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const standardItems = [
      'Confirmation Statement filed at Companies House',
      'Annual accounts prepared and filed',
      'Corporation tax return submitted',
      'VAT returns up to date',
      'PAYE / payroll records reviewed',
      'Director details confirmed and up to date',
      'Shareholder register reviewed',
      'Registered office address confirmed',
      'Insurance policies reviewed and renewed',
      'Data protection obligations reviewed',
      'Employment contracts reviewed',
      'Health & safety assessment completed',
      'Bank mandates and signatories reviewed',
      'Company policies reviewed and updated',
    ];
    const customItems = (data.customItems || '').split('\n').filter(Boolean);
    const allItems = [...standardItems, ...customItems];
    const checkboxRows = allItems.map(item => [
      `<span style="display:inline-block;width:14px;height:14px;border:1.5px solid #1B4F8A;border-radius:2px;margin-right:8px;vertical-align:middle;"></span>`,
      item
    ]);
    return [
      section('Review Details', infoTable([
        ['Company', or(data.companyName, '[Company]')],
        ['Review Year', or(data.reviewYear, '[Year]')],
        ['Review Date', or(data.reviewDate, '[Date]')],
        ['Reviewed By', data.reviewedBy],
      ])),
      section('Annual Review Checklist',
        `<table class="pdf-table"><thead><tr><th style="width:40px;">Done</th><th>Item</th></tr></thead><tbody>${checkboxRows.map(([cb, item]) => `<tr><td>${cb}</td><td>${item}</td></tr>`).join('')}</tbody></table>`
      ),
    ].join('');
  },
};

// ─── Expense Approval Form ────────────────────────────────────────────────────
export const expenseApprovalForm: DocumentTemplate = {
  id: 'expense-approval-form',
  name: 'Expense Approval Form',
  category: 'company-admin',
  description: 'A form for requesting and approving business expense reimbursements.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['expense', 'approval', 'reimbursement', 'finance'],
  signatories: [{ label: 'Claimant' }, { label: 'Approver' }],
  sections: [
    {
      id: 'details',
      title: 'Claim Details',
      fields: [
        { id: 'claimantName', label: 'Claimant Name', type: 'text', required: true },
        { id: 'department', label: 'Department', type: 'text', required: false },
        { id: 'claimDate', label: 'Claim Date', type: 'date', required: true },
        { id: 'period', label: 'Expense Period', type: 'text', required: false, placeholder: 'e.g. May 2026' },
        { id: 'expenses', label: 'Expenses (Date | Description | Category | Amount)', type: 'textarea', required: true, placeholder: '01 May 2026 | Train to London | Travel | £45.00\n03 May 2026 | Client lunch | Entertainment | £32.50' },
        { id: 'totalAmount', label: 'Total Amount Claimed', type: 'text', required: true },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.expenses || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    return [
      section('Claim Details', infoTable([
        ['Claimant', or(data.claimantName, '[Name]')],
        ['Department', data.department],
        ['Claim Date', or(data.claimDate, '[Date]')],
        ['Expense Period', data.period],
      ])),
      section('Expenses', dataTable(['Date', 'Description', 'Category', 'Amount'], rows)),
      section('Total', infoTable([['Total Amount Claimed', or(data.totalAmount, '—')]])),
      data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Petty Cash Record ────────────────────────────────────────────────────────
export const pettyCashRecord: DocumentTemplate = {
  id: 'petty-cash-record',
  name: 'Petty Cash Record',
  category: 'company-admin',
  description: 'A record of petty cash transactions, receipts, and balances.',
  icon: 'Coins',
  planRequired: 'free',
  tags: ['petty cash', 'finance', 'record', 'cash'],
  sections: [
    {
      id: 'details',
      title: 'Record Details',
      fields: [
        { id: 'orgName', label: 'Organisation', type: 'text', required: true },
        { id: 'period', label: 'Period', type: 'text', required: true, placeholder: 'e.g. June 2026' },
        { id: 'custodian', label: 'Petty Cash Custodian', type: 'text', required: false },
        { id: 'openingBalance', label: 'Opening Balance', type: 'text', required: false },
        { id: 'transactions', label: 'Transactions (Date | Description | Receipt No. | Amount In | Amount Out)', type: 'textarea', required: true, placeholder: '01 Jun 2026 | Office supplies | R001 | — | £12.50\n05 Jun 2026 | Top-up | — | £50.00 | —' },
        { id: 'closingBalance', label: 'Closing Balance', type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.transactions || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || ''];
    });
    return [
      section('Record Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Period', or(data.period, '[Period]')],
        ['Custodian', data.custodian],
        ['Opening Balance', data.openingBalance],
      ])),
      section('Transactions', dataTable(['Date', 'Description', 'Receipt No.', 'Amount In', 'Amount Out'], rows)),
      section('Balance', infoTable([['Closing Balance', data.closingBalance || '—']])),
    ].filter(Boolean).join('');
  },
};

// ─── Meeting Attendance Sheet ─────────────────────────────────────────────────
export const meetingAttendanceSheet: DocumentTemplate = {
  id: 'meeting-attendance-sheet',
  name: 'Meeting Attendance Sheet',
  category: 'company-admin',
  description: 'An attendance register for meetings, training sessions, or events.',
  icon: 'UserCheck',
  planRequired: 'free',
  tags: ['attendance', 'meeting', 'register', 'record'],
  sections: [
    {
      id: 'details',
      title: 'Meeting Details',
      fields: [
        { id: 'meetingTitle', label: 'Meeting / Event Title', type: 'text', required: true },
        { id: 'meetingDate', label: 'Date', type: 'date', required: true },
        { id: 'meetingTime', label: 'Time', type: 'text', required: false },
        { id: 'location', label: 'Location', type: 'text', required: false },
        { id: 'chair', label: 'Chair / Facilitator', type: 'text', required: false },
        { id: 'attendees', label: 'Attendees (one per line: Name | Organisation | Role)', type: 'textarea', required: true, placeholder: 'Jane Smith | ABC Ltd | Director\nJohn Brown | XYZ Ltd | Manager' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.attendees || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || l, parts[1] || '—', parts[2] || '—', ''];
    });
    return [
      section('Meeting Details', infoTable([
        ['Meeting', or(data.meetingTitle, '[Meeting Title]')],
        ['Date', or(data.meetingDate, '[Date]')],
        ['Time', data.meetingTime],
        ['Location', data.location],
        ['Chair', data.chair],
      ])),
      section('Attendance Register', dataTable(['Name', 'Organisation', 'Role', 'Signature'], rows)),
    ].join('');
  },
};

// ─── Document Control Sheet ───────────────────────────────────────────────────
export const documentControlSheet: DocumentTemplate = {
  id: 'document-control-sheet',
  name: 'Document Control Sheet',
  category: 'company-admin',
  description: 'A document control record tracking versions, approvals, and distribution of a document.',
  icon: 'FileStack',
  planRequired: 'free',
  tags: ['document control', 'version', 'approval', 'record'],
  sections: [
    {
      id: 'details',
      title: 'Document Details',
      fields: [
        { id: 'documentTitle', label: 'Document Title', type: 'text', required: true },
        { id: 'documentRef', label: 'Document Reference', type: 'text', required: false },
        { id: 'currentVersion', label: 'Current Version', type: 'text', required: false, placeholder: 'e.g. v1.2' },
        { id: 'owner', label: 'Document Owner', type: 'text', required: false },
        { id: 'reviewDate', label: 'Next Review Date', type: 'date', required: false },
        { id: 'versionHistory', label: 'Version History (Version | Date | Author | Changes)', type: 'textarea', required: false, placeholder: 'v1.0 | 01 Jan 2026 | Jane Smith | Initial version\nv1.1 | 01 Mar 2026 | John Brown | Section 3 updated' },
        { id: 'distribution', label: 'Distribution List (Name | Role | Date Issued)', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const versionRows = (data.versionHistory || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    const distRows = (data.distribution || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Document Details', infoTable([
        ['Document Title', or(data.documentTitle, '[Document Title]')],
        ['Reference', data.documentRef],
        ['Current Version', data.currentVersion],
        ['Document Owner', data.owner],
        ['Next Review Date', data.reviewDate],
      ])),
      versionRows.length ? section('Version History', dataTable(['Version', 'Date', 'Author', 'Changes'], versionRows)) : '',
      distRows.length ? section('Distribution List', dataTable(['Name', 'Role', 'Date Issued'], distRows)) : '',
    ].filter(Boolean).join('');
  },
};
