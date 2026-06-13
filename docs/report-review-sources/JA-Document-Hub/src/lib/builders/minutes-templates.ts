import type { BuilderTemplate } from '@/lib/builder-framework';

export const MINUTES_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'minutes-general',
    builderId: 'minutes',
    name: 'Meeting Minutes',
    description: 'Standard meeting minutes for any type of meeting',
    category: 'Meeting Minutes',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'org_name', label: 'Organisation Name', type: 'text', required: true },
      { id: 'meeting_title', label: 'Meeting Title / Type', type: 'text', required: true },
      { id: 'meeting_date', label: 'Date of Meeting', type: 'date', required: true },
      { id: 'meeting_time', label: 'Time', type: 'text', placeholder: 'e.g. 10:00 – 11:30' },
      { id: 'meeting_location', label: 'Location / Platform', type: 'text', placeholder: 'e.g. Board Room or Microsoft Teams' },
      { id: 'chair_name', label: 'Chair', type: 'text', required: true },
      { id: 'minutes_taker', label: 'Minutes Taken By', type: 'text', required: true },
      { id: 'attendees', label: 'Attendees', type: 'textarea', placeholder: 'List names and roles', required: true },
      { id: 'apologies', label: 'Apologies', type: 'textarea', placeholder: 'Names of those who sent apologies' },
      { id: 'agenda_items', label: 'Agenda Items Discussed', type: 'textarea', required: true, helpText: 'Use numbered items. e.g. 1. Welcome and apologies\n2. Minutes of last meeting\n3. Matters arising' },
      { id: 'decisions', label: 'Decisions Made', type: 'textarea', required: true },
      { id: 'action_items', label: 'Action Items', type: 'textarea', placeholder: 'Action | Owner | Deadline', required: true },
      { id: 'next_meeting', label: 'Next Meeting Date', type: 'text' },
      { id: 'signatory_name', label: 'Approved By (Chair)', type: 'text' },
      { id: 'signatory_date', label: 'Date Approved', type: 'date' },
    ],
    bodyTemplate: `# MEETING MINUTES

**{{org_name}}**

**Meeting:** {{meeting_title}}
**Date:** {{meeting_date}} | **Time:** {{meeting_time}}
**Location:** {{meeting_location}}
**Chair:** {{chair_name}} | **Minutes:** {{minutes_taker}}

---

## Attendees

{{attendees}}

**Apologies:** {{apologies}}

---

## Agenda and Discussion

{{agenda_items}}

---

## Decisions Made

{{decisions}}

---

## Action Items

| Action | Owner | Deadline |
|--------|-------|----------|
{{action_items}}

---

**Next Meeting:** {{next_meeting}}

---

*These minutes are a true and accurate record of the meeting.*`,
  },

  {
    id: 'minutes-board',
    builderId: 'minutes',
    name: 'Board Meeting Minutes',
    description: 'Formal board of directors meeting minutes',
    category: 'Board Minutes',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'company_number', label: 'Company Number', type: 'text' },
      { id: 'meeting_date', label: 'Date of Meeting', type: 'date', required: true },
      { id: 'meeting_time', label: 'Time', type: 'text' },
      { id: 'meeting_location', label: 'Location', type: 'text' },
      { id: 'chair_name', label: 'Chair', type: 'text', required: true },
      { id: 'minutes_taker', label: 'Company Secretary / Minutes Taker', type: 'text', required: true },
      { id: 'directors_present', label: 'Directors Present', type: 'textarea', required: true },
      { id: 'directors_absent', label: 'Directors Absent / Apologies', type: 'textarea' },
      { id: 'quorum_confirmed', label: 'Quorum Confirmed', type: 'select', options: ['Yes — quorum present', 'No — meeting inquorate'], defaultValue: 'Yes — quorum present' },
      { id: 'agenda_items', label: 'Agenda Items and Discussion', type: 'textarea', required: true },
      { id: 'resolutions', label: 'Resolutions Passed', type: 'textarea', required: true },
      { id: 'action_items', label: 'Action Items', type: 'textarea' },
      { id: 'next_meeting', label: 'Next Board Meeting', type: 'text' },
      { id: 'signatory_name', label: 'Signed By (Chair)', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# BOARD MEETING MINUTES

**{{company_name}}**
Company Number: {{company_number}}

**Date:** {{meeting_date}} | **Time:** {{meeting_time}}
**Location:** {{meeting_location}}
**Chair:** {{chair_name}}
**Company Secretary / Minutes:** {{minutes_taker}}

---

## Directors Present

{{directors_present}}

**Absent / Apologies:** {{directors_absent}}

**Quorum:** {{quorum_confirmed}}

---

## Business Conducted

{{agenda_items}}

---

## Resolutions

The following resolutions were passed by the Board:

{{resolutions}}

---

## Action Items

{{action_items}}

---

**Next Board Meeting:** {{next_meeting}}

---

*Signed as a true and accurate record of the meeting.*`,
  },

  {
    id: 'minutes-trustee',
    builderId: 'minutes',
    name: 'Trustee Meeting Minutes',
    description: 'Charity trustee board meeting minutes',
    category: 'Trustee Minutes',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'charity_name', label: 'Charity Name', type: 'text', required: true },
      { id: 'charity_number', label: 'Charity Registration Number', type: 'text' },
      { id: 'meeting_date', label: 'Date of Meeting', type: 'date', required: true },
      { id: 'meeting_time', label: 'Time', type: 'text' },
      { id: 'meeting_location', label: 'Location', type: 'text' },
      { id: 'chair_name', label: 'Chair', type: 'text', required: true },
      { id: 'trustees_present', label: 'Trustees Present', type: 'textarea', required: true },
      { id: 'trustees_absent', label: 'Trustees Absent / Apologies', type: 'textarea' },
      { id: 'staff_present', label: 'Staff / Others Present', type: 'textarea' },
      { id: 'agenda_items', label: 'Agenda Items and Discussion', type: 'textarea', required: true },
      { id: 'decisions', label: 'Decisions and Resolutions', type: 'textarea', required: true },
      { id: 'action_items', label: 'Action Items', type: 'textarea' },
      { id: 'next_meeting', label: 'Next Trustee Meeting', type: 'text' },
      { id: 'signatory_name', label: 'Signed By (Chair)', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# TRUSTEE MEETING MINUTES

**{{charity_name}}**
Charity Registration Number: {{charity_number}}

**Date:** {{meeting_date}} | **Time:** {{meeting_time}}
**Location:** {{meeting_location}}
**Chair:** {{chair_name}}

---

## Trustees Present

{{trustees_present}}

**Apologies:** {{trustees_absent}}

**Also Present:** {{staff_present}}

---

## Business

{{agenda_items}}

---

## Decisions and Resolutions

{{decisions}}

---

## Actions

{{action_items}}

---

**Next Meeting:** {{next_meeting}}

---

*Approved as a true record of the meeting.*`,
  },

  {
    id: 'minutes-shareholder-resolution',
    builderId: 'minutes',
    name: 'Shareholder Resolution',
    description: 'Written shareholder resolution (ordinary or special)',
    category: 'Shareholder Resolutions',
    planRequired: 'professional',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    defaultLayout: 'resolution',
    fields: [
      { id: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'company_number', label: 'Company Number', type: 'text', required: true },
      { id: 'resolution_type', label: 'Resolution Type', type: 'select', options: ['Ordinary Resolution', 'Special Resolution', 'Written Resolution'], defaultValue: 'Written Resolution' },
      { id: 'resolution_date', label: 'Date of Resolution', type: 'date', required: true },
      { id: 'shareholders', label: 'Shareholders (names and shareholdings)', type: 'textarea', required: true },
      { id: 'resolution_text', label: 'Resolution Text', type: 'textarea', required: true, helpText: 'State the resolution clearly and precisely' },
      { id: 'votes_for', label: 'Votes For', type: 'text' },
      { id: 'votes_against', label: 'Votes Against', type: 'text' },
      { id: 'signatory_name', label: 'Signed By', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# {{resolution_type}}

**{{company_name}}**
Company Number: {{company_number}}

Date: {{resolution_date}}

---

## Shareholders

{{shareholders}}

---

## Resolution

**IT IS RESOLVED** (as a {{resolution_type}}) that:

{{resolution_text}}

---

## Voting

**Votes For:** {{votes_for}}
**Votes Against:** {{votes_against}}

**Result: PASSED**

---

*This resolution was duly passed in accordance with the Companies Act 2006.*`,
  },

  {
    id: 'minutes-director-resolution',
    builderId: 'minutes',
    name: 'Director Resolution',
    description: 'Written resolution of the board of directors',
    category: 'Director Resolutions',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    defaultLayout: 'resolution',
    fields: [
      { id: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'company_number', label: 'Company Number', type: 'text', required: true },
      { id: 'resolution_date', label: 'Date', type: 'date', required: true },
      { id: 'directors', label: 'Directors', type: 'textarea', required: true },
      { id: 'resolution_text', label: 'Resolution Text', type: 'textarea', required: true },
      { id: 'signatory_name', label: 'Signed By (Director)', type: 'text' },
      { id: 'signatory_title', label: 'Title', type: 'text' },
      { id: 'signatory_date', label: 'Date', type: 'date' },
    ],
    bodyTemplate: `# WRITTEN RESOLUTION OF THE DIRECTORS

**{{company_name}}**
Company Number: {{company_number}}

Date: {{resolution_date}}

---

## Directors

{{directors}}

---

## Resolution

**IT IS RESOLVED** that:

{{resolution_text}}

---

*This written resolution is passed in accordance with the company's articles of association and the Companies Act 2006.*`,
  },

  {
    id: 'minutes-decision-log',
    builderId: 'minutes',
    name: 'Decision Log',
    description: 'Running log of key decisions made by a team or organisation',
    category: 'Decision Log',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#0f766e',
    fields: [
      { id: 'org_name', label: 'Organisation / Project Name', type: 'text', required: true },
      { id: 'log_period', label: 'Log Period', type: 'text', placeholder: 'e.g. Q2 2026 or January – June 2026' },
      { id: 'prepared_by', label: 'Prepared By', type: 'text', required: true },
      { id: 'decisions', label: 'Decisions (one per line: Date | Decision | Made By | Rationale)', type: 'textarea', required: true },
    ],
    bodyTemplate: `# DECISION LOG

**{{org_name}}**

**Period:** {{log_period}}
**Prepared By:** {{prepared_by}}

---

## Decisions

| Date | Decision | Made By | Rationale |
|------|----------|---------|-----------|
{{decisions}}

---

*This log provides a record of key decisions for governance and accountability purposes.*`,
  },

  // ── Meeting Agenda ────────────────────────────────────────────────────────
  {
    id: 'minutes-agenda',
    builderId: 'minutes',
    name: 'Meeting Agenda',
    description: 'Structured agenda for any type of meeting',
    category: 'Meeting Agenda',
    industries: ['Business', 'Charity', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'meeting_title',     label: 'Meeting Title',              type: 'text',     required: true },
      { id: 'meeting_date',      label: 'Meeting Date & Time',        type: 'text',     required: true },
      { id: 'location',          label: 'Location / Video Link',      type: 'text' },
      { id: 'chair',             label: 'Chair',                      type: 'text' },
      { id: 'attendees',         label: 'Invited Attendees',          type: 'textarea' },
      { id: 'apologies',         label: 'Apologies Expected',         type: 'textarea' },
      { id: 'agenda_items',      label: 'Agenda Items',               type: 'textarea', required: true, placeholder: '1. Welcome & Apologies (5 min)\n2. Minutes of last meeting (5 min)\n3. [Item] (10 min)\n4. AOB\n5. Date of next meeting' },
      { id: 'pre_reading',       label: 'Pre-Reading / Documents',    type: 'textarea' },
      { id: 'next_meeting',      label: 'Next Meeting Date',          type: 'text' },
    ],
    bodyTemplate: `# {{meeting_title}} — Agenda

**Organisation:** {{org_name}}
**Date & Time:** {{meeting_date}}
**Location:** {{location}}
**Chair:** {{chair}}

---

## Attendees

{{attendees}}

**Apologies:** {{apologies}}

---

## Agenda

{{agenda_items}}

---

## Pre-Reading / Documents

{{pre_reading}}

---

**Next Meeting:** {{next_meeting}}`,
  },

  // ── Action Log ────────────────────────────────────────────────────────────
  {
    id: 'minutes-action-log',
    builderId: 'minutes',
    name: 'Action Log',
    description: 'Ongoing log of actions, owners, and deadlines from meetings',
    category: 'Action Log',
    industries: ['Business', 'Charity', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'org_name',          label: 'Organisation Name',          type: 'text',     required: true },
      { id: 'project_or_meeting',label: 'Project / Meeting Name',     type: 'text',     required: true },
      { id: 'log_date',          label: 'Log Date',                   type: 'date',     required: true },
      { id: 'maintained_by',     label: 'Maintained By',              type: 'text' },
      { id: 'actions',           label: 'Actions',                    type: 'textarea', required: true, placeholder: 'Action | Owner | Due Date | Status | Notes' },
    ],
    bodyTemplate: `# Action Log

**Organisation:** {{org_name}}
**Project / Meeting:** {{project_or_meeting}}
**Date:** {{log_date}}
**Maintained By:** {{maintained_by}}

---

## Actions

| # | Action | Owner | Due Date | Status | Notes |
|---|--------|-------|----------|--------|-------|
{{actions}}

---

**Status Key:** ☐ Not Started  ⏳ In Progress  ✅ Complete  ❌ Overdue  🔄 Deferred`,
  },

  // ── Board Minutes ─────────────────────────────────────────────────────────
  {
    id: 'minutes-board-full',
    builderId: 'minutes',
    name: 'Full Board Meeting Minutes',
    description: 'Comprehensive minutes for a formal board of directors meeting',
    category: 'Board Minutes',
    industries: ['Business', 'Finance', 'General'],
    popular: true,
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#7c3aed',
    fields: [
      { id: 'company_name',      label: 'Company Name',               type: 'text',     required: true },
      { id: 'company_number',    label: 'Company Number',             type: 'text' },
      { id: 'meeting_date',      label: 'Meeting Date & Time',        type: 'text',     required: true },
      { id: 'location',          label: 'Location',                   type: 'text' },
      { id: 'chair',             label: 'Chair',                      type: 'text',     required: true },
      { id: 'directors_present', label: 'Directors Present',          type: 'textarea', required: true },
      { id: 'also_present',      label: 'Also Present',               type: 'textarea' },
      { id: 'apologies',         label: 'Apologies',                  type: 'textarea' },
      { id: 'quorum',            label: 'Quorum Confirmed',           type: 'text',     defaultValue: 'A quorum was present and the meeting was duly constituted.' },
      { id: 'prev_minutes',      label: 'Previous Minutes',           type: 'textarea', defaultValue: 'The minutes of the previous board meeting were approved as a true and accurate record.' },
      { id: 'matters_arising',   label: 'Matters Arising',            type: 'textarea' },
      { id: 'agenda_items',      label: 'Agenda Items & Discussions', type: 'textarea', required: true },
      { id: 'resolutions',       label: 'Resolutions Passed',         type: 'textarea' },
      { id: 'aob',               label: 'Any Other Business',         type: 'textarea' },
      { id: 'next_meeting',      label: 'Next Meeting Date',          type: 'text' },
    ],
    bodyTemplate: `# Board Meeting Minutes

**{{company_name}}** (Company No: {{company_number}})

**Date & Time:** {{meeting_date}}
**Location:** {{location}}
**Chair:** {{chair}}

---

## Attendance

**Directors Present:**
{{directors_present}}

**Also Present:**
{{also_present}}

**Apologies:**
{{apologies}}

---

## Quorum

{{quorum}}

---

## 1. Minutes of Previous Meeting

{{prev_minutes}}

## 2. Matters Arising

{{matters_arising}}

---

## 3. Agenda Items

{{agenda_items}}

---

## 4. Resolutions

{{resolutions}}

---

## 5. Any Other Business

{{aob}}

---

**Next Meeting:** {{next_meeting}}

---

**Signed as a true record:**

Chair: _________________________ Date: _____________`,
  },
];
