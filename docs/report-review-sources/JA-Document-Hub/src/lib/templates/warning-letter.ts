import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br } from './html-helpers';

export const warningLetter: DocumentTemplate = {
  id: 'warning-letter',
  name: 'Employee Warning Letter',
  category: 'hr',
  description: 'A formal written warning letter to an employee regarding conduct or performance issues.',
  icon: 'AlertTriangle',
  planRequired: 'free',
  tags: ['warning', 'disciplinary', 'hr', 'conduct', 'performance'],
  signatories: [{ label: 'Manager / HR Signatory' }, { label: 'Employee Acknowledgement' }],
  sections: [
    {
      id: 'employer',
      title: 'Employer Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'managerName', label: 'Manager / HR Name', type: 'text', required: true },
        { id: 'managerTitle', label: 'Manager Title', type: 'text', required: false },
      ],
    },
    {
      id: 'employee',
      title: 'Employee Details',
      fields: [
        { id: 'employeeName', label: 'Employee Full Name', type: 'text', required: true },
        { id: 'jobTitle', label: 'Employee Job Title', type: 'text', required: false },
        { id: 'department', label: 'Department', type: 'text', required: false },
      ],
    },
    {
      id: 'warning',
      title: 'Warning Details',
      fields: [
        { id: 'warningType', label: 'Warning Type', type: 'select', required: true, options: ['First Written Warning', 'Second Written Warning', 'Final Written Warning'] },
        { id: 'letterDate', label: 'Letter Date', type: 'date', required: true },
        { id: 'incidentDate', label: 'Date of Incident / Issue', type: 'date', required: false },
        { id: 'issueType', label: 'Nature of Issue', type: 'select', required: true, options: ['Conduct', 'Performance', 'Attendance', 'Timekeeping', 'Other'] },
        { id: 'issueDescription', label: 'Description of Issue', type: 'textarea', required: true, placeholder: 'Describe the conduct or performance issue in detail...' },
        { id: 'previousWarnings', label: 'Previous Warnings / Discussions', type: 'textarea', required: false },
        { id: 'improvement', label: 'Required Improvement / Actions', type: 'textarea', required: true, placeholder: 'What the employee must do to improve...' },
        { id: 'reviewDate', label: 'Review / Monitoring Period', type: 'text', required: false, placeholder: 'e.g. 3 months from the date of this letter' },
        { id: 'consequence', label: 'Consequence of No Improvement', type: 'text', required: false, placeholder: 'e.g. Further disciplinary action up to and including dismissal' },
        { id: 'appealRights', label: 'Appeal Rights', type: 'textarea', required: false, placeholder: 'e.g. You have the right to appeal this warning within 5 working days...' },
      ],
    },
  ],
  generateDocument: (data) => [
    section('Parties', infoTable([
      ['Company', or(data.companyName, '[Company Name]')],
      ['Employee', or(data.employeeName, '[Employee Name]')],
      ['Job Title', data.jobTitle],
      ['Department', data.department],
      ['Date', or(data.letterDate, '[Date]')],
    ])),

    section('Warning Notice',
      `<p>Dear <strong>${or(data.employeeName, '[Employee Name]')}</strong>,</p>
      <p>Following a disciplinary meeting${data.incidentDate ? ` regarding an incident on ${data.incidentDate}` : ''}, we are writing to issue you with a <strong>${or(data.warningType, 'Written Warning')}</strong> in relation to your <strong>${or(data.issueType, 'conduct/performance')}</strong>.</p>`
    ),

    section('Details of the Issue',
      `<p>${nl2br(or(data.issueDescription, '[Issue description]'))}</p>` +
      (data.previousWarnings ? `<p><strong>Previous Warnings / Discussions:</strong><br>${nl2br(data.previousWarnings)}</p>` : '')
    ),

    section('Required Improvement',
      `<p>${nl2br(or(data.improvement, '[Required improvement]'))}</p>` +
      (data.reviewDate ? `<p><strong>Review Period:</strong> ${data.reviewDate}</p>` : '') +
      (data.consequence ? `<p><strong>Consequence of No Improvement:</strong> ${data.consequence}</p>` : '')
    ),

    section('Appeal Rights',
      `<p>${data.appealRights
        ? nl2br(data.appealRights)
        : `You have the right to appeal this warning. If you wish to appeal, please do so in writing to ${or(data.managerName, '[Manager Name]')} within 5 working days of receiving this letter.`
      }</p>`
    ),

    section('Acknowledgement',
      `<p>Yours sincerely,<br><strong>${or(data.managerName, '[Manager Name]')}</strong>${data.managerTitle ? `<br>${data.managerTitle}` : ''}<br>${or(data.companyName, '[Company Name]')}</p>
      <p style="margin-top:12px;font-size:9pt;color:#6b7280;">Please sign below to acknowledge receipt of this letter. Acknowledgement does not indicate agreement with its contents.</p>`
    ),
  ].filter(Boolean).join(''),
};
