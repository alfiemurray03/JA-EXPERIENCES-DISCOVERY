import type { DocumentTemplate } from '../document-types';
import { section, infoTable, clause, or, nl2br } from './html-helpers';

export const shareholderResolution: DocumentTemplate = {
  id: 'shareholder-resolution',
  name: 'Shareholder Resolution',
  category: 'shareholder',
  description: 'A written resolution of the shareholders of a private limited company.',
  icon: 'TrendingUp',
  planRequired: 'free',
  tags: ['shareholder', 'resolution', 'written', 'governance', 'company'],
  signatories: [{ label: 'Shareholder 1' }, { label: 'Shareholder 2' }],
  sections: [
    {
      id: 'company',
      title: 'Company Details',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'companyNumber', label: 'Company Registration Number', type: 'text', required: false },
        { id: 'resolutionDate', label: 'Date of Resolution', type: 'date', required: true },
        { id: 'resolutionType', label: 'Resolution Type', type: 'select', required: true, options: ['Ordinary Resolution', 'Special Resolution'] },
      ],
    },
    {
      id: 'resolution',
      title: 'Resolution Details',
      fields: [
        { id: 'resolutionTitle', label: 'Resolution Title / Subject', type: 'text', required: true },
        { id: 'background', label: 'Background / Recitals', type: 'textarea', required: false },
        { id: 'resolutionText', label: 'Resolution Text', type: 'textarea', required: true, placeholder: 'IT IS RESOLVED THAT...' },
      ],
    },
    {
      id: 'shareholders',
      title: 'Shareholders',
      fields: [
        { id: 'shareholders', label: 'Shareholders (one per line: Name, Shares)', type: 'textarea', required: true, placeholder: 'Jane Smith, 500 ordinary shares\nJohn Brown, 500 ordinary shares' },
        { id: 'totalShares', label: 'Total Shares in Issue', type: 'text', required: false, placeholder: 'e.g. 1,000 ordinary shares of £1 each' },
      ],
    },
  ],
  generateDocument: (data) => {
    const shareholderRows = (data.shareholders || '')
      .split('\n').filter(Boolean)
      .map((line) => { const [name, shares] = line.split(',').map((s) => s.trim()); return [name || line, shares || '—']; });

    return [
      section('Company Information', infoTable([
        ['Company Name', or(data.companyName, '[Company Name]')],
        ['Registration Number', data.companyNumber],
        ['Date of Resolution', or(data.resolutionDate, '[Date]')],
        ['Resolution Type', or(data.resolutionType, 'Ordinary Resolution')],
        ['Total Shares', data.totalShares],
      ])),

      section('Written Resolution of the Shareholders',
        `<p>The shareholders of <strong>${or(data.companyName, '[Company Name]')}</strong>, being entitled to vote on this resolution, hereby pass the following ${or(data.resolutionType, 'written resolution')} in accordance with the Companies Act 2006:</p>`
      ),

      data.background ? section('Background', `<p>${nl2br(data.background)}</p>`) : '',

      section('Resolution',
        `<div style="background:#f0f4fa;border-left:4px solid #1B4F8A;padding:14px 16px;margin:8px 0;border-radius:2px;">
          <p style="font-weight:700;color:#1B4F8A;margin:0 0 8px;font-family:Arial,sans-serif;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;">IT IS RESOLVED THAT:</p>
          <p style="margin:0;">${nl2br(or(data.resolutionText, '[Resolution text]'))}</p>
        </div>`
      ),

      section('Shareholders', `
        <table class="pdf-table">
          <thead><tr><th>Shareholder Name</th><th>Shares Held</th><th>Signature</th></tr></thead>
          <tbody>${shareholderRows.map(([name, shares]) =>
            `<tr><td>${name}</td><td>${shares}</td><td style="min-width:120px;">&nbsp;</td></tr>`
          ).join('')}</tbody>
        </table>
      `),

      section('Authority',
        clause('1.', `This is a ${or(data.resolutionType, 'written resolution')} passed in accordance with section 288 of the Companies Act 2006.`) +
        clause('2.', 'This resolution shall be effective from the date last signed below.')
      ),
    ].filter(Boolean).join('');
  },
};
