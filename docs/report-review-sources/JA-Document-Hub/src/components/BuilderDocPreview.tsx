/**
 * BuilderDocPreview — Multi-layout A4 document preview renderer.
 * Each layout produces a visually distinct document appropriate for its type.
 * Used by all 10 builders via GenericBuilder.
 */
import type { BuilderTemplate, BuilderLayoutId } from '@/lib/builder-framework';
import { renderTemplate, fmtDate, BUILDER_DEFAULT_LAYOUT } from '@/lib/builder-framework';
import type { BrandingState } from '@/components/GenericBuilder';

interface Props {
  fields: Record<string, string>;
  template: BuilderTemplate;
  branding: BrandingState;
  /** Override layout — if omitted, uses template.defaultLayout or builder default */
  layoutId?: BuilderLayoutId;
  /** Override document type label */
  docTypeLabel?: string;
}

export default function BuilderDocPreview({ fields, template, branding, layoutId, docTypeLabel }: Props) {
  const resolvedLayout: BuilderLayoutId =
    layoutId ?? template.defaultLayout ?? BUILDER_DEFAULT_LAYOUT[template.builderId] ?? 'letter';

  const color = branding.color || template.accentColor || '#1B4F8A';
  const orgName = branding.orgName || fields.org_name || fields.company_name || '';
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const body = renderTemplate(template.bodyTemplate, fields);
  const docTitle = docTypeLabel || template.name;

  const ctx: RenderCtx = { fields, template, branding, color, orgName, today, body, docTitle };

  switch (resolvedLayout) {
    case 'modern-letter':  return <ModernLetterLayout ctx={ctx} />;
    case 'email':          return <EmailLayout ctx={ctx} />;
    case 'invoice':        return <InvoiceLayout ctx={ctx} />;
    case 'quote':          return <QuoteLayout ctx={ctx} />;
    case 'contract':       return <ContractLayout ctx={ctx} />;
    case 'policy':         return <PolicyLayout ctx={ctx} />;
    case 'report':         return <ReportLayout ctx={ctx} />;
    case 'minutes':        return <MinutesLayout ctx={ctx} />;
    case 'resolution':     return <ResolutionLayout ctx={ctx} />;
    case 'form':           return <FormLayout ctx={ctx} />;
    case 'checklist':      return <ChecklistLayout ctx={ctx} />;
    case 'proposal':       return <ProposalLayout ctx={ctx} />;
    case 'certificate':    return <CertificateLayout ctx={ctx} />;
    default:               return <FormalLetterLayout ctx={ctx} />;
  }
}

// ── Shared context passed to every layout ─────────────────────────────────────

interface RenderCtx {
  fields: Record<string, string>;
  template: BuilderTemplate;
  branding: BrandingState;
  color: string;
  orgName: string;
  today: string;
  body: string;
  docTitle: string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const A4: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  color: '#1a1a1a',
  fontFamily: "'Arial', Helvetica, sans-serif",
  fontSize: '10pt',
  lineHeight: '1.6',
  position: 'relative',
};

function BrandingLogo({ ctx, maxH = '12mm', maxW = '50mm' }: { ctx: RenderCtx; maxH?: string; maxW?: string }) {
  if (ctx.branding.logoUrl) {
    return <img src={ctx.branding.logoUrl} alt="Logo" style={{ maxHeight: maxH, maxWidth: maxW, objectFit: 'contain', display: 'block' }} />;
  }
  return null;
}

function DocFooter({ ctx }: { ctx: RenderCtx }) {
  // Only show footer if org name is set — never show the auto-generated date
  if (!ctx.orgName) return null;
  return (
    <div style={{ position: 'absolute', bottom: '8mm', left: '16mm', right: '16mm', borderTop: '1px solid #e5e7eb', paddingTop: '2.5mm', display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#aaa' }}>
      <span>{ctx.orgName}</span>
    </div>
  );
}

function SignatureBlock({ ctx }: { ctx: RenderCtx }) {
  const { fields } = ctx;
  if (!fields.signatory_name && !fields.signed_by) return null;
  return (
    <div style={{ marginTop: '10mm', borderTop: '1px solid #e5e7eb', paddingTop: '5mm' }}>
      <div style={{ display: 'flex', gap: '18mm', flexWrap: 'wrap' }}>
        <SigBox name={fields.signatory_name || fields.signed_by} title={fields.signatory_title} date={fields.signatory_date} color={ctx.color} />
        {fields.witness_name && <SigBox name={fields.witness_name} title="Witness" color={ctx.color} />}
      </div>
    </div>
  );
}

function SigBox({ name, title, date, color }: { name?: string; title?: string; date?: string; color: string }) {
  return (
    <div>
      <div style={{ borderBottom: `1px solid ${color}`, width: '58mm', marginBottom: '2mm' }}>&nbsp;</div>
      <div style={{ fontSize: '8.5pt', color: '#555' }}>
        {name && <div style={{ fontWeight: 700 }}>{name}</div>}
        {title && <div>{title}</div>}
        {date && <div>Date: {fmtDate(date)}</div>}
      </div>
    </div>
  );
}

// ── Body formatter (markdown-lite → HTML) ─────────────────────────────────────

function BodyHtml({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{ fontSize: '10pt', lineHeight: '1.7', color: '#1a1a1a' }}
      dangerouslySetInnerHTML={{ __html: formatBody(text, color) }}
    />
  );
}

function formatBody(text: string, accentColor: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let inList = false;
  let inOl = false;

  function closeList() {
    if (inList) { out.push('</ul>'); inList = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('# ')) {
      closeList();
      out.push(`<h1 style="font-size:13pt;font-weight:800;color:${accentColor};margin:5mm 0 2.5mm">${esc(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      out.push(`<h2 style="font-size:11pt;font-weight:700;color:${accentColor};margin:4mm 0 2mm;border-bottom:1px solid #e5e7eb;padding-bottom:1mm">${esc(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3 style="font-size:10pt;font-weight:700;color:#374151;margin:3mm 0 1.5mm">${esc(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inList) { out.push('<ul style="margin:2mm 0 2mm 5mm;padding:0;list-style:disc">'); inList = true; }
      out.push(`<li style="margin-bottom:1mm">${inline(line.slice(2))}</li>`);
      continue;
    }
    const olMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (!inOl) { out.push('<ol style="margin:2mm 0 2mm 5mm;padding:0;list-style:decimal">'); inOl = true; }
      out.push(`<li style="margin-bottom:1mm">${inline(olMatch[2])}</li>`);
      continue;
    }
    if (line.trim() === '') { closeList(); out.push('<br>'); continue; }
    if (line.trim() === '---') { closeList(); out.push(`<hr style="border:none;border-top:1px solid #e5e7eb;margin:3mm 0">`); continue; }
    closeList();
    out.push(`<p style="margin:0 0 2mm">${inline(line)}</p>`);
  }
  closeList();
  return out.join('');
}

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f3f4f6;padding:0 2px;border-radius:2px;font-size:9pt">$1</code>');
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. Formal Letter (Modern) ─────────────────────────────────────────────────

function FormalLetterLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body } = ctx;
  const senderAddr = [fields.sender_address, fields.sender_city, fields.sender_postcode].filter(Boolean).join(', ');
  const recipientAddr = [fields.recipient_address, fields.recipient_city, fields.recipient_postcode].filter(Boolean).join(', ');
  const letterDate = fmtDate(fields.date || fields.letter_date || '') || today;

  return (
    <div style={{ ...A4, padding: '0 0 24mm', fontFamily: "'Arial', Helvetica, sans-serif" }}>
      {/* Modern header bar */}
      <div style={{ background: color, padding: '10mm 18mm 8mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
        <div>
          <BrandingLogo ctx={ctx} maxH="10mm" />
          {orgName && <div style={{ color: '#fff', fontSize: '13pt', fontWeight: 800, marginTop: ctx.branding.logoUrl ? '2mm' : '0' }}>{orgName}</div>}
          {senderAddr && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt', marginTop: '1mm' }}>{senderAddr}</div>}
          {fields.sender_email && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt' }}>{fields.sender_email}</div>}
          {fields.sender_phone && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt' }}>{fields.sender_phone}</div>}
        </div>
        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.9)', fontSize: '9pt' }}>
          <div style={{ fontWeight: 600 }}>{letterDate}</div>
          {fields.reference && <div style={{ marginTop: '1mm', fontSize: '8.5pt' }}>Ref: {fields.reference}</div>}
        </div>
      </div>

      <div style={{ padding: '0 18mm' }}>
        {/* Recipient block */}
        {(fields.recipient_name || fields.recipient_company || recipientAddr) && (
          <div style={{ marginBottom: '6mm', padding: '4mm 5mm', background: '#f8f9fa', borderLeft: `3px solid ${color}`, borderRadius: '0 4px 4px 0' }}>
            {fields.recipient_name && <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{fields.recipient_name}</div>}
            {fields.recipient_company && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.recipient_company}</div>}
            {recipientAddr && <div style={{ fontSize: '9.5pt', color: '#555' }}>{recipientAddr}</div>}
          </div>
        )}

        {/* Subject */}
        {fields.subject && (
          <div style={{ marginBottom: '5mm', fontSize: '11pt', fontWeight: 700, color }}>{fields.subject}</div>
        )}

        {/* Salutation */}
        <div style={{ marginBottom: '4mm', fontSize: '10pt' }}>
          {fields.salutation || (fields.recipient_name ? `Dear ${fields.recipient_name},` : 'Dear Sir/Madam,')}
        </div>

        {/* Body */}
        <BodyHtml text={body} color={color} />

        {/* Closing */}
        <div style={{ marginTop: '8mm', fontSize: '10pt' }}>
          <div>{fields.closing || 'Yours sincerely,'}</div>
          <div style={{ marginTop: '12mm', borderBottom: `2px solid ${color}`, width: '55mm' }}>&nbsp;</div>
          <div style={{ marginTop: '2mm', fontWeight: 700 }}>{fields.signatory_name || orgName}</div>
          {fields.signatory_title && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.signatory_title}</div>}
        </div>
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 2. Modern Letter ──────────────────────────────────────────────────────────

function ModernLetterLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body } = ctx;
  const letterDate = fmtDate(fields.date || fields.letter_date || '') || today;

  return (
    <div style={{ ...A4, padding: '0 0 24mm' }}>
      {/* Coloured header bar */}
      <div style={{ background: color, padding: '10mm 18mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8mm' }}>
        <div>
          <BrandingLogo ctx={ctx} maxH="10mm" />
          {orgName && <div style={{ color: '#fff', fontSize: '13pt', fontWeight: 800, marginTop: ctx.branding.logoUrl ? '2mm' : '0' }}>{orgName}</div>}
        </div>
        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.85)', fontSize: '9pt' }}>
          <div>{letterDate}</div>
          {fields.reference && <div>Ref: {fields.reference}</div>}
        </div>
      </div>

      <div style={{ padding: '0 18mm' }}>
        {/* Recipient */}
        {(fields.recipient_name || fields.recipient_company) && (
          <div style={{ marginBottom: '6mm', padding: '4mm 5mm', background: '#f8f9fa', borderLeft: `3px solid ${color}`, borderRadius: '0 4px 4px 0' }}>
            {fields.recipient_name && <div style={{ fontWeight: 700 }}>{fields.recipient_name}</div>}
            {fields.recipient_company && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.recipient_company}</div>}
            {fields.recipient_address && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.recipient_address}</div>}
          </div>
        )}

        {/* Subject */}
        {fields.subject && (
          <div style={{ marginBottom: '5mm', fontSize: '11pt', fontWeight: 700, color }}>{fields.subject}</div>
        )}

        {/* Salutation */}
        <div style={{ marginBottom: '4mm' }}>
          {fields.salutation || (fields.recipient_name ? `Dear ${fields.recipient_name},` : 'Dear Sir/Madam,')}
        </div>

        <BodyHtml text={body} color={color} />

        {/* Closing */}
        <div style={{ marginTop: '8mm' }}>
          <div>{fields.closing || 'Kind regards,'}</div>
          <div style={{ marginTop: '10mm', borderBottom: `2px solid ${color}`, width: '52mm' }}>&nbsp;</div>
          <div style={{ marginTop: '2mm', fontWeight: 700 }}>{fields.signatory_name || orgName}</div>
          {fields.signatory_title && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.signatory_title}</div>}
        </div>
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 3. Email Template ─────────────────────────────────────────────────────────

function EmailLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;

  return (
    <div style={{ ...A4, padding: '12mm 16mm 24mm', fontFamily: "'Arial', Helvetica, sans-serif" }}>
      {/* Email header */}
      <div style={{ borderBottom: `3px solid ${color}`, paddingBottom: '5mm', marginBottom: '6mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <BrandingLogo ctx={ctx} />
          {orgName && <div style={{ fontSize: '11pt', fontWeight: 700, color, marginTop: '1.5mm' }}>{orgName}</div>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#888' }}>
          <div style={{ fontWeight: 600, color, fontSize: '10pt' }}>Email Template</div>
          <div>{today}</div>
        </div>
      </div>

      {/* Email meta fields */}
      <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4mm 5mm', marginBottom: '5mm', fontSize: '9.5pt' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {fields.to_email && (
              <tr><td style={{ width: '18mm', color: '#888', paddingBottom: '1.5mm' }}>To:</td><td style={{ fontWeight: 600, paddingBottom: '1.5mm' }}>{fields.to_email}</td></tr>
            )}
            {fields.from_email && (
              <tr><td style={{ color: '#888', paddingBottom: '1.5mm' }}>From:</td><td style={{ paddingBottom: '1.5mm' }}>{fields.from_email}</td></tr>
            )}
            {fields.cc_email && (
              <tr><td style={{ color: '#888', paddingBottom: '1.5mm' }}>CC:</td><td style={{ paddingBottom: '1.5mm' }}>{fields.cc_email}</td></tr>
            )}
            <tr>
              <td style={{ color: '#888', paddingBottom: '1.5mm' }}>Subject:</td>
              <td style={{ fontWeight: 700, paddingBottom: '1.5mm' }}>{fields.subject || docTitle}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Email body */}
      <div style={{ padding: '2mm 0' }}>
        {fields.salutation && <div style={{ marginBottom: '3mm' }}>{fields.salutation}</div>}
        <BodyHtml text={body} color={color} />
        {fields.closing && <div style={{ marginTop: '5mm' }}>{fields.closing}</div>}
        {(fields.signatory_name || orgName) && (
          <div style={{ marginTop: '3mm', fontWeight: 700 }}>{fields.signatory_name || orgName}</div>
        )}
        {fields.signatory_title && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.signatory_title}</div>}
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 4. Invoice ────────────────────────────────────────────────────────────────

function InvoiceLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const invoiceDate = fmtDate(fields.invoice_date || fields.date || '') || today;
  const dueDate = fmtDate(fields.due_date || '') || '';

  return (
    <div style={{ ...A4, padding: '14mm 16mm 28mm' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
        <div>
          <BrandingLogo ctx={ctx} maxH="14mm" />
          {orgName && <div style={{ fontSize: '13pt', fontWeight: 800, color, marginTop: '2mm' }}>{orgName}</div>}
          {fields.sender_address && <div style={{ fontSize: '9pt', color: '#666', marginTop: '1mm' }}>{fields.sender_address}</div>}
          {fields.sender_email && <div style={{ fontSize: '9pt', color: '#666' }}>{fields.sender_email}</div>}
          {fields.vat_number && <div style={{ fontSize: '9pt', color: '#666' }}>VAT: {fields.vat_number}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22pt', fontWeight: 900, color, letterSpacing: '-0.5px' }}>{docTitle.toUpperCase()}</div>
          <div style={{ marginTop: '3mm', fontSize: '9pt', color: '#555' }}>
            <div><strong>Invoice No:</strong> {fields.invoice_number || fields.reference || 'INV-001'}</div>
            <div><strong>Date:</strong> {invoiceDate}</div>
            {dueDate && <div><strong>Due:</strong> {dueDate}</div>}
          </div>
        </div>
      </div>

      {/* Bill To */}
      {(fields.client_name || fields.recipient_name) && (
        <div style={{ marginBottom: '7mm', display: 'flex', gap: '10mm' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5mm' }}>Bill To</div>
            <div style={{ fontWeight: 700 }}>{fields.client_name || fields.recipient_name}</div>
            {fields.client_address && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.client_address}</div>}
            {fields.client_email && <div style={{ fontSize: '9.5pt', color: '#555' }}>{fields.client_email}</div>}
          </div>
          {fields.project_name && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5mm' }}>Project</div>
              <div>{fields.project_name}</div>
            </div>
          )}
        </div>
      )}

      {/* Line items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9.5pt' }}>
        <thead>
          <tr style={{ background: color, color: '#fff' }}>
            <th style={{ padding: '2.5mm 3mm', textAlign: 'left', fontWeight: 700 }}>Description</th>
            <th style={{ padding: '2.5mm 3mm', textAlign: 'center', fontWeight: 700, width: '18mm' }}>Qty</th>
            <th style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 700, width: '22mm' }}>Unit Price</th>
            <th style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 700, width: '22mm' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {fields.line_items ? (
            fields.line_items.split('\n').filter(Boolean).map((line, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                <td style={{ padding: '2mm 3mm', borderBottom: '1px solid #f0f0f0' }} colSpan={4}>{line}</td>
              </tr>
            ))
          ) : (
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '2mm 3mm', borderBottom: '1px solid #f0f0f0' }}>{fields.description || 'Services rendered'}</td>
              <td style={{ padding: '2mm 3mm', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>1</td>
              <td style={{ padding: '2mm 3mm', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{fields.unit_price || fields.amount || '—'}</td>
              <td style={{ padding: '2mm 3mm', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{fields.amount || '—'}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '7mm' }}>
        <table style={{ fontSize: '9.5pt', minWidth: '60mm' }}>
          <tbody>
            {fields.subtotal && <tr><td style={{ padding: '1mm 3mm', color: '#555' }}>Subtotal:</td><td style={{ padding: '1mm 3mm', textAlign: 'right' }}>{fields.subtotal}</td></tr>}
            {fields.vat_amount && <tr><td style={{ padding: '1mm 3mm', color: '#555' }}>VAT ({fields.vat_rate || '20%'}):</td><td style={{ padding: '1mm 3mm', textAlign: 'right' }}>{fields.vat_amount}</td></tr>}
            {fields.discount && <tr><td style={{ padding: '1mm 3mm', color: '#555' }}>Discount:</td><td style={{ padding: '1mm 3mm', textAlign: 'right' }}>-{fields.discount}</td></tr>}
            <tr style={{ background: color, color: '#fff' }}>
              <td style={{ padding: '2mm 3mm', fontWeight: 700 }}>Total:</td>
              <td style={{ padding: '2mm 3mm', textAlign: 'right', fontWeight: 700, fontSize: '11pt' }}>{fields.total || fields.amount || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment details + notes */}
      {(fields.bank_name || fields.account_number || fields.sort_code || fields.payment_terms) && (
        <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '5px', padding: '4mm 5mm', marginBottom: '5mm', fontSize: '9pt' }}>
          <div style={{ fontWeight: 700, color, marginBottom: '2mm', fontSize: '9.5pt' }}>Payment Details</div>
          {fields.bank_name && <div>Bank: {fields.bank_name}</div>}
          {fields.account_number && <div>Account: {fields.account_number}</div>}
          {fields.sort_code && <div>Sort Code: {fields.sort_code}</div>}
          {fields.payment_terms && <div style={{ marginTop: '1.5mm', color: '#555' }}>{fields.payment_terms}</div>}
        </div>
      )}

      {/* Body / notes */}
      {body.trim() && <BodyHtml text={body} color={color} />}

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 5. Quote / Estimate ───────────────────────────────────────────────────────

function QuoteLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const quoteDate = fmtDate(fields.date || '') || today;
  const validUntil = fmtDate(fields.valid_until || '') || '';

  return (
    <div style={{ ...A4, padding: '14mm 16mm 28mm' }}>
      {/* Header with accent stripe */}
      <div style={{ borderLeft: `5px solid ${color}`, paddingLeft: '5mm', marginBottom: '8mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <BrandingLogo ctx={ctx} />
          {orgName && <div style={{ fontSize: '13pt', fontWeight: 800, color, marginTop: '1.5mm' }}>{orgName}</div>}
          {fields.sender_address && <div style={{ fontSize: '9pt', color: '#666' }}>{fields.sender_address}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20pt', fontWeight: 900, color }}>{docTitle.toUpperCase()}</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '2mm' }}>
            <div>No: {fields.quote_number || fields.reference || 'QUO-001'}</div>
            <div>Date: {quoteDate}</div>
            {validUntil && <div style={{ color: '#e67e22', fontWeight: 600 }}>Valid until: {validUntil}</div>}
          </div>
        </div>
      </div>

      {/* Prepared for */}
      {(fields.client_name || fields.recipient_name) && (
        <div style={{ marginBottom: '6mm', padding: '3.5mm 5mm', background: '#f8f9fa', borderRadius: '5px', fontSize: '9.5pt' }}>
          <span style={{ color: '#888', marginRight: '3mm' }}>Prepared for:</span>
          <strong>{fields.client_name || fields.recipient_name}</strong>
          {fields.client_company && <span style={{ color: '#555', marginLeft: '3mm' }}>— {fields.client_company}</span>}
        </div>
      )}

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9.5pt' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${color}` }}>
            <th style={{ padding: '2mm 3mm', textAlign: 'left', color, fontWeight: 700 }}>Item / Service</th>
            <th style={{ padding: '2mm 3mm', textAlign: 'center', color, fontWeight: 700, width: '18mm' }}>Qty</th>
            <th style={{ padding: '2mm 3mm', textAlign: 'right', color, fontWeight: 700, width: '22mm' }}>Rate</th>
            <th style={{ padding: '2mm 3mm', textAlign: 'right', color, fontWeight: 700, width: '22mm' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '2.5mm 3mm', borderBottom: '1px solid #f0f0f0' }}>{fields.description || 'Services as described'}</td>
            <td style={{ padding: '2.5mm 3mm', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>1</td>
            <td style={{ padding: '2.5mm 3mm', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{fields.unit_price || fields.amount || '—'}</td>
            <td style={{ padding: '2.5mm 3mm', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{fields.amount || '—'}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 700, color }}>Total Estimate:</td>
            <td style={{ padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 800, fontSize: '11pt', color }}>{fields.total || fields.amount || '—'}</td>
          </tr>
        </tfoot>
      </table>

      {body.trim() && <BodyHtml text={body} color={color} />}
      <SignatureBlock ctx={ctx} />
      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 6. Contract / Agreement ───────────────────────────────────────────────────

function ContractLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const contractDate = fmtDate(fields.date || fields.contract_date || '') || today;

  return (
    <div style={{ ...A4, padding: '16mm 20mm 28mm', fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '8mm', borderBottom: `2px solid ${color}`, paddingBottom: '6mm' }}>
        <BrandingLogo ctx={ctx} maxH="12mm" />
        {orgName && <div style={{ fontSize: '10pt', color: '#555', marginTop: '2mm' }}>{orgName}</div>}
        <div style={{ fontSize: '16pt', fontWeight: 900, color, marginTop: '4mm', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{docTitle}</div>
        <div style={{ fontSize: '9.5pt', color: '#666', marginTop: '2mm' }}>Dated: {contractDate}</div>
        {fields.reference && <div style={{ fontSize: '9pt', color: '#888', marginTop: '1mm' }}>Ref: {fields.reference}</div>}
      </div>

      {/* Parties block */}
      {(fields.party_a_name || fields.party_b_name || fields.client_name || fields.contractor_name) && (
        <div style={{ marginBottom: '7mm', padding: '4mm 5mm', background: '#f8f9fa', border: `1px solid ${color}30`, borderRadius: '5px', fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 700, color, marginBottom: '2.5mm', fontSize: '10pt' }}>PARTIES TO THIS AGREEMENT</div>
          <div style={{ display: 'flex', gap: '8mm' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '8.5pt', color: '#888', textTransform: 'uppercase', marginBottom: '1mm' }}>Party A</div>
              <div style={{ fontWeight: 600 }}>{fields.party_a_name || fields.client_name || '—'}</div>
              {fields.party_a_address && <div style={{ color: '#555' }}>{fields.party_a_address}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '8.5pt', color: '#888', textTransform: 'uppercase', marginBottom: '1mm' }}>Party B</div>
              <div style={{ fontWeight: 600 }}>{fields.party_b_name || fields.contractor_name || '—'}</div>
              {fields.party_b_address && <div style={{ color: '#555' }}>{fields.party_b_address}</div>}
            </div>
          </div>
        </div>
      )}

      <BodyHtml text={body} color={color} />
      <SignatureBlock ctx={ctx} />
      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 7. Policy Document ────────────────────────────────────────────────────────

function PolicyLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const policyDate = fmtDate(fields.date || fields.effective_date || '') || today;
  const reviewDate = fmtDate(fields.review_date || '') || '';

  return (
    <div style={{ ...A4, padding: '0 0 28mm' }}>
      {/* Header band */}
      <div style={{ background: color, padding: '8mm 16mm', marginBottom: '7mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <BrandingLogo ctx={ctx} maxH="10mm" />
            {orgName && <div style={{ color: '#fff', fontSize: '11pt', fontWeight: 700, marginTop: ctx.branding.logoUrl ? '2mm' : '0' }}>{orgName}</div>}
          </div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.85)', fontSize: '8.5pt' }}>
            {fields.policy_number && <div style={{ fontWeight: 700, fontSize: '9pt' }}>Policy No: {fields.policy_number}</div>}
            <div>Version: {fields.version || '1.0'}</div>
            <div>Effective: {policyDate}</div>
            {reviewDate && <div>Review: {reviewDate}</div>}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '15pt', fontWeight: 900, marginTop: '4mm', letterSpacing: '-0.2px' }}>{docTitle}</div>
      </div>

      <div style={{ padding: '0 16mm' }}>
        {/* Policy meta */}
        {(fields.policy_owner || fields.approved_by || fields.department) && (
          <div style={{ marginBottom: '6mm', display: 'flex', gap: '6mm', flexWrap: 'wrap', fontSize: '9pt' }}>
            {fields.policy_owner && (
              <div style={{ padding: '2mm 4mm', background: '#f0f4ff', borderRadius: '4px' }}>
                <span style={{ color: '#888' }}>Owner: </span><strong>{fields.policy_owner}</strong>
              </div>
            )}
            {fields.approved_by && (
              <div style={{ padding: '2mm 4mm', background: '#f0f4ff', borderRadius: '4px' }}>
                <span style={{ color: '#888' }}>Approved by: </span><strong>{fields.approved_by}</strong>
              </div>
            )}
            {fields.department && (
              <div style={{ padding: '2mm 4mm', background: '#f0f4ff', borderRadius: '4px' }}>
                <span style={{ color: '#888' }}>Dept: </span><strong>{fields.department}</strong>
              </div>
            )}
          </div>
        )}

        <BodyHtml text={body} color={color} />
        <SignatureBlock ctx={ctx} />
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 8. Report ─────────────────────────────────────────────────────────────────

function ReportLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const reportDate = fmtDate(fields.date || fields.report_date || '') || today;

  return (
    <div style={{ ...A4, padding: '0 0 28mm' }}>
      {/* Header */}
      <div style={{ background: color, padding: '8mm 16mm 6mm', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <BrandingLogo ctx={ctx} maxH="10mm" />
            {orgName && <div style={{ color: '#fff', fontSize: '10pt', fontWeight: 600, marginTop: '1.5mm' }}>{orgName}</div>}
          </div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt' }}>
            <div>{reportDate}</div>
            {fields.reference && <div>Ref: {fields.reference}</div>}
            {fields.report_period && <div>Period: {fields.report_period}</div>}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '16pt', fontWeight: 900, marginTop: '4mm' }}>{docTitle}</div>
        {fields.report_type && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9.5pt', marginTop: '1mm' }}>{fields.report_type}</div>}
      </div>

      {/* Summary box */}
      {fields.summary && (
        <div style={{ margin: '0 16mm', marginTop: '6mm', padding: '4mm 5mm', background: '#f0f4ff', borderLeft: `4px solid ${color}`, borderRadius: '0 5px 5px 0', fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 700, color, marginBottom: '1.5mm', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Executive Summary</div>
          <div>{fields.summary}</div>
        </div>
      )}

      <div style={{ padding: '5mm 16mm 0' }}>
        {/* Prepared by */}
        {(fields.prepared_by || fields.author) && (
          <div style={{ marginBottom: '5mm', fontSize: '9pt', color: '#555' }}>
            Prepared by: <strong>{fields.prepared_by || fields.author}</strong>
            {fields.prepared_for && <span> &nbsp;|&nbsp; For: <strong>{fields.prepared_for}</strong></span>}
          </div>
        )}

        <BodyHtml text={body} color={color} />
        <SignatureBlock ctx={ctx} />
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 9. Meeting Minutes ────────────────────────────────────────────────────────

function MinutesLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const meetingDate = fmtDate(fields.meeting_date || fields.date || '') || today;

  return (
    <div style={{ ...A4, padding: '14mm 16mm 28mm' }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${color}`, paddingBottom: '5mm', marginBottom: '6mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <BrandingLogo ctx={ctx} />
            {orgName && <div style={{ fontSize: '12pt', fontWeight: 700, color, marginTop: '1.5mm' }}>{orgName}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#555' }}>
            <div style={{ fontSize: '14pt', fontWeight: 800, color }}>{docTitle}</div>
            <div style={{ marginTop: '1.5mm' }}>{meetingDate}</div>
            {fields.meeting_time && <div>{fields.meeting_time}</div>}
            {fields.location && <div>{fields.location}</div>}
          </div>
        </div>
      </div>

      {/* Attendees */}
      {(fields.attendees || fields.present) && (
        <div style={{ marginBottom: '5mm', padding: '3.5mm 5mm', background: '#f8f9fa', borderRadius: '5px', fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 700, color, marginBottom: '1.5mm', fontSize: '9pt', textTransform: 'uppercase' }}>Present</div>
          <div>{fields.attendees || fields.present}</div>
          {fields.apologies && (
            <div style={{ marginTop: '1.5mm', color: '#888' }}>
              <strong>Apologies:</strong> {fields.apologies}
            </div>
          )}
        </div>
      )}

      {/* Chair / Secretary */}
      {(fields.chair || fields.chairperson) && (
        <div style={{ marginBottom: '5mm', fontSize: '9.5pt', color: '#555' }}>
          <strong>Chair:</strong> {fields.chair || fields.chairperson}
          {fields.secretary && <span> &nbsp;|&nbsp; <strong>Secretary:</strong> {fields.secretary}</span>}
        </div>
      )}

      <BodyHtml text={body} color={color} />

      {/* Actions */}
      {fields.action_items && (
        <div style={{ marginTop: '6mm', padding: '4mm 5mm', background: '#fff8e1', border: '1px solid #ffd54f', borderRadius: '5px', fontSize: '9.5pt' }}>
          <div style={{ fontWeight: 700, color: '#e65100', marginBottom: '2mm', fontSize: '9pt', textTransform: 'uppercase' }}>Action Items</div>
          <div>{fields.action_items}</div>
        </div>
      )}

      {/* Next meeting */}
      {fields.next_meeting && (
        <div style={{ marginTop: '4mm', fontSize: '9.5pt', color: '#555' }}>
          <strong>Next Meeting:</strong> {fmtDate(fields.next_meeting) || fields.next_meeting}
        </div>
      )}

      <SignatureBlock ctx={ctx} />
      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 10. Resolution ────────────────────────────────────────────────────────────

function ResolutionLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const resDate = fmtDate(fields.date || fields.resolution_date || '') || today;

  return (
    <div style={{ ...A4, padding: '18mm 22mm 28mm', fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Centred title block */}
      <div style={{ textAlign: 'center', marginBottom: '10mm' }}>
        <BrandingLogo ctx={ctx} maxH="12mm" />
        {orgName && <div style={{ fontSize: '11pt', color: '#555', marginTop: '2mm' }}>{orgName}</div>}
        <div style={{ fontSize: '15pt', fontWeight: 900, color, marginTop: '5mm', textTransform: 'uppercase', letterSpacing: '1px' }}>{docTitle}</div>
        <div style={{ fontSize: '9.5pt', color: '#666', marginTop: '2mm' }}>Passed on {resDate}</div>
        {fields.resolution_number && <div style={{ fontSize: '9pt', color: '#888', marginTop: '1mm' }}>Resolution No: {fields.resolution_number}</div>}
      </div>

      <div style={{ borderTop: `2px solid ${color}`, borderBottom: `2px solid ${color}`, padding: '5mm 0', marginBottom: '7mm', textAlign: 'center', fontSize: '10pt', color: '#555' }}>
        {fields.company_name || orgName}
        {fields.company_number && ` (Company No. ${fields.company_number})`}
      </div>

      <BodyHtml text={body} color={color} />

      {/* Voting record */}
      {(fields.votes_for || fields.votes_against) && (
        <div style={{ marginTop: '6mm', padding: '3.5mm 5mm', background: '#f8f9fa', borderRadius: '5px', fontSize: '9.5pt', display: 'flex', gap: '8mm' }}>
          {fields.votes_for && <div><strong style={{ color: '#16a34a' }}>For:</strong> {fields.votes_for}</div>}
          {fields.votes_against && <div><strong style={{ color: '#dc2626' }}>Against:</strong> {fields.votes_against}</div>}
          {fields.abstentions && <div><strong style={{ color: '#888' }}>Abstentions:</strong> {fields.abstentions}</div>}
        </div>
      )}

      <SignatureBlock ctx={ctx} />
      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 11. Form ──────────────────────────────────────────────────────────────────

function FormLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;

  return (
    <div style={{ ...A4, padding: '0 0 28mm' }}>
      {/* Header */}
      <div style={{ background: color, padding: '7mm 16mm', marginBottom: '7mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <BrandingLogo ctx={ctx} maxH="10mm" />
            {orgName && <div style={{ color: '#fff', fontSize: '10pt', fontWeight: 600, marginTop: '1.5mm' }}>{orgName}</div>}
          </div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt' }}>
            {fields.form_number && <div>Form No: {fields.form_number}</div>}
            <div>{today}</div>
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '14pt', fontWeight: 800, marginTop: '3mm' }}>{docTitle}</div>
        {fields.form_description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9.5pt', marginTop: '1mm' }}>{fields.form_description}</div>}
      </div>

      <div style={{ padding: '0 16mm' }}>
        {/* Instructions */}
        {fields.instructions && (
          <div style={{ marginBottom: '5mm', padding: '3.5mm 5mm', background: '#f0f4ff', borderLeft: `3px solid ${color}`, borderRadius: '0 4px 4px 0', fontSize: '9.5pt', color: '#555' }}>
            {fields.instructions}
          </div>
        )}

        <BodyHtml text={body} color={color} />

        {/* Form fields rendered as labelled boxes */}
        <div style={{ marginTop: '5mm' }}>
          {['full_name', 'date_of_birth', 'address', 'phone', 'email', 'signature'].map(f => {
            if (!fields[f] && !['full_name', 'date_of_birth', 'signature'].includes(f)) return null;
            const label = f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return (
              <div key={f} style={{ marginBottom: '4mm' }}>
                <div style={{ fontSize: '8.5pt', fontWeight: 700, color, marginBottom: '1mm', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                <div style={{ borderBottom: '1px solid #d1d5db', minHeight: '7mm', padding: '1mm 0', fontSize: '10pt', color: fields[f] ? '#1a1a1a' : '#ccc' }}>
                  {fields[f] || '\u00A0'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Declaration */}
        {fields.declaration && (
          <div style={{ marginTop: '6mm', padding: '3.5mm 5mm', background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '9pt', color: '#555' }}>
            <strong>Declaration:</strong> {fields.declaration}
          </div>
        )}

        <SignatureBlock ctx={ctx} />
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 12. Checklist ─────────────────────────────────────────────────────────────

function ChecklistLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;

  // Parse body lines into checklist items
  const lines = body.split('\n').filter(l => l.trim());
  const items = lines.map(l => {
    const stripped = l.replace(/^[-•*]\s*/, '').replace(/^\[\s*\]\s*/, '').replace(/^##?\s*/, '');
    const isHeading = l.startsWith('## ') || l.startsWith('# ');
    return { text: stripped, isHeading };
  });

  return (
    <div style={{ ...A4, padding: '0 0 28mm' }}>
      {/* Header */}
      <div style={{ background: color, padding: '7mm 16mm', marginBottom: '6mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <BrandingLogo ctx={ctx} maxH="10mm" />
            {orgName && <div style={{ color: '#fff', fontSize: '10pt', fontWeight: 600, marginTop: '1.5mm' }}>{orgName}</div>}
          </div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontSize: '8.5pt' }}>
            <div>{today}</div>
            {fields.reference && <div>Ref: {fields.reference}</div>}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '14pt', fontWeight: 800, marginTop: '3mm' }}>{docTitle}</div>
      </div>

      <div style={{ padding: '0 16mm' }}>
        {/* Meta */}
        {(fields.completed_by || fields.department || fields.location) && (
          <div style={{ marginBottom: '5mm', display: 'flex', gap: '6mm', flexWrap: 'wrap', fontSize: '9pt' }}>
            {fields.completed_by && <div><span style={{ color: '#888' }}>Completed by: </span><strong>{fields.completed_by}</strong></div>}
            {fields.department && <div><span style={{ color: '#888' }}>Dept: </span><strong>{fields.department}</strong></div>}
            {fields.location && <div><span style={{ color: '#888' }}>Location: </span><strong>{fields.location}</strong></div>}
          </div>
        )}

        {/* Checklist items */}
        <div>
          {items.map((item, i) => (
            item.isHeading ? (
              <div key={i} style={{ fontSize: '10.5pt', fontWeight: 700, color, marginTop: '5mm', marginBottom: '2mm', borderBottom: `1px solid ${color}30`, paddingBottom: '1mm' }}>
                {item.text}
              </div>
            ) : (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '3mm', padding: '2mm 0', borderBottom: '1px solid #f3f4f6', fontSize: '9.5pt' }}>
                <div style={{ width: '4.5mm', height: '4.5mm', border: `1.5px solid ${color}`, borderRadius: '2px', flexShrink: 0, marginTop: '1mm', background: '#fff' }} />
                <div style={{ flex: 1 }}>{item.text}</div>
                <div style={{ width: '28mm', borderBottom: '1px dotted #d1d5db', marginTop: '3mm', flexShrink: 0 }} />
              </div>
            )
          ))}
        </div>

        {/* Sign-off */}
        <div style={{ marginTop: '8mm', display: 'flex', gap: '12mm' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '1mm' }}>Completed by</div>
            <div style={{ borderBottom: `1px solid ${color}`, height: '7mm' }} />
            <div style={{ fontSize: '8pt', color: '#aaa', marginTop: '1mm' }}>Signature / Name</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '1mm' }}>Date completed</div>
            <div style={{ borderBottom: `1px solid ${color}`, height: '7mm' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '1mm' }}>Verified by</div>
            <div style={{ borderBottom: `1px solid ${color}`, height: '7mm' }} />
          </div>
        </div>
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 13. Proposal ──────────────────────────────────────────────────────────────

function ProposalLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, body, docTitle } = ctx;
  const propDate = fmtDate(fields.date || '') || today;

  return (
    <div style={{ ...A4, padding: '0 0 28mm' }}>
      {/* Cover section */}
      <div style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, padding: '14mm 18mm 12mm', marginBottom: '8mm' }}>
        <BrandingLogo ctx={ctx} maxH="12mm" />
        {orgName && <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10pt', marginTop: '2mm' }}>{orgName}</div>}
        <div style={{ color: '#fff', fontSize: '20pt', fontWeight: 900, marginTop: '6mm', lineHeight: '1.2' }}>{docTitle}</div>
        {fields.subtitle && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11pt', marginTop: '2mm' }}>{fields.subtitle}</div>}
        <div style={{ marginTop: '6mm', display: 'flex', gap: '8mm', flexWrap: 'wrap' }}>
          {(fields.prepared_for || fields.client_name) && (
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9.5pt' }}>
              <div style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>Prepared for</div>
              <div style={{ fontWeight: 700 }}>{fields.prepared_for || fields.client_name}</div>
            </div>
          )}
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9.5pt' }}>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>Date</div>
            <div style={{ fontWeight: 700 }}>{propDate}</div>
          </div>
          {fields.valid_until && (
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9.5pt' }}>
              <div style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>Valid until</div>
              <div style={{ fontWeight: 700 }}>{fmtDate(fields.valid_until)}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 18mm' }}>
        {/* Executive summary */}
        {fields.executive_summary && (
          <div style={{ marginBottom: '6mm', padding: '4mm 5mm', background: '#f0f4ff', borderLeft: `4px solid ${color}`, borderRadius: '0 5px 5px 0', fontSize: '9.5pt' }}>
            <div style={{ fontWeight: 700, color, marginBottom: '1.5mm', fontSize: '9pt', textTransform: 'uppercase' }}>Executive Summary</div>
            <div>{fields.executive_summary}</div>
          </div>
        )}

        <BodyHtml text={body} color={color} />

        {/* Value / investment */}
        {(fields.investment || fields.total_value || fields.budget) && (
          <div style={{ marginTop: '6mm', padding: '4mm 5mm', background: color, borderRadius: '6px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10pt', fontWeight: 700 }}>Total Investment</div>
            <div style={{ fontSize: '16pt', fontWeight: 900 }}>{fields.investment || fields.total_value || fields.budget}</div>
          </div>
        )}

        <SignatureBlock ctx={ctx} />
      </div>

      <DocFooter ctx={ctx} />
    </div>
  );
}

// ── 14. Certificate ───────────────────────────────────────────────────────────

function CertificateLayout({ ctx }: { ctx: RenderCtx }) {
  const { fields, color, orgName, today, docTitle } = ctx;
  const certDate = fmtDate(fields.date || fields.award_date || '') || today;

  return (
    <div style={{ ...A4, padding: '12mm', display: 'flex', alignItems: 'stretch' }}>
      <div style={{ flex: 1, border: `4px double ${color}`, borderRadius: '8px', padding: '12mm 14mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
        {/* Corner decorations */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            [pos.includes('top') ? 'top' : 'bottom']: '4mm',
            [pos.includes('left') ? 'left' : 'right']: '4mm',
            width: '8mm', height: '8mm',
            border: `2px solid ${color}`,
            borderRadius: '2px',
            opacity: 0.4,
          }} />
        ))}

        <BrandingLogo ctx={ctx} maxH="14mm" />
        {orgName && <div style={{ fontSize: '11pt', color: '#555', marginTop: '2mm' }}>{orgName}</div>}

        <div style={{ fontSize: '8pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '3px', marginTop: '8mm', marginBottom: '2mm' }}>Certificate of</div>
        <div style={{ fontSize: '22pt', fontWeight: 900, color, lineHeight: '1.1' }}>{docTitle}</div>

        <div style={{ width: '40mm', height: '1px', background: `${color}60`, margin: '6mm auto' }} />

        <div style={{ fontSize: '10pt', color: '#555', marginBottom: '3mm' }}>This is to certify that</div>
        <div style={{ fontSize: '18pt', fontWeight: 800, color, fontStyle: 'italic', marginBottom: '3mm' }}>
          {fields.recipient_name || fields.full_name || '___________________________'}
        </div>

        {fields.achievement && (
          <div style={{ fontSize: '10pt', color: '#555', maxWidth: '120mm', marginBottom: '3mm' }}>{fields.achievement}</div>
        )}

        {fields.course_name && (
          <div style={{ fontSize: '11pt', fontWeight: 700, color, marginBottom: '3mm' }}>{fields.course_name}</div>
        )}

        <div style={{ fontSize: '9.5pt', color: '#888', marginTop: '4mm' }}>Awarded on {certDate}</div>

        {/* Signature line */}
        <div style={{ marginTop: '10mm', display: 'flex', gap: '16mm', justifyContent: 'center' }}>
          <div>
            <div style={{ borderBottom: `1.5px solid ${color}`, width: '50mm', marginBottom: '1.5mm' }}>&nbsp;</div>
            <div style={{ fontSize: '8.5pt', color: '#888' }}>{fields.signatory_name || 'Authorised Signatory'}</div>
            {fields.signatory_title && <div style={{ fontSize: '8pt', color: '#aaa' }}>{fields.signatory_title}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
