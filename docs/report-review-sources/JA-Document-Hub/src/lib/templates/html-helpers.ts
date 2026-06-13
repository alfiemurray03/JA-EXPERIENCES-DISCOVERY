/**
 * HTML building helpers for PDF document templates.
 * All templates output structured HTML consumed by the A4 preview renderer.
 *
 * Design principles:
 *  - Every helper returns a self-contained HTML string.
 *  - Empty / undefined values are silently skipped.
 *  - No platform branding is injected here.
 */

// ── Core block helpers ─────────────────────────────────────────────────────────

/** Wrap content in a labelled section block */
export function section(title: string, content: string): string {
  if (!content?.trim()) return '';
  return `<section class="pdf-section"><h3>${title}</h3>${content}</section>`;
}

/** Two-column key/value info table — skips rows where value is empty */
export function infoTable(rows: Array<[string, string | undefined | null]>): string {
  const filtered = rows.filter(([, v]) => v && String(v).trim());
  if (!filtered.length) return '';
  return `<table class="pdf-info-table"><tbody>${filtered.map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
}

/** Full data table with header row */
export function dataTable(headers: string[], rows: string[][]): string {
  if (!rows.length) return '';
  return `<table class="pdf-table">
    <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

/** Two-column parties block */
export function parties(
  left:  { title: string; lines: string[] },
  right: { title: string; lines: string[] },
): string {
  const block = (b: { title: string; lines: string[] }) =>
    `<div class="pdf-party-block"><h4>${esc(b.title)}</h4>${
      b.lines.filter(Boolean).map((l) => `<p>${l}</p>`).join('')
    }</div>`;
  return `<div class="pdf-parties">${block(left)}${block(right)}</div>`;
}

/** Numbered clause */
export function clause(num: string, text: string): string {
  return `<div class="pdf-clause"><span class="pdf-clause-num">${esc(num)}</span><span class="pdf-clause-text">${text}</span></div>`;
}

/** Highlighted notice / alert box */
export function notice(text: string, variant: 'info' | 'warning' | 'success' = 'info'): string {
  if (!text?.trim()) return '';
  const colours: Record<string, string> = {
    info:    'background:#eff6ff;border-color:#bfdbfe;color:#1e40af;',
    warning: 'background:#fffbeb;border-color:#fde68a;color:#92400e;',
    success: 'background:#f0fdf4;border-color:#bbf7d0;color:#166534;',
  };
  return `<div class="pdf-notice" style="${colours[variant] ?? colours.info}border:1px solid;border-radius:4px;padding:10px 14px;margin:12px 0;font-size:9pt;"><p>${text}</p></div>`;
}

/** Horizontal rule divider */
export function divider(): string {
  return `<hr class="pdf-divider" />`;
}

/** Paragraph — skips empty strings */
export function p(text: string | undefined | null): string {
  if (!text?.trim()) return '';
  return `<p>${text}</p>`;
}

/** Convert newlines to <br> tags */
export function nl2br(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

/** Return val if non-empty, else fallback */
export function or(val: string | undefined | null, fallback: string): string {
  return val?.trim() || fallback;
}

/** Escape HTML special characters */
export function esc(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Composite helpers ──────────────────────────────────────────────────────────

/** Checklist / tick-box list */
export function checklist(items: string[]): string {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return '';
  return `<ul class="pdf-checklist">${filtered.map(i =>
    `<li><span class="pdf-checkbox">☐</span> ${i}</li>`
  ).join('')}</ul>`;
}

/** Signature block for N signatories */
export function signatureBlock(signatories: Array<{ label: string; name?: string }>): string {
  if (!signatories.length) return '';
  const isSingle = signatories.length === 1;
  return `<section class="pdf-signatures">
    <h3>Signatures</h3>
    <div class="pdf-sig-grid${isSingle ? ' single' : ''}">
      ${signatories.map(s => `
        <div class="signature-box">
          <p class="sig-label">${esc(s.label)}</p>
          ${s.name ? `<p style="font-size:9pt;color:#374151;margin:0 0 4px 0;">${esc(s.name)}</p>` : ''}
          <div class="signature-line"></div>
          <p class="sig-field">Signature: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
          <p class="sig-field">Name: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
          <p class="sig-field">Date: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
        </div>`).join('')}
    </div>
  </section>`;
}

/** Address block — formats multi-line address cleanly */
export function addressBlock(lines: string[]): string {
  const filtered = lines.filter(Boolean);
  if (!filtered.length) return '';
  return filtered.map(l => `<p style="margin:0 0 2px 0;font-size:9.5pt;">${l}</p>`).join('');
}

/** Inline badge — e.g. status, category */
export function badge(text: string, colour = '#1B4F8A'): string {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${colour}20;color:${colour};border:1px solid ${colour}40;font-size:8pt;font-weight:600;font-family:Arial,sans-serif;">${esc(text)}</span>`;
}

/** Format a date string nicely — returns fallback if empty */
export function fmtDate(val: string | undefined | null, fallback = '[Date]'): string {
  if (!val?.trim()) return fallback;
  try {
    return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return val;
  }
}

/** Format currency — e.g. fmtCurrency('1500', '£') → '£1,500.00' */
export function fmtCurrency(val: string | undefined | null, symbol = '£'): string {
  if (!val?.trim()) return '';
  const num = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return val;
  return `${symbol}${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Ordered list */
export function ol(items: string[]): string {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return '';
  return `<ol>${filtered.map(i => `<li>${i}</li>`).join('')}</ol>`;
}

/** Unordered list */
export function ul(items: string[]): string {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return '';
  return `<ul>${filtered.map(i => `<li>${i}</li>`).join('')}</ul>`;
}
