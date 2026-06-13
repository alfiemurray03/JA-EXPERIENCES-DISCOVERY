/**
 * Invoice-family templates:
 *  - Credit Note
 *  - Purchase Order
 *  - Quote / Estimate
 *  - Receipt
 *  - Expense Report
 *  - Proforma Invoice
 *  - Remittance Advice
 *  - Statement of Account
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, esc, fmtDate, notice, signatureBlock } from './html-helpers';

// ── Shared line-item table renderer ──────────────────────────────────────────
function lineItemTable(raw: string, colHeaders = ['Description', 'Qty', 'Unit Price', 'Total']): string {
  const rows = raw.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split('|').map(p => p.trim());
    return `<tr>${parts.map((p, i) => `<td${i > 0 ? ' style="text-align:right;"' : ''}>${esc(p)}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="pdf-table" style="margin-top:12px;">
    <thead><tr>${colHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows || `<tr><td colspan="${colHeaders.length}" style="text-align:center;color:#9ca3af;">No items</td></tr>`}</tbody>
  </table>`;
}

function totalsBlock(rows: Array<[string, string | undefined | null]>, totalLabel = 'Total'): string {
  const filtered = rows.filter(([, v]) => v?.trim());
  const last = filtered[filtered.length - 1];
  return `<div class="pdf-totals"><table>
    ${filtered.slice(0, -1).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}
    ${last ? `<tr class="total-row"><td>${esc(last[0])}</td><td>${last[1]}</td></tr>` : ''}
  </table></div>`;
}

function fromToHeader(
  from: { name: string; address?: string; email?: string; phone?: string; vatNo?: string; coNo?: string },
  to:   { label: string; name: string; address?: string; email?: string },
): string {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
    <div>
      <p style="font-size:8pt;font-weight:700;color:#1B4F8A;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;font-family:Arial,sans-serif;">From</p>
      <p style="margin:0;font-weight:700;">${or(from.name, '[Supplier Name]')}</p>
      ${from.address ? `<p style="margin:2px 0;font-size:9.5pt;">${from.address.replace(/\n/g, '<br>')}</p>` : ''}
      ${from.email   ? `<p style="margin:2px 0;font-size:9.5pt;">${esc(from.email)}</p>` : ''}
      ${from.phone   ? `<p style="margin:2px 0;font-size:9.5pt;">${esc(from.phone)}</p>` : ''}
      ${from.vatNo   ? `<p style="margin:2px 0;font-size:9pt;color:#6b7280;">VAT No: ${esc(from.vatNo)}</p>` : ''}
      ${from.coNo    ? `<p style="margin:2px 0;font-size:9pt;color:#6b7280;">Co. No: ${esc(from.coNo)}</p>` : ''}
    </div>
    <div>
      <p style="font-size:8pt;font-weight:700;color:#1B4F8A;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;font-family:Arial,sans-serif;">${esc(to.label)}</p>
      <p style="margin:0;font-weight:700;">${or(to.name, '[Name]')}</p>
      ${to.address ? `<p style="margin:2px 0;font-size:9.5pt;">${to.address.replace(/\n/g, '<br>')}</p>` : ''}
      ${to.email   ? `<p style="margin:2px 0;font-size:9.5pt;">${esc(to.email)}</p>` : ''}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Credit Note
// ─────────────────────────────────────────────────────────────────────────────
export const creditNoteTemplate: DocumentTemplate = {
  id: 'credit-note',
  name: 'Credit Note',
  category: 'finance',
  description: 'Issue a credit note to a customer to reduce the amount owed on a previous invoice, including reason for credit and adjusted totals.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['credit note', 'refund', 'invoice adjustment', 'billing', 'vat'],
  signatories: [],
  sections: [
    {
      id: 'supplier',
      title: 'Your Details',
      fields: [
        { id: 'supplierName',    label: 'Your Name / Company',      type: 'text',     required: true },
        { id: 'supplierAddress', label: 'Your Address',             type: 'textarea', required: false },
        { id: 'supplierEmail',   label: 'Your Email',               type: 'email',    required: false },
        { id: 'vatNumber',       label: 'VAT Number (if applicable)', type: 'text',   required: false },
      ],
    },
    {
      id: 'client',
      title: 'Client Details',
      fields: [
        { id: 'clientName',    label: 'Client Name / Company', type: 'text',     required: true },
        { id: 'clientAddress', label: 'Client Address',        type: 'textarea', required: false },
        { id: 'clientEmail',   label: 'Client Email',          type: 'email',    required: false },
      ],
    },
    {
      id: 'credit',
      title: 'Credit Note Details',
      fields: [
        { id: 'creditNoteNumber', label: 'Credit Note Number',       type: 'text', required: true, placeholder: 'e.g. CN-001' },
        { id: 'creditNoteDate',   label: 'Credit Note Date',         type: 'date', required: true },
        { id: 'originalInvoice',  label: 'Original Invoice Number',  type: 'text', required: false, placeholder: 'e.g. INV-042' },
        { id: 'reason',           label: 'Reason for Credit',        type: 'textarea', required: true },
      ],
    },
    {
      id: 'amounts',
      title: 'Credit Amounts',
      fields: [
        { id: 'lineItems',    label: 'Line Items (Description | Qty | Unit Price | Total)', type: 'textarea', required: false, placeholder: 'Returned goods | 2 | £50.00 | £100.00' },
        { id: 'subtotal',     label: 'Subtotal',           type: 'text', required: true },
        { id: 'vatRate',      label: 'VAT Rate (if applicable)', type: 'text', required: false, placeholder: '20%' },
        { id: 'vatAmount',    label: 'VAT Amount',         type: 'text', required: false },
        { id: 'totalCredit',  label: 'Total Credit Amount', type: 'text', required: true },
      ],
    },
  ],
  generateDocument: (data) => [
    fromToHeader(
      { name: data.supplierName, address: data.supplierAddress, email: data.supplierEmail, vatNo: data.vatNumber },
      { label: 'Credit To', name: data.clientName, address: data.clientAddress, email: data.clientEmail },
    ),
    infoTable([
      ['Credit Note No.', or(data.creditNoteNumber, '[CN-XXX]')],
      ['Date', fmtDate(data.creditNoteDate)],
      ['Original Invoice', data.originalInvoice],
    ]),
    section('Reason for Credit', `<p>${esc(data.reason)}</p>`),
    data.lineItems ? lineItemTable(data.lineItems) : '',
    totalsBlock([
      ['Subtotal', data.subtotal],
      ...(data.vatRate ? [['VAT (' + data.vatRate + ')', data.vatAmount] as [string, string]] : []),
      ['Total Credit', data.totalCredit],
    ]),
    notice('This credit note reduces the balance on the referenced invoice. Please retain for your records.', 'info'),
  ].filter(Boolean).join(''),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Purchase Order
// ─────────────────────────────────────────────────────────────────────────────
export const purchaseOrderTemplate: DocumentTemplate = {
  id: 'purchase-order',
  name: 'Purchase Order',
  category: 'finance',
  description: 'A formal purchase order sent to a supplier authorising the purchase of goods or services at agreed prices.',
  icon: 'ShoppingBag',
  planRequired: 'free',
  tags: ['purchase order', 'PO', 'procurement', 'supplier', 'ordering'],
  signatories: [{ label: 'Authorised by' }],
  sections: [
    {
      id: 'buyer',
      title: 'Buyer Details',
      fields: [
        { id: 'buyerName',    label: 'Buyer Company Name', type: 'text',     required: true },
        { id: 'buyerAddress', label: 'Buyer Address',      type: 'textarea', required: false },
        { id: 'buyerEmail',   label: 'Buyer Email',        type: 'email',    required: false },
        { id: 'buyerPhone',   label: 'Buyer Phone',        type: 'phone',    required: false },
        { id: 'contactName',  label: 'Contact Name',       type: 'text',     required: false },
      ],
    },
    {
      id: 'supplier',
      title: 'Supplier Details',
      fields: [
        { id: 'supplierName',    label: 'Supplier Company Name', type: 'text',     required: true },
        { id: 'supplierAddress', label: 'Supplier Address',      type: 'textarea', required: false },
        { id: 'supplierEmail',   label: 'Supplier Email',        type: 'email',    required: false },
      ],
    },
    {
      id: 'order',
      title: 'Order Details',
      fields: [
        { id: 'poNumber',      label: 'PO Number',          type: 'text', required: true, placeholder: 'e.g. PO-2024-001' },
        { id: 'orderDate',     label: 'Order Date',         type: 'date', required: true },
        { id: 'deliveryDate',  label: 'Required Delivery Date', type: 'date', required: false },
        { id: 'deliveryAddress', label: 'Delivery Address (if different)', type: 'textarea', required: false },
        { id: 'paymentTerms',  label: 'Payment Terms',      type: 'text', required: false, placeholder: 'e.g. Net 30' },
      ],
    },
    {
      id: 'items',
      title: 'Items Ordered',
      fields: [
        { id: 'lineItems',   label: 'Line Items (Description | Qty | Unit Price | Total)', type: 'textarea', required: true, placeholder: 'Office chairs | 10 | £120.00 | £1,200.00' },
        { id: 'subtotal',    label: 'Subtotal',    type: 'text', required: false },
        { id: 'vatAmount',   label: 'VAT Amount',  type: 'text', required: false },
        { id: 'totalAmount', label: 'Order Total', type: 'text', required: true },
        { id: 'notes',       label: 'Special Instructions / Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    fromToHeader(
      { name: data.buyerName, address: data.buyerAddress, email: data.buyerEmail, phone: data.buyerPhone },
      { label: 'Supplier', name: data.supplierName, address: data.supplierAddress, email: data.supplierEmail },
    ),
    infoTable([
      ['PO Number',       or(data.poNumber, '[PO-XXX]')],
      ['Order Date',      fmtDate(data.orderDate)],
      ['Delivery By',     data.deliveryDate ? fmtDate(data.deliveryDate) : undefined],
      ['Payment Terms',   data.paymentTerms],
      ['Contact',         data.contactName],
    ]),
    data.deliveryAddress ? section('Delivery Address', `<p>${esc(data.deliveryAddress).replace(/\n/g, '<br>')}</p>`) : '',
    lineItemTable(data.lineItems || ''),
    totalsBlock([
      ['Subtotal',    data.subtotal],
      ['VAT',         data.vatAmount],
      ['Order Total', data.totalAmount],
    ]),
    data.notes ? section('Special Instructions', `<p>${esc(data.notes)}</p>`) : '',
    notice('This Purchase Order constitutes an official order. Please confirm receipt and acceptance.', 'info'),
    signatureBlock([{ label: 'Authorised by', name: data.contactName }]),
  ].filter(Boolean).join(''),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Quote / Estimate
// ─────────────────────────────────────────────────────────────────────────────
export const quoteTemplate: DocumentTemplate = {
  id: 'quote-estimate',
  name: 'Quote / Estimate',
  category: 'finance',
  description: 'A professional quotation or estimate for goods or services, with itemised pricing, validity period, and terms.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['quote', 'estimate', 'quotation', 'proposal', 'pricing'],
  signatories: [],
  sections: [
    {
      id: 'from',
      title: 'Your Details',
      fields: [
        { id: 'supplierName',    label: 'Your Name / Company',  type: 'text',     required: true },
        { id: 'supplierAddress', label: 'Your Address',         type: 'textarea', required: false },
        { id: 'supplierEmail',   label: 'Your Email',           type: 'email',    required: false },
        { id: 'supplierPhone',   label: 'Your Phone',           type: 'phone',    required: false },
        { id: 'vatNumber',       label: 'VAT Number',           type: 'text',     required: false },
      ],
    },
    {
      id: 'to',
      title: 'Client Details',
      fields: [
        { id: 'clientName',    label: 'Client Name / Company', type: 'text',     required: true },
        { id: 'clientAddress', label: 'Client Address',        type: 'textarea', required: false },
        { id: 'clientEmail',   label: 'Client Email',          type: 'email',    required: false },
      ],
    },
    {
      id: 'quote',
      title: 'Quote Details',
      fields: [
        { id: 'quoteNumber',   label: 'Quote Number',         type: 'text', required: true, placeholder: 'e.g. QT-2024-001' },
        { id: 'quoteDate',     label: 'Quote Date',           type: 'date', required: true },
        { id: 'validUntil',    label: 'Valid Until',          type: 'date', required: false },
        { id: 'projectTitle',  label: 'Project / Job Title',  type: 'text', required: false },
      ],
    },
    {
      id: 'items',
      title: 'Quoted Items',
      fields: [
        { id: 'lineItems',    label: 'Line Items (Description | Qty | Unit Price | Total)', type: 'textarea', required: true, placeholder: 'Website design | 1 | £2,500.00 | £2,500.00' },
        { id: 'subtotal',     label: 'Subtotal',          type: 'text', required: false },
        { id: 'vatRate',      label: 'VAT Rate',          type: 'text', required: false, placeholder: '20%' },
        { id: 'vatAmount',    label: 'VAT Amount',        type: 'text', required: false },
        { id: 'totalAmount',  label: 'Total Quote Value', type: 'text', required: true },
        { id: 'terms',        label: 'Terms & Conditions / Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    fromToHeader(
      { name: data.supplierName, address: data.supplierAddress, email: data.supplierEmail, phone: data.supplierPhone, vatNo: data.vatNumber },
      { label: 'Prepared For', name: data.clientName, address: data.clientAddress, email: data.clientEmail },
    ),
    infoTable([
      ['Quote Number', or(data.quoteNumber, '[QT-XXX]')],
      ['Date',         fmtDate(data.quoteDate)],
      ['Valid Until',  data.validUntil ? fmtDate(data.validUntil) : undefined],
      ['Project',      data.projectTitle],
    ]),
    lineItemTable(data.lineItems || ''),
    totalsBlock([
      ['Subtotal',     data.subtotal],
      ...(data.vatRate ? [['VAT (' + data.vatRate + ')', data.vatAmount] as [string, string]] : []),
      ['Total',        data.totalAmount],
    ]),
    data.terms ? section('Terms & Conditions', `<p>${esc(data.terms).replace(/\n/g, '<br>')}</p>`) : '',
    notice(
      data.validUntil
        ? `This quote is valid until ${fmtDate(data.validUntil)}. Prices are subject to change after this date.`
        : 'Prices are subject to change. Please confirm acceptance in writing.',
      'warning',
    ),
  ].filter(Boolean).join(''),
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Receipt
// ─────────────────────────────────────────────────────────────────────────────
export const receiptTemplate: DocumentTemplate = {
  id: 'payment-receipt',
  name: 'Payment Receipt',
  category: 'finance',
  description: 'A formal receipt confirming payment received for goods or services, suitable for customers and accounting records.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['receipt', 'payment', 'proof of payment', 'billing'],
  signatories: [],
  sections: [
    {
      id: 'from',
      title: 'Received By',
      fields: [
        { id: 'businessName',    label: 'Business / Trader Name', type: 'text',     required: true },
        { id: 'businessAddress', label: 'Business Address',       type: 'textarea', required: false },
        { id: 'businessEmail',   label: 'Business Email',         type: 'email',    required: false },
        { id: 'vatNumber',       label: 'VAT Number',             type: 'text',     required: false },
      ],
    },
    {
      id: 'payer',
      title: 'Received From',
      fields: [
        { id: 'payerName',    label: 'Customer / Payer Name', type: 'text',     required: true },
        { id: 'payerAddress', label: 'Customer Address',      type: 'textarea', required: false },
      ],
    },
    {
      id: 'payment',
      title: 'Payment Details',
      fields: [
        { id: 'receiptNumber',  label: 'Receipt Number',       type: 'text',   required: true, placeholder: 'e.g. REC-001' },
        { id: 'receiptDate',    label: 'Date of Payment',      type: 'date',   required: true },
        { id: 'paymentMethod',  label: 'Payment Method',       type: 'select', required: true, options: ['Bank Transfer', 'Cash', 'Cheque', 'Card', 'Direct Debit', 'PayPal', 'Other'] },
        { id: 'invoiceRef',     label: 'Invoice / Reference',  type: 'text',   required: false },
        { id: 'description',    label: 'Description of Goods/Services', type: 'textarea', required: true },
        { id: 'amountPaid',     label: 'Amount Paid',          type: 'text',   required: true },
        { id: 'vatIncluded',    label: 'VAT Included (if applicable)', type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    fromToHeader(
      { name: data.businessName, address: data.businessAddress, email: data.businessEmail, vatNo: data.vatNumber },
      { label: 'Received From', name: data.payerName, address: data.payerAddress },
    ),
    infoTable([
      ['Receipt No.',     or(data.receiptNumber, '[REC-XXX]')],
      ['Date',            fmtDate(data.receiptDate)],
      ['Payment Method',  data.paymentMethod],
      ['Invoice Ref.',    data.invoiceRef],
    ]),
    section('Description', `<p>${esc(data.description)}</p>`),
    `<div class="pdf-totals"><table>
      ${data.vatIncluded ? `<tr><td>VAT Included</td><td>${esc(data.vatIncluded)}</td></tr>` : ''}
      <tr class="total-row"><td>Amount Paid</td><td>${esc(data.amountPaid)}</td></tr>
    </table></div>`,
    notice('This receipt confirms payment in full. Please retain for your records.', 'success'),
  ].filter(Boolean).join(''),
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Expense Report
// ─────────────────────────────────────────────────────────────────────────────
export const expenseReportTemplate: DocumentTemplate = {
  id: 'expense-report',
  name: 'Expense Report',
  category: 'finance',
  description: 'A structured employee expense report for submitting business expenses for reimbursement, with itemised costs and receipts summary.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['expense', 'expenses', 'reimbursement', 'business travel', 'hr'],
  signatories: [{ label: 'Employee' }, { label: 'Approved by' }],
  sections: [
    {
      id: 'employee',
      title: 'Employee Details',
      fields: [
        { id: 'employeeName',   label: 'Employee Name',       type: 'text', required: true },
        { id: 'employeeId',     label: 'Employee ID / Dept',  type: 'text', required: false },
        { id: 'managerName',    label: 'Manager / Approver',  type: 'text', required: false },
        { id: 'reportPeriod',   label: 'Expense Period',      type: 'text', required: true, placeholder: 'e.g. May 2024' },
        { id: 'submittedDate',  label: 'Date Submitted',      type: 'date', required: true },
        { id: 'purpose',        label: 'Business Purpose',    type: 'text', required: true, placeholder: 'e.g. Client visit — Manchester' },
      ],
    },
    {
      id: 'expenses',
      title: 'Expense Items',
      fields: [
        { id: 'lineItems', label: 'Expenses (Date | Category | Description | Amount)', type: 'textarea', required: true,
          placeholder: '01/05/2024 | Travel | Train to Manchester | £42.50\n01/05/2024 | Meals | Client lunch | £35.00' },
        { id: 'totalAmount', label: 'Total Claimed', type: 'text', required: true },
        { id: 'receiptsAttached', label: 'Receipts Attached?', type: 'select', required: false, options: ['Yes — all receipts attached', 'Partial — some receipts missing', 'No receipts'] },
        { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.lineItems || '').split('\n').filter((l: string) => l.trim()).map((line: string) => {
      const parts = line.split('|').map((p: string) => p.trim());
      return `<tr><td>${esc(parts[0] || '')}</td><td>${esc(parts[1] || '')}</td><td>${esc(parts[2] || '')}</td><td style="text-align:right;">${esc(parts[3] || '')}</td></tr>`;
    }).join('');

    return [
      section('Employee Details', infoTable([
        ['Employee',       data.employeeName],
        ['Employee ID',    data.employeeId],
        ['Manager',        data.managerName],
        ['Period',         data.reportPeriod],
        ['Date Submitted', fmtDate(data.submittedDate)],
        ['Purpose',        data.purpose],
      ])),
      `<table class="pdf-table" style="margin-top:12px;">
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;">No expenses entered</td></tr>'}</tbody>
      </table>`,
      `<div class="pdf-totals"><table>
        <tr class="total-row"><td>Total Claimed</td><td>${esc(data.totalAmount || '—')}</td></tr>
      </table></div>`,
      data.receiptsAttached ? section('Receipts', `<p>${esc(data.receiptsAttached)}</p>`) : '',
      data.notes ? section('Notes', `<p>${esc(data.notes)}</p>`) : '',
      signatureBlock([
        { label: 'Employee', name: data.employeeName },
        { label: 'Approved by', name: data.managerName },
      ]),
    ].filter(Boolean).join('');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Proforma Invoice
// ─────────────────────────────────────────────────────────────────────────────
export const proformaInvoiceTemplate: DocumentTemplate = {
  id: 'proforma-invoice',
  name: 'Proforma Invoice',
  category: 'finance',
  description: 'A preliminary invoice sent before goods or services are delivered, used to confirm order details and request advance payment.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['proforma', 'invoice', 'advance payment', 'pre-invoice', 'billing'],
  signatories: [],
  sections: [
    {
      id: 'supplier',
      title: 'Your Details',
      fields: [
        { id: 'supplierName',    label: 'Your Name / Company',    type: 'text',     required: true },
        { id: 'supplierAddress', label: 'Your Address',           type: 'textarea', required: false },
        { id: 'supplierEmail',   label: 'Your Email',             type: 'email',    required: false },
        { id: 'supplierPhone',   label: 'Your Phone',             type: 'phone',    required: false },
        { id: 'vatNumber',       label: 'VAT Number',             type: 'text',     required: false },
      ],
    },
    {
      id: 'client',
      title: 'Client Details',
      fields: [
        { id: 'clientName',    label: 'Client Name / Company', type: 'text',     required: true },
        { id: 'clientAddress', label: 'Client Address',        type: 'textarea', required: false },
        { id: 'clientEmail',   label: 'Client Email',          type: 'email',    required: false },
      ],
    },
    {
      id: 'proforma',
      title: 'Proforma Details',
      fields: [
        { id: 'proformaNumber', label: 'Proforma Number',         type: 'text', required: true, placeholder: 'e.g. PRO-001' },
        { id: 'proformaDate',   label: 'Date',                    type: 'date', required: true },
        { id: 'validUntil',     label: 'Valid Until',             type: 'date', required: false },
        { id: 'deliveryDate',   label: 'Expected Delivery Date',  type: 'date', required: false },
        { id: 'paymentTerms',   label: 'Payment Terms',           type: 'text', required: false, placeholder: 'e.g. 50% upfront, 50% on delivery' },
      ],
    },
    {
      id: 'items',
      title: 'Items',
      fields: [
        { id: 'lineItems',   label: 'Line Items (Description | Qty | Unit Price | Total)', type: 'textarea', required: true },
        { id: 'subtotal',    label: 'Subtotal',    type: 'text', required: false },
        { id: 'vatRate',     label: 'VAT Rate',    type: 'text', required: false },
        { id: 'vatAmount',   label: 'VAT Amount',  type: 'text', required: false },
        { id: 'totalAmount', label: 'Total',       type: 'text', required: true },
        { id: 'bankDetails', label: 'Bank / Payment Details', type: 'textarea', required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    notice('PROFORMA INVOICE — This is not a VAT invoice. A formal invoice will be issued upon payment.', 'warning'),
    fromToHeader(
      { name: data.supplierName, address: data.supplierAddress, email: data.supplierEmail, phone: data.supplierPhone, vatNo: data.vatNumber },
      { label: 'Bill To', name: data.clientName, address: data.clientAddress, email: data.clientEmail },
    ),
    infoTable([
      ['Proforma No.',   or(data.proformaNumber, '[PRO-XXX]')],
      ['Date',           fmtDate(data.proformaDate)],
      ['Valid Until',    data.validUntil ? fmtDate(data.validUntil) : undefined],
      ['Delivery By',    data.deliveryDate ? fmtDate(data.deliveryDate) : undefined],
      ['Payment Terms',  data.paymentTerms],
    ]),
    lineItemTable(data.lineItems || ''),
    totalsBlock([
      ['Subtotal',  data.subtotal],
      ...(data.vatRate ? [['VAT (' + data.vatRate + ')', data.vatAmount] as [string, string]] : []),
      ['Total Due', data.totalAmount],
    ]),
    data.bankDetails ? section('Payment Details', `<p>${esc(data.bankDetails).replace(/\n/g, '<br>')}</p>`) : '',
  ].filter(Boolean).join(''),
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Remittance Advice
// ─────────────────────────────────────────────────────────────────────────────
export const remittanceAdviceTemplate: DocumentTemplate = {
  id: 'remittance-advice',
  name: 'Remittance Advice',
  category: 'finance',
  description: 'A remittance advice slip sent to a supplier to confirm which invoices a payment covers.',
  icon: 'Receipt',
  planRequired: 'free',
  tags: ['remittance', 'payment advice', 'supplier', 'accounts payable'],
  signatories: [],
  sections: [
    {
      id: 'payer',
      title: 'Paying Company',
      fields: [
        { id: 'payerName',    label: 'Your Company Name', type: 'text',     required: true },
        { id: 'payerAddress', label: 'Your Address',      type: 'textarea', required: false },
        { id: 'payerEmail',   label: 'Your Email',        type: 'email',    required: false },
      ],
    },
    {
      id: 'supplier',
      title: 'Supplier Details',
      fields: [
        { id: 'supplierName',  label: 'Supplier Name',  type: 'text',  required: true },
        { id: 'supplierEmail', label: 'Supplier Email', type: 'email', required: false },
      ],
    },
    {
      id: 'payment',
      title: 'Payment Details',
      fields: [
        { id: 'paymentDate',   label: 'Payment Date',    type: 'date',   required: true },
        { id: 'paymentMethod', label: 'Payment Method',  type: 'select', required: false, options: ['BACS', 'CHAPS', 'Faster Payments', 'Cheque', 'Card', 'Other'] },
        { id: 'reference',     label: 'Payment Reference', type: 'text', required: false },
        { id: 'invoices',      label: 'Invoices Covered (Invoice No | Date | Amount)', type: 'textarea', required: true,
          placeholder: 'INV-001 | 01/04/2024 | £1,200.00\nINV-002 | 15/04/2024 | £800.00' },
        { id: 'totalPaid',     label: 'Total Amount Paid', type: 'text', required: true },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.invoices || '').split('\n').filter((l: string) => l.trim()).map((line: string) => {
      const parts = line.split('|').map((p: string) => p.trim());
      return `<tr><td>${esc(parts[0] || '')}</td><td>${esc(parts[1] || '')}</td><td style="text-align:right;">${esc(parts[2] || '')}</td></tr>`;
    }).join('');

    return [
      fromToHeader(
        { name: data.payerName, address: data.payerAddress, email: data.payerEmail },
        { label: 'To Supplier', name: data.supplierName, email: data.supplierEmail },
      ),
      infoTable([
        ['Payment Date',   fmtDate(data.paymentDate)],
        ['Method',         data.paymentMethod],
        ['Reference',      data.reference],
      ]),
      `<table class="pdf-table" style="margin-top:12px;">
        <thead><tr><th>Invoice No.</th><th>Invoice Date</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No invoices listed</td></tr>'}</tbody>
      </table>`,
      `<div class="pdf-totals"><table>
        <tr class="total-row"><td>Total Paid</td><td>${esc(data.totalPaid || '—')}</td></tr>
      </table></div>`,
      notice('Please allocate this payment against the invoices listed above.', 'info'),
    ].filter(Boolean).join('');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Statement of Account
// ─────────────────────────────────────────────────────────────────────────────
export const statementOfAccountTemplate: DocumentTemplate = {
  id: 'statement-of-account',
  name: 'Statement of Account',
  category: 'finance',
  description: 'A periodic statement sent to a customer summarising all invoices, payments, and the outstanding balance.',
  icon: 'BarChart2',
  planRequired: 'free',
  tags: ['statement', 'account', 'balance', 'invoices', 'billing'],
  signatories: [],
  sections: [
    {
      id: 'supplier',
      title: 'Your Details',
      fields: [
        { id: 'supplierName',    label: 'Your Company Name', type: 'text',     required: true },
        { id: 'supplierAddress', label: 'Your Address',      type: 'textarea', required: false },
        { id: 'supplierEmail',   label: 'Your Email',        type: 'email',    required: false },
        { id: 'supplierPhone',   label: 'Your Phone',        type: 'phone',    required: false },
      ],
    },
    {
      id: 'client',
      title: 'Client Details',
      fields: [
        { id: 'clientName',    label: 'Client Name / Company', type: 'text',     required: true },
        { id: 'clientAddress', label: 'Client Address',        type: 'textarea', required: false },
        { id: 'clientEmail',   label: 'Client Email',          type: 'email',    required: false },
      ],
    },
    {
      id: 'statement',
      title: 'Statement Details',
      fields: [
        { id: 'statementDate',  label: 'Statement Date',    type: 'date', required: true },
        { id: 'periodFrom',     label: 'Period From',       type: 'date', required: false },
        { id: 'periodTo',       label: 'Period To',         type: 'date', required: false },
        { id: 'transactions',   label: 'Transactions (Date | Type | Reference | Debit | Credit | Balance)', type: 'textarea', required: true,
          placeholder: '01/04/2024 | Invoice | INV-001 | £1,200.00 | — | £1,200.00\n15/04/2024 | Payment | PAY-001 | — | £600.00 | £600.00' },
        { id: 'openingBalance', label: 'Opening Balance',   type: 'text', required: false },
        { id: 'closingBalance', label: 'Closing Balance / Amount Due', type: 'text', required: true },
        { id: 'paymentTerms',   label: 'Payment Terms',     type: 'text', required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.transactions || '').split('\n').filter((l: string) => l.trim()).map((line: string) => {
      const parts = line.split('|').map((p: string) => p.trim());
      return `<tr>${parts.map((p, i) => `<td${i >= 3 ? ' style="text-align:right;"' : ''}>${esc(p)}</td>`).join('')}</tr>`;
    }).join('');

    return [
      fromToHeader(
        { name: data.supplierName, address: data.supplierAddress, email: data.supplierEmail, phone: data.supplierPhone },
        { label: 'Account For', name: data.clientName, address: data.clientAddress, email: data.clientEmail },
      ),
      infoTable([
        ['Statement Date', fmtDate(data.statementDate)],
        ['Period',         data.periodFrom && data.periodTo ? `${fmtDate(data.periodFrom)} – ${fmtDate(data.periodTo)}` : undefined],
        ['Opening Balance', data.openingBalance],
        ['Payment Terms',  data.paymentTerms],
      ]),
      `<table class="pdf-table" style="margin-top:12px;">
        <thead><tr><th>Date</th><th>Type</th><th>Reference</th><th style="text-align:right;">Debit</th><th style="text-align:right;">Credit</th><th style="text-align:right;">Balance</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#9ca3af;">No transactions</td></tr>'}</tbody>
      </table>`,
      `<div class="pdf-totals"><table>
        <tr class="total-row"><td>Amount Due</td><td>${esc(data.closingBalance || '—')}</td></tr>
      </table></div>`,
      notice('Please contact us if you have any queries regarding this statement.', 'info'),
    ].filter(Boolean).join('');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_INVOICE_TEMPLATES: DocumentTemplate[] = [
  creditNoteTemplate,
  purchaseOrderTemplate,
  quoteTemplate,
  receiptTemplate,
  expenseReportTemplate,
  proformaInvoiceTemplate,
  remittanceAdviceTemplate,
  statementOfAccountTemplate,
];
