import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or } from './html-helpers';

export const invoiceTemplate: DocumentTemplate = {
  id: 'invoice-template',
  name: 'Invoice',
  category: 'business-letters',
  description: 'A professional invoice for goods or services supplied, including itemised charges, VAT, and payment details.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['invoice', 'billing', 'payment', 'vat', 'business'],
  signatories: [],
  sections: [
    {
      id: 'sender',
      title: 'Your Details (Supplier)',
      fields: [
        { id: 'supplierName', label: 'Your Name / Company Name', type: 'text', required: true },
        { id: 'supplierAddress', label: 'Your Address', type: 'textarea', required: false },
        { id: 'supplierEmail', label: 'Your Email', type: 'email', required: false },
        { id: 'supplierPhone', label: 'Your Phone', type: 'phone', required: false },
        { id: 'vatNumber', label: 'VAT Registration Number (if applicable)', type: 'text', required: false },
        { id: 'companyNumber', label: 'Company Registration Number (if applicable)', type: 'text', required: false },
      ],
    },
    {
      id: 'recipient',
      title: 'Bill To (Client)',
      fields: [
        { id: 'clientName', label: 'Client Name / Company', type: 'text', required: true },
        { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: false },
        { id: 'clientEmail', label: 'Client Email', type: 'email', required: false },
      ],
    },
    {
      id: 'invoice',
      title: 'Invoice Details',
      fields: [
        { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, placeholder: 'e.g. INV-001' },
        { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
        { id: 'dueDate', label: 'Payment Due Date', type: 'date', required: false },
        { id: 'poNumber', label: 'Purchase Order Number (if applicable)', type: 'text', required: false },
      ],
    },
    {
      id: 'items',
      title: 'Items & Amounts',
      fields: [
        { id: 'lineItems', label: 'Line Items (one per line: Description | Qty | Unit Price)', type: 'textarea', required: true, placeholder: 'Web design services | 1 | £2,000.00\nHosting setup | 1 | £150.00' },
        { id: 'subtotal', label: 'Subtotal (ex. VAT)', type: 'text', required: true, placeholder: 'e.g. £2,150.00' },
        { id: 'vatRate', label: 'VAT Rate (leave blank if not VAT registered)', type: 'text', required: false, placeholder: 'e.g. 20%' },
        { id: 'vatAmount', label: 'VAT Amount', type: 'text', required: false },
        { id: 'totalAmount', label: 'Total Amount Due', type: 'text', required: true },
      ],
    },
    {
      id: 'payment',
      title: 'Payment Details',
      fields: [
        { id: 'bankName', label: 'Bank Name', type: 'text', required: false },
        { id: 'accountName', label: 'Account Name', type: 'text', required: false },
        { id: 'sortCode', label: 'Sort Code', type: 'text', required: false },
        { id: 'accountNumber', label: 'Account Number', type: 'text', required: false },
        { id: 'paymentReference', label: 'Payment Reference', type: 'text', required: false },
        { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const lineRows = (data.lineItems || '')
      .split('\n').filter((l: string) => l.trim())
      .map((line: string) => {
        const parts = line.split('|').map((p: string) => p.trim());
        return `<tr><td>${parts[0] || ''}</td><td style="text-align:center;">${parts[1] || ''}</td><td style="text-align:right;">${parts[2] || ''}</td></tr>`;
      }).join('');

    return [
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <p style="font-size:8pt;font-weight:700;color:#1B4F8A;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;font-family:Arial,sans-serif;">From</p>
          <p style="margin:0;font-weight:700;">${or(data.supplierName, '[Supplier Name]')}</p>
          ${data.supplierAddress ? `<p style="margin:2px 0;font-size:9.5pt;">${data.supplierAddress.replace(/\n/g, '<br>')}</p>` : ''}
          ${data.supplierEmail ? `<p style="margin:2px 0;font-size:9.5pt;">${data.supplierEmail}</p>` : ''}
          ${data.supplierPhone ? `<p style="margin:2px 0;font-size:9.5pt;">${data.supplierPhone}</p>` : ''}
          ${data.vatNumber ? `<p style="margin:2px 0;font-size:9pt;color:#6b7280;">VAT No: ${data.vatNumber}</p>` : ''}
          ${data.companyNumber ? `<p style="margin:2px 0;font-size:9pt;color:#6b7280;">Co. No: ${data.companyNumber}</p>` : ''}
        </div>
        <div>
          <p style="font-size:8pt;font-weight:700;color:#1B4F8A;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;font-family:Arial,sans-serif;">Bill To</p>
          <p style="margin:0;font-weight:700;">${or(data.clientName, '[Client Name]')}</p>
          ${data.clientAddress ? `<p style="margin:2px 0;font-size:9.5pt;">${data.clientAddress.replace(/\n/g, '<br>')}</p>` : ''}
          ${data.clientEmail ? `<p style="margin:2px 0;font-size:9.5pt;">${data.clientEmail}</p>` : ''}
        </div>
      </div>`,

      infoTable([
        ['Invoice Number', or(data.invoiceNumber, '[INV-XXX]')],
        ['Invoice Date', or(data.invoiceDate, '[Date]')],
        ['Payment Due', data.dueDate],
        ['PO Number', data.poNumber],
      ]),

      `<table class="pdf-table" style="margin-top:16px;">
        <thead>
          <tr>
            <th style="width:60%;">Description</th>
            <th style="width:15%;text-align:center;">Qty</th>
            <th style="width:25%;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineRows || '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No items added</td></tr>'}
        </tbody>
      </table>`,

      `<div class="pdf-totals">
        <table>
          <tr><td>Subtotal</td><td>${or(data.subtotal, '—')}</td></tr>
          ${data.vatRate ? `<tr><td>VAT (${data.vatRate})</td><td>${data.vatAmount || '—'}</td></tr>` : ''}
          <tr class="total-row"><td>Total Due</td><td>${or(data.totalAmount, '—')}</td></tr>
        </table>
      </div>`,

      section('Payment Details', infoTable([
        ['Bank', data.bankName],
        ['Account Name', data.accountName],
        ['Sort Code', data.sortCode],
        ['Account Number', data.accountNumber],
        ['Reference', data.paymentReference || data.invoiceNumber],
      ])),

      data.notes ? section('Notes', `<p>${data.notes}</p>`) : '',
    ].filter(Boolean).join('');
  },
};
