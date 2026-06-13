import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'hospitality', icon: 'UtensilsCrossed', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const eventRunSheet = mk('event-run-sheet', 'Event Run Sheet', 'A detailed run sheet / schedule for an event.', ['event', 'run sheet', 'schedule', 'timeline'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'eventName', label: 'Event Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'eventManager', label: 'Event Manager', type: 'text', required: false },
    { id: 'schedule', label: 'Schedule (Time — Activity)', type: 'textarea', required: false },
    { id: 'keyContacts', label: 'Key Contacts', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Event Run Sheet', infoTable([['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)],['Venue', d.venue],['Event Manager', d.eventManager]])),
    d.schedule ? section('Schedule', `<p>${nl2br(d.schedule)}</p>`) : '',
    d.keyContacts ? section('Key Contacts', `<p>${nl2br(d.keyContacts)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const venueHireAgreement = mk('venue-hire-agreement', 'Venue Hire Agreement', 'An agreement for hiring a venue for an event.', ['venue', 'hire', 'agreement', 'event'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'venueName', label: 'Venue Name', type: 'text', required: true },
    { id: 'venueAddress', label: 'Venue Address', type: 'textarea', required: false },
    { id: 'hireeName', label: 'Hirer Name / Organisation', type: 'text', required: true },
    { id: 'eventName', label: 'Event Name', type: 'text', required: false },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'startTime', label: 'Start Time', type: 'text', required: false },
    { id: 'endTime', label: 'End Time', type: 'text', required: false },
    { id: 'expectedAttendees', label: 'Expected Number of Attendees', type: 'text', required: false },
    { id: 'hirePrice', label: 'Hire Price', type: 'text', required: false },
    { id: 'deposit', label: 'Deposit Amount', type: 'text', required: false },
    { id: 'paymentDue', label: 'Balance Payment Due', type: 'date', required: false },
    { id: 'includedFacilities', label: 'Included Facilities', type: 'textarea', required: false },
    { id: 'rules', label: 'Venue Rules & Conditions', type: 'textarea', required: false },
    { id: 'cancellationPolicy', label: 'Cancellation Policy', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Venue Hire Agreement', infoTable([['Venue', or(d.venueName,'[Venue]')],['Hirer', or(d.hireeName,'[Hirer]')],['Event', d.eventName],['Date', fmtDate(d.eventDate)],['Start Time', d.startTime],['End Time', d.endTime],['Attendees', d.expectedAttendees],['Hire Price', d.hirePrice],['Deposit', d.deposit],['Balance Due', fmtDate(d.paymentDue)]])),
    d.includedFacilities ? section('Included Facilities', `<p>${nl2br(d.includedFacilities)}</p>`) : '',
    d.rules ? section('Venue Rules & Conditions', `<p>${nl2br(d.rules)}</p>`) : '',
    d.cancellationPolicy ? section('Cancellation Policy', `<p>${nl2br(d.cancellationPolicy)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Venue Representative</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Hirer Signature</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const cateringOrder = mk('catering-order', 'Catering Order Form', 'A catering order form for events or corporate catering.', ['catering', 'order', 'event', 'food'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'cateringCompany', label: 'Catering Company', type: 'text', required: true },
    { id: 'clientName', label: 'Client Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'eventTime', label: 'Service Time', type: 'text', required: false },
    { id: 'venue', label: 'Venue / Delivery Address', type: 'textarea', required: false },
    { id: 'guestCount', label: 'Number of Guests', type: 'text', required: false },
    { id: 'menuItems', label: 'Menu Items / Packages', type: 'textarea', required: false },
    { id: 'dietaryRequirements', label: 'Dietary Requirements', type: 'textarea', required: false },
    { id: 'totalPrice', label: 'Total Price', type: 'text', required: false },
    { id: 'depositPaid', label: 'Deposit Paid', type: 'text', required: false },
    { id: 'specialInstructions', label: 'Special Instructions', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Catering Order', infoTable([['Caterer', or(d.cateringCompany,'[Caterer]')],['Client', or(d.clientName,'[Client]')],['Date', fmtDate(d.eventDate)],['Service Time', d.eventTime],['Guests', d.guestCount],['Total Price', d.totalPrice],['Deposit Paid', d.depositPaid]])),
    section('Venue / Delivery', `<p>${nl2br(or(d.venue,'[Venue]'))}</p>`),
    d.menuItems ? section('Menu Items', `<p>${nl2br(d.menuItems)}</p>`) : '',
    d.dietaryRequirements ? section('Dietary Requirements', `<p>${nl2br(d.dietaryRequirements)}</p>`) : '',
    d.specialInstructions ? section('Special Instructions', `<p>${nl2br(d.specialInstructions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const guestFeedbackForm = mk('guest-feedback-form', 'Guest Feedback Form', 'A guest feedback form for hotels, restaurants or events.', ['feedback', 'guest', 'hospitality', 'review'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'businessName', label: 'Business Name', type: 'text', required: true },
    { id: 'visitDate', label: 'Visit / Event Date', type: 'date', required: false },
    { id: 'guestName', label: 'Guest Name (optional)', type: 'text', required: false },
    { id: 'overallRating', label: 'Overall Rating (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'foodRating', label: 'Food / Service Rating', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'staffRating', label: 'Staff Rating', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'highlights', label: 'What Did You Enjoy Most?', type: 'textarea', required: false },
    { id: 'improvements', label: 'What Could We Improve?', type: 'textarea', required: false },
    { id: 'recommend', label: 'Would You Recommend Us?', type: 'select', required: false, options: ['Yes', 'No', 'Maybe'] },
    { id: 'additionalComments', label: 'Additional Comments', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Guest Feedback', infoTable([['Business', or(d.businessName,'[Business]')],['Visit Date', fmtDate(d.visitDate)],['Guest', d.guestName || 'Anonymous'],['Overall Rating', d.overallRating],['Food / Service', d.foodRating],['Staff', d.staffRating],['Would Recommend', d.recommend]])),
    d.highlights ? section('What They Enjoyed', `<p>${nl2br(d.highlights)}</p>`) : '',
    d.improvements ? section('Suggested Improvements', `<p>${nl2br(d.improvements)}</p>`) : '',
    d.additionalComments ? section('Additional Comments', `<p>${nl2br(d.additionalComments)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const eventBudgetPlanner = mk('event-budget-planner', 'Event Budget Planner', 'A budget planner for events, parties or functions.', ['budget', 'event', 'planner', 'finance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'eventName', label: 'Event Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'totalBudget', label: 'Total Budget', type: 'text', required: false },
    { id: 'venue', label: 'Venue Cost', type: 'text', required: false },
    { id: 'catering', label: 'Catering Cost', type: 'text', required: false },
    { id: 'entertainment', label: 'Entertainment Cost', type: 'text', required: false },
    { id: 'decorations', label: 'Decorations Cost', type: 'text', required: false },
    { id: 'marketing', label: 'Marketing / Invitations Cost', type: 'text', required: false },
    { id: 'staffing', label: 'Staffing Cost', type: 'text', required: false },
    { id: 'other', label: 'Other Costs', type: 'text', required: false },
    { id: 'contingency', label: 'Contingency', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Event Budget Planner', infoTable([['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)],['Total Budget', d.totalBudget]])),
    section('Budget Breakdown', infoTable([['Venue', d.venue],['Catering', d.catering],['Entertainment', d.entertainment],['Decorations', d.decorations],['Marketing / Invitations', d.marketing],['Staffing', d.staffing],['Other', d.other],['Contingency', d.contingency]])),
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const weddingPlannerDoc = mk('wedding-planner', 'Wedding Planner', 'A comprehensive wedding planning document.', ['wedding', 'planner', 'event'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'coupleName', label: 'Couple Names', type: 'text', required: true },
    { id: 'weddingDate', label: 'Wedding Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'guestCount', label: 'Guest Count', type: 'text', required: false },
    { id: 'budget', label: 'Total Budget', type: 'text', required: false },
    { id: 'theme', label: 'Theme / Style', type: 'text', required: false },
    { id: 'vendors', label: 'Key Vendors', type: 'textarea', required: false },
    { id: 'timeline', label: 'Day Timeline', type: 'textarea', required: false },
    { id: 'checklist', label: 'Planning Checklist', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Wedding Details', infoTable([['Couple', or(d.coupleName,'[Couple]')],['Date', fmtDate(d.weddingDate)],['Venue', d.venue],['Guests', d.guestCount],['Budget', d.budget],['Theme', d.theme]])),
    d.vendors ? section('Key Vendors', `<p>${nl2br(d.vendors)}</p>`) : '',
    d.timeline ? section('Day Timeline', `<p>${nl2br(d.timeline)}</p>`) : '',
    d.checklist ? section('Planning Checklist', `<p>${nl2br(d.checklist)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const staffRosterHospitality = mk('hospitality-staff-roster', 'Hospitality Staff Roster', 'A staff roster for hospitality, restaurant or event teams.', ['roster', 'staff', 'hospitality', 'shifts'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'businessName', label: 'Business Name', type: 'text', required: true },
    { id: 'weekCommencing', label: 'Week Commencing', type: 'date', required: false },
    { id: 'manager', label: 'Manager', type: 'text', required: false },
    { id: 'rosterDetails', label: 'Roster (Staff Name, Day, Shift Times, Role)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Staff Roster', infoTable([['Business', or(d.businessName,'[Business]')],['Week Commencing', fmtDate(d.weekCommencing)],['Manager', d.manager]])),
    d.rosterDetails ? section('Roster', `<p>${nl2br(d.rosterDetails)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const eventChecklist = mk('event-checklist', 'Event Planning Checklist', 'A comprehensive event planning checklist.', ['event', 'checklist', 'planning'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'eventName', label: 'Event Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'organiser', label: 'Organiser', type: 'text', required: false },
    { id: 'preEventTasks', label: 'Pre-Event Tasks', type: 'textarea', required: false },
    { id: 'dayOfTasks', label: 'Day-of Tasks', type: 'textarea', required: false },
    { id: 'postEventTasks', label: 'Post-Event Tasks', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Event Checklist', infoTable([['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)],['Organiser', d.organiser]])),
    d.preEventTasks ? section('Pre-Event Tasks', `<p>${nl2br(d.preEventTasks)}</p>`) : '',
    d.dayOfTasks ? section('Day-of Tasks', `<p>${nl2br(d.dayOfTasks)}</p>`) : '',
    d.postEventTasks ? section('Post-Event Tasks', `<p>${nl2br(d.postEventTasks)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const supplierContactList = mk('supplier-contact-list', 'Supplier Contact List', 'A contact list for event or hospitality suppliers.', ['supplier', 'contact', 'event', 'hospitality'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'businessName', label: 'Business / Event Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'suppliers', label: 'Suppliers (Name, Type, Contact, Phone, Email)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Supplier Contact List', infoTable([['Business', or(d.businessName,'[Business]')],['Date', fmtDate(d.date)]])),
    d.suppliers ? section('Suppliers', `<p>${nl2br(d.suppliers)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const menuPlanningDoc = mk('menu-planning', 'Menu Planning Document', 'A menu planning document for restaurants, cafes or events.', ['menu', 'planning', 'food', 'hospitality'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'businessName', label: 'Business Name', type: 'text', required: true },
    { id: 'menuPeriod', label: 'Menu Period / Season', type: 'text', required: false },
    { id: 'starters', label: 'Starters', type: 'textarea', required: false },
    { id: 'mains', label: 'Main Courses', type: 'textarea', required: false },
    { id: 'desserts', label: 'Desserts', type: 'textarea', required: false },
    { id: 'drinks', label: 'Drinks / Beverages', type: 'textarea', required: false },
    { id: 'allergens', label: 'Key Allergen Information', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Menu Plan', infoTable([['Business', or(d.businessName,'[Business]')],['Period', d.menuPeriod]])),
    d.starters ? section('Starters', `<p>${nl2br(d.starters)}</p>`) : '',
    d.mains ? section('Main Courses', `<p>${nl2br(d.mains)}</p>`) : '',
    d.desserts ? section('Desserts', `<p>${nl2br(d.desserts)}</p>`) : '',
    d.drinks ? section('Drinks', `<p>${nl2br(d.drinks)}</p>`) : '',
    d.allergens ? section('Allergen Information', `<p>${nl2br(d.allergens)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_HOSPITALITY_TEMPLATES: DocumentTemplate[] = [
  eventRunSheet, venueHireAgreement, cateringOrder, guestFeedbackForm,
  eventBudgetPlanner, weddingPlannerDoc, staffRosterHospitality,
  eventChecklist, supplierContactList, menuPlanningDoc,
];
