/**
 * Business Documents batch:
 * Meeting Agenda, Meeting Notes, Action Log, Decision Log, Project Plan,
 * Business Plan, Service Proposal, Quote, Estimate, Receipt, Purchase Order,
 * Delivery Note, Client Agreement, Supplier Agreement, Partnership Agreement,
 * MOU, Business Letter, Formal Notice, Internal Memo, Company Announcement,
 * Risk Register, Issue Register, Incident Log, Complaint Log
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br, clause } from './html-helpers';
import { DISCLAIMER } from './template-factory';

// ─── Meeting Agenda ───────────────────────────────────────────────────────────
export const meetingAgenda: DocumentTemplate = {
  id: 'meeting-agenda',
  name: 'Meeting Agenda',
  category: 'business',
  description: 'A structured agenda for any business meeting, listing items, owners, and time allocations.',
  icon: 'ListChecks',
  planRequired: 'free',
  tags: ['meeting', 'agenda', 'business'],
  sections: [
    {
      id: 'meeting',
      title: 'Meeting Details',
      fields: [
        { id: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true },
        { id: 'meetingDate', label: 'Date', type: 'date', required: true },
        { id: 'meetingTime', label: 'Time', type: 'text', required: false, placeholder: 'e.g. 10:00 AM' },
        { id: 'location', label: 'Location / Platform', type: 'text', required: false },
        { id: 'chair', label: 'Chair', type: 'text', required: false },
        { id: 'attendees', label: 'Invited Attendees', type: 'textarea', required: false },
        { id: 'agendaItems', label: 'Agenda Items (one per line: Item | Owner | Time)', type: 'textarea', required: true, placeholder: 'Welcome & Introductions | Chair | 5 min\nQ3 Financial Review | Finance Director | 20 min\nAOB | All | 10 min' },
        { id: 'objectives', label: 'Meeting Objectives', type: 'textarea', required: false },
        { id: 'preReading', label: 'Pre-Reading / Documents', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.agendaItems || '').split('\n').filter(Boolean).map((l, i) => {
      const [item, owner, time] = l.split('|').map(s => s.trim());
      return [`${i + 1}`, item || l, owner || '—', time || '—'];
    });
    return [
      section('Meeting Details', infoTable([
        ['Meeting', or(data.meetingTitle, '[Meeting Title]')],
        ['Date', or(data.meetingDate, '[Date]')],
        ['Time', data.meetingTime],
        ['Location', data.location],
        ['Chair', data.chair],
      ])),
      data.attendees ? section('Invited Attendees', `<p>${nl2br(data.attendees)}</p>`) : '',
      data.objectives ? section('Meeting Objectives', `<p>${nl2br(data.objectives)}</p>`) : '',
      section('Agenda', dataTable(['#', 'Item', 'Owner', 'Time'], rows)),
      data.preReading ? section('Pre-Reading & Documents', `<p>${nl2br(data.preReading)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Meeting Notes ────────────────────────────────────────────────────────────
export const meetingNotes: DocumentTemplate = {
  id: 'meeting-notes',
  name: 'Meeting Notes',
  category: 'business',
  description: 'Informal notes from a business meeting, capturing key points, decisions, and actions.',
  icon: 'NotebookPen',
  planRequired: 'free',
  tags: ['meeting', 'notes', 'business'],
  sections: [
    {
      id: 'meeting',
      title: 'Meeting Details',
      fields: [
        { id: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true },
        { id: 'meetingDate', label: 'Date', type: 'date', required: true },
        { id: 'attendees', label: 'Attendees', type: 'textarea', required: false },
        { id: 'keyPoints', label: 'Key Points Discussed', type: 'textarea', required: true },
        { id: 'decisions', label: 'Decisions Made', type: 'textarea', required: false },
        { id: 'actions', label: 'Actions (Name | Action | Deadline)', type: 'textarea', required: false, placeholder: 'Jane Smith | Send report | 10 Jun 2026' },
        { id: 'nextMeeting', label: 'Next Meeting Date', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const actionRows = (data.actions || '').split('\n').filter(Boolean).map(l => {
      const [name, action, deadline] = l.split('|').map(s => s.trim());
      return [name || l, action || '—', deadline || '—'];
    });
    return [
      section('Meeting Details', infoTable([
        ['Meeting', or(data.meetingTitle, '[Meeting Title]')],
        ['Date', or(data.meetingDate, '[Date]')],
        ['Attendees', data.attendees],
      ])),
      section('Key Points', `<p>${nl2br(or(data.keyPoints, '[Key points]'))}</p>`),
      data.decisions ? section('Decisions Made', `<p>${nl2br(data.decisions)}</p>`) : '',
      actionRows.length ? section('Action Items', dataTable(['Responsible', 'Action', 'Deadline'], actionRows)) : '',
      data.nextMeeting ? section('Next Meeting', infoTable([['Date', data.nextMeeting]])) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Action Log ───────────────────────────────────────────────────────────────
export const actionLog: DocumentTemplate = {
  id: 'action-log',
  name: 'Action Log',
  category: 'business',
  description: 'A running log of actions, owners, deadlines, and status for a project or team.',
  icon: 'CheckSquare',
  planRequired: 'free',
  tags: ['action', 'log', 'project', 'tasks'],
  sections: [
    {
      id: 'details',
      title: 'Log Details',
      fields: [
        { id: 'projectName', label: 'Project / Team Name', type: 'text', required: true },
        { id: 'logDate', label: 'Log Date', type: 'date', required: true },
        { id: 'preparedBy', label: 'Prepared By', type: 'text', required: false },
        { id: 'actions', label: 'Actions (Ref | Description | Owner | Deadline | Status)', type: 'textarea', required: true, placeholder: 'A001 | Update website | Jane Smith | 15 Jun 2026 | In Progress\nA002 | Send invoices | John Brown | 10 Jun 2026 | Complete' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.actions || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || ''];
    });
    return [
      section('Log Details', infoTable([
        ['Project / Team', or(data.projectName, '[Project]')],
        ['Date', or(data.logDate, '[Date]')],
        ['Prepared By', data.preparedBy],
      ])),
      section('Actions', dataTable(['Ref', 'Description', 'Owner', 'Deadline', 'Status'], rows)),
    ].join('');
  },
};

// ─── Decision Log ─────────────────────────────────────────────────────────────
export const decisionLog: DocumentTemplate = {
  id: 'decision-log',
  name: 'Decision Log',
  category: 'business',
  description: 'A record of key decisions made, who made them, and the rationale.',
  icon: 'GitBranch',
  planRequired: 'free',
  tags: ['decision', 'log', 'governance', 'project'],
  sections: [
    {
      id: 'details',
      title: 'Log Details',
      fields: [
        { id: 'projectName', label: 'Project / Organisation', type: 'text', required: true },
        { id: 'logDate', label: 'Log Date', type: 'date', required: true },
        { id: 'decisions', label: 'Decisions (Ref | Decision | Made By | Date | Rationale)', type: 'textarea', required: true, placeholder: 'D001 | Approve new supplier | Board | 01 Jun 2026 | Best value and quality' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.decisions || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || ''];
    });
    return [
      section('Log Details', infoTable([
        ['Project / Organisation', or(data.projectName, '[Project]')],
        ['Date', or(data.logDate, '[Date]')],
      ])),
      section('Decisions', dataTable(['Ref', 'Decision', 'Made By', 'Date', 'Rationale'], rows)),
    ].join('');
  },
};

// ─── Project Plan ─────────────────────────────────────────────────────────────
export const projectPlan: DocumentTemplate = {
  id: 'project-plan',
  name: 'Project Plan',
  category: 'business',
  description: 'A structured project plan covering objectives, milestones, resources, and risks.',
  icon: 'Kanban',
  planRequired: 'free',
  tags: ['project', 'plan', 'milestones', 'management'],
  sections: [
    {
      id: 'overview',
      title: 'Project Overview',
      fields: [
        { id: 'projectName', label: 'Project Name', type: 'text', required: true },
        { id: 'projectManager', label: 'Project Manager', type: 'text', required: false },
        { id: 'sponsor', label: 'Project Sponsor', type: 'text', required: false },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'endDate', label: 'Target End Date', type: 'date', required: false },
        { id: 'objectives', label: 'Project Objectives', type: 'textarea', required: true },
        { id: 'scope', label: 'Scope', type: 'textarea', required: false },
        { id: 'outOfScope', label: 'Out of Scope', type: 'textarea', required: false },
      ],
    },
    {
      id: 'milestones',
      title: 'Milestones & Tasks',
      fields: [
        { id: 'milestones', label: 'Milestones (Milestone | Owner | Target Date | Status)', type: 'textarea', required: true, placeholder: 'Project kick-off | PM | 01 Jun 2026 | Complete\nDesign phase | Design team | 15 Jun 2026 | In Progress' },
        { id: 'resources', label: 'Resources Required', type: 'textarea', required: false },
        { id: 'budget', label: 'Budget', type: 'text', required: false },
        { id: 'risks', label: 'Key Risks', type: 'textarea', required: false },
        { id: 'dependencies', label: 'Dependencies', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const milestoneRows = (data.milestones || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    return [
      section('Project Overview', infoTable([
        ['Project Name', or(data.projectName, '[Project Name]')],
        ['Project Manager', data.projectManager],
        ['Sponsor', data.sponsor],
        ['Start Date', or(data.startDate, '[Start Date]')],
        ['Target End Date', data.endDate],
        ['Budget', data.budget],
      ])),
      section('Objectives', `<p>${nl2br(or(data.objectives, '[Objectives]'))}</p>`),
      data.scope ? section('Scope', `<p>${nl2br(data.scope)}</p>`) : '',
      data.outOfScope ? section('Out of Scope', `<p>${nl2br(data.outOfScope)}</p>`) : '',
      milestoneRows.length ? section('Milestones', dataTable(['Milestone', 'Owner', 'Target Date', 'Status'], milestoneRows)) : '',
      data.resources ? section('Resources', `<p>${nl2br(data.resources)}</p>`) : '',
      data.risks ? section('Key Risks', `<p>${nl2br(data.risks)}</p>`) : '',
      data.dependencies ? section('Dependencies', `<p>${nl2br(data.dependencies)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Business Plan ────────────────────────────────────────────────────────────
export const businessPlan: DocumentTemplate = {
  id: 'business-plan',
  name: 'Business Plan',
  category: 'business',
  description: 'A structured business plan covering vision, market, products/services, financials, and strategy.',
  icon: 'LineChart',
  planRequired: 'free',
  tags: ['business plan', 'strategy', 'startup', 'finance'],
  sections: [
    {
      id: 'overview',
      title: 'Business Overview',
      fields: [
        { id: 'businessName', label: 'Business Name', type: 'text', required: true },
        { id: 'businessType', label: 'Business Type', type: 'text', required: false, placeholder: 'e.g. Limited Company, Sole Trader, Partnership' },
        { id: 'foundedDate', label: 'Founded / Proposed Start Date', type: 'date', required: false },
        { id: 'vision', label: 'Vision Statement', type: 'textarea', required: true },
        { id: 'mission', label: 'Mission Statement', type: 'textarea', required: false },
        { id: 'productsServices', label: 'Products / Services', type: 'textarea', required: true },
        { id: 'targetMarket', label: 'Target Market', type: 'textarea', required: true },
        { id: 'uniqueValue', label: 'Unique Value Proposition', type: 'textarea', required: false },
        { id: 'competitors', label: 'Key Competitors', type: 'textarea', required: false },
        { id: 'marketingStrategy', label: 'Marketing Strategy', type: 'textarea', required: false },
        { id: 'financialSummary', label: 'Financial Summary / Projections', type: 'textarea', required: false },
        { id: 'fundingRequired', label: 'Funding Required', type: 'text', required: false },
        { id: 'keyRisks', label: 'Key Risks & Mitigation', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Business Overview', infoTable([
      ['Business Name', or(data.businessName, '[Business Name]')],
      ['Business Type', data.businessType],
      ['Founded / Start Date', data.foundedDate],
    ])),
    section('Vision & Mission',
      `<p><strong>Vision:</strong> ${nl2br(or(data.vision, '[Vision]'))}</p>` +
      (data.mission ? `<p><strong>Mission:</strong> ${nl2br(data.mission)}</p>` : '')
    ),
    section('Products & Services', `<p>${nl2br(or(data.productsServices, '[Products/Services]'))}</p>`),
    section('Market Analysis',
      `<p><strong>Target Market:</strong><br>${nl2br(or(data.targetMarket, '[Target Market]'))}</p>` +
      (data.uniqueValue ? `<p><strong>Unique Value Proposition:</strong><br>${nl2br(data.uniqueValue)}</p>` : '') +
      (data.competitors ? `<p><strong>Key Competitors:</strong><br>${nl2br(data.competitors)}</p>` : '')
    ),
    data.marketingStrategy ? section('Marketing Strategy', `<p>${nl2br(data.marketingStrategy)}</p>`) : '',
    section('Financial Summary',
      (data.financialSummary ? `<p>${nl2br(data.financialSummary)}</p>` : '') +
      (data.fundingRequired ? `<p><strong>Funding Required:</strong> ${data.fundingRequired}</p>` : '')
    ),
    data.keyRisks ? section('Key Risks & Mitigation', `<p>${nl2br(data.keyRisks)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Service Proposal ─────────────────────────────────────────────────────────
export const serviceProposal: DocumentTemplate = {
  id: 'service-proposal',
  name: 'Service Proposal',
  category: 'business',
  description: 'A professional proposal for services, outlining scope, approach, timeline, and pricing.',
  icon: 'Send',
  planRequired: 'free',
  tags: ['proposal', 'services', 'business', 'client'],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'providerName', label: 'Your Name / Company', type: 'text', required: true },
        { id: 'clientName', label: 'Client Name / Company', type: 'text', required: true },
        { id: 'proposalDate', label: 'Proposal Date', type: 'date', required: true },
        { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
        { id: 'proposalRef', label: 'Proposal Reference', type: 'text', required: false },
      ],
    },
    {
      id: 'proposal',
      title: 'Proposal Details',
      fields: [
        { id: 'projectTitle', label: 'Project / Engagement Title', type: 'text', required: true },
        { id: 'background', label: 'Background & Objectives', type: 'textarea', required: false },
        { id: 'scopeOfWork', label: 'Scope of Work', type: 'textarea', required: true },
        { id: 'approach', label: 'Our Approach', type: 'textarea', required: false },
        { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: false },
        { id: 'timeline', label: 'Proposed Timeline', type: 'textarea', required: false },
        { id: 'pricing', label: 'Pricing', type: 'textarea', required: true },
        { id: 'terms', label: 'Terms & Conditions Summary', type: 'textarea', required: false },
        { id: 'nextSteps', label: 'Next Steps', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Proposal Details', infoTable([
      ['Prepared By', or(data.providerName, '[Provider]')],
      ['Prepared For', or(data.clientName, '[Client]')],
      ['Date', or(data.proposalDate, '[Date]')],
      ['Valid Until', data.validUntil],
      ['Reference', data.proposalRef],
    ])),
    section('Project Overview', infoTable([['Project', or(data.projectTitle, '[Project Title]')]])),
    data.background ? section('Background & Objectives', `<p>${nl2br(data.background)}</p>`) : '',
    section('Scope of Work', `<p>${nl2br(or(data.scopeOfWork, '[Scope]'))}</p>`),
    data.approach ? section('Our Approach', `<p>${nl2br(data.approach)}</p>`) : '',
    data.deliverables ? section('Deliverables', `<p>${nl2br(data.deliverables)}</p>`) : '',
    data.timeline ? section('Proposed Timeline', `<p>${nl2br(data.timeline)}</p>`) : '',
    section('Pricing', `<p>${nl2br(or(data.pricing, '[Pricing]'))}</p>`),
    data.terms ? section('Terms & Conditions', `<p>${nl2br(data.terms)}</p>`) : '',
    data.nextSteps ? section('Next Steps', `<p>${nl2br(data.nextSteps)}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─── Quote ────────────────────────────────────────────────────────────────────
export const quoteTemplate: DocumentTemplate = {
  id: 'quote',
  name: 'Quote',
  category: 'finance',
  description: 'A formal quotation for goods or services, with itemised pricing.',
  icon: 'Tag',
  planRequired: 'free',
  tags: ['quote', 'quotation', 'pricing', 'business'],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'supplierName', label: 'Your Name / Company', type: 'text', required: true },
        { id: 'supplierAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'supplierEmail', label: 'Your Email', type: 'email', required: false },
        { id: 'clientName', label: 'Client Name / Company', type: 'text', required: true },
        { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: false },
        { id: 'quoteNumber', label: 'Quote Number', type: 'text', required: true, placeholder: 'e.g. QUO-001' },
        { id: 'quoteDate', label: 'Quote Date', type: 'date', required: true },
        { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
      ],
    },
    {
      id: 'items',
      title: 'Items',
      fields: [
        { id: 'lineItems', label: 'Line Items (Description | Qty | Unit Price)', type: 'textarea', required: true, placeholder: 'Web design | 1 | £2,000\nHosting setup | 1 | £150' },
        { id: 'subtotal', label: 'Subtotal', type: 'text', required: true },
        { id: 'vatRate', label: 'VAT Rate (if applicable)', type: 'text', required: false },
        { id: 'vatAmount', label: 'VAT Amount', type: 'text', required: false },
        { id: 'total', label: 'Total', type: 'text', required: true },
        { id: 'notes', label: 'Notes / Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const lineRows = (data.lineItems || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      section('Quote Details', infoTable([
        ['From', or(data.supplierName, '[Supplier]')],
        ['Address', data.supplierAddress],
        ['Email', data.supplierEmail],
        ['To', or(data.clientName, '[Client]')],
        ['Client Address', data.clientAddress],
        ['Quote Number', or(data.quoteNumber, '[QUO-XXX]')],
        ['Date', or(data.quoteDate, '[Date]')],
        ['Valid Until', data.validUntil],
      ])),
      section('Items', dataTable(['Description', 'Qty', 'Unit Price'], lineRows)),
      section('Totals', infoTable([
        ['Subtotal', or(data.subtotal, '—')],
        ...(data.vatRate ? [['VAT (' + data.vatRate + ')', data.vatAmount || '—'] as [string, string]] : []),
        ['Total', or(data.total, '—')],
      ])),
      data.notes ? section('Notes & Terms', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Estimate ─────────────────────────────────────────────────────────────────
export const estimateTemplate: DocumentTemplate = {
  id: 'estimate',
  name: 'Estimate',
  category: 'finance',
  description: 'A cost estimate for work or services — not a binding quote.',
  icon: 'Calculator',
  planRequired: 'free',
  tags: ['estimate', 'cost', 'pricing', 'business'],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'supplierName', label: 'Your Name / Company', type: 'text', required: true },
        { id: 'clientName', label: 'Client Name', type: 'text', required: true },
        { id: 'estimateNumber', label: 'Estimate Number', type: 'text', required: true, placeholder: 'e.g. EST-001' },
        { id: 'estimateDate', label: 'Estimate Date', type: 'date', required: true },
        { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
      ],
    },
    {
      id: 'items',
      title: 'Estimated Items',
      fields: [
        { id: 'lineItems', label: 'Items (Description | Qty | Estimated Price)', type: 'textarea', required: true },
        { id: 'estimatedTotal', label: 'Estimated Total', type: 'text', required: true },
        { id: 'notes', label: 'Notes / Assumptions', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const lineRows = (data.lineItems || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      `<div class="pdf-notice"><p><strong>Please note:</strong> This is an estimate only and is not a binding quotation. Final costs may vary depending on actual requirements.</p></div>`,
      section('Estimate Details', infoTable([
        ['From', or(data.supplierName, '[Supplier]')],
        ['To', or(data.clientName, '[Client]')],
        ['Estimate Number', or(data.estimateNumber, '[EST-XXX]')],
        ['Date', or(data.estimateDate, '[Date]')],
        ['Valid Until', data.validUntil],
      ])),
      section('Estimated Items', dataTable(['Description', 'Qty', 'Estimated Price'], lineRows)),
      section('Estimated Total', infoTable([['Estimated Total', or(data.estimatedTotal, '—')]])),
      data.notes ? section('Notes & Assumptions', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Receipt ──────────────────────────────────────────────────────────────────
export const receiptTemplate: DocumentTemplate = {
  id: 'receipt',
  name: 'Receipt',
  category: 'finance',
  description: 'A receipt confirming payment received for goods or services.',
  icon: 'CheckCircle',
  planRequired: 'free',
  tags: ['receipt', 'payment', 'finance'],
  sections: [
    {
      id: 'details',
      title: 'Receipt Details',
      fields: [
        { id: 'supplierName', label: 'Received By (Name / Company)', type: 'text', required: true },
        { id: 'clientName', label: 'Received From', type: 'text', required: true },
        { id: 'receiptNumber', label: 'Receipt Number', type: 'text', required: true, placeholder: 'e.g. REC-001' },
        { id: 'receiptDate', label: 'Date', type: 'date', required: true },
        { id: 'description', label: 'Description of Payment', type: 'textarea', required: true },
        { id: 'amount', label: 'Amount Received', type: 'text', required: true },
        { id: 'paymentMethod', label: 'Payment Method', type: 'select', required: false, options: ['Bank Transfer', 'Cash', 'Cheque', 'Card', 'Other'] },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Receipt Details', infoTable([
      ['Receipt Number', or(data.receiptNumber, '[REC-XXX]')],
      ['Date', or(data.receiptDate, '[Date]')],
      ['Received By', or(data.supplierName, '[Supplier]')],
      ['Received From', or(data.clientName, '[Client]')],
      ['Payment Method', data.paymentMethod],
    ])),
    section('Payment Details',
      `<p><strong>Description:</strong><br>${nl2br(or(data.description, '[Description]'))}</p>` +
      `<p style="font-size:14pt;font-weight:700;color:#1B4F8A;margin-top:12px;">Amount Received: ${or(data.amount, '—')}</p>`
    ),
    data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    `<p style="margin-top:16px;font-size:9pt;color:#6b7280;">This receipt confirms that payment has been received in full.</p>`,
  ].filter(Boolean).join(''),
};

// ─── Purchase Order ───────────────────────────────────────────────────────────
export const purchaseOrder: DocumentTemplate = {
  id: 'purchase-order',
  name: 'Purchase Order',
  category: 'finance',
  description: 'A formal purchase order authorising a supplier to provide goods or services.',
  icon: 'ShoppingCart',
  planRequired: 'free',
  tags: ['purchase order', 'PO', 'procurement', 'finance'],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'buyerName', label: 'Buyer Name / Company', type: 'text', required: true },
        { id: 'buyerAddress', label: 'Buyer Address', type: 'textarea', required: false },
        { id: 'supplierName', label: 'Supplier Name / Company', type: 'text', required: true },
        { id: 'supplierAddress', label: 'Supplier Address', type: 'textarea', required: false },
        { id: 'poNumber', label: 'PO Number', type: 'text', required: true, placeholder: 'e.g. PO-001' },
        { id: 'poDate', label: 'PO Date', type: 'date', required: true },
        { id: 'deliveryDate', label: 'Required Delivery Date', type: 'date', required: false },
        { id: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false },
      ],
    },
    {
      id: 'items',
      title: 'Items Ordered',
      fields: [
        { id: 'lineItems', label: 'Items (Description | Qty | Unit Price | Total)', type: 'textarea', required: true },
        { id: 'subtotal', label: 'Subtotal', type: 'text', required: false },
        { id: 'vatAmount', label: 'VAT', type: 'text', required: false },
        { id: 'total', label: 'Total', type: 'text', required: true },
        { id: 'paymentTerms', label: 'Payment Terms', type: 'text', required: false },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const lineRows = (data.lineItems || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
    });
    return [
      section('Purchase Order Details', infoTable([
        ['PO Number', or(data.poNumber, '[PO-XXX]')],
        ['Date', or(data.poDate, '[Date]')],
        ['Buyer', or(data.buyerName, '[Buyer]')],
        ['Buyer Address', data.buyerAddress],
        ['Supplier', or(data.supplierName, '[Supplier]')],
        ['Supplier Address', data.supplierAddress],
        ['Required Delivery', data.deliveryDate],
        ['Delivery Address', data.deliveryAddress],
        ['Payment Terms', data.paymentTerms],
      ])),
      section('Items Ordered', dataTable(['Description', 'Qty', 'Unit Price', 'Total'], lineRows)),
      section('Order Totals', infoTable([
        ['Subtotal', data.subtotal || '—'],
        ['VAT', data.vatAmount || '—'],
        ['Total', or(data.total, '—')],
      ])),
      data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
    ].filter(Boolean).join('');
  },
};

// ─── Delivery Note ────────────────────────────────────────────────────────────
export const deliveryNote: DocumentTemplate = {
  id: 'delivery-note',
  name: 'Delivery Note',
  category: 'business',
  description: 'A delivery note accompanying goods, listing items delivered and confirming receipt.',
  icon: 'Truck',
  planRequired: 'free',
  tags: ['delivery', 'note', 'goods', 'logistics'],
  sections: [
    {
      id: 'details',
      title: 'Delivery Details',
      fields: [
        { id: 'supplierName', label: 'Supplier Name / Company', type: 'text', required: true },
        { id: 'deliveryTo', label: 'Deliver To', type: 'text', required: true },
        { id: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false },
        { id: 'dnNumber', label: 'Delivery Note Number', type: 'text', required: true, placeholder: 'e.g. DN-001' },
        { id: 'dnDate', label: 'Delivery Date', type: 'date', required: true },
        { id: 'orderRef', label: 'Order / PO Reference', type: 'text', required: false },
        { id: 'items', label: 'Items (Description | Qty | Condition)', type: 'textarea', required: true },
        { id: 'notes', label: 'Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const itemRows = (data.items || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || 'Good'];
    });
    return [
      section('Delivery Details', infoTable([
        ['Delivery Note No.', or(data.dnNumber, '[DN-XXX]')],
        ['Date', or(data.dnDate, '[Date]')],
        ['From', or(data.supplierName, '[Supplier]')],
        ['To', or(data.deliveryTo, '[Recipient]')],
        ['Delivery Address', data.deliveryAddress],
        ['Order / PO Ref', data.orderRef],
      ])),
      section('Items Delivered', dataTable(['Description', 'Qty', 'Condition'], itemRows)),
      data.notes ? section('Notes', `<p>${nl2br(data.notes)}</p>`) : '',
      `<div class="pdf-signatures"><h3>Received By</h3><div class="pdf-sig-grid"><div class="signature-box"><p class="sig-label">Received By</p><div class="signature-line"></div><p class="sig-field">Name:</p><p class="sig-field">Date:</p></div><div class="signature-box"><p class="sig-label">Delivered By</p><div class="signature-line"></div><p class="sig-field">Name:</p><p class="sig-field">Date:</p></div></div></div>`,
    ].filter(Boolean).join('');
  },
};

// ─── Client Agreement ─────────────────────────────────────────────────────────
export const clientAgreement: DocumentTemplate = {
  id: 'client-agreement',
  name: 'Client Agreement',
  category: 'contracts',
  description: 'A client engagement agreement setting out the terms of a business relationship.',
  icon: 'Handshake',
  planRequired: 'free',
  tags: ['client', 'agreement', 'contract', 'engagement'],
  signatories: [{ label: 'Service Provider' }, { label: 'Client' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'providerName', label: 'Service Provider Name / Company', type: 'text', required: true },
        { id: 'providerAddress', label: 'Provider Address', type: 'textarea', required: false },
        { id: 'clientName', label: 'Client Name / Company', type: 'text', required: true },
        { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: false },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
      ],
    },
    {
      id: 'terms',
      title: 'Agreement Terms',
      fields: [
        { id: 'services', label: 'Services to be Provided', type: 'textarea', required: true },
        { id: 'fees', label: 'Fees & Payment Terms', type: 'textarea', required: true },
        { id: 'duration', label: 'Duration / Term', type: 'text', required: false },
        { id: 'noticePeriod', label: 'Notice Period', type: 'text', required: false },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
        { id: 'governingLaw', label: 'Governing Law', type: 'text', required: false, defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Agreement Details', infoTable([
      ['Date', or(data.agreementDate, '[Date]')],
      ['Governing Law', or(data.governingLaw, 'England and Wales')],
    ])),
    `<div class="pdf-parties"><div class="pdf-party-block"><h4>Service Provider</h4><p>${or(data.providerName, '[Provider]')}</p>${data.providerAddress ? `<p>${data.providerAddress.replace(/\n/g, '<br>')}</p>` : ''}</div><div class="pdf-party-block"><h4>Client</h4><p>${or(data.clientName, '[Client]')}</p>${data.clientAddress ? `<p>${data.clientAddress.replace(/\n/g, '<br>')}</p>` : ''}</div></div>`,
    section('1. Services', `<p>${nl2br(or(data.services, '[Services]'))}</p>`),
    section('2. Fees & Payment', `<p>${nl2br(or(data.fees, '[Fees]'))}</p>`),
    section('3. Term & Termination',
      clause('3.1', data.duration ? `This agreement shall continue for ${data.duration}.` : 'This agreement shall continue until terminated by either party.') +
      clause('3.2', data.noticePeriod ? `Either party may terminate by giving ${data.noticePeriod} written notice.` : 'Either party may terminate by giving reasonable written notice.')
    ),
    data.additionalTerms ? section('4. Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Supplier Agreement ───────────────────────────────────────────────────────
export const supplierAgreement: DocumentTemplate = {
  id: 'supplier-agreement',
  name: 'Supplier Agreement',
  category: 'contracts',
  description: 'An agreement with a supplier setting out terms for the supply of goods or services.',
  icon: 'Package',
  planRequired: 'free',
  tags: ['supplier', 'agreement', 'procurement', 'contract'],
  signatories: [{ label: 'Buyer' }, { label: 'Supplier' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'buyerName', label: 'Buyer Name / Company', type: 'text', required: true },
        { id: 'buyerAddress', label: 'Buyer Address', type: 'textarea', required: false },
        { id: 'supplierName', label: 'Supplier Name / Company', type: 'text', required: true },
        { id: 'supplierAddress', label: 'Supplier Address', type: 'textarea', required: false },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
      ],
    },
    {
      id: 'terms',
      title: 'Supply Terms',
      fields: [
        { id: 'supplyDescription', label: 'Description of Goods / Services', type: 'textarea', required: true },
        { id: 'pricing', label: 'Pricing & Payment Terms', type: 'textarea', required: true },
        { id: 'deliveryTerms', label: 'Delivery Terms', type: 'textarea', required: false },
        { id: 'qualityStandards', label: 'Quality Standards', type: 'textarea', required: false },
        { id: 'duration', label: 'Agreement Duration', type: 'text', required: false },
        { id: 'noticePeriod', label: 'Notice Period', type: 'text', required: false },
        { id: 'governingLaw', label: 'Governing Law', type: 'text', required: false, defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Agreement Details', infoTable([
      ['Date', or(data.agreementDate, '[Date]')],
      ['Governing Law', or(data.governingLaw, 'England and Wales')],
    ])),
    `<div class="pdf-parties"><div class="pdf-party-block"><h4>Buyer</h4><p>${or(data.buyerName, '[Buyer]')}</p>${data.buyerAddress ? `<p>${data.buyerAddress.replace(/\n/g, '<br>')}</p>` : ''}</div><div class="pdf-party-block"><h4>Supplier</h4><p>${or(data.supplierName, '[Supplier]')}</p>${data.supplierAddress ? `<p>${data.supplierAddress.replace(/\n/g, '<br>')}</p>` : ''}</div></div>`,
    section('1. Supply of Goods / Services', `<p>${nl2br(or(data.supplyDescription, '[Description]'))}</p>`),
    section('2. Pricing & Payment', `<p>${nl2br(or(data.pricing, '[Pricing]'))}</p>`),
    data.deliveryTerms ? section('3. Delivery', `<p>${nl2br(data.deliveryTerms)}</p>`) : '',
    data.qualityStandards ? section('4. Quality Standards', `<p>${nl2br(data.qualityStandards)}</p>`) : '',
    section('5. Term & Termination',
      clause('5.1', data.duration ? `This agreement shall continue for ${data.duration}.` : 'This agreement shall continue until terminated.') +
      clause('5.2', data.noticePeriod ? `Either party may terminate by giving ${data.noticePeriod} written notice.` : 'Either party may terminate by giving 30 days written notice.')
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Partnership Agreement Draft ──────────────────────────────────────────────
export const partnershipAgreement: DocumentTemplate = {
  id: 'partnership-agreement',
  name: 'Partnership Agreement Draft',
  category: 'contracts',
  description: 'A draft partnership agreement outlining the terms between business partners.',
  icon: 'Users',
  planRequired: 'free',
  tags: ['partnership', 'agreement', 'business', 'partners'],
  signatories: [{ label: 'Partner 1' }, { label: 'Partner 2' }],
  sections: [
    {
      id: 'parties',
      title: 'Partners',
      fields: [
        { id: 'partner1Name', label: 'Partner 1 Full Name', type: 'text', required: true },
        { id: 'partner1Address', label: 'Partner 1 Address', type: 'textarea', required: false },
        { id: 'partner2Name', label: 'Partner 2 Full Name', type: 'text', required: true },
        { id: 'partner2Address', label: 'Partner 2 Address', type: 'textarea', required: false },
        { id: 'partnershipName', label: 'Partnership / Trading Name', type: 'text', required: true },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
        { id: 'commencementDate', label: 'Partnership Commencement Date', type: 'date', required: false },
      ],
    },
    {
      id: 'terms',
      title: 'Partnership Terms',
      fields: [
        { id: 'businessDescription', label: 'Nature of Business', type: 'textarea', required: true },
        { id: 'capitalContributions', label: 'Capital Contributions', type: 'textarea', required: false, placeholder: 'Partner 1: £X\nPartner 2: £X' },
        { id: 'profitSharing', label: 'Profit & Loss Sharing', type: 'textarea', required: false, placeholder: 'e.g. 50/50 or Partner 1: 60%, Partner 2: 40%' },
        { id: 'roles', label: 'Roles & Responsibilities', type: 'textarea', required: false },
        { id: 'bankingArrangements', label: 'Banking Arrangements', type: 'textarea', required: false },
        { id: 'decisionMaking', label: 'Decision Making', type: 'textarea', required: false },
        { id: 'dissolution', label: 'Dissolution / Exit Terms', type: 'textarea', required: false },
        { id: 'governingLaw', label: 'Governing Law', type: 'text', required: false, defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Partnership Details', infoTable([
      ['Partnership Name', or(data.partnershipName, '[Partnership Name]')],
      ['Agreement Date', or(data.agreementDate, '[Date]')],
      ['Commencement Date', data.commencementDate],
      ['Governing Law', or(data.governingLaw, 'England and Wales')],
    ])),
    `<div class="pdf-parties"><div class="pdf-party-block"><h4>Partner 1</h4><p>${or(data.partner1Name, '[Partner 1]')}</p>${data.partner1Address ? `<p>${data.partner1Address.replace(/\n/g, '<br>')}</p>` : ''}</div><div class="pdf-party-block"><h4>Partner 2</h4><p>${or(data.partner2Name, '[Partner 2]')}</p>${data.partner2Address ? `<p>${data.partner2Address.replace(/\n/g, '<br>')}</p>` : ''}</div></div>`,
    section('1. Nature of Business', `<p>${nl2br(or(data.businessDescription, '[Business description]'))}</p>`),
    data.capitalContributions ? section('2. Capital Contributions', `<p>${nl2br(data.capitalContributions)}</p>`) : '',
    data.profitSharing ? section('3. Profit & Loss Sharing', `<p>${nl2br(data.profitSharing)}</p>`) : '',
    data.roles ? section('4. Roles & Responsibilities', `<p>${nl2br(data.roles)}</p>`) : '',
    data.bankingArrangements ? section('5. Banking', `<p>${nl2br(data.bankingArrangements)}</p>`) : '',
    data.decisionMaking ? section('6. Decision Making', `<p>${nl2br(data.decisionMaking)}</p>`) : '',
    data.dissolution ? section('7. Dissolution & Exit', `<p>${nl2br(data.dissolution)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Memorandum of Understanding ─────────────────────────────────────────────
export const memorandumOfUnderstanding: DocumentTemplate = {
  id: 'memorandum-of-understanding',
  name: 'Memorandum of Understanding',
  category: 'contracts',
  description: 'A non-binding MOU setting out the intentions and understanding between two parties.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['MOU', 'memorandum', 'understanding', 'agreement'],
  signatories: [{ label: 'Party 1' }, { label: 'Party 2' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'party1Name', label: 'Party 1 Name / Organisation', type: 'text', required: true },
        { id: 'party2Name', label: 'Party 2 Name / Organisation', type: 'text', required: true },
        { id: 'mouDate', label: 'MOU Date', type: 'date', required: true },
      ],
    },
    {
      id: 'content',
      title: 'MOU Content',
      fields: [
        { id: 'purpose', label: 'Purpose of MOU', type: 'textarea', required: true },
        { id: 'responsibilities', label: 'Responsibilities of Each Party', type: 'textarea', required: false },
        { id: 'duration', label: 'Duration', type: 'text', required: false },
        { id: 'additionalTerms', label: 'Additional Terms', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    `<div class="pdf-notice"><p><strong>Note:</strong> This Memorandum of Understanding is not legally binding and does not create a formal contract between the parties.</p></div>`,
    section('Parties', infoTable([
      ['Party 1', or(data.party1Name, '[Party 1]')],
      ['Party 2', or(data.party2Name, '[Party 2]')],
      ['Date', or(data.mouDate, '[Date]')],
    ])),
    section('1. Purpose', `<p>${nl2br(or(data.purpose, '[Purpose]'))}</p>`),
    data.responsibilities ? section('2. Responsibilities', `<p>${nl2br(data.responsibilities)}</p>`) : '',
    data.duration ? section('3. Duration', `<p>${data.duration}</p>`) : '',
    data.additionalTerms ? section('4. Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Business Letter ──────────────────────────────────────────────────────────
export const businessLetter: DocumentTemplate = {
  id: 'business-letter',
  name: 'Business Letter',
  category: 'letters',
  description: 'A professional business letter for any purpose.',
  icon: 'Mail',
  planRequired: 'free',
  tags: ['business', 'letter', 'correspondence'],
  signatories: [{ label: 'Sender' }],
  sections: [
    {
      id: 'details',
      title: 'Letter Details',
      fields: [
        { id: 'senderName', label: 'Your Name', type: 'text', required: true },
        { id: 'senderOrg', label: 'Your Organisation', type: 'text', required: false },
        { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'letterDate', label: 'Date', type: 'date', required: true },
        { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
        { id: 'recipientOrg', label: 'Recipient Organisation', type: 'text', required: false },
        { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: false },
        { id: 'subject', label: 'Subject', type: 'text', required: true },
        { id: 'body', label: 'Letter Body', type: 'textarea', required: true },
        { id: 'signOff', label: 'Sign Off', type: 'select', required: false, options: ['Yours sincerely', 'Yours faithfully', 'Kind regards', 'Best regards'] },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Correspondence Details', infoTable([
      ['From', [or(data.senderName, '[Sender]'), data.senderOrg].filter(Boolean).join(', ')],
      ['Address', data.senderAddress],
      ['Date', or(data.letterDate, '[Date]')],
      ['To', [or(data.recipientName, '[Recipient]'), data.recipientOrg].filter(Boolean).join(', ')],
      ['Recipient Address', data.recipientAddress],
    ])),
    section(`Re: ${or(data.subject, '[Subject]')}`,
      `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>
      <p>${nl2br(or(data.body, '[Letter body]'))}</p>
      <p>${or(data.signOff, 'Yours sincerely')},<br><br><strong>${or(data.senderName, '[Your Name]')}</strong>${data.senderOrg ? `<br>${data.senderOrg}` : ''}</p>`
    ),
  ].join(''),
};

// ─── Formal Notice ────────────────────────────────────────────────────────────
export const formalNotice: DocumentTemplate = {
  id: 'formal-notice',
  name: 'Formal Notice',
  category: 'letters',
  description: 'A formal notice letter for any legal, contractual, or administrative purpose.',
  icon: 'AlertCircle',
  planRequired: 'free',
  tags: ['notice', 'formal', 'legal', 'letter'],
  signatories: [{ label: 'Issuing Party' }],
  sections: [
    {
      id: 'details',
      title: 'Notice Details',
      fields: [
        { id: 'senderName', label: 'Issuing Party Name', type: 'text', required: true },
        { id: 'senderOrg', label: 'Organisation', type: 'text', required: false },
        { id: 'senderAddress', label: 'Address', type: 'textarea', required: false },
        { id: 'letterDate', label: 'Date', type: 'date', required: true },
        { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
        { id: 'recipientOrg', label: 'Recipient Organisation', type: 'text', required: false },
        { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: false },
        { id: 'noticeType', label: 'Type of Notice', type: 'text', required: true, placeholder: 'e.g. Notice of Termination, Notice to Remedy, Notice of Default' },
        { id: 'noticeBody', label: 'Notice Content', type: 'textarea', required: true },
        { id: 'responseRequired', label: 'Response Required By', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Notice Details', infoTable([
      ['From', [or(data.senderName, '[Sender]'), data.senderOrg].filter(Boolean).join(', ')],
      ['Address', data.senderAddress],
      ['Date', or(data.letterDate, '[Date]')],
      ['To', [or(data.recipientName, '[Recipient]'), data.recipientOrg].filter(Boolean).join(', ')],
      ['Recipient Address', data.recipientAddress],
    ])),
    section(`NOTICE: ${or(data.noticeType, '[Notice Type]').toUpperCase()}`,
      `<p>Dear ${or(data.recipientName, 'Sir/Madam')},</p>
      <p>${nl2br(or(data.noticeBody, '[Notice content]'))}</p>` +
      (data.responseRequired ? `<p><strong>A response is required by: ${data.responseRequired}</strong></p>` : '') +
      `<p>Yours faithfully,<br><strong>${or(data.senderName, '[Sender]')}</strong>${data.senderOrg ? `<br>${data.senderOrg}` : ''}</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Internal Memo ────────────────────────────────────────────────────────────
export const internalMemo: DocumentTemplate = {
  id: 'internal-memo',
  name: 'Internal Memo',
  category: 'business',
  description: 'An internal memorandum for communicating information within an organisation.',
  icon: 'MessageSquare',
  planRequired: 'free',
  tags: ['memo', 'internal', 'communication', 'business'],
  sections: [
    {
      id: 'details',
      title: 'Memo Details',
      fields: [
        { id: 'to', label: 'To', type: 'text', required: true },
        { id: 'from', label: 'From', type: 'text', required: true },
        { id: 'cc', label: 'CC', type: 'text', required: false },
        { id: 'date', label: 'Date', type: 'date', required: true },
        { id: 'subject', label: 'Subject', type: 'text', required: true },
        { id: 'body', label: 'Memo Content', type: 'textarea', required: true },
        { id: 'actionRequired', label: 'Action Required', type: 'textarea', required: false },
        { id: 'deadline', label: 'Deadline', type: 'date', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('MEMORANDUM', infoTable([
      ['To', or(data.to, '[Recipient]')],
      ['From', or(data.from, '[Sender]')],
      ['CC', data.cc],
      ['Date', or(data.date, '[Date]')],
      ['Subject', or(data.subject, '[Subject]')],
    ])),
    section('Content', `<p>${nl2br(or(data.body, '[Memo content]'))}</p>`),
    data.actionRequired ? section('Action Required',
      `<p>${nl2br(data.actionRequired)}</p>` +
      (data.deadline ? `<p><strong>Deadline: ${data.deadline}</strong></p>` : '')
    ) : '',
  ].filter(Boolean).join(''),
};

// ─── Company Announcement ─────────────────────────────────────────────────────
export const companyAnnouncement: DocumentTemplate = {
  id: 'company-announcement',
  name: 'Company Announcement',
  category: 'business',
  description: 'An official company announcement for staff, stakeholders, or the public.',
  icon: 'Megaphone',
  planRequired: 'free',
  tags: ['announcement', 'company', 'communication', 'notice'],
  sections: [
    {
      id: 'details',
      title: 'Announcement Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'announcementDate', label: 'Date', type: 'date', required: true },
        { id: 'audience', label: 'Audience', type: 'text', required: false, placeholder: 'e.g. All Staff, Shareholders, Customers' },
        { id: 'subject', label: 'Announcement Subject', type: 'text', required: true },
        { id: 'body', label: 'Announcement Content', type: 'textarea', required: true },
        { id: 'effectiveDate', label: 'Effective Date (if applicable)', type: 'date', required: false },
        { id: 'contactName', label: 'Contact for Queries', type: 'text', required: false },
        { id: 'contactEmail', label: 'Contact Email', type: 'email', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Announcement Details', infoTable([
      ['Company', or(data.companyName, '[Company]')],
      ['Date', or(data.announcementDate, '[Date]')],
      ['To', data.audience],
      ['Effective Date', data.effectiveDate],
    ])),
    section(or(data.subject, '[Subject]'),
      `<p>${nl2br(or(data.body, '[Announcement content]'))}</p>` +
      (data.contactName || data.contactEmail
        ? `<p style="margin-top:12px;"><strong>For queries, please contact:</strong><br>${[data.contactName, data.contactEmail].filter(Boolean).join(' — ')}</p>`
        : '')
    ),
  ].filter(Boolean).join(''),
};

// ─── Risk Register ────────────────────────────────────────────────────────────
export const riskRegister: DocumentTemplate = {
  id: 'risk-register',
  name: 'Risk Register',
  category: 'business',
  description: 'A risk register for identifying, assessing, and managing organisational or project risks.',
  icon: 'AlertTriangle',
  planRequired: 'free',
  tags: ['risk', 'register', 'management', 'governance'],
  sections: [
    {
      id: 'details',
      title: 'Register Details',
      fields: [
        { id: 'projectOrg', label: 'Project / Organisation', type: 'text', required: true },
        { id: 'registerDate', label: 'Date', type: 'date', required: true },
        { id: 'preparedBy', label: 'Prepared By', type: 'text', required: false },
        { id: 'risks', label: 'Risks (Ref | Risk | Likelihood | Impact | Owner | Mitigation | Status)', type: 'textarea', required: true, placeholder: 'R001 | Key staff departure | Medium | High | HR Manager | Succession planning | Open\nR002 | Data breach | Low | High | IT Manager | Security training | Open' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.risks || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || '', parts[6] || ''];
    });
    return [
      section('Register Details', infoTable([
        ['Project / Organisation', or(data.projectOrg, '[Project/Org]')],
        ['Date', or(data.registerDate, '[Date]')],
        ['Prepared By', data.preparedBy],
      ])),
      section('Risk Register', dataTable(['Ref', 'Risk', 'Likelihood', 'Impact', 'Owner', 'Mitigation', 'Status'], rows)),
    ].join('');
  },
};

// ─── Issue Register ───────────────────────────────────────────────────────────
export const issueRegister: DocumentTemplate = {
  id: 'issue-register',
  name: 'Issue Register',
  category: 'business',
  description: 'A log of issues, their impact, owners, and resolution status.',
  icon: 'Bug',
  planRequired: 'free',
  tags: ['issue', 'register', 'log', 'project'],
  sections: [
    {
      id: 'details',
      title: 'Register Details',
      fields: [
        { id: 'projectOrg', label: 'Project / Organisation', type: 'text', required: true },
        { id: 'registerDate', label: 'Date', type: 'date', required: true },
        { id: 'issues', label: 'Issues (Ref | Issue | Raised By | Date Raised | Priority | Owner | Status)', type: 'textarea', required: true, placeholder: 'I001 | System outage | IT Team | 01 Jun 2026 | High | IT Manager | In Progress' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.issues || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || '', parts[6] || ''];
    });
    return [
      section('Register Details', infoTable([
        ['Project / Organisation', or(data.projectOrg, '[Project/Org]')],
        ['Date', or(data.registerDate, '[Date]')],
      ])),
      section('Issue Register', dataTable(['Ref', 'Issue', 'Raised By', 'Date Raised', 'Priority', 'Owner', 'Status'], rows)),
    ].join('');
  },
};

// ─── Incident Log ─────────────────────────────────────────────────────────────
export const incidentLog: DocumentTemplate = {
  id: 'incident-log',
  name: 'Incident Log',
  category: 'business',
  description: 'A log of incidents, near-misses, or events requiring recording.',
  icon: 'Siren',
  planRequired: 'free',
  tags: ['incident', 'log', 'safety', 'record'],
  sections: [
    {
      id: 'details',
      title: 'Log Details',
      fields: [
        { id: 'orgName', label: 'Organisation', type: 'text', required: true },
        { id: 'logDate', label: 'Log Date', type: 'date', required: true },
        { id: 'incidents', label: 'Incidents (Ref | Date | Description | Location | Reported By | Action Taken)', type: 'textarea', required: true, placeholder: 'INC001 | 01 Jun 2026 | Slip on wet floor | Reception | Jane Smith | Wet floor sign placed' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.incidents || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || ''];
    });
    return [
      section('Log Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Date', or(data.logDate, '[Date]')],
      ])),
      section('Incident Log', dataTable(['Ref', 'Date', 'Description', 'Location', 'Reported By', 'Action Taken'], rows)),
    ].join('');
  },
};

// ─── Complaint Log ────────────────────────────────────────────────────────────
export const complaintLog: DocumentTemplate = {
  id: 'complaint-log',
  name: 'Complaint Log',
  category: 'complaints',
  description: 'A log for recording and tracking customer or stakeholder complaints.',
  icon: 'MessageCircleWarning',
  planRequired: 'free',
  tags: ['complaint', 'log', 'customer service', 'record'],
  sections: [
    {
      id: 'details',
      title: 'Log Details',
      fields: [
        { id: 'orgName', label: 'Organisation', type: 'text', required: true },
        { id: 'logDate', label: 'Log Date', type: 'date', required: true },
        { id: 'complaints', label: 'Complaints (Ref | Date | Complainant | Summary | Assigned To | Status | Outcome)', type: 'textarea', required: true, placeholder: 'C001 | 01 Jun 2026 | John Smith | Late delivery | Customer Service | Resolved | Refund issued' },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.complaints || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || '', parts[6] || ''];
    });
    return [
      section('Log Details', infoTable([
        ['Organisation', or(data.orgName, '[Organisation]')],
        ['Date', or(data.logDate, '[Date]')],
      ])),
      section('Complaint Log', dataTable(['Ref', 'Date', 'Complainant', 'Summary', 'Assigned To', 'Status', 'Outcome'], rows)),
    ].join('');
  },
};
