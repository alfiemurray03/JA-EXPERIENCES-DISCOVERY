import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'it-tech', icon: 'Monitor', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const softwareRequirementsSpec = mk('software-requirements-spec', 'Software Requirements Specification', 'A software requirements specification (SRS) document.', ['software', 'requirements', 'spec', 'development'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'version', label: 'Document Version', type: 'text', required: false, placeholder: 'e.g. 1.0' },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'author', label: 'Author', type: 'text', required: false },
    { id: 'overview', label: 'Project Overview', type: 'textarea', required: false },
    { id: 'scope', label: 'Scope', type: 'textarea', required: false },
    { id: 'functionalReqs', label: 'Functional Requirements', type: 'textarea', required: false },
    { id: 'nonFunctionalReqs', label: 'Non-Functional Requirements', type: 'textarea', required: false },
    { id: 'constraints', label: 'Constraints & Assumptions', type: 'textarea', required: false },
    { id: 'stakeholders', label: 'Stakeholders', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Document Details', infoTable([['Project', or(d.projectName,'[Project]')],['Version', d.version],['Date', fmtDate(d.date)],['Author', d.author]])),
    d.overview ? section('Project Overview', `<p>${nl2br(d.overview)}</p>`) : '',
    d.scope ? section('Scope', `<p>${nl2br(d.scope)}</p>`) : '',
    d.functionalReqs ? section('Functional Requirements', `<p>${nl2br(d.functionalReqs)}</p>`) : '',
    d.nonFunctionalReqs ? section('Non-Functional Requirements', `<p>${nl2br(d.nonFunctionalReqs)}</p>`) : '',
    d.constraints ? section('Constraints & Assumptions', `<p>${nl2br(d.constraints)}</p>`) : '',
    d.stakeholders ? section('Stakeholders', `<p>${nl2br(d.stakeholders)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const technicalSpec = mk('technical-spec', 'Technical Specification', 'A technical specification document for a system or feature.', ['technical', 'spec', 'architecture'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project / Feature Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'author', label: 'Author', type: 'text', required: false },
    { id: 'purpose', label: 'Purpose', type: 'textarea', required: false },
    { id: 'architecture', label: 'Architecture Overview', type: 'textarea', required: false },
    { id: 'techStack', label: 'Technology Stack', type: 'textarea', required: false },
    { id: 'dataModel', label: 'Data Model / Schema', type: 'textarea', required: false },
    { id: 'apiEndpoints', label: 'API Endpoints', type: 'textarea', required: false },
    { id: 'security', label: 'Security Considerations', type: 'textarea', required: false },
    { id: 'testing', label: 'Testing Approach', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Technical Specification', infoTable([['Project', or(d.projectName,'[Project]')],['Version', d.version],['Date', fmtDate(d.date)],['Author', d.author]])),
    d.purpose ? section('Purpose', `<p>${nl2br(d.purpose)}</p>`) : '',
    d.architecture ? section('Architecture Overview', `<p>${nl2br(d.architecture)}</p>`) : '',
    d.techStack ? section('Technology Stack', `<p>${nl2br(d.techStack)}</p>`) : '',
    d.dataModel ? section('Data Model', `<p>${nl2br(d.dataModel)}</p>`) : '',
    d.apiEndpoints ? section('API Endpoints', `<p>${nl2br(d.apiEndpoints)}</p>`) : '',
    d.security ? section('Security Considerations', `<p>${nl2br(d.security)}</p>`) : '',
    d.testing ? section('Testing Approach', `<p>${nl2br(d.testing)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const bugReport = mk('bug-report', 'Bug Report', 'A structured bug report for software development teams.', ['bug', 'report', 'issue', 'software'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'bugId', label: 'Bug ID / Reference', type: 'text', required: false },
    { id: 'title', label: 'Bug Title', type: 'text', required: true },
    { id: 'reportedBy', label: 'Reported By', type: 'text', required: false },
    { id: 'date', label: 'Date Reported', type: 'date', required: false },
    { id: 'severity', label: 'Severity', type: 'select', required: false, options: ['Critical', 'High', 'Medium', 'Low'] },
    { id: 'environment', label: 'Environment', type: 'text', required: false, placeholder: 'e.g. Production, Staging, v2.3.1' },
    { id: 'stepsToReproduce', label: 'Steps to Reproduce', type: 'textarea', required: false },
    { id: 'expectedBehaviour', label: 'Expected Behaviour', type: 'textarea', required: false },
    { id: 'actualBehaviour', label: 'Actual Behaviour', type: 'textarea', required: false },
    { id: 'screenshots', label: 'Screenshots / Evidence', type: 'textarea', required: false },
    { id: 'assignedTo', label: 'Assigned To', type: 'text', required: false },
  ]}],
  (d) => [
    section('Bug Report', infoTable([['ID', d.bugId],['Title', or(d.title,'[Title]')],['Reported By', d.reportedBy],['Date', fmtDate(d.date)],['Severity', d.severity],['Environment', d.environment],['Assigned To', d.assignedTo]])),
    d.stepsToReproduce ? section('Steps to Reproduce', `<p>${nl2br(d.stepsToReproduce)}</p>`) : '',
    d.expectedBehaviour ? section('Expected Behaviour', `<p>${nl2br(d.expectedBehaviour)}</p>`) : '',
    d.actualBehaviour ? section('Actual Behaviour', `<p>${nl2br(d.actualBehaviour)}</p>`) : '',
    d.screenshots ? section('Evidence / Notes', `<p>${nl2br(d.screenshots)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const changeRequest = mk('change-request', 'Change Request', 'A formal IT or software change request document.', ['change request', 'change management', 'it'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'crId', label: 'Change Request ID', type: 'text', required: false },
    { id: 'title', label: 'Change Title', type: 'text', required: true },
    { id: 'requestedBy', label: 'Requested By', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'priority', label: 'Priority', type: 'select', required: false, options: ['Critical', 'High', 'Medium', 'Low'] },
    { id: 'description', label: 'Description of Change', type: 'textarea', required: false },
    { id: 'justification', label: 'Business Justification', type: 'textarea', required: false },
    { id: 'impact', label: 'Impact Assessment', type: 'textarea', required: false },
    { id: 'rollbackPlan', label: 'Rollback Plan', type: 'textarea', required: false },
    { id: 'implementationDate', label: 'Proposed Implementation Date', type: 'date', required: false },
    { id: 'approver', label: 'Approver', type: 'text', required: false },
  ]}],
  (d) => [
    section('Change Request', infoTable([['ID', d.crId],['Title', or(d.title,'[Title]')],['Requested By', d.requestedBy],['Date', fmtDate(d.date)],['Priority', d.priority],['Implementation Date', fmtDate(d.implementationDate)],['Approver', d.approver]])),
    d.description ? section('Description of Change', `<p>${nl2br(d.description)}</p>`) : '',
    d.justification ? section('Business Justification', `<p>${nl2br(d.justification)}</p>`) : '',
    d.impact ? section('Impact Assessment', `<p>${nl2br(d.impact)}</p>`) : '',
    d.rollbackPlan ? section('Rollback Plan', `<p>${nl2br(d.rollbackPlan)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const itSupportTicket = mk('it-support-ticket', 'IT Support Ticket', 'An IT support request / helpdesk ticket.', ['it support', 'helpdesk', 'ticket'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'ticketId', label: 'Ticket ID', type: 'text', required: false },
    { id: 'requesterName', label: 'Requester Name', type: 'text', required: true },
    { id: 'requesterEmail', label: 'Requester Email', type: 'text', required: false },
    { id: 'department', label: 'Department', type: 'text', required: false },
    { id: 'date', label: 'Date Submitted', type: 'date', required: false },
    { id: 'category', label: 'Category', type: 'select', required: false, options: ['Hardware', 'Software', 'Network', 'Access / Permissions', 'Email', 'Other'] },
    { id: 'priority', label: 'Priority', type: 'select', required: false, options: ['Critical', 'High', 'Medium', 'Low'] },
    { id: 'description', label: 'Issue Description', type: 'textarea', required: true },
    { id: 'stepsAlreadyTaken', label: 'Steps Already Taken', type: 'textarea', required: false },
    { id: 'assignedTo', label: 'Assigned To', type: 'text', required: false },
  ]}],
  (d) => [
    section('IT Support Ticket', infoTable([['Ticket ID', d.ticketId],['Requester', or(d.requesterName,'[Requester]')],['Email', d.requesterEmail],['Department', d.department],['Date', fmtDate(d.date)],['Category', d.category],['Priority', d.priority],['Assigned To', d.assignedTo]])),
    section('Issue Description', `<p>${nl2br(or(d.description,'[Description]'))}</p>`),
    d.stepsAlreadyTaken ? section('Steps Already Taken', `<p>${nl2br(d.stepsAlreadyTaken)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const systemMaintenancePlan = mk('system-maintenance-plan', 'System Maintenance Plan', 'A scheduled system maintenance and update plan.', ['maintenance', 'system', 'it', 'schedule'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'systemName', label: 'System Name', type: 'text', required: true },
    { id: 'owner', label: 'System Owner', type: 'text', required: false },
    { id: 'maintenanceWindow', label: 'Maintenance Window', type: 'text', required: false, placeholder: 'e.g. Every Sunday 02:00–04:00' },
    { id: 'scheduledTasks', label: 'Scheduled Maintenance Tasks', type: 'textarea', required: false },
    { id: 'backupSchedule', label: 'Backup Schedule', type: 'text', required: false },
    { id: 'monitoringTools', label: 'Monitoring Tools', type: 'text', required: false },
    { id: 'escalationContact', label: 'Escalation Contact', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('System Maintenance Plan', infoTable([['System', or(d.systemName,'[System]')],['Owner', d.owner],['Maintenance Window', d.maintenanceWindow],['Backup Schedule', d.backupSchedule],['Monitoring Tools', d.monitoringTools],['Escalation Contact', d.escalationContact]])),
    d.scheduledTasks ? section('Scheduled Tasks', `<p>${nl2br(d.scheduledTasks)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const dataBreachReport = mk('data-breach-report', 'Data Breach Incident Report', 'An internal data breach incident report for IT and compliance teams.', ['data breach', 'incident', 'gdpr', 'security'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'incidentId', label: 'Incident ID', type: 'text', required: false },
    { id: 'reportedBy', label: 'Reported By', type: 'text', required: true },
    { id: 'dateDiscovered', label: 'Date Discovered', type: 'date', required: false },
    { id: 'dateOccurred', label: 'Date Occurred (if known)', type: 'date', required: false },
    { id: 'description', label: 'Description of Incident', type: 'textarea', required: false },
    { id: 'dataAffected', label: 'Data / Systems Affected', type: 'textarea', required: false },
    { id: 'numberOfRecords', label: 'Estimated Number of Records Affected', type: 'text', required: false },
    { id: 'immediateActions', label: 'Immediate Actions Taken', type: 'textarea', required: false },
    { id: 'rootCause', label: 'Root Cause (if known)', type: 'textarea', required: false },
    { id: 'remediation', label: 'Remediation Plan', type: 'textarea', required: false },
    { id: 'notificationRequired', label: 'Regulatory Notification Required?', type: 'select', required: false, options: ['Yes', 'No', 'Under Assessment'] },
  ]}],
  (d) => [
    section('Data Breach Report', infoTable([['Incident ID', d.incidentId],['Reported By', or(d.reportedBy,'[Reporter]')],['Date Discovered', fmtDate(d.dateDiscovered)],['Date Occurred', fmtDate(d.dateOccurred)],['Records Affected', d.numberOfRecords],['Notification Required', d.notificationRequired]])),
    d.description ? section('Incident Description', `<p>${nl2br(d.description)}</p>`) : '',
    d.dataAffected ? section('Data / Systems Affected', `<p>${nl2br(d.dataAffected)}</p>`) : '',
    d.immediateActions ? section('Immediate Actions Taken', `<p>${nl2br(d.immediateActions)}</p>`) : '',
    d.rootCause ? section('Root Cause', `<p>${nl2br(d.rootCause)}</p>`) : '',
    d.remediation ? section('Remediation Plan', `<p>${nl2br(d.remediation)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const projectKickoffAgenda = mk('project-kickoff-agenda', 'Project Kickoff Meeting Agenda', 'An agenda for a project kickoff meeting.', ['project', 'kickoff', 'agenda', 'meeting'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'date', label: 'Meeting Date', type: 'date', required: false },
    { id: 'time', label: 'Time', type: 'text', required: false },
    { id: 'location', label: 'Location / Platform', type: 'text', required: false },
    { id: 'attendees', label: 'Attendees', type: 'textarea', required: false },
    { id: 'agendaItems', label: 'Agenda Items', type: 'textarea', required: false },
    { id: 'objectives', label: 'Meeting Objectives', type: 'textarea', required: false },
    { id: 'facilitator', label: 'Facilitator', type: 'text', required: false },
  ]}],
  (d) => [
    section('Kickoff Meeting', infoTable([['Project', or(d.projectName,'[Project]')],['Date', fmtDate(d.date)],['Time', d.time],['Location', d.location],['Facilitator', d.facilitator]])),
    d.attendees ? section('Attendees', `<p>${nl2br(d.attendees)}</p>`) : '',
    d.objectives ? section('Meeting Objectives', `<p>${nl2br(d.objectives)}</p>`) : '',
    d.agendaItems ? section('Agenda', `<p>${nl2br(d.agendaItems)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const userStory = mk('user-story', 'User Story', 'An agile user story document for product development.', ['user story', 'agile', 'product', 'scrum'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'storyId', label: 'Story ID', type: 'text', required: false },
    { id: 'title', label: 'Story Title', type: 'text', required: true },
    { id: 'epic', label: 'Epic / Feature', type: 'text', required: false },
    { id: 'asA', label: 'As a…', type: 'text', required: false, placeholder: 'e.g. registered user' },
    { id: 'iWantTo', label: 'I want to…', type: 'text', required: false, placeholder: 'e.g. reset my password' },
    { id: 'soThat', label: 'So that…', type: 'text', required: false, placeholder: 'e.g. I can regain access to my account' },
    { id: 'acceptanceCriteria', label: 'Acceptance Criteria', type: 'textarea', required: false },
    { id: 'storyPoints', label: 'Story Points', type: 'text', required: false },
    { id: 'priority', label: 'Priority', type: 'select', required: false, options: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'] },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('User Story', infoTable([['ID', d.storyId],['Title', or(d.title,'[Title]')],['Epic', d.epic],['Story Points', d.storyPoints],['Priority', d.priority]])),
    `<div style="background:#f8f9fb;border:1px solid #dde1e8;border-radius:4px;padding:12px;margin:8px 0;">
      <p style="margin:0 0 4px 0;"><strong>As a</strong> ${or(d.asA,'[user type]')},</p>
      <p style="margin:0 0 4px 0;"><strong>I want to</strong> ${or(d.iWantTo,'[goal]')},</p>
      <p style="margin:0;"><strong>So that</strong> ${or(d.soThat,'[benefit]')}.</p>
    </div>`,
    d.acceptanceCriteria ? section('Acceptance Criteria', `<p>${nl2br(d.acceptanceCriteria)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const sprintPlanningDoc = mk('sprint-planning', 'Sprint Planning Document', 'A sprint planning document for agile development teams.', ['sprint', 'agile', 'scrum', 'planning'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'sprintNumber', label: 'Sprint Number', type: 'text', required: true },
    { id: 'startDate', label: 'Sprint Start Date', type: 'date', required: false },
    { id: 'endDate', label: 'Sprint End Date', type: 'date', required: false },
    { id: 'goal', label: 'Sprint Goal', type: 'textarea', required: false },
    { id: 'team', label: 'Team Members', type: 'textarea', required: false },
    { id: 'capacity', label: 'Team Capacity (story points)', type: 'text', required: false },
    { id: 'backlogItems', label: 'Backlog Items / Stories', type: 'textarea', required: false },
    { id: 'risks', label: 'Risks & Dependencies', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Sprint Planning', infoTable([['Sprint', or(d.sprintNumber,'[Sprint]')],['Start', fmtDate(d.startDate)],['End', fmtDate(d.endDate)],['Capacity', d.capacity]])),
    d.goal ? section('Sprint Goal', `<p>${nl2br(d.goal)}</p>`) : '',
    d.team ? section('Team', `<p>${nl2br(d.team)}</p>`) : '',
    d.backlogItems ? section('Backlog Items', `<p>${nl2br(d.backlogItems)}</p>`) : '',
    d.risks ? section('Risks & Dependencies', `<p>${nl2br(d.risks)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const itAssetRegister = mk('it-asset-register', 'IT Asset Register', 'A register of IT hardware and software assets.', ['asset', 'register', 'it', 'inventory'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'assetList', label: 'Asset List (one per line: Asset ID, Name, Type, User, Location, Status)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('IT Asset Register', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)]])),
    d.assetList ? section('Assets', `<p>${nl2br(d.assetList)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const disasterRecoveryPlan = mk('disaster-recovery-plan', 'Disaster Recovery Plan', 'An IT disaster recovery plan for business continuity.', ['disaster recovery', 'business continuity', 'it'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'rto', label: 'Recovery Time Objective (RTO)', type: 'text', required: false },
    { id: 'rpo', label: 'Recovery Point Objective (RPO)', type: 'text', required: false },
    { id: 'criticalSystems', label: 'Critical Systems', type: 'textarea', required: false },
    { id: 'recoverySteps', label: 'Recovery Steps', type: 'textarea', required: false },
    { id: 'contacts', label: 'Key Contacts', type: 'textarea', required: false },
    { id: 'testSchedule', label: 'Test Schedule', type: 'text', required: false },
  ]}],
  (d) => [
    section('Disaster Recovery Plan', infoTable([['Organisation', or(d.orgName,'[Org]')],['Version', d.version],['Date', fmtDate(d.date)],['RTO', d.rto],['RPO', d.rpo],['Test Schedule', d.testSchedule]])),
    d.criticalSystems ? section('Critical Systems', `<p>${nl2br(d.criticalSystems)}</p>`) : '',
    d.recoverySteps ? section('Recovery Steps', `<p>${nl2br(d.recoverySteps)}</p>`) : '',
    d.contacts ? section('Key Contacts', `<p>${nl2br(d.contacts)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const apiDocumentation = mk('api-documentation', 'API Documentation', 'Basic API documentation for a software project.', ['api', 'documentation', 'developer'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'apiName', label: 'API Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: false },
    { id: 'baseUrl', label: 'Base URL', type: 'text', required: false },
    { id: 'authentication', label: 'Authentication Method', type: 'text', required: false },
    { id: 'overview', label: 'Overview', type: 'textarea', required: false },
    { id: 'endpoints', label: 'Endpoints', type: 'textarea', required: false },
    { id: 'errorCodes', label: 'Error Codes', type: 'textarea', required: false },
    { id: 'rateLimit', label: 'Rate Limiting', type: 'text', required: false },
    { id: 'changelog', label: 'Changelog', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('API Documentation', infoTable([['API', or(d.apiName,'[API]')],['Version', d.version],['Base URL', d.baseUrl],['Authentication', d.authentication],['Rate Limit', d.rateLimit]])),
    d.overview ? section('Overview', `<p>${nl2br(d.overview)}</p>`) : '',
    d.endpoints ? section('Endpoints', `<p>${nl2br(d.endpoints)}</p>`) : '',
    d.errorCodes ? section('Error Codes', `<p>${nl2br(d.errorCodes)}</p>`) : '',
    d.changelog ? section('Changelog', `<p>${nl2br(d.changelog)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const testPlan = mk('test-plan', 'Test Plan', 'A software testing plan document.', ['test plan', 'qa', 'testing', 'software'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'scope', label: 'Test Scope', type: 'textarea', required: false },
    { id: 'testTypes', label: 'Types of Testing', type: 'textarea', required: false },
    { id: 'testEnvironment', label: 'Test Environment', type: 'textarea', required: false },
    { id: 'entryExitCriteria', label: 'Entry / Exit Criteria', type: 'textarea', required: false },
    { id: 'testCases', label: 'Test Cases Overview', type: 'textarea', required: false },
    { id: 'risks', label: 'Risks', type: 'textarea', required: false },
    { id: 'team', label: 'Testing Team', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Test Plan', infoTable([['Project', or(d.projectName,'[Project]')],['Version', d.version],['Date', fmtDate(d.date)]])),
    d.scope ? section('Test Scope', `<p>${nl2br(d.scope)}</p>`) : '',
    d.testTypes ? section('Types of Testing', `<p>${nl2br(d.testTypes)}</p>`) : '',
    d.testEnvironment ? section('Test Environment', `<p>${nl2br(d.testEnvironment)}</p>`) : '',
    d.entryExitCriteria ? section('Entry / Exit Criteria', `<p>${nl2br(d.entryExitCriteria)}</p>`) : '',
    d.testCases ? section('Test Cases', `<p>${nl2br(d.testCases)}</p>`) : '',
    d.risks ? section('Risks', `<p>${nl2br(d.risks)}</p>`) : '',
    d.team ? section('Testing Team', `<p>${nl2br(d.team)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const networkDiagramDoc = mk('network-diagram-doc', 'Network Diagram Document', 'A network infrastructure documentation sheet.', ['network', 'infrastructure', 'it', 'diagram'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'networkOverview', label: 'Network Overview', type: 'textarea', required: false },
    { id: 'devices', label: 'Key Devices / Nodes', type: 'textarea', required: false },
    { id: 'ipRanges', label: 'IP Ranges / Subnets', type: 'textarea', required: false },
    { id: 'firewallRules', label: 'Firewall Rules Summary', type: 'textarea', required: false },
    { id: 'vpn', label: 'VPN / Remote Access', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Network Documentation', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.date)]])),
    d.networkOverview ? section('Network Overview', `<p>${nl2br(d.networkOverview)}</p>`) : '',
    d.devices ? section('Key Devices', `<p>${nl2br(d.devices)}</p>`) : '',
    d.ipRanges ? section('IP Ranges / Subnets', `<p>${nl2br(d.ipRanges)}</p>`) : '',
    d.firewallRules ? section('Firewall Rules', `<p>${nl2br(d.firewallRules)}</p>`) : '',
    d.vpn ? section('VPN / Remote Access', `<p>${nl2br(d.vpn)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const softwareReleaseNotes = mk('release-notes', 'Software Release Notes', 'Release notes for a software version or update.', ['release notes', 'changelog', 'software'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'productName', label: 'Product Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: true },
    { id: 'releaseDate', label: 'Release Date', type: 'date', required: false },
    { id: 'newFeatures', label: 'New Features', type: 'textarea', required: false },
    { id: 'improvements', label: 'Improvements', type: 'textarea', required: false },
    { id: 'bugFixes', label: 'Bug Fixes', type: 'textarea', required: false },
    { id: 'knownIssues', label: 'Known Issues', type: 'textarea', required: false },
    { id: 'upgradeNotes', label: 'Upgrade Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Release Notes', infoTable([['Product', or(d.productName,'[Product]')],['Version', or(d.version,'[Version]')],['Release Date', fmtDate(d.releaseDate)]])),
    d.newFeatures ? section('New Features', `<p>${nl2br(d.newFeatures)}</p>`) : '',
    d.improvements ? section('Improvements', `<p>${nl2br(d.improvements)}</p>`) : '',
    d.bugFixes ? section('Bug Fixes', `<p>${nl2br(d.bugFixes)}</p>`) : '',
    d.knownIssues ? section('Known Issues', `<p>${nl2br(d.knownIssues)}</p>`) : '',
    d.upgradeNotes ? section('Upgrade Notes', `<p>${nl2br(d.upgradeNotes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const cybersecurityPolicy = mk('cybersecurity-policy', 'Cybersecurity Policy', 'An organisational cybersecurity policy document.', ['cybersecurity', 'policy', 'it security'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation Name', type: 'text', required: true },
    { id: 'version', label: 'Version', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'scope', label: 'Scope', type: 'textarea', required: false },
    { id: 'passwordPolicy', label: 'Password Policy', type: 'textarea', required: false },
    { id: 'accessControl', label: 'Access Control', type: 'textarea', required: false },
    { id: 'devicePolicy', label: 'Device & BYOD Policy', type: 'textarea', required: false },
    { id: 'incidentResponse', label: 'Incident Response', type: 'textarea', required: false },
    { id: 'training', label: 'Security Training Requirements', type: 'textarea', required: false },
    { id: 'reviewDate', label: 'Next Review Date', type: 'date', required: false },
  ]}],
  (d) => [
    section('Cybersecurity Policy', infoTable([['Organisation', or(d.orgName,'[Org]')],['Version', d.version],['Date', fmtDate(d.date)],['Next Review', fmtDate(d.reviewDate)]])),
    d.scope ? section('Scope', `<p>${nl2br(d.scope)}</p>`) : '',
    d.passwordPolicy ? section('Password Policy', `<p>${nl2br(d.passwordPolicy)}</p>`) : '',
    d.accessControl ? section('Access Control', `<p>${nl2br(d.accessControl)}</p>`) : '',
    d.devicePolicy ? section('Device & BYOD Policy', `<p>${nl2br(d.devicePolicy)}</p>`) : '',
    d.incidentResponse ? section('Incident Response', `<p>${nl2br(d.incidentResponse)}</p>`) : '',
    d.training ? section('Security Training', `<p>${nl2br(d.training)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const onboardingChecklist = mk('it-onboarding-checklist', 'IT Onboarding Checklist', 'An IT onboarding checklist for new starters.', ['onboarding', 'it', 'new starter', 'checklist'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'employeeName', label: 'Employee Name', type: 'text', required: true },
    { id: 'startDate', label: 'Start Date', type: 'date', required: false },
    { id: 'department', label: 'Department', type: 'text', required: false },
    { id: 'manager', label: 'Line Manager', type: 'text', required: false },
    { id: 'hardwareItems', label: 'Hardware to Provision', type: 'textarea', required: false },
    { id: 'softwareAccess', label: 'Software / System Access Required', type: 'textarea', required: false },
    { id: 'emailSetup', label: 'Email / Communication Setup', type: 'textarea', required: false },
    { id: 'securityBriefing', label: 'Security Briefing Completed?', type: 'select', required: false, options: ['Yes', 'No', 'Pending'] },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('IT Onboarding Checklist', infoTable([['Employee', or(d.employeeName,'[Employee]')],['Start Date', fmtDate(d.startDate)],['Department', d.department],['Manager', d.manager],['Security Briefing', d.securityBriefing]])),
    d.hardwareItems ? section('Hardware to Provision', `<p>${nl2br(d.hardwareItems)}</p>`) : '',
    d.softwareAccess ? section('Software / System Access', `<p>${nl2br(d.softwareAccess)}</p>`) : '',
    d.emailSetup ? section('Email / Communication Setup', `<p>${nl2br(d.emailSetup)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const projectRetroDoc = mk('project-retrospective', 'Project Retrospective', 'A project retrospective document for agile teams.', ['retrospective', 'retro', 'agile', 'project'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project / Sprint Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'facilitator', label: 'Facilitator', type: 'text', required: false },
    { id: 'wentWell', label: 'What Went Well', type: 'textarea', required: false },
    { id: 'improvements', label: 'What Could Be Improved', type: 'textarea', required: false },
    { id: 'actionItems', label: 'Action Items', type: 'textarea', required: false },
    { id: 'teamMorale', label: 'Team Morale (1–10)', type: 'text', required: false },
  ]}],
  (d) => [
    section('Retrospective', infoTable([['Project', or(d.projectName,'[Project]')],['Date', fmtDate(d.date)],['Facilitator', d.facilitator],['Team Morale', d.teamMorale]])),
    d.wentWell ? section('What Went Well', `<p>${nl2br(d.wentWell)}</p>`) : '',
    d.improvements ? section('What Could Be Improved', `<p>${nl2br(d.improvements)}</p>`) : '',
    d.actionItems ? section('Action Items', `<p>${nl2br(d.actionItems)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_IT_TECH_TEMPLATES: DocumentTemplate[] = [
  softwareRequirementsSpec, technicalSpec, bugReport, changeRequest,
  itSupportTicket, systemMaintenancePlan, dataBreachReport, projectKickoffAgenda,
  userStory, sprintPlanningDoc, itAssetRegister, disasterRecoveryPlan,
  apiDocumentation, testPlan, networkDiagramDoc, softwareReleaseNotes,
  cybersecurityPolicy, onboardingChecklist, projectRetroDoc,
];
