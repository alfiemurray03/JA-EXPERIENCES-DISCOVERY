import type { DocumentTemplate } from '../document-types';
import { section, infoTable, parties, clause, or, nl2br, fmtDate, notice, divider } from './html-helpers';

export const serviceAgreement: DocumentTemplate = {
  id: 'service-agreement',
  name: 'Service Agreement',
  category: 'business-letters',
  description: 'A formal agreement between a service provider and a client, defining the services, fees, and terms of the engagement.',
  icon: 'Handshake',
  planRequired: 'free',
  tags: ['service', 'agreement', 'contract', 'business', 'client'],
  signatories: [{ label: 'Service Provider' }, { label: 'Client' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'providerName',    label: 'Service Provider Name / Company', type: 'text',     required: true },
        { id: 'providerAddress', label: 'Service Provider Address',        type: 'textarea', required: false },
        { id: 'clientName',      label: 'Client Name / Company',           type: 'text',     required: true },
        { id: 'clientAddress',   label: 'Client Address',                  type: 'textarea', required: false },
        { id: 'agreementDate',   label: 'Agreement Date',                  type: 'date',     required: true },
      ],
    },
    {
      id: 'services',
      title: 'Services',
      fields: [
        { id: 'serviceDescription', label: 'Description of Services',             type: 'textarea', required: true },
        { id: 'deliverables',       label: 'Key Deliverables (optional)',          type: 'textarea', required: false,
          placeholder: 'List the specific outputs or deliverables' },
        { id: 'serviceStartDate',   label: 'Service Start Date',                  type: 'date',     required: true },
        { id: 'serviceEndDate',     label: 'Service End Date (or "Ongoing")',      type: 'text',     required: false },
        { id: 'serviceLocation',    label: 'Location of Services',                type: 'text',     required: false },
      ],
    },
    {
      id: 'fees',
      title: 'Fees & Payment',
      fields: [
        { id: 'feeAmount',       label: 'Fee / Price',          type: 'text', required: true,  placeholder: 'e.g. £2,500 + VAT' },
        { id: 'paymentSchedule', label: 'Payment Schedule',     type: 'text', required: false, placeholder: 'e.g. 50% upfront, 50% on completion' },
        { id: 'paymentMethod',   label: 'Payment Method',       type: 'text', required: false, placeholder: 'e.g. BACS bank transfer' },
        { id: 'invoiceTerms',    label: 'Invoice Payment Terms', type: 'text', required: false, placeholder: 'e.g. 30 days from invoice date' },
        { id: 'latePayment',     label: 'Late Payment Terms',   type: 'text', required: false, placeholder: 'e.g. 8% per annum above Bank of England base rate' },
        { id: 'vatRegistered',   label: 'VAT Registered?',      type: 'select', required: false, options: ['Yes', 'No'] },
      ],
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      fields: [
        { id: 'noticePeriod',   label: 'Termination Notice Period', type: 'text', required: false, placeholder: 'e.g. 30 days written notice' },
        { id: 'liabilityLimit', label: 'Limitation of Liability',   type: 'text', required: false, placeholder: 'e.g. Limited to total fees paid under this Agreement' },
        { id: 'ipOwnership',    label: 'Intellectual Property',     type: 'select', required: false,
          options: ['Client owns all IP on payment', 'Provider retains IP, grants licence to Client', 'Shared ownership'] },
        { id: 'governingLaw',   label: 'Governing Law',             type: 'text', required: false, defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => {
    const providerName = or(data.providerName, '[Service Provider]');
    const clientName   = or(data.clientName,   '[Client]');

    return [

      section('Agreement Details', infoTable([
        ['Agreement Date',  fmtDate(data.agreementDate)],
        ['Governing Law',   or(data.governingLaw, 'England and Wales')],
        ['VAT Registered',  data.vatRegistered],
      ])),

      parties(
        {
          title: 'Service Provider',
          lines: [
            `<strong>${providerName}</strong>`,
            ...(data.providerAddress || '').split('\n'),
          ],
        },
        {
          title: 'Client',
          lines: [
            `<strong>${clientName}</strong>`,
            ...(data.clientAddress || '').split('\n'),
          ],
        },
      ),

      section('1. Services',
        infoTable([
          ['Start Date',  fmtDate(data.serviceStartDate)],
          ['End Date',    data.serviceEndDate || 'Ongoing'],
          ['Location',    data.serviceLocation],
        ]) +
        `<p><strong>Description of Services:</strong></p>
        <p style="background:#f8f9fb;border-left:3px solid #1B4F8A;padding:8px 12px;margin:8px 0;border-radius:0 4px 4px 0;">${nl2br(or(data.serviceDescription, '[Service Description]'))}</p>` +
        (data.deliverables
          ? `<p><strong>Key Deliverables:</strong></p><p style="background:#f8f9fb;border-left:3px solid #059669;padding:8px 12px;margin:8px 0;border-radius:0 4px 4px 0;">${nl2br(data.deliverables)}</p>`
          : '')
      ),

      section('2. Fees & Payment',
        infoTable([
          ['Fee',                   or(data.feeAmount, '[Fee]')],
          ['Payment Schedule',      data.paymentSchedule],
          ['Payment Method',        data.paymentMethod],
          ['Invoice Payment Terms', data.invoiceTerms],
          ['Late Payment',          data.latePayment],
        ]) +
        (data.vatRegistered === 'Yes'
          ? notice('All fees are exclusive of VAT, which will be charged at the prevailing rate where applicable.', 'info')
          : '')
      ),

      section('3. Obligations of the Service Provider',
        clause('3.1', `The Service Provider shall perform the services described in Clause 1 with reasonable skill, care, and diligence.`) +
        clause('3.2', 'The Service Provider shall comply with all applicable laws and regulations in the performance of the services.') +
        clause('3.3', 'The Service Provider shall keep the Client reasonably informed of progress and shall promptly notify the Client of any issues that may affect delivery, quality, or timescales.')
      ),

      section('4. Obligations of the Client',
        clause('4.1', 'The Client shall provide all information, materials, and access reasonably required by the Service Provider to perform the services.') +
        clause('4.2', 'The Client shall pay all invoices in accordance with the agreed payment terms set out in Clause 2.') +
        clause('4.3', 'The Client shall promptly review and provide feedback on any deliverables within a reasonable timeframe.')
      ),

      section('5. Intellectual Property',
        clause('5.1', data.ipOwnership === 'Provider retains IP, grants licence to Client'
          ? `All intellectual property rights in the deliverables shall remain vested in the Service Provider. The Service Provider grants the Client a non-exclusive, royalty-free licence to use the deliverables for the purposes contemplated by this Agreement.`
          : data.ipOwnership === 'Shared ownership'
          ? `Intellectual property rights in the deliverables shall be jointly owned by the parties. Neither party may assign or licence their interest without the written consent of the other.`
          : `Upon receipt of full payment, all intellectual property rights in the deliverables created specifically for the Client under this Agreement shall vest in the Client.`)
      ),

      section('6. Confidentiality',
        clause('6.1', 'Both parties agree to keep confidential all information received from the other party that is designated as confidential or that reasonably should be understood to be confidential, and shall not disclose such information to any third party without prior written consent.') +
        clause('6.2', 'This obligation shall survive termination of this Agreement for a period of 2 years.')
      ),

      section('7. Limitation of Liability',
        clause('7.1', data.liabilityLimit
          ? `The Service Provider's total liability under or in connection with this Agreement shall be limited to: ${data.liabilityLimit}.`
          : `The Service Provider's total liability under or in connection with this Agreement shall not exceed the total fees paid by the Client in the 12 months preceding the claim.`) +
        clause('7.2', 'Neither party shall be liable for indirect, consequential, incidental, or special damages arising out of or in connection with this Agreement.')
      ),

      section('8. Termination',
        clause('8.1', data.noticePeriod
          ? `Either party may terminate this Agreement by giving <strong>${data.noticePeriod}</strong> written notice to the other party.`
          : 'Either party may terminate this Agreement by giving <strong>30 days</strong> written notice to the other party.') +
        clause('8.2', 'Either party may terminate this Agreement immediately upon written notice if the other party commits a material breach and (where remediable) fails to remedy that breach within 14 days of written notice.') +
        clause('8.3', 'On termination, the Client shall pay for all services performed up to the date of termination.')
      ),

      section('9. General',
        clause('9.1', `This Agreement shall be governed by and construed in accordance with the laws of <strong>${or(data.governingLaw, 'England and Wales')}</strong>, and the parties submit to the exclusive jurisdiction of the courts of that jurisdiction.`) +
        clause('9.2', 'This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior negotiations, representations, and agreements.') +
        clause('9.3', 'No amendment to this Agreement shall be effective unless made in writing and signed by both parties.') +
        clause('9.4', 'If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.')
      ),

      divider(),

      `<p style="font-size:9pt;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">
        IN WITNESS WHEREOF, the parties have executed this Service Agreement as of the date first written above.
      </p>`,

    ].filter(Boolean).join('');
  },
};
