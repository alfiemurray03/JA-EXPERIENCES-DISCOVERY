/**
 * Document reference number generator.
 * Format: JA-[CATEGORY_CODE]-[YYYYMMDD]-[4-digit random]
 */

const CATEGORY_CODES: Record<string, string> = {
  company: 'CO',
  'board-meeting': 'BM',
  director: 'DR',
  shareholder: 'SH',
  'business-letters': 'BL',
  complaints: 'CP',
  hr: 'HR',
  policies: 'PL',
  consent: 'CN',
  travel: 'TR',
  personal: 'PE',
};

export function generateDocRef(category: string): string {
  const code = CATEGORY_CODES[category] ?? 'GN';
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `JA-${code}-${date}-${rand}`;
}

export function formatDocDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}
