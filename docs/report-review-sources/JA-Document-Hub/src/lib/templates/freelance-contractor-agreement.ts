import type { DocumentTemplate } from '../document-types';
import { section, infoTable, parties, clause, or, nl2br, fmtDate, notice, divider } from './html-helpers';

export const freelanceContractorAgreement: DocumentTemplate = {
  id: 'freelance-contractor-agreement',
  name: 'Freelance / Contractor Agreement',
  category: 'business-letters',
  description: 'A contract between a business and a self-employed freelancer or independent contractor, setting out scope, fees, and terms.',
  icon: 'FileSignature',
  planRequired: 'free',
  tags: ['freelance', 'contractor', 'contract', 'self-employed', 'agreement'],
  signatories: [{ label: 'Client (Authorised Signatory)' }, { label: 'Contractor' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'clientName', label: 'Client / Company Name', type: 'text', required: true },
        { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: false },
        { id: 'contractorName', label: 'Contractor / Freelancer Name', type: 'text', required: true },
        { id: 'contractorAddress', label: 'Contractor Address', type: 'textarea', required: false },
        { id: 'contractorCompany', label: 'Contractor Trading Name (if applicable)', type: 'text', required: false },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
      ],
    },
    {
      id: 'engagement',
      title: 'Engagement Details',
      fields: [
        { id: 'projectTitle', label: 'Project / Role Title', type: 'text', required: true },
        { id: 'scopeOfWork', label: 'Scope of Work / Services', type: 'textarea', required: true, placeholder: 'Describe the services to be provided...' },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'endDate', label: 'End Date (or "Ongoing")', type: 'text', required: false, placeholder: 'e.g. 31 December 2025 or Ongoing' },
        { id: 'deliverables', label: 'Key Deliverables', type: 'textarea', required: false },
      ],
    },
    {
      id: 'fees',
      title: 'Fees & Payment',
      fields: [
        { id: 'feeType', label: 'Fee Structure', type: 'select', required: true, options: ['Fixed Project Fee', 'Day Rate', 'Hourly Rate', 'Monthly Retainer'] },
        { id: 'feeAmount', label: 'Fee Amount', type: 'text', required: true, placeholder: 'e.g. £5,000 or £450 per day' },
        { id: 'paymentTerms', label: 'Payment Terms', type: 'text', required: false, placeholder: 'e.g. 30 days from invoice date' },
        { id: 'invoicingSchedule', label: 'Invoicing Schedule', type: 'text', required: false, placeholder: 'e.g. Monthly in arrears' },
        { id: 'expensesPolicy', label: 'Expenses Policy', type: 'textarea', required: false },
      ],
    },
    {
      id: 'terms',
      title: 'Contract Terms',
      fields: [
        { id: 'noticePeriod', label: 'Notice Period', type: 'text', required: false, placeholder: 'e.g. 2 weeks written notice' },
        { id: 'confidentiality', label: 'Confidentiality Obligations', type: 'textarea', required: false },
        { id: 'ipOwnership', label: 'Intellectual Property', type: 'textarea', required: false },
        { id: 'governingLaw', label: 'Governing Law', type: 'text', required: false, defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => {
    const clientName     = or(data.clientName,     '[Client]');
    const contractorName = or(data.contractorName, '[Contractor]');

    return [

    section('Agreement Details', infoTable([
      ['Agreement Date', fmtDate(data.agreementDate)],
      ['Project / Role', or(data.projectTitle, '[Project Title]')],
      ['Governing Law',  or(data.governingLaw, 'England and Wales')],
    ])),

    parties(
      {
        title: 'Client',
        lines: [
          `<strong>${clientName}</strong>`,
          ...(data.clientAddress || '').split('\n'),
        ],
      },
      {
        title: 'Contractor',
        lines: [
          `<strong>${contractorName}</strong>`,
          data.contractorCompany ? `Trading as: ${data.contractorCompany}` : '',
          ...(data.contractorAddress || '').split('\n'),
        ],
      },
    ),

    notice('The Contractor is engaged as an independent contractor, not an employee. This Agreement does not create an employment relationship.', 'info'),

    section('1. Engagement',
      infoTable([
        ['Project / Role', or(data.projectTitle, '[Project Title]')],
        ['Start Date',     fmtDate(data.startDate)],
        ['End Date',       data.endDate || 'Ongoing'],
      ]) +
      `<p><strong>Scope of Work:</strong></p>
      <p style="background:#f8f9fb;border-left:3px solid #1B4F8A;padding:8px 12px;margin:8px 0;border-radius:0 4px 4px 0;">${nl2br(or(data.scopeOfWork, '[Scope of Work]'))}</p>` +
      (data.deliverables
        ? `<p><strong>Key Deliverables:</strong></p><p style="background:#f8f9fb;border-left:3px solid #059669;padding:8px 12px;margin:8px 0;border-radius:0 4px 4px 0;">${nl2br(data.deliverables)}</p>`
        : '')
    ),

    section('2. Fees & Payment',
      infoTable([
        ['Fee Structure',  or(data.feeType, '[Fee Type]')],
        ['Fee',            or(data.feeAmount, '[Fee Amount]')],
        ['Payment Terms',  data.paymentTerms],
        ['Invoicing',      data.invoicingSchedule],
      ]) +
      (data.expensesPolicy
        ? `<p><strong>Expenses Policy:</strong> ${nl2br(data.expensesPolicy)}</p>`
        : '<p>Expenses will only be reimbursed if agreed in writing in advance by the Client.</p>')
    ),

    section('3. Independent Contractor Status',
      clause('3.1', `<strong>${contractorName}</strong> is engaged as an independent contractor and not as an employee, worker, or agent of <strong>${clientName}</strong>. Nothing in this Agreement shall create or be deemed to create a partnership, joint venture, or employment relationship between the parties.`) +
      clause('3.2', 'The Contractor is solely responsible for their own income tax, National Insurance contributions, VAT (if applicable), and all other statutory obligations arising from their self-employment.') +
      clause('3.3', 'The Contractor shall have the right to provide services to other clients during the term of this Agreement, provided this does not conflict with their obligations hereunder.')
    ),

    section('4. Obligations',
      clause('4.1', 'The Contractor shall perform the services described in Clause 1 with reasonable skill, care, and diligence, and in accordance with any reasonable instructions from the Client.') +
      clause('4.2', 'The Client shall provide the Contractor with all information and access reasonably required to perform the services.') +
      clause('4.3', 'The Client shall pay all undisputed invoices within the agreed payment terms.')
    ),

    section('5. Confidentiality',
      clause('5.1', data.confidentiality
        ? nl2br(data.confidentiality)
        : `The Contractor agrees to keep all information relating to the Client's business, clients, and operations strictly confidential and not to disclose it to any third party without prior written consent of the Client. This obligation shall survive termination of this Agreement for a period of 2 years.`)
    ),

    section('6. Intellectual Property',
      clause('6.1', data.ipOwnership
        ? nl2br(data.ipOwnership)
        : `All intellectual property rights in any work, deliverables, or materials created by the Contractor specifically for the Client in the course of this engagement shall vest in and be owned by the Client upon receipt of full payment of all fees due.`) +
      clause('6.2', 'The Contractor warrants that the deliverables will not infringe the intellectual property rights of any third party.')
    ),

    section('7. Termination',
      clause('7.1', data.noticePeriod
        ? `Either party may terminate this Agreement by giving <strong>${data.noticePeriod}</strong> written notice to the other party.`
        : 'Either party may terminate this Agreement by giving <strong>2 weeks</strong> written notice to the other party.') +
      clause('7.2', 'Either party may terminate this Agreement immediately upon written notice if the other party commits a material breach and (where remediable) fails to remedy that breach within 7 days of written notice.') +
      clause('7.3', 'On termination, the Client shall pay for all services properly performed up to the date of termination.')
    ),

    section('8. General',
      clause('8.1', `This Agreement shall be governed by and construed in accordance with the laws of <strong>${or(data.governingLaw, 'England and Wales')}</strong>.`) +
      clause('8.2', 'This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior discussions and agreements.') +
      clause('8.3', 'No amendment to this Agreement shall be effective unless made in writing and signed by both parties.')
    ),

    divider(),

    `<p style="font-size:9pt;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">
      IN WITNESS WHEREOF, the parties have executed this Freelance / Contractor Agreement as of the date first written above.
    </p>`,

  ].filter(Boolean).join('');
  },
};
