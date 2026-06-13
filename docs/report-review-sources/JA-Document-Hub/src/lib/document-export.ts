// Document export utilities for PDF, Word (DOCX), and HTML

export function exportAsHTML(content: string, title: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      color: #000;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: inherit;
    }
    @media print {
      body { margin: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <pre>${escapeHtml(content)}</pre>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${sanitizeFilename(title)}.html`);
}

export function exportAsPDF(content: string, title: string): void {
  // Open print dialog with formatted content
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      color: #000;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: inherit;
    }
    @media print {
      body { margin: 0; padding: 20mm; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <pre>${escapeHtml(content)}</pre>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

export function exportAsWord(content: string, title: string): void {
  // Generate a basic RTF-compatible Word document
  const rtf = generateRTF(content, title);
  const blob = new Blob([rtf], { type: 'application/rtf' });
  downloadBlob(blob, `${sanitizeFilename(title)}.rtf`);
}

function generateRTF(content: string, title: string): string {
  const escaped = content
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par\n');

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}}
{\\info{\\title ${title}}}
\\paperw12240\\paperh15840\\margl1800\\margr1800\\margt1440\\margb1440
\\f0\\fs24
${escaped}
}`;
}

export function printDocument(content: string, title: string): void {
  exportAsPDF(content, title);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '_').substring(0, 80);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
