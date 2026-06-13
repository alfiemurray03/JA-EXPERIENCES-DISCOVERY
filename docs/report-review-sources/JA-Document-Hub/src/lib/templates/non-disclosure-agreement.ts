import type { DocumentTemplate } from '../document-types';
import { section, infoTable, parties, clause, or, nl2br, fmtDate, notice, divider } from './html-helpers';

export const nonDisclosureAgreement: DocumentTemplate = {
  id: 'non-disclosure-agreement',
  name: 'Non-Disclosure Agreement (NDA)',
  category: 'business-letters',
  description: 'A mutual or one-way NDA to protect confidential information shared between two parties.',
  icon: 'ShieldCheck',
  planRequired: 'free',
  tags: ['nda', 'confidentiality', 'non-disclosure', 'agreement', 'contract'],
  signatories: [{ label: 'Disclosing Party' }, { label: 'Receiving Party' }],
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'disclosingParty',   label: 'Disclosing Party Name / Company', type: 'text',     required: true },
        { id: 'disclosingAddress', label: 'Disclosing Party Address',         type: 'textarea', required: false },
        { id: 'receivingParty',    label: 'Receiving Party Name / Company',   type: 'text',     required: true },
        { id: 'receivingAddress',  label: 'Receiving Party Address',          type: 'textarea', required: false },
        { id: 'ndaType',           label: 'NDA Type',                         type: 'select',   required: true,
          options: ['One-Way (Unilateral)', 'Mutual (Bilateral)'] },
        { id: 'agreementDate',     label: 'Agreement Date',                   type: 'date',     required: true },
      ],
    },
    {
      id: 'details',
      title: 'Confidentiality Details',
      fields: [
        { id: 'purpose',          label: 'Purpose of Disclosure',                    type: 'textarea', required: true },
        { id: 'confidentialInfo', label: 'Definition of Confidential Information',   type: 'textarea', required: false },
        { id: 'exclusions',       label: 'Exclusions from Confidentiality',          type: 'textarea', required: false },
        { id: 'duration',         label: 'Duration of Confidentiality Obligation',   type: 'text',     required: false,
          placeholder: 'e.g. 2 years from the date of this Agreement' },
        { id: 'governingLaw',     label: 'Governing Law',                            type: 'text',     required: false,
          defaultValue: 'England and Wales' },
      ],
    },
  ],
  generateDocument: (data) => [

    section('Agreement Details', infoTable([
      ['Agreement Type', data.ndaType === 'Mutual (Bilateral)'
        ? 'Mutual Non-Disclosure Agreement (Bilateral)'
        : 'One-Way Non-Disclosure Agreement (Unilateral)'],
      ['Date of Agreement', fmtDate(data.agreementDate)],
      ['Governing Law',     or(data.governingLaw, 'England and Wales')],
    ])),

    parties(
      {
        title: 'Disclosing Party',
        lines: [
          `<strong>${or(data.disclosingParty, '[Disclosing Party]')}</strong>`,
          ...(data.disclosingAddress || '').split('\n'),
        ],
      },
      {
        title: 'Receiving Party',
        lines: [
          `<strong>${or(data.receivingParty, '[Receiving Party]')}</strong>`,
          ...(data.receivingAddress || '').split('\n'),
        ],
      },
    ),

    notice(
      data.ndaType === 'Mutual (Bilateral)'
        ? 'This is a <strong>mutual</strong> NDA — both parties agree to keep each other\'s information confidential.'
        : 'This is a <strong>one-way</strong> NDA — only the Receiving Party is bound by confidentiality obligations.',
      'info',
    ),

    section('1. Purpose',
      `<p>The parties wish to explore and discuss the following:</p>
      <p style="background:#f8f9fb;border-left:3px solid #1B4F8A;padding:8px 12px;margin:8px 0;border-radius:0 4px 4px 0;">${nl2br(or(data.purpose, '[Purpose of Disclosure]'))}</p>
      <p>In connection with this purpose, the Disclosing Party${data.ndaType === 'Mutual (Bilateral)' ? ' (and/or the Receiving Party)' : ''} may disclose certain Confidential Information to the Receiving Party.</p>`
    ),

    section('2. Confidential Information',
      clause('2.1', `<strong>"Confidential Information"</strong> means: ${
        data.confidentialInfo ||
        'all non-public information disclosed by the Disclosing Party to the Receiving Party, whether oral, written, electronic, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.'
      }`) +
      clause('2.2', `<strong>Confidential Information does NOT include</strong> information that: ${
        data.exclusions ||
        '(a) is or becomes publicly available through no fault of the Receiving Party; (b) was already known to the Receiving Party at the time of disclosure; (c) is independently developed by the Receiving Party without use of the Confidential Information; or (d) is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives prompt written notice to the Disclosing Party.'
      }`)
    ),

    section('3. Obligations of the Receiving Party',
      clause('3.1', 'The Receiving Party agrees to: (a) keep the Confidential Information strictly confidential and not disclose it to any third party without prior written consent of the Disclosing Party; (b) use the Confidential Information solely for the Purpose stated in Clause 1; (c) protect the Confidential Information with at least the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care; and (d) limit access to the Confidential Information to those employees, contractors, or advisers who have a need to know and are bound by confidentiality obligations no less restrictive than those in this Agreement.') +
      clause('3.2', 'The Receiving Party shall promptly notify the Disclosing Party upon becoming aware of any actual or suspected unauthorised disclosure of Confidential Information.')
    ),

    section('4. Duration',
      clause('4.1', data.duration
        ? `The obligations of confidentiality under this Agreement shall continue for <strong>${data.duration}</strong>.`
        : 'The obligations of confidentiality shall continue for <strong>2 years</strong> from the date of this Agreement, or until the Confidential Information enters the public domain through no fault of the Receiving Party, whichever is earlier.')
    ),

    section('5. Return or Destruction of Information',
      clause('5.1', 'Upon written request by the Disclosing Party, or upon termination of the discussions between the parties, the Receiving Party shall promptly return or destroy all Confidential Information (including copies) in its possession, and certify in writing that it has done so.')
    ),

    section('6. Remedies',
      clause('6.1', 'The Receiving Party acknowledges that breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate, and that the Disclosing Party shall be entitled to seek equitable relief (including injunction and specific performance) in addition to all other remedies available at law or in equity.') +
      clause('6.2', 'No failure or delay by the Disclosing Party in exercising any right under this Agreement shall operate as a waiver of that right.')
    ),

    section('7. General',
      clause('7.1', `This Agreement shall be governed by and construed in accordance with the laws of <strong>${or(data.governingLaw, 'England and Wales')}</strong>.`) +
      clause('7.2', 'This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior discussions, representations, and understandings.') +
      clause('7.3', 'If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.')
    ),

    divider(),

    `<p style="font-size:9pt;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">
      IN WITNESS WHEREOF, the parties have executed this Non-Disclosure Agreement as of the date first written above.
    </p>`,

  ].filter(Boolean).join(''),
};
