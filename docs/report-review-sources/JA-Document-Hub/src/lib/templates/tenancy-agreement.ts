import type { DocumentTemplate } from '../document-types';
import { section, infoTable, parties, clause, or, nl2br } from './html-helpers';

export const tenancyAgreement: DocumentTemplate = {
  id: 'tenancy-agreement',
  name: 'Residential Tenancy Agreement',
  category: 'personal',
  description: 'An Assured Shorthold Tenancy (AST) agreement for residential lettings in England and Wales.',
  icon: 'Home',
  planRequired: 'free',
  tags: ['tenancy', 'rental', 'landlord', 'tenant', 'ast', 'letting', 'property'],
  signatories: [{ label: 'Landlord' }, { label: 'Tenant(s)' }],
  sections: [
    {
      id: 'parties',
      title: 'Landlord & Tenant',
      fields: [
        { id: 'landlordName', label: 'Landlord Full Name', type: 'text', required: true },
        { id: 'landlordAddress', label: 'Landlord Address (for correspondence)', type: 'textarea', required: true },
        { id: 'landlordEmail', label: 'Landlord Email', type: 'email', required: false },
        { id: 'landlordPhone', label: 'Landlord Phone', type: 'phone', required: false },
        { id: 'tenantNames', label: 'Tenant(s) Full Name(s)', type: 'textarea', required: true, placeholder: 'List all tenants, one per line' },
      ],
    },
    {
      id: 'property',
      title: 'Property Details',
      fields: [
        { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
        { id: 'propertyType', label: 'Property Type', type: 'select', required: false, options: ['Flat', 'House', 'Studio', 'Room in shared house', 'Maisonette', 'Bungalow', 'Other'] },
        { id: 'furnished', label: 'Furnished Status', type: 'select', required: false, options: ['Furnished', 'Part-Furnished', 'Unfurnished'] },
        { id: 'includedItems', label: 'Included Items / White Goods', type: 'textarea', required: false },
      ],
    },
    {
      id: 'tenancy',
      title: 'Tenancy Terms',
      fields: [
        { id: 'tenancyType', label: 'Tenancy Type', type: 'select', required: true, options: ['Fixed Term', 'Periodic (Rolling)'] },
        { id: 'startDate', label: 'Tenancy Start Date', type: 'date', required: true },
        { id: 'endDate', label: 'Fixed Term End Date (if applicable)', type: 'date', required: false },
        { id: 'monthlyRent', label: 'Monthly Rent', type: 'text', required: true, placeholder: 'e.g. £1,200 per calendar month' },
        { id: 'rentDueDay', label: 'Rent Due Day', type: 'text', required: false, placeholder: 'e.g. 1st of each month' },
        { id: 'paymentMethod', label: 'Payment Method', type: 'text', required: false },
        { id: 'depositAmount', label: 'Security Deposit Amount', type: 'text', required: false },
        { id: 'depositScheme', label: 'Deposit Protection Scheme', type: 'text', required: false },
      ],
    },
    {
      id: 'obligations',
      title: 'Obligations & Rules',
      fields: [
        { id: 'petsAllowed', label: 'Pets Permitted', type: 'select', required: false, options: ['No pets permitted', 'Pets permitted with prior written consent', 'Pets permitted'] },
        { id: 'smokingPolicy', label: 'Smoking Policy', type: 'select', required: false, options: ['No smoking anywhere on the property', 'Smoking permitted outside only', 'No restriction'] },
        { id: 'sublettingPolicy', label: 'Subletting', type: 'select', required: false, options: ['Not permitted without written consent', 'Not permitted', 'Permitted'] },
        { id: 'noticePeriod', label: 'Notice Period (after fixed term)', type: 'text', required: false },
        { id: 'additionalTerms', label: 'Additional Terms or Special Conditions', type: 'textarea', required: false },
        { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Agreement Details', infoTable([
      ['Agreement Date', or(data.agreementDate, '[Date]')],
      ['Tenancy Type', or(data.tenancyType, '[Type]')],
      ['Property Type', data.propertyType],
      ['Furnished Status', data.furnished],
    ])),

    parties(
      {
        title: 'Landlord',
        lines: [
          or(data.landlordName, '[Landlord Name]'),
          ...(data.landlordAddress || '').split('\n'),
          data.landlordEmail ? `Email: ${data.landlordEmail}` : '',
          data.landlordPhone ? `Phone: ${data.landlordPhone}` : '',
        ]
      },
      {
        title: 'Tenant(s)',
        lines: (data.tenantNames || '[Tenant Name(s)]').split('\n')
      }
    ),

    section('1. The Property',
      infoTable([
        ['Property Address', or(data.propertyAddress, '[Property Address]')],
        ['Included Items', data.includedItems],
      ])
    ),

    section('2. Tenancy Term', infoTable([
      ['Start Date', or(data.startDate, '[Start Date]')],
      ['End Date', data.endDate || (data.tenancyType === 'Periodic (Rolling)' ? 'Periodic — rolling monthly' : 'To be confirmed')],
    ])),

    section('3. Rent & Deposit', infoTable([
      ['Monthly Rent', or(data.monthlyRent, '[Rent]')],
      ['Rent Due', data.rentDueDay],
      ['Payment Method', data.paymentMethod],
      ['Security Deposit', data.depositAmount],
      ['Deposit Scheme', data.depositScheme],
    ])),

    section('4. Tenant Obligations',
      clause('4.1', 'Pay rent on time as agreed.') +
      clause('4.2', 'Keep the property clean and in good condition.') +
      clause('4.3', 'Not cause nuisance or annoyance to neighbours.') +
      clause('4.4', 'Report any repairs or maintenance issues promptly.') +
      clause('4.5', 'Not make alterations to the property without written consent.') +
      clause('4.6', 'Allow the Landlord access for inspections with at least 24 hours\' written notice.') +
      clause('4.7', data.petsAllowed || 'Not keep pets without prior written consent.') +
      clause('4.8', data.smokingPolicy || 'Not smoke anywhere on the property.') +
      clause('4.9', data.sublettingPolicy || 'Not sublet the property without prior written consent.')
    ),

    section('5. Landlord Obligations',
      clause('5.1', 'Ensure the property is safe and fit for habitation at the start of the tenancy.') +
      clause('5.2', 'Carry out repairs to the structure, exterior, and installations (gas, electricity, water).') +
      clause('5.3', 'Provide a valid Gas Safety Certificate (if applicable) before the tenancy begins.') +
      clause('5.4', 'Ensure the property has a valid Energy Performance Certificate (EPC).') +
      clause('5.5', 'Protect the deposit in a government-approved scheme within 30 days of receipt.')
    ),

    section('6. Termination',
      clause('6.1', data.noticePeriod
        ? `Notice periods: ${data.noticePeriod}`
        : 'After the fixed term, either party may end the tenancy by giving appropriate written notice in accordance with the Housing Act 1988.')
    ),

    data.additionalTerms ? section('7. Additional Terms', `<p>${nl2br(data.additionalTerms)}</p>`) : '',

    `<div class="pdf-notice"><p><strong>Important Notice:</strong> This is a template Assured Shorthold Tenancy Agreement for use in England and Wales only. Landlords must comply with all current legal requirements including deposit protection, right to rent checks, gas safety, electrical safety, and providing prescribed information. Users are strongly advised to seek independent legal advice before entering into any tenancy agreement.</p></div>`,
  ].filter(Boolean).join(''),
};
