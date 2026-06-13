/**
 * General-purpose templates covering personal planning, sports, household,
 * education, certificates, and miscellaneous operational documents.
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate } from './html-helpers';

// ── Helpers ───────────────────────────────────────────────────────────────────
function personal(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'personal', icon: 'FileText', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}
function education(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'education', icon: 'GraduationCap', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}
function forms(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'forms', icon: 'ClipboardList', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}
function reports(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'reports', icon: 'BarChart2', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}
function property(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'property', icon: 'Home', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}
function hr(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'hr', icon: 'UserCog', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

// ── Personal Planners ─────────────────────────────────────────────────────────
export const goalPlanner = personal('goal-planner', 'Goal Planner', 'A personal goal-setting and action plan document.', ['goals', 'planner', 'personal'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'period', label: 'Period', type: 'text', required: false },
    { id: 'goals', label: 'Goals', type: 'textarea', required: false },
    { id: 'actions', label: 'Action Steps', type: 'textarea', required: false },
    { id: 'obstacles', label: 'Potential Obstacles', type: 'textarea', required: false },
    { id: 'support', label: 'Support Needed', type: 'textarea', required: false },
    { id: 'reviewDate', label: 'Review Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Goal Planner', infoTable([['Name', d.name],['Period', d.period],['Review Date', fmtDate(d.reviewDate)]])),
    d.goals ? section('Goals', `<p>${nl2br(d.goals)}</p>`) : '',
    d.actions ? section('Action Steps', `<p>${nl2br(d.actions)}</p>`) : '',
    d.obstacles ? section('Potential Obstacles', `<p>${nl2br(d.obstacles)}</p>`) : '',
    d.support ? section('Support Needed', `<p>${nl2br(d.support)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const weeklyPlanner = personal('weekly-planner', 'Weekly Planner', 'A weekly schedule and task planner.', ['weekly', 'planner', 'schedule'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Name', type: 'text', required: false },
    { id: 'weekCommencing', label: 'Week Commencing', type: 'date', required: false },
    { id: 'monday', label: 'Monday', type: 'textarea', required: false },
    { id: 'tuesday', label: 'Tuesday', type: 'textarea', required: false },
    { id: 'wednesday', label: 'Wednesday', type: 'textarea', required: false },
    { id: 'thursday', label: 'Thursday', type: 'textarea', required: false },
    { id: 'friday', label: 'Friday', type: 'textarea', required: false },
    { id: 'saturday', label: 'Saturday', type: 'textarea', required: false },
    { id: 'sunday', label: 'Sunday', type: 'textarea', required: false },
    { id: 'priorities', label: 'Top Priorities This Week', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Weekly Planner', infoTable([['Name', d.name],['Week Commencing', fmtDate(d.weekCommencing)]])),
    d.priorities ? section('Top Priorities', `<p>${nl2br(d.priorities)}</p>`) : '',
    d.monday ? section('Monday', `<p>${nl2br(d.monday)}</p>`) : '',
    d.tuesday ? section('Tuesday', `<p>${nl2br(d.tuesday)}</p>`) : '',
    d.wednesday ? section('Wednesday', `<p>${nl2br(d.wednesday)}</p>`) : '',
    d.thursday ? section('Thursday', `<p>${nl2br(d.thursday)}</p>`) : '',
    d.friday ? section('Friday', `<p>${nl2br(d.friday)}</p>`) : '',
    d.saturday ? section('Saturday', `<p>${nl2br(d.saturday)}</p>`) : '',
    d.sunday ? section('Sunday', `<p>${nl2br(d.sunday)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const monthlyPlanner = personal('monthly-planner', 'Monthly Planner', 'A monthly goals and task planner.', ['monthly', 'planner', 'goals'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Name', type: 'text', required: false },
    { id: 'month', label: 'Month / Year', type: 'text', required: false },
    { id: 'goals', label: 'Monthly Goals', type: 'textarea', required: false },
    { id: 'keyDates', label: 'Key Dates / Events', type: 'textarea', required: false },
    { id: 'tasks', label: 'Tasks / To-Do List', type: 'textarea', required: false },
    { id: 'habits', label: 'Habits to Track', type: 'textarea', required: false },
    { id: 'reflection', label: 'End-of-Month Reflection', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Monthly Planner', infoTable([['Name', d.name],['Month', d.month]])),
    d.goals ? section('Monthly Goals', `<p>${nl2br(d.goals)}</p>`) : '',
    d.keyDates ? section('Key Dates', `<p>${nl2br(d.keyDates)}</p>`) : '',
    d.tasks ? section('Tasks', `<p>${nl2br(d.tasks)}</p>`) : '',
    d.habits ? section('Habits to Track', `<p>${nl2br(d.habits)}</p>`) : '',
    d.reflection ? section('Reflection', `<p>${nl2br(d.reflection)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const habitTracker = personal('habit-tracker', 'Habit Tracker', 'A habit tracker to monitor daily habits and routines.', ['habit', 'tracker', 'personal', 'routine'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Name', type: 'text', required: false },
    { id: 'month', label: 'Month', type: 'text', required: false },
    { id: 'habits', label: 'Habits to Track (one per line)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Habit Tracker', infoTable([['Name', d.name],['Month', d.month]])),
    d.habits ? section('Habits', `<p>${nl2br(d.habits)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const travelPlanner = personal('travel-planner', 'Travel Planner', 'A travel itinerary and planning document.', ['travel', 'planner', 'itinerary', 'holiday'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'traveller', label: 'Traveller Name(s)', type: 'text', required: false },
    { id: 'destination', label: 'Destination', type: 'text', required: true },
    { id: 'departureDate', label: 'Departure Date', type: 'date', required: false },
    { id: 'returnDate', label: 'Return Date', type: 'date', required: false },
    { id: 'accommodation', label: 'Accommodation Details', type: 'textarea', required: false },
    { id: 'flights', label: 'Flights / Transport', type: 'textarea', required: false },
    { id: 'itinerary', label: 'Day-by-Day Itinerary', type: 'textarea', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'packingList', label: 'Packing List', type: 'textarea', required: false },
    { id: 'emergencyContacts', label: 'Emergency Contacts', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Travel Planner', infoTable([['Traveller', d.traveller],['Destination', or(d.destination,'[Destination]')],['Departure', fmtDate(d.departureDate)],['Return', fmtDate(d.returnDate)],['Budget', d.budget]])),
    d.flights ? section('Flights / Transport', `<p>${nl2br(d.flights)}</p>`) : '',
    d.accommodation ? section('Accommodation', `<p>${nl2br(d.accommodation)}</p>`) : '',
    d.itinerary ? section('Itinerary', `<p>${nl2br(d.itinerary)}</p>`) : '',
    d.packingList ? section('Packing List', `<p>${nl2br(d.packingList)}</p>`) : '',
    d.emergencyContacts ? section('Emergency Contacts', `<p>${nl2br(d.emergencyContacts)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const movingHousePlanner = personal('moving-house-planner', 'Moving House Planner', 'A checklist and planner for moving house.', ['moving', 'house', 'planner', 'checklist'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Name', type: 'text', required: false },
    { id: 'movingDate', label: 'Moving Date', type: 'date', required: false },
    { id: 'fromAddress', label: 'Moving From', type: 'textarea', required: false },
    { id: 'toAddress', label: 'Moving To', type: 'textarea', required: false },
    { id: 'removalCompany', label: 'Removal Company', type: 'text', required: false },
    { id: 'preMoveTasks', label: 'Pre-Move Tasks', type: 'textarea', required: false },
    { id: 'movingDayTasks', label: 'Moving Day Tasks', type: 'textarea', required: false },
    { id: 'postMoveTasks', label: 'Post-Move Tasks', type: 'textarea', required: false },
    { id: 'notifyList', label: 'People / Organisations to Notify', type: 'textarea', required: false },
    { id: 'budget', label: 'Moving Budget', type: 'text', required: false },
  ]}],
  (d) => [
    section('Moving House Planner', infoTable([['Name', d.name],['Moving Date', fmtDate(d.movingDate)],['Removal Company', d.removalCompany],['Budget', d.budget]])),
    d.fromAddress ? section('Moving From', `<p>${nl2br(d.fromAddress)}</p>`) : '',
    d.toAddress ? section('Moving To', `<p>${nl2br(d.toAddress)}</p>`) : '',
    d.preMoveTasks ? section('Pre-Move Tasks', `<p>${nl2br(d.preMoveTasks)}</p>`) : '',
    d.movingDayTasks ? section('Moving Day Tasks', `<p>${nl2br(d.movingDayTasks)}</p>`) : '',
    d.postMoveTasks ? section('Post-Move Tasks', `<p>${nl2br(d.postMoveTasks)}</p>`) : '',
    d.notifyList ? section('Notify List', `<p>${nl2br(d.notifyList)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const petCareRecord = personal('pet-care-record', 'Pet Care Record', 'A pet care and health record document.', ['pet', 'care', 'record', 'animal'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'petName', label: 'Pet Name', type: 'text', required: true },
    { id: 'species', label: 'Species / Breed', type: 'text', required: false },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: false },
    { id: 'ownerName', label: 'Owner Name', type: 'text', required: false },
    { id: 'vetName', label: 'Vet Name / Practice', type: 'text', required: false },
    { id: 'vetPhone', label: 'Vet Phone', type: 'text', required: false },
    { id: 'vaccinations', label: 'Vaccinations', type: 'textarea', required: false },
    { id: 'medications', label: 'Medications', type: 'textarea', required: false },
    { id: 'feedingSchedule', label: 'Feeding Schedule', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Pet Care Record', infoTable([['Pet', or(d.petName,'[Pet]')],['Species / Breed', d.species],['DOB', fmtDate(d.dob)],['Owner', d.ownerName],['Vet', d.vetName],['Vet Phone', d.vetPhone]])),
    d.vaccinations ? section('Vaccinations', `<p>${nl2br(d.vaccinations)}</p>`) : '',
    d.medications ? section('Medications', `<p>${nl2br(d.medications)}</p>`) : '',
    d.feedingSchedule ? section('Feeding Schedule', `<p>${nl2br(d.feedingSchedule)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const householdInventory = property('household-inventory', 'Household Inventory', 'A household contents inventory for insurance or moving purposes.', ['household', 'inventory', 'contents', 'insurance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'ownerName', label: 'Owner Name', type: 'text', required: false },
    { id: 'address', label: 'Property Address', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'items', label: 'Items (Room, Item, Description, Estimated Value)', type: 'textarea', required: false },
    { id: 'totalValue', label: 'Total Estimated Value', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Household Inventory', infoTable([['Owner', d.ownerName],['Address', d.address],['Date', fmtDate(d.date)],['Total Value', d.totalValue]])),
    d.items ? section('Items', `<p>${nl2br(d.items)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const homeMaintenanceLog = property('home-maintenance-log', 'Home Maintenance Log', 'A log of home maintenance tasks and repairs.', ['home', 'maintenance', 'log', 'repairs'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'address', label: 'Property Address', type: 'textarea', required: false },
    { id: 'owner', label: 'Owner Name', type: 'text', required: false },
    { id: 'maintenanceLog', label: 'Maintenance Log (Date, Task, Contractor, Cost)', type: 'textarea', required: false },
    { id: 'upcomingTasks', label: 'Upcoming Tasks', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Home Maintenance Log', infoTable([['Property', d.address],['Owner', d.owner]])),
    d.maintenanceLog ? section('Maintenance Log', `<p>${nl2br(d.maintenanceLog)}</p>`) : '',
    d.upcomingTasks ? section('Upcoming Tasks', `<p>${nl2br(d.upcomingTasks)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Sports & Clubs ────────────────────────────────────────────────────────────
export const teamRegister = forms('team-register', 'Team Register', 'A register of team members for a sports club or group.', ['team', 'register', 'sports', 'club'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'teamName', label: 'Team / Club Name', type: 'text', required: true },
    { id: 'season', label: 'Season / Year', type: 'text', required: false },
    { id: 'manager', label: 'Manager / Coach', type: 'text', required: false },
    { id: 'members', label: 'Members (Name, Position, Contact)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Team Register', infoTable([['Team', or(d.teamName,'[Team]')],['Season', d.season],['Manager', d.manager]])),
    d.members ? section('Members', `<p>${nl2br(d.members)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const matchAttendanceSheet = forms('match-attendance-sheet', 'Match Attendance Sheet', 'An attendance sheet for a sports match or training session.', ['attendance', 'match', 'sports', 'training'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'teamName', label: 'Team / Club Name', type: 'text', required: true },
    { id: 'opponent', label: 'Opponent / Session Type', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'players', label: 'Players Present', type: 'textarea', required: false },
    { id: 'absentees', label: 'Absentees', type: 'textarea', required: false },
    { id: 'result', label: 'Result (if match)', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Match Attendance', infoTable([['Team', or(d.teamName,'[Team]')],['Opponent', d.opponent],['Date', fmtDate(d.date)],['Venue', d.venue],['Result', d.result]])),
    d.players ? section('Players Present', `<p>${nl2br(d.players)}</p>`) : '',
    d.absentees ? section('Absentees', `<p>${nl2br(d.absentees)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const fixtureList = forms('fixture-list', 'Fixture List', 'A fixture list for a sports team or league.', ['fixtures', 'sports', 'schedule', 'league'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'teamName', label: 'Team / Club Name', type: 'text', required: true },
    { id: 'season', label: 'Season', type: 'text', required: false },
    { id: 'fixtures', label: 'Fixtures (Date, Opponent, Venue, Time)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Fixture List', infoTable([['Team', or(d.teamName,'[Team]')],['Season', d.season]])),
    d.fixtures ? section('Fixtures', `<p>${nl2br(d.fixtures)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const tournamentPlanner = forms('tournament-planner', 'Tournament Planner', 'A planner for organising a sports tournament.', ['tournament', 'planner', 'sports', 'event'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'tournamentName', label: 'Tournament Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'organiser', label: 'Organiser', type: 'text', required: false },
    { id: 'teams', label: 'Participating Teams', type: 'textarea', required: false },
    { id: 'format', label: 'Tournament Format', type: 'textarea', required: false },
    { id: 'schedule', label: 'Schedule', type: 'textarea', required: false },
    { id: 'prizes', label: 'Prizes', type: 'textarea', required: false },
    { id: 'rules', label: 'Rules', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Tournament Planner', infoTable([['Tournament', or(d.tournamentName,'[Tournament]')],['Date', fmtDate(d.date)],['Venue', d.venue],['Organiser', d.organiser]])),
    d.teams ? section('Participating Teams', `<p>${nl2br(d.teams)}</p>`) : '',
    d.format ? section('Format', `<p>${nl2br(d.format)}</p>`) : '',
    d.schedule ? section('Schedule', `<p>${nl2br(d.schedule)}</p>`) : '',
    d.prizes ? section('Prizes', `<p>${nl2br(d.prizes)}</p>`) : '',
    d.rules ? section('Rules', `<p>${nl2br(d.rules)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Certificates ──────────────────────────────────────────────────────────────
export const certificateOfAttendance = education('certificate-of-attendance', 'Certificate of Attendance', 'A certificate of attendance for a course, event or training.', ['certificate', 'attendance', 'training'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Issuing Organisation', type: 'text', required: true },
    { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
    { id: 'eventName', label: 'Event / Course Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'duration', label: 'Duration', type: 'text', required: false },
    { id: 'signatory', label: 'Signatory Name', type: 'text', required: false },
    { id: 'signatoryTitle', label: 'Signatory Title', type: 'text', required: false },
  ]}],
  (d) => [
    `<div style="text-align:center;padding:20px 0;">
      <p style="font-size:9pt;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 8px 0;">Certificate of Attendance</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">This is to certify that</p>
      <p style="font-size:18pt;font-weight:700;color:#1B4F8A;margin:0 0 8px 0;">${or(d.recipientName,'[Recipient]')}</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 8px 0;">attended</p>
      <p style="font-size:13pt;font-weight:600;margin:0 0 8px 0;">${or(d.eventName,'[Event]')}</p>
      ${d.date ? `<p style="font-size:9pt;color:#374151;margin:0 0 4px 0;">on ${fmtDate(d.date)}</p>` : ''}
      ${d.duration ? `<p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">Duration: ${d.duration}</p>` : ''}
      <p style="font-size:9pt;color:#374151;margin:0 0 24px 0;">Issued by <strong>${or(d.orgName,'[Organisation]')}</strong></p>
      <div style="display:inline-block;text-align:center;margin-top:16px;">
        <div style="height:1px;background:#374151;width:200px;margin-bottom:4px;"></div>
        <p style="font-size:8.5pt;margin:0;">${d.signatory || '[Signatory]'}${d.signatoryTitle ? `<br>${d.signatoryTitle}` : ''}</p>
      </div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const certificateOfCompletion = education('certificate-of-completion', 'Certificate of Completion', 'A certificate of completion for a course or programme.', ['certificate', 'completion', 'course', 'training'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Issuing Organisation', type: 'text', required: true },
    { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
    { id: 'courseName', label: 'Course / Programme Name', type: 'text', required: true },
    { id: 'completionDate', label: 'Completion Date', type: 'date', required: false },
    { id: 'grade', label: 'Grade / Result (optional)', type: 'text', required: false },
    { id: 'signatory', label: 'Signatory Name', type: 'text', required: false },
    { id: 'signatoryTitle', label: 'Signatory Title', type: 'text', required: false },
  ]}],
  (d) => [
    `<div style="text-align:center;padding:20px 0;">
      <p style="font-size:9pt;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 8px 0;">Certificate of Completion</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">This is to certify that</p>
      <p style="font-size:18pt;font-weight:700;color:#1B4F8A;margin:0 0 8px 0;">${or(d.recipientName,'[Recipient]')}</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 8px 0;">has successfully completed</p>
      <p style="font-size:13pt;font-weight:600;margin:0 0 8px 0;">${or(d.courseName,'[Course]')}</p>
      ${d.completionDate ? `<p style="font-size:9pt;color:#374151;margin:0 0 4px 0;">Completed: ${fmtDate(d.completionDate)}</p>` : ''}
      ${d.grade ? `<p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">Grade: <strong>${d.grade}</strong></p>` : ''}
      <p style="font-size:9pt;color:#374151;margin:0 0 24px 0;">Issued by <strong>${or(d.orgName,'[Organisation]')}</strong></p>
      <div style="display:inline-block;text-align:center;margin-top:16px;">
        <div style="height:1px;background:#374151;width:200px;margin-bottom:4px;"></div>
        <p style="font-size:8.5pt;margin:0;">${d.signatory || '[Signatory]'}${d.signatoryTitle ? `<br>${d.signatoryTitle}` : ''}</p>
      </div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const achievementCertificate = education('achievement-certificate', 'Achievement Certificate', 'A certificate recognising an achievement or award.', ['certificate', 'achievement', 'award', 'recognition'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Issuing Organisation', type: 'text', required: true },
    { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
    { id: 'achievement', label: 'Achievement / Award', type: 'text', required: true },
    { id: 'reason', label: 'Reason / Description', type: 'textarea', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'signatory', label: 'Signatory Name', type: 'text', required: false },
    { id: 'signatoryTitle', label: 'Signatory Title', type: 'text', required: false },
  ]}],
  (d) => [
    `<div style="text-align:center;padding:20px 0;">
      <p style="font-size:9pt;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 8px 0;">Certificate of Achievement</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">Presented to</p>
      <p style="font-size:18pt;font-weight:700;color:#1B4F8A;margin:0 0 8px 0;">${or(d.recipientName,'[Recipient]')}</p>
      <p style="font-size:9pt;color:#374151;margin:0 0 8px 0;">in recognition of</p>
      <p style="font-size:13pt;font-weight:600;margin:0 0 8px 0;">${or(d.achievement,'[Achievement]')}</p>
      ${d.reason ? `<p style="font-size:9pt;color:#374151;margin:0 0 8px 0;font-style:italic;">${d.reason}</p>` : ''}
      ${d.date ? `<p style="font-size:9pt;color:#374151;margin:0 0 16px 0;">${fmtDate(d.date)}</p>` : ''}
      <p style="font-size:9pt;color:#374151;margin:0 0 24px 0;">Issued by <strong>${or(d.orgName,'[Organisation]')}</strong></p>
      <div style="display:inline-block;text-align:center;margin-top:16px;">
        <div style="height:1px;background:#374151;width:200px;margin-bottom:4px;"></div>
        <p style="font-size:8.5pt;margin:0;">${d.signatory || '[Signatory]'}${d.signatoryTitle ? `<br>${d.signatoryTitle}` : ''}</p>
      </div>
    </div>`,
  ].filter(Boolean).join(''),
);

// ── Education ─────────────────────────────────────────────────────────────────
export const studyPlanner = education('study-planner', 'Study Planner', 'A study schedule and revision planner for students.', ['study', 'planner', 'revision', 'student'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'studentName', label: 'Student Name', type: 'text', required: false },
    { id: 'examPeriod', label: 'Exam / Study Period', type: 'text', required: false },
    { id: 'subjects', label: 'Subjects / Modules', type: 'textarea', required: false },
    { id: 'weeklySchedule', label: 'Weekly Study Schedule', type: 'textarea', required: false },
    { id: 'examDates', label: 'Exam Dates', type: 'textarea', required: false },
    { id: 'goals', label: 'Study Goals', type: 'textarea', required: false },
    { id: 'resources', label: 'Resources / Materials', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Study Planner', infoTable([['Student', d.studentName],['Period', d.examPeriod]])),
    d.subjects ? section('Subjects / Modules', `<p>${nl2br(d.subjects)}</p>`) : '',
    d.examDates ? section('Exam Dates', `<p>${nl2br(d.examDates)}</p>`) : '',
    d.weeklySchedule ? section('Weekly Schedule', `<p>${nl2br(d.weeklySchedule)}</p>`) : '',
    d.goals ? section('Study Goals', `<p>${nl2br(d.goals)}</p>`) : '',
    d.resources ? section('Resources', `<p>${nl2br(d.resources)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const trainingRegister = education('training-register', 'Training Register', 'A register of staff or participant training records.', ['training', 'register', 'record', 'hr'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'trainingTitle', label: 'Training Title', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'trainer', label: 'Trainer / Provider', type: 'text', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'participants', label: 'Participants (Name, Role, Signature)', type: 'textarea', required: false },
    { id: 'learningObjectives', label: 'Learning Objectives', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Training Register', infoTable([['Organisation', or(d.orgName,'[Org]')],['Training', or(d.trainingTitle,'[Training]')],['Date', fmtDate(d.date)],['Trainer', d.trainer],['Location', d.location]])),
    d.learningObjectives ? section('Learning Objectives', `<p>${nl2br(d.learningObjectives)}</p>`) : '',
    d.participants ? section('Participants', `<p>${nl2br(d.participants)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const workshopPlanner = education('workshop-planner', 'Workshop Planner', 'A planning document for a workshop or training session.', ['workshop', 'planner', 'training', 'session'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'workshopTitle', label: 'Workshop Title', type: 'text', required: true },
    { id: 'facilitator', label: 'Facilitator', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'duration', label: 'Duration', type: 'text', required: false },
    { id: 'venue', label: 'Venue', type: 'text', required: false },
    { id: 'objectives', label: 'Learning Objectives', type: 'textarea', required: false },
    { id: 'agenda', label: 'Agenda / Session Plan', type: 'textarea', required: false },
    { id: 'materials', label: 'Materials Required', type: 'textarea', required: false },
    { id: 'activities', label: 'Activities', type: 'textarea', required: false },
    { id: 'evaluation', label: 'Evaluation Method', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Workshop Planner', infoTable([['Workshop', or(d.workshopTitle,'[Workshop]')],['Facilitator', d.facilitator],['Date', fmtDate(d.date)],['Duration', d.duration],['Venue', d.venue]])),
    d.objectives ? section('Learning Objectives', `<p>${nl2br(d.objectives)}</p>`) : '',
    d.agenda ? section('Agenda / Session Plan', `<p>${nl2br(d.agenda)}</p>`) : '',
    d.materials ? section('Materials Required', `<p>${nl2br(d.materials)}</p>`) : '',
    d.activities ? section('Activities', `<p>${nl2br(d.activities)}</p>`) : '',
    d.evaluation ? section('Evaluation', `<p>${nl2br(d.evaluation)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Business Operations ───────────────────────────────────────────────────────
export const visitorRegister = forms('visitor-register', 'Visitor Register', 'A visitor sign-in register for offices, schools or sites.', ['visitor', 'register', 'sign-in', 'security'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'visitors', label: 'Visitors (Name, Company, Host, Time In, Time Out)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Visitor Register', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)]])),
    d.visitors ? section('Visitors', `<p>${nl2br(d.visitors)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const dailyChecklist = forms('daily-checklist', 'Daily Checklist', 'A daily operational checklist for businesses or teams.', ['checklist', 'daily', 'operations'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Team', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'completedBy', label: 'Completed By', type: 'text', required: false },
    { id: 'morningTasks', label: 'Morning Tasks', type: 'textarea', required: false },
    { id: 'afternoonTasks', label: 'Afternoon Tasks', type: 'textarea', required: false },
    { id: 'closingTasks', label: 'Closing / End-of-Day Tasks', type: 'textarea', required: false },
    { id: 'issues', label: 'Issues / Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Daily Checklist', infoTable([['Organisation', d.orgName],['Date', fmtDate(d.date)],['Completed By', d.completedBy]])),
    d.morningTasks ? section('Morning Tasks', `<p>${nl2br(d.morningTasks)}</p>`) : '',
    d.afternoonTasks ? section('Afternoon Tasks', `<p>${nl2br(d.afternoonTasks)}</p>`) : '',
    d.closingTasks ? section('Closing Tasks', `<p>${nl2br(d.closingTasks)}</p>`) : '',
    d.issues ? section('Issues / Notes', `<p>${nl2br(d.issues)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const weeklyChecklist = forms('weekly-checklist', 'Weekly Checklist', 'A weekly operational checklist.', ['checklist', 'weekly', 'operations'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Team', type: 'text', required: false },
    { id: 'weekCommencing', label: 'Week Commencing', type: 'date', required: false },
    { id: 'completedBy', label: 'Completed By', type: 'text', required: false },
    { id: 'tasks', label: 'Weekly Tasks', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Weekly Checklist', infoTable([['Organisation', d.orgName],['Week Commencing', fmtDate(d.weekCommencing)],['Completed By', d.completedBy]])),
    d.tasks ? section('Tasks', `<p>${nl2br(d.tasks)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const staffSurvey = hr('staff-survey', 'Staff Survey', 'An employee satisfaction or engagement survey.', ['staff', 'survey', 'engagement', 'hr'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'surveyDate', label: 'Survey Date', type: 'date', required: false },
    { id: 'anonymous', label: 'Anonymous?', type: 'select', required: false, options: ['Yes — Anonymous', 'No — Named'] },
    { id: 'overallSatisfaction', label: 'Overall Job Satisfaction (1–5)', type: 'select', required: false, options: ['5 - Very Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'] },
    { id: 'workEnvironment', label: 'Work Environment Rating (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'managementRating', label: 'Management / Leadership Rating (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'highlights', label: 'What Do You Value Most?', type: 'textarea', required: false },
    { id: 'improvements', label: 'What Could Be Improved?', type: 'textarea', required: false },
    { id: 'additionalComments', label: 'Additional Comments', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Staff Survey', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.surveyDate)],['Anonymous', d.anonymous],['Overall Satisfaction', d.overallSatisfaction],['Work Environment', d.workEnvironment],['Management', d.managementRating]])),
    d.highlights ? section('What They Value Most', `<p>${nl2br(d.highlights)}</p>`) : '',
    d.improvements ? section('Suggested Improvements', `<p>${nl2br(d.improvements)}</p>`) : '',
    d.additionalComments ? section('Additional Comments', `<p>${nl2br(d.additionalComments)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const exitChecklist = hr('exit-checklist', 'Exit Checklist', 'An employee exit checklist for HR and IT teams.', ['exit', 'checklist', 'leaver', 'hr'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
    { id: 'lastDay', label: 'Last Working Day', type: 'date', required: false },
    { id: 'department', label: 'Department', type: 'text', required: false },
    { id: 'manager', label: 'Line Manager', type: 'text', required: false },
    { id: 'hrTasks', label: 'HR Tasks', type: 'textarea', required: false },
    { id: 'itTasks', label: 'IT Tasks', type: 'textarea', required: false },
    { id: 'equipmentReturned', label: 'Equipment Returned', type: 'textarea', required: false },
    { id: 'handoverCompleted', label: 'Handover Completed?', type: 'select', required: false, options: ['Yes', 'No', 'Partial'] },
    { id: 'exitInterviewCompleted', label: 'Exit Interview Completed?', type: 'select', required: false, options: ['Yes', 'No'] },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Exit Checklist', infoTable([['Employee', or(d.employeeName,'[Employee]')],['Last Day', fmtDate(d.lastDay)],['Department', d.department],['Manager', d.manager],['Handover', d.handoverCompleted],['Exit Interview', d.exitInterviewCompleted]])),
    d.hrTasks ? section('HR Tasks', `<p>${nl2br(d.hrTasks)}</p>`) : '',
    d.itTasks ? section('IT Tasks', `<p>${nl2br(d.itTasks)}</p>`) : '',
    d.equipmentReturned ? section('Equipment Returned', `<p>${nl2br(d.equipmentReturned)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const skillsMatrix = hr('skills-matrix', 'Skills Matrix', 'A team skills matrix to map competencies across staff.', ['skills', 'matrix', 'competency', 'hr'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Team', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'manager', label: 'Manager', type: 'text', required: false },
    { id: 'skills', label: 'Skills / Competencies', type: 'textarea', required: false },
    { id: 'teamMembers', label: 'Team Members & Ratings', type: 'textarea', required: false },
    { id: 'gaps', label: 'Identified Skill Gaps', type: 'textarea', required: false },
    { id: 'trainingPlan', label: 'Training Plan', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Skills Matrix', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)],['Manager', d.manager]])),
    d.skills ? section('Skills / Competencies', `<p>${nl2br(d.skills)}</p>`) : '',
    d.teamMembers ? section('Team Members & Ratings', `<p>${nl2br(d.teamMembers)}</p>`) : '',
    d.gaps ? section('Identified Gaps', `<p>${nl2br(d.gaps)}</p>`) : '',
    d.trainingPlan ? section('Training Plan', `<p>${nl2br(d.trainingPlan)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const communityFeedbackForm = forms('community-feedback-form', 'Community Feedback Form', 'A feedback form for community groups and organisations.', ['feedback', 'community', 'survey'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'respondentName', label: 'Respondent Name (optional)', type: 'text', required: false },
    { id: 'overallRating', label: 'Overall Rating (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
    { id: 'highlights', label: 'What Did You Find Most Valuable?', type: 'textarea', required: false },
    { id: 'improvements', label: 'What Could Be Improved?', type: 'textarea', required: false },
    { id: 'suggestions', label: 'Suggestions for Future Activities', type: 'textarea', required: false },
    { id: 'recommend', label: 'Would You Recommend Us?', type: 'select', required: false, options: ['Yes', 'No', 'Maybe'] },
  ]}],
  (d) => [
    section('Community Feedback', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)],['Respondent', d.respondentName || 'Anonymous'],['Rating', d.overallRating],['Recommend', d.recommend]])),
    d.highlights ? section('Most Valuable', `<p>${nl2br(d.highlights)}</p>`) : '',
    d.improvements ? section('Improvements', `<p>${nl2br(d.improvements)}</p>`) : '',
    d.suggestions ? section('Suggestions', `<p>${nl2br(d.suggestions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const projectClosureReport = reports('project-closure-report', 'Project Closure Report', 'A project closure report summarising outcomes and lessons learned.', ['project', 'closure', 'report', 'lessons learned'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'projectManager', label: 'Project Manager', type: 'text', required: false },
    { id: 'closureDate', label: 'Closure Date', type: 'date', required: false },
    { id: 'summary', label: 'Project Summary', type: 'textarea', required: false },
    { id: 'objectives', label: 'Objectives Achieved', type: 'textarea', required: false },
    { id: 'budget', label: 'Budget Summary', type: 'textarea', required: false },
    { id: 'lessonsLearned', label: 'Lessons Learned', type: 'textarea', required: false },
    { id: 'outstandingActions', label: 'Outstanding Actions', type: 'textarea', required: false },
    { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Project Closure Report', infoTable([['Project', or(d.projectName,'[Project]')],['Manager', d.projectManager],['Closure Date', fmtDate(d.closureDate)]])),
    d.summary ? section('Project Summary', `<p>${nl2br(d.summary)}</p>`) : '',
    d.objectives ? section('Objectives Achieved', `<p>${nl2br(d.objectives)}</p>`) : '',
    d.budget ? section('Budget Summary', `<p>${nl2br(d.budget)}</p>`) : '',
    d.lessonsLearned ? section('Lessons Learned', `<p>${nl2br(d.lessonsLearned)}</p>`) : '',
    d.outstandingActions ? section('Outstanding Actions', `<p>${nl2br(d.outstandingActions)}</p>`) : '',
    d.recommendations ? section('Recommendations', `<p>${nl2br(d.recommendations)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const weeklyStatusReport = reports('weekly-status-report', 'Weekly Status Report', 'A weekly project or team status report.', ['status report', 'weekly', 'project'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project / Team Name', type: 'text', required: true },
    { id: 'reportedBy', label: 'Reported By', type: 'text', required: false },
    { id: 'weekEnding', label: 'Week Ending', type: 'date', required: false },
    { id: 'status', label: 'Overall Status', type: 'select', required: false, options: ['On Track', 'At Risk', 'Off Track', 'Completed'] },
    { id: 'accomplishments', label: 'Accomplishments This Week', type: 'textarea', required: false },
    { id: 'plannedNextWeek', label: 'Planned for Next Week', type: 'textarea', required: false },
    { id: 'risks', label: 'Risks / Issues', type: 'textarea', required: false },
    { id: 'decisions', label: 'Decisions Required', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Weekly Status Report', infoTable([['Project', or(d.projectName,'[Project]')],['Reported By', d.reportedBy],['Week Ending', fmtDate(d.weekEnding)],['Status', d.status]])),
    d.accomplishments ? section('Accomplishments', `<p>${nl2br(d.accomplishments)}</p>`) : '',
    d.plannedNextWeek ? section('Planned Next Week', `<p>${nl2br(d.plannedNextWeek)}</p>`) : '',
    d.risks ? section('Risks / Issues', `<p>${nl2br(d.risks)}</p>`) : '',
    d.decisions ? section('Decisions Required', `<p>${nl2br(d.decisions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_GENERAL_TEMPLATES: DocumentTemplate[] = [
  goalPlanner, weeklyPlanner, monthlyPlanner, habitTracker, travelPlanner,
  movingHousePlanner, petCareRecord, householdInventory, homeMaintenanceLog,
  teamRegister, matchAttendanceSheet, fixtureList, tournamentPlanner,
  certificateOfAttendance, certificateOfCompletion, achievementCertificate,
  studyPlanner, trainingRegister, workshopPlanner,
  visitorRegister, dailyChecklist, weeklyChecklist,
  staffSurvey, exitChecklist, skillsMatrix, communityFeedbackForm,
  projectClosureReport, weeklyStatusReport,
];
