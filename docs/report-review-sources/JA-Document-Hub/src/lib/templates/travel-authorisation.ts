import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br } from './html-helpers';

export const travelAuthorisation: DocumentTemplate = {
  id: 'travel-authorisation',
  name: 'Travel Authorisation Letter',
  category: 'travel',
  description: 'A letter authorising an individual to travel, including child travel consent letters for single parents or guardians.',
  icon: 'Plane',
  planRequired: 'free',
  tags: ['travel', 'authorisation', 'consent', 'child', 'letter'],
  signatories: [{ label: 'Authorising Party' }],
  sections: [
    {
      id: 'authoriser',
      title: 'Authorising Party',
      fields: [
        { id: 'authoriserName', label: 'Your Full Name', type: 'text', required: true },
        { id: 'authoriserAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'authoriserRelationship', label: 'Your Relationship to Traveller', type: 'text', required: false, placeholder: 'e.g. Parent, Guardian, Employer' },
        { id: 'authoriserContact', label: 'Your Contact Number', type: 'phone', required: false },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
      ],
    },
    {
      id: 'traveller',
      title: 'Traveller Details',
      fields: [
        { id: 'travellerName', label: 'Traveller Full Name', type: 'text', required: true },
        { id: 'travellerDOB', label: 'Date of Birth', type: 'date', required: false },
        { id: 'travellerPassport', label: 'Passport Number', type: 'text', required: false },
        { id: 'travellerNationality', label: 'Nationality', type: 'text', required: false },
      ],
    },
    {
      id: 'travel',
      title: 'Travel Details',
      fields: [
        { id: 'destination', label: 'Destination Country / Countries', type: 'text', required: true },
        { id: 'departureDate', label: 'Departure Date', type: 'date', required: true },
        { id: 'returnDate', label: 'Return Date', type: 'date', required: false },
        { id: 'purpose', label: 'Purpose of Travel', type: 'text', required: false, placeholder: 'e.g. Holiday, Family visit, School trip' },
        { id: 'accompaniedBy', label: 'Travelling With', type: 'text', required: false, placeholder: 'e.g. Mother (Jane Smith), School group' },
        { id: 'additionalInfo', label: 'Additional Information', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Letter Details', infoTable([
      ['Issued By', or(data.authoriserName, '[Authoriser Name]')],
      ['Relationship', data.authoriserRelationship],
      ['Contact Number', data.authoriserContact],
      ['Date', or(data.letterDate, '[Date]')],
    ])),

    section('To Whom It May Concern',
      `<p>I, <strong>${or(data.authoriserName, '[Authoriser Name]')}</strong>${data.authoriserRelationship ? `, ${data.authoriserRelationship} of ${or(data.travellerName, '[Traveller Name]')},` : ','} hereby authorise and consent to the travel described below.</p>`
    ),

    section('Traveller Details', infoTable([
      ['Full Name', or(data.travellerName, '[Traveller Name]')],
      ['Date of Birth', data.travellerDOB],
      ['Passport Number', data.travellerPassport],
      ['Nationality', data.travellerNationality],
    ])),

    section('Travel Details', infoTable([
      ['Destination', or(data.destination, '[Destination]')],
      ['Departure Date', or(data.departureDate, '[Departure Date]')],
      ['Return Date', data.returnDate],
      ['Purpose of Travel', data.purpose],
      ['Travelling With', data.accompaniedBy],
    ])),

    data.additionalInfo ? section('Additional Information', `<p>${nl2br(data.additionalInfo)}</p>`) : '',

    section('Declaration',
      `<p>I confirm that I have full legal authority to grant this authorisation. I can be contacted on <strong>${data.authoriserContact || '[Contact Number]'}</strong> should verification be required.</p>
      <p>Yours faithfully,<br><strong>${or(data.authoriserName, '[Authoriser Name]')}</strong>${data.authoriserRelationship ? `<br>${data.authoriserRelationship}` : ''}</p>`
    ),
  ].filter(Boolean).join(''),
};
