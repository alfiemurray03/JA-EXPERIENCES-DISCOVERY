import type { BuilderTemplate } from '@/lib/builder-framework';

export const INVOICE_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'invoice-standard',
    builderId: 'invoice',
    name: 'Standard Invoice',
    description: 'Clean standard invoice for goods or services',
    category: 'Standard Invoice',
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Name / Business',       type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'seller_phone',      label: 'Your Phone',                 type: 'phone' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true, placeholder: 'e.g. INV-2026-001' },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date',     required: true },
      { id: 'due_date',          label: 'Payment Due Date',           type: 'date',     required: true },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'client_email',      label: 'Client Email',               type: 'email' },
      { id: 'description',       label: 'Description of Services / Goods', type: 'textarea', required: true },
      { id: 'subtotal',          label: 'Subtotal',                   type: 'text',     required: true, placeholder: 'e.g. £1,200.00' },
      { id: 'vat_rate',          label: 'VAT Rate',                   type: 'select',   options: ['0%', '5%', '20%', 'N/A'], defaultValue: '20%' },
      { id: 'vat_amount',        label: 'VAT Amount',                 type: 'text',     placeholder: 'e.g. £240.00' },
      { id: 'total',             label: 'Total Amount Due',           type: 'text',     required: true, placeholder: 'e.g. £1,440.00' },
      { id: 'payment_terms',     label: 'Payment Terms',              type: 'text',     defaultValue: 'Payment due within 30 days of invoice date' },
      { id: 'bank_details',      label: 'Bank / Payment Details',     type: 'textarea', placeholder: 'Bank name, sort code, account number, reference' },
      { id: 'notes',             label: 'Notes (optional)',           type: 'textarea' },
    ],
    bodyTemplate: `# INVOICE

**{{seller_name}}**
{{seller_address}}
{{seller_email}} | {{seller_phone}}

---

**Invoice Number:** {{invoice_number}}
**Invoice Date:** {{invoice_date}}
**Due Date:** {{due_date}}

---

**Bill To:**
{{client_name}}
{{client_address}}
{{client_email}}

---

## Description

{{description}}

---

| | |
|---|---|
| **Subtotal** | {{subtotal}} |
| **VAT ({{vat_rate}})** | {{vat_amount}} |
| **Total Due** | **{{total}}** |

---

**Payment Terms:** {{payment_terms}}

**Payment Details:**
{{bank_details}}

{{notes}}`,
  },

  {
    id: 'invoice-vat',
    builderId: 'invoice',
    name: 'VAT Invoice',
    description: 'Full VAT invoice compliant with HMRC requirements',
    category: 'VAT Invoice',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Business Name',              type: 'text',     required: true },
      { id: 'seller_address',    label: 'Business Address',           type: 'textarea', required: true },
      { id: 'seller_vat',        label: 'VAT Registration Number',    type: 'text',     required: true, placeholder: 'e.g. GB123456789' },
      { id: 'seller_company',    label: 'Company Number (if Ltd)',    type: 'text' },
      { id: 'seller_email',      label: 'Business Email',             type: 'email' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'invoice_date',      label: 'Tax Point / Invoice Date',   type: 'date',     required: true },
      { id: 'due_date',          label: 'Payment Due Date',           type: 'date',     required: true },
      { id: 'client_name',       label: 'Client / Customer Name',     type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'client_vat',        label: 'Client VAT Number (if applicable)', type: 'text' },
      { id: 'description',       label: 'Description of Supply',      type: 'textarea', required: true },
      { id: 'net_amount',        label: 'Net Amount (excl. VAT)',      type: 'text',     required: true },
      { id: 'vat_rate',          label: 'VAT Rate',                   type: 'select',   options: ['20% Standard Rate', '5% Reduced Rate', '0% Zero Rate'], defaultValue: '20% Standard Rate' },
      { id: 'vat_amount',        label: 'VAT Amount',                 type: 'text',     required: true },
      { id: 'gross_total',       label: 'Gross Total (incl. VAT)',     type: 'text',     required: true },
      { id: 'bank_details',      label: 'Bank Details',               type: 'textarea', required: true },
    ],
    bodyTemplate: `# VAT INVOICE

**{{seller_name}}**
{{seller_address}}
VAT Reg: {{seller_vat}} | Company No: {{seller_company}}
{{seller_email}}

---

**Invoice Number:** {{invoice_number}}
**Tax Point / Date:** {{invoice_date}}
**Payment Due:** {{due_date}}

---

**Customer:**
{{client_name}}
{{client_address}}
Customer VAT No: {{client_vat}}

---

## Supply Details

{{description}}

---

| | |
|---|---|
| **Net Amount** | {{net_amount}} |
| **VAT ({{vat_rate}})** | {{vat_amount}} |
| **Gross Total** | **{{gross_total}}** |

---

**Bank Details:**
{{bank_details}}

*This is a VAT invoice for UK tax purposes.*`,
  },

  {
    id: 'invoice-proforma',
    builderId: 'invoice',
    name: 'Pro Forma Invoice',
    description: 'Pro forma invoice for advance payment or quotation purposes',
    category: 'Pro Forma',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'proforma_number',   label: 'Pro Forma Number',           type: 'text',     required: true },
      { id: 'issue_date',        label: 'Issue Date',                 type: 'date',     required: true },
      { id: 'valid_until',       label: 'Valid Until',                type: 'date' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'description',       label: 'Description of Goods / Services', type: 'textarea', required: true },
      { id: 'total',             label: 'Total Amount',               type: 'text',     required: true },
      { id: 'payment_instructions', label: 'Payment Instructions',    type: 'textarea' },
      { id: 'notes',             label: 'Notes',                      type: 'textarea', defaultValue: 'This is a pro forma invoice and is not a demand for payment. A formal invoice will be issued upon confirmation of order.' },
    ],
    bodyTemplate: `# PRO FORMA INVOICE

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Pro Forma Number:** {{proforma_number}}
**Issue Date:** {{issue_date}}
**Valid Until:** {{valid_until}}

---

**Prepared For:**
{{client_name}}
{{client_address}}

---

## Description

{{description}}

---

**Total: {{total}}**

---

**Payment Instructions:**
{{payment_instructions}}

---

*{{notes}}*`,
  },

  {
    id: 'invoice-credit-note',
    builderId: 'invoice',
    name: 'Credit Note',
    description: 'Issue a credit note against a previous invoice',
    category: 'Credit Note',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_vat',        label: 'VAT Number (if applicable)', type: 'text' },
      { id: 'credit_note_number',label: 'Credit Note Number',         type: 'text',     required: true },
      { id: 'credit_note_date',  label: 'Credit Note Date',           type: 'date',     required: true },
      { id: 'original_invoice',  label: 'Original Invoice Number',    type: 'text',     required: true },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'reason',            label: 'Reason for Credit',          type: 'textarea', required: true },
      { id: 'credit_amount',     label: 'Credit Amount',              type: 'text',     required: true },
      { id: 'vat_amount',        label: 'VAT Amount (if applicable)', type: 'text' },
      { id: 'total_credit',      label: 'Total Credit',               type: 'text',     required: true },
    ],
    bodyTemplate: `# CREDIT NOTE

**{{seller_name}}**
{{seller_address}}
VAT Reg: {{seller_vat}}

---

**Credit Note Number:** {{credit_note_number}}
**Date:** {{credit_note_date}}
**Against Invoice:** {{original_invoice}}

---

**Issued To:**
{{client_name}}
{{client_address}}

---

## Reason for Credit

{{reason}}

---

| | |
|---|---|
| **Credit Amount (net)** | {{credit_amount}} |
| **VAT** | {{vat_amount}} |
| **Total Credit** | **{{total_credit}}** |

---

*This credit note reduces the amount owed on Invoice {{original_invoice}}.*`,
  },

  {
    id: 'invoice-quote',
    builderId: 'invoice',
    name: 'Quote / Estimate',
    description: 'Formal quotation or estimate for goods or services',
    category: 'Quote & Estimate',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    defaultLayout: 'quote',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'seller_phone',      label: 'Your Phone',                 type: 'phone' },
      { id: 'quote_number',      label: 'Quote Number',               type: 'text',     required: true },
      { id: 'quote_date',        label: 'Quote Date',                 type: 'date',     required: true },
      { id: 'valid_until',       label: 'Valid Until',                type: 'date' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'description',       label: 'Description of Work / Goods',type: 'textarea', required: true },
      { id: 'subtotal',          label: 'Subtotal',                   type: 'text',     required: true },
      { id: 'vat',               label: 'VAT (if applicable)',        type: 'text' },
      { id: 'total',             label: 'Total',                      type: 'text',     required: true },
      { id: 'terms',             label: 'Terms & Conditions',         type: 'textarea', defaultValue: 'This quote is valid for 30 days. Prices are subject to change after this date.' },
    ],
    bodyTemplate: `# QUOTATION

**{{seller_name}}**
{{seller_address}}
{{seller_email}} | {{seller_phone}}

---

**Quote Number:** {{quote_number}}
**Date:** {{quote_date}}
**Valid Until:** {{valid_until}}

---

**Prepared For:**
{{client_name}}
{{client_address}}

---

## Scope of Work / Goods

{{description}}

---

| | |
|---|---|
| **Subtotal** | {{subtotal}} |
| **VAT** | {{vat}} |
| **Total** | **{{total}}** |

---

**Terms:**
{{terms}}`,
  },

  {
    id: 'invoice-deposit',
    builderId: 'invoice',
    name: 'Deposit Invoice',
    description: 'Request a deposit payment before work begins',
    category: 'Deposit',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date',     required: true },
      { id: 'due_date',          label: 'Deposit Due Date',           type: 'date',     required: true },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'project_description',label: 'Project Description',       type: 'textarea', required: true },
      { id: 'total_project_value',label: 'Total Project Value',       type: 'text',     required: true },
      { id: 'deposit_percentage',label: 'Deposit Percentage',         type: 'text',     defaultValue: '50%' },
      { id: 'deposit_amount',    label: 'Deposit Amount Due',         type: 'text',     required: true },
      { id: 'bank_details',      label: 'Bank Details',               type: 'textarea', required: true },
      { id: 'balance_due',       label: 'Balance Due On Completion',  type: 'text' },
    ],
    bodyTemplate: `# DEPOSIT INVOICE

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Invoice Number:** {{invoice_number}}
**Date:** {{invoice_date}}
**Deposit Due:** {{due_date}}

---

**Client:**
{{client_name}}
{{client_address}}

---

## Project

{{project_description}}

---

| | |
|---|---|
| **Total Project Value** | {{total_project_value}} |
| **Deposit Required ({{deposit_percentage}})** | **{{deposit_amount}}** |
| **Balance Due on Completion** | {{balance_due}} |

---

**Bank Details:**
{{bank_details}}

*Work will commence upon receipt of the deposit.*`,
  },

  {
    id: 'invoice-receipt',
    builderId: 'invoice',
    name: 'Payment Receipt',
    description: 'Confirm receipt of payment from a customer',
    category: 'Receipt',
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'receipt_number',    label: 'Receipt Number',             type: 'text',     required: true },
      { id: 'receipt_date',      label: 'Receipt Date',               type: 'date',     required: true },
      { id: 'client_name',       label: 'Received From',              type: 'text',     required: true },
      { id: 'description',       label: 'Description',                type: 'textarea', required: true },
      { id: 'amount_received',   label: 'Amount Received',            type: 'text',     required: true },
      { id: 'payment_method',    label: 'Payment Method',             type: 'select',   options: ['Bank Transfer', 'Cash', 'Card', 'Cheque', 'Direct Debit', 'PayPal'], defaultValue: 'Bank Transfer' },
      { id: 'invoice_ref',       label: 'Invoice Reference (if any)', type: 'text' },
    ],
    bodyTemplate: `# PAYMENT RECEIPT

**{{seller_name}}**
{{seller_address}}

---

**Receipt Number:** {{receipt_number}}
**Date:** {{receipt_date}}

---

**Received From:** {{client_name}}
**Invoice Reference:** {{invoice_ref}}

---

## Payment Details

{{description}}

---

| | |
|---|---|
| **Amount Received** | **{{amount_received}}** |
| **Payment Method** | {{payment_method}} |

---

*Thank you for your payment. This receipt confirms that payment has been received in full.*`,
  },

  {
    id: 'invoice-recurring',
    builderId: 'invoice',
    name: 'Recurring Invoice',
    description: 'Monthly or periodic recurring service invoice',
    category: 'Recurring',
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'billing_period',    label: 'Billing Period',             type: 'text',     required: true, placeholder: 'e.g. June 2026' },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date',     required: true },
      { id: 'due_date',          label: 'Due Date',                   type: 'date',     required: true },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'service_description',label: 'Service Description',       type: 'textarea', required: true },
      { id: 'monthly_fee',       label: 'Monthly Fee',                type: 'text',     required: true },
      { id: 'vat',               label: 'VAT (if applicable)',        type: 'text' },
      { id: 'total',             label: 'Total Due',                  type: 'text',     required: true },
      { id: 'bank_details',      label: 'Bank Details',               type: 'textarea', required: true },
      { id: 'direct_debit_note', label: 'Direct Debit Note (optional)', type: 'text' },
    ],
    bodyTemplate: `# RECURRING INVOICE

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Invoice Number:** {{invoice_number}}
**Billing Period:** {{billing_period}}
**Invoice Date:** {{invoice_date}}
**Due Date:** {{due_date}}

---

**Client:**
{{client_name}}
{{client_address}}

---

## Service

{{service_description}}

---

| | |
|---|---|
| **Monthly Fee** | {{monthly_fee}} |
| **VAT** | {{vat}} |
| **Total Due** | **{{total}}** |

---

**Bank Details:**
{{bank_details}}

{{direct_debit_note}}`,
  },

  // ── Statement ─────────────────────────────────────────────────────────────
  {
    id: 'invoice-statement',
    builderId: 'invoice',
    name: 'Account Statement',
    description: 'Summary statement of all invoices and payments for an account',
    category: 'Statement',
    industries: ['Finance', 'Business', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'statement_date',    label: 'Statement Date',             type: 'date',     required: true },
      { id: 'account_ref',       label: 'Account Reference',          type: 'text' },
      { id: 'period',            label: 'Statement Period',           type: 'text',     placeholder: 'e.g. 1 May 2026 – 31 May 2026' },
      { id: 'transactions',      label: 'Transactions',               type: 'textarea', required: true, placeholder: 'Date | Description | Debit | Credit | Balance' },
      { id: 'balance_due',       label: 'Balance Due (£)',            type: 'text',     required: true },
      { id: 'payment_details',   label: 'Payment Details',            type: 'textarea' },
    ],
    bodyTemplate: `**ACCOUNT STATEMENT**

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Statement for:** {{client_name}}
{{client_address}}

**Statement Date:** {{statement_date}}
**Account Ref:** {{account_ref}}
**Period:** {{period}}

---

## Transactions

{{transactions}}

---

**Balance Due: £{{balance_due}}**

**Payment Details:**
{{payment_details}}`,
  },

  // ── Payment Request ───────────────────────────────────────────────────────
  {
    id: 'invoice-payment-request',
    builderId: 'invoice',
    name: 'Payment Request',
    description: 'Simple payment request for services rendered or goods supplied',
    category: 'Payment Request',
    industries: ['Finance', 'Business', 'General'],
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Name / Business',       type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'request_date',      label: 'Request Date',               type: 'date',     required: true },
      { id: 'reference',         label: 'Reference',                  type: 'text' },
      { id: 'description',       label: 'Description of Work / Goods',type: 'textarea', required: true },
      { id: 'amount',            label: 'Amount Requested (£)',       type: 'text',     required: true },
      { id: 'due_date',          label: 'Payment Due Date',           type: 'date' },
      { id: 'payment_details',   label: 'Payment Details',            type: 'textarea', required: true },
    ],
    bodyTemplate: `**PAYMENT REQUEST**

**From:** {{seller_name}}
{{seller_address}}
{{seller_email}}

**To:** {{client_name}}

**Date:** {{request_date}}
**Reference:** {{reference}}

---

**Description:**
{{description}}

---

**Amount Requested: £{{amount}}**
**Due Date:** {{due_date}}

**Payment Details:**
{{payment_details}}

Thank you for your prompt payment.`,
  },

  // ── Retainer ──────────────────────────────────────────────────────────────
  {
    id: 'invoice-retainer',
    builderId: 'invoice',
    name: 'Retainer Invoice',
    description: 'Monthly retainer invoice for ongoing services',
    category: 'Retainer',
    industries: ['Business', 'Finance', 'IT', 'Legal'],
    planRequired: 'standard',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date',     required: true },
      { id: 'retainer_period',   label: 'Retainer Period',            type: 'text',     placeholder: 'e.g. June 2026' },
      { id: 'services_included', label: 'Services Included',          type: 'textarea', required: true },
      { id: 'hours_included',    label: 'Hours Included',             type: 'text',     placeholder: 'e.g. Up to 10 hours' },
      { id: 'retainer_fee',      label: 'Retainer Fee (£)',           type: 'text',     required: true },
      { id: 'vat_amount',        label: 'VAT (£)',                    type: 'text' },
      { id: 'total',             label: 'Total (£)',                  type: 'text',     required: true },
      { id: 'due_date',          label: 'Payment Due Date',           type: 'date' },
      { id: 'bank_details',      label: 'Bank Details',               type: 'textarea' },
    ],
    bodyTemplate: `**RETAINER INVOICE**

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Invoice To:** {{client_name}}
{{client_address}}

**Invoice Number:** {{invoice_number}}
**Invoice Date:** {{invoice_date}}
**Retainer Period:** {{retainer_period}}
**Due Date:** {{due_date}}

---

## Services Included

{{services_included}}

**Hours included:** {{hours_included}}

---

| | |
|---|---|
| **Retainer Fee** | £{{retainer_fee}} |
| **VAT** | £{{vat_amount}} |
| **Total Due** | **£{{total}}** |

---

**Bank Details:**
{{bank_details}}`,
  },

  // ── Non-VAT Invoice ───────────────────────────────────────────────────────
  {
    id: 'invoice-non-vat',
    builderId: 'invoice',
    name: 'Non-VAT Invoice',
    description: 'Invoice for businesses not VAT registered',
    category: 'Non-VAT Invoice',
    industries: ['Business', 'Finance', 'General'],
    popular: true,
    planRequired: 'personal',
    status: 'active',
    supportsBranding: true,
    accentColor: '#b45309',
    fields: [
      { id: 'seller_name',       label: 'Your Business Name',         type: 'text',     required: true },
      { id: 'seller_address',    label: 'Your Address',               type: 'textarea' },
      { id: 'seller_email',      label: 'Your Email',                 type: 'email' },
      { id: 'client_name',       label: 'Client Name',                type: 'text',     required: true },
      { id: 'client_address',    label: 'Client Address',             type: 'textarea' },
      { id: 'invoice_number',    label: 'Invoice Number',             type: 'text',     required: true },
      { id: 'invoice_date',      label: 'Invoice Date',               type: 'date',     required: true },
      { id: 'due_date',          label: 'Payment Due Date',           type: 'date' },
      { id: 'line_items',        label: 'Line Items',                 type: 'textarea', required: true, placeholder: 'Description | Qty | Unit Price | Total' },
      { id: 'subtotal',          label: 'Subtotal (£)',               type: 'text',     required: true },
      { id: 'total',             label: 'Total (£)',                  type: 'text',     required: true },
      { id: 'bank_details',      label: 'Bank Details',               type: 'textarea' },
      { id: 'notes',             label: 'Notes',                      type: 'textarea', defaultValue: 'VAT is not applicable as we are not VAT registered.' },
    ],
    bodyTemplate: `**INVOICE**

**{{seller_name}}**
{{seller_address}}
{{seller_email}}

---

**Invoice To:** {{client_name}}
{{client_address}}

**Invoice Number:** {{invoice_number}}
**Date:** {{invoice_date}}
**Due Date:** {{due_date}}

---

## Items

{{line_items}}

---

| | |
|---|---|
| **Subtotal** | £{{subtotal}} |
| **Total** | **£{{total}}** |

*{{notes}}*

---

**Bank Details:**
{{bank_details}}`,
  },
];
