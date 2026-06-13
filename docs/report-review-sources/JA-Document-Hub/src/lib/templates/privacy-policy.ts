import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or } from './html-helpers';

export const privacyPolicy: DocumentTemplate = {
  id: 'privacy-policy',
  name: 'Privacy Policy',
  category: 'policies',
  description: 'A GDPR-compliant privacy policy for websites and businesses, covering data collection, use, and rights.',
  icon: 'Shield',
  planRequired: 'free',
  tags: ['privacy', 'gdpr', 'data protection', 'policy', 'website'],
  signatories: [],
  sections: [
    {
      id: 'organisation',
      title: 'Organisation Details',
      fields: [
        { id: 'companyName', label: 'Organisation / Company Name', type: 'text', required: true },
        { id: 'companyAddress', label: 'Registered Address', type: 'textarea', required: false },
        { id: 'contactEmail', label: 'Data Controller Contact Email', type: 'email', required: true },
        { id: 'websiteUrl', label: 'Website URL', type: 'text', required: false },
        { id: 'dpoName', label: 'Data Protection Officer (if applicable)', type: 'text', required: false },
        { id: 'effectiveDate', label: 'Policy Effective Date', type: 'date', required: true },
      ],
    },
    {
      id: 'dataCollection',
      title: 'Data Collection',
      fields: [
        { id: 'dataTypes', label: 'Types of Personal Data Collected', type: 'textarea', required: true, placeholder: 'e.g. Name, email address, phone number, IP address, payment information...' },
        { id: 'collectionMethods', label: 'How Data is Collected', type: 'textarea', required: false, placeholder: 'e.g. Website forms, cookies, direct correspondence, purchase transactions...' },
        { id: 'purposes', label: 'Purposes of Processing', type: 'textarea', required: true, placeholder: 'e.g. To fulfil orders, send marketing communications, improve our services...' },
        { id: 'legalBasis', label: 'Legal Basis for Processing', type: 'textarea', required: false, placeholder: 'e.g. Consent, legitimate interests, contractual necessity, legal obligation...' },
      ],
    },
    {
      id: 'rights',
      title: 'Data Subject Rights',
      fields: [
        { id: 'retentionPeriod', label: 'Data Retention Period', type: 'text', required: false, placeholder: 'e.g. 7 years for financial records, 2 years for marketing data' },
        { id: 'thirdParties', label: 'Third Parties Data is Shared With', type: 'textarea', required: false, placeholder: 'e.g. Payment processors, email marketing platforms, analytics providers...' },
        { id: 'internationalTransfers', label: 'International Data Transfers', type: 'text', required: false, placeholder: 'e.g. Data may be transferred to the USA under Standard Contractual Clauses' },
        { id: 'cookiePolicy', label: 'Cookie Usage', type: 'textarea', required: false, placeholder: 'Describe how cookies are used on your website...' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Policy Information', infoTable([
      ['Organisation', or(data.companyName, '[Organisation Name]')],
      ['Registered Address', data.companyAddress],
      ['Contact Email', or(data.contactEmail, '[Email]')],
      ['Website', data.websiteUrl],
      ['Data Protection Officer', data.dpoName],
      ['Effective Date', or(data.effectiveDate, '[Date]')],
    ])),

    section('Introduction',
      `<p><strong>${or(data.companyName, '[Organisation Name]')}</strong> is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
      <p>We are the data controller for the personal data we process. If you have any questions about this policy, please contact us at <strong>${or(data.contactEmail, '[Email]')}</strong>.</p>`
    ),

    section('Personal Data We Collect',
      `<p><strong>Types of data collected:</strong></p><p>${(data.dataTypes || '[Data types]').replace(/\n/g, '<br>')}</p>` +
      (data.collectionMethods ? `<p><strong>How we collect data:</strong></p><p>${data.collectionMethods.replace(/\n/g, '<br>')}</p>` : '')
    ),

    section('How We Use Your Data',
      `<p><strong>Purposes of processing:</strong></p><p>${(data.purposes || '[Purposes]').replace(/\n/g, '<br>')}</p>` +
      (data.legalBasis ? `<p><strong>Legal basis:</strong></p><p>${data.legalBasis.replace(/\n/g, '<br>')}</p>` : '')
    ),

    section('Data Retention',
      `<p>${data.retentionPeriod || 'We retain personal data only for as long as necessary for the purposes for which it was collected, or as required by law.'}</p>`
    ),

    data.thirdParties ? section('Sharing Your Data',
      `<p>We may share your personal data with the following third parties:</p><p>${data.thirdParties.replace(/\n/g, '<br>')}</p>` +
      (data.internationalTransfers ? `<p><strong>International transfers:</strong> ${data.internationalTransfers}</p>` : '')
    ) : '',

    data.cookiePolicy ? section('Cookies', `<p>${data.cookiePolicy.replace(/\n/g, '<br>')}</p>`) : '',

    section('Your Rights',
      `<p>Under UK GDPR, you have the following rights regarding your personal data:</p>
      <ul>
        <li><strong>Right of access</strong> — to request a copy of the data we hold about you</li>
        <li><strong>Right to rectification</strong> — to request correction of inaccurate data</li>
        <li><strong>Right to erasure</strong> — to request deletion of your data in certain circumstances</li>
        <li><strong>Right to restrict processing</strong> — to request we limit how we use your data</li>
        <li><strong>Right to data portability</strong> — to receive your data in a portable format</li>
        <li><strong>Right to object</strong> — to object to processing based on legitimate interests or for direct marketing</li>
        <li><strong>Rights related to automated decision-making</strong></li>
      </ul>
      <p>To exercise any of these rights, please contact us at <strong>${or(data.contactEmail, '[Email]')}</strong>. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <strong>ico.org.uk</strong>.</p>`
    ),

    section('Changes to This Policy',
      `<p>We may update this Privacy Policy from time to time. The current version will always be available${data.websiteUrl ? ` on our website at ${data.websiteUrl}` : ''}. The effective date of the current version is <strong>${or(data.effectiveDate, '[Date]')}</strong>.</p>`
    ),
  ].filter(Boolean).join(''),
};
