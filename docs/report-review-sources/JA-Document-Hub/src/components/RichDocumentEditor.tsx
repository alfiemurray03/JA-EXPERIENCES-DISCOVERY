/**
 * RichDocumentEditor
 * ──────────────────
 * A DOCX-style inline document editor. Users click directly into the A4 page
 * and edit content in-place. A floating toolbar appears on selection.
 *
 * Architecture:
 *  - The document is rendered as a live HTML string inside a contentEditable
 *    container (the A4 page div).
 *  - On every input/blur the HTML is captured and saved back to state.
 *  - A floating toolbar handles bold/italic/underline/lists/alignment.
 *  - A sidebar panel handles layout, branding, header flags, and block insertion.
 */

import {
  useState, useEffect, useRef, useCallback,
  type RefObject,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Table2, Image, Type,
  LayoutTemplate, Palette, Settings2, Plus,
  Check, RotateCcw, FileText, Heading1,
  Quote, Code, SeparatorHorizontal, Link2, Strikethrough,
  Highlighter, Baseline,
} from 'lucide-react';
import {
  renderDocument, LAYOUTS, DEFAULT_LAYOUT,
  type LayoutId, type BrandingConfig, type HeaderFlags,
} from '@/lib/document-layouts';
import { formatDocDate } from '@/lib/doc-ref';
import type { SavedDocument } from '@/lib/document-types';
import LogoUploader from '@/components/LogoUploader';
import '@/styles/pdf-document.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EditorState {
  title: string;
  layout: LayoutId;
  branding: BrandingConfig;
  flags: HeaderFlags;
  bodyHtml: string;
  docRef?: string;
  version?: string;
  status?: string;
}

interface RichDocumentEditorProps {
  doc: SavedDocument;
  onSave: (state: EditorState) => void;
  readOnly?: boolean;
}

// ── Colour presets ─────────────────────────────────────────────────────────────

const PRESET_COLOURS = [
  '#1B4F8A', '#1e1b8a', '#7c3aed', '#059669', '#dc2626',
  '#ea580c', '#b45309', '#0891b2', '#374151', '#1a1a2e',
];

// ── Block snippets users can insert ───────────────────────────────────────────

const BLOCK_SNIPPETS: Array<{
  id: string;
  label: string;
  icon: React.ElementType;
  html: string;
}> = [
  {
    id: 'heading',
    label: 'Section Heading',
    icon: Heading1,
    html: `<section class="pdf-section"><h3>Section Title</h3><p>Enter your content here.</p></section>`,
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    icon: Type,
    html: `<p>Enter your paragraph text here.</p>`,
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    icon: List,
    html: `<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>`,
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    icon: ListOrdered,
    html: `<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>`,
  },
  {
    id: 'table-2col',
    label: 'Info Table (2 col)',
    icon: Table2,
    html: `<table class="pdf-info-table"><tbody>
      <tr><td>Label</td><td>Value</td></tr>
      <tr><td>Label</td><td>Value</td></tr>
      <tr><td>Label</td><td>Value</td></tr>
    </tbody></table>`,
  },
  {
    id: 'table-data',
    label: 'Data Table',
    icon: Table2,
    html: `<table class="pdf-table"><thead><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr></thead>
    <tbody>
      <tr><td>Value</td><td>Value</td><td>Value</td></tr>
      <tr><td>Value</td><td>Value</td><td>Value</td></tr>
    </tbody></table>`,
  },
  {
    id: 'notice',
    label: 'Notice / Alert',
    icon: Quote,
    html: `<div class="pdf-notice"><p>Important notice text here.</p></div>`,
  },
  {
    id: 'divider',
    label: 'Divider',
    icon: SeparatorHorizontal,
    html: `<hr class="pdf-divider" />`,
  },
  {
    id: 'signature',
    label: 'Signature Block',
    icon: FileText,
    html: `<section class="pdf-signatures">
      <h3>Signatures</h3>
      <div class="pdf-sig-grid">
        <div class="signature-box">
          <p class="sig-label">Authorised Signatory</p>
          <div class="signature-line"></div>
          <p class="sig-field">Name: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
          <p class="sig-field">Date: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
        </div>
        <div class="signature-box">
          <p class="sig-label">Witness / Countersignatory</p>
          <div class="signature-line"></div>
          <p class="sig-field">Name: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
          <p class="sig-field">Date: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
        </div>
      </div>
    </section>`,
  },
  {
    id: 'parties',
    label: 'Parties Block',
    icon: FileText,
    html: `<div class="pdf-parties">
      <div class="pdf-party-block">
        <h4>Party 1</h4>
        <p>Name: </p>
        <p>Address: </p>
        <p>Company No.: </p>
      </div>
      <div class="pdf-party-block">
        <h4>Party 2</h4>
        <p>Name: </p>
        <p>Address: </p>
        <p>Company No.: </p>
      </div>
    </div>`,
  },
  {
    id: 'image',
    label: 'Image Placeholder',
    icon: Image,
    html: `<div style="border:2px dashed #d1d5db;border-radius:6px;padding:24px;text-align:center;color:#9ca3af;font-size:9pt;font-family:Arial,sans-serif;margin:12px 0;">
      [Image — replace src with your image URL]<br/>
      <img src="" alt="Image" style="max-width:100%;height:auto;display:block;margin:8px auto;" />
    </div>`,
  },
  {
    id: 'code',
    label: 'Code Block',
    icon: Code,
    html: `<pre style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:12px;font-family:'Courier New',monospace;font-size:8.5pt;color:#1f2937;overflow-x:auto;white-space:pre-wrap;">// Enter code here</pre>`,
  },
];

// ── Floating toolbar ───────────────────────────────────────────────────────────

interface FloatingToolbarProps {
  editorRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
  position: { top: number; left: number };
}

const FONT_SIZES = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '24pt', '32pt'];
const TEXT_COLOURS = ['#1a1a1a', '#1B4F8A', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#b45309', '#6b7280', '#ffffff'];
const HIGHLIGHT_COLOURS = ['#fef9c3', '#dcfce7', '#dbeafe', '#fce7f3', '#ede9fe', '#ffedd5', '#f1f5f9'];

function FloatingToolbar({ editorRef, visible, position }: FloatingToolbarProps) {
  const [showColour, setShowColour] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }

  function insertLink() {
    if (!linkUrl.trim() || linkUrl === 'https://') return;
    exec('createLink', linkUrl.trim());
    setShowLink(false);
    setLinkUrl('https://');
  }

  function insertTable() {
    const html = `<table class="pdf-table" style="width:100%;border-collapse:collapse;margin:12px 0;">
      <thead><tr>
        <th style="background:#1B4F8A;color:white;padding:7px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9pt;">Column 1</th>
        <th style="background:#1B4F8A;color:white;padding:7px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9pt;">Column 2</th>
        <th style="background:#1B4F8A;color:white;padding:7px 10px;text-align:left;font-family:Arial,sans-serif;font-size:9pt;">Column 3</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td></tr>
        <tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">Value</td></tr>
      </tbody>
    </table>`;
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl pointer-events-auto"
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
      onMouseDown={e => e.preventDefault()}
    >
      {/* Main toolbar row */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 flex-wrap max-w-[520px]">
        {/* Format */}
        <button type="button" onClick={() => exec('bold')}           className="p-1.5 rounded hover:bg-muted" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('italic')}         className="p-1.5 rounded hover:bg-muted" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('underline')}      className="p-1.5 rounded hover:bg-muted" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('strikeThrough')}  className="p-1.5 rounded hover:bg-muted" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Headings */}
        <button type="button" onClick={() => exec('formatBlock', 'h2')} className="p-1.5 rounded hover:bg-muted text-[10px] font-bold" title="Heading 2">H2</button>
        <button type="button" onClick={() => exec('formatBlock', 'h3')} className="p-1.5 rounded hover:bg-muted text-[10px] font-bold" title="Heading 3">H3</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')}  className="p-1.5 rounded hover:bg-muted" title="Paragraph"><Type className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowFontSize(s => !s); setShowColour(false); setShowHighlight(false); setShowLink(false); }}
            className="p-1.5 rounded hover:bg-muted text-[10px] font-medium flex items-center gap-0.5"
            title="Font size"
          >
            <span>Aa</span>
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-1 grid grid-cols-2 gap-0.5 z-10 min-w-[100px]">
              {FONT_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => { exec('fontSize', '7'); /* workaround — use inline style */ document.execCommand('styleWithCSS', false, 'true'); exec('fontSize', sz); setShowFontSize(false); }}
                  className="px-2 py-1 text-[10px] rounded hover:bg-muted text-left"
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text colour */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowColour(s => !s); setShowHighlight(false); setShowFontSize(false); setShowLink(false); }}
            className="p-1.5 rounded hover:bg-muted"
            title="Text colour"
          >
            <Baseline className="w-3.5 h-3.5" />
          </button>
          {showColour && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 flex flex-wrap gap-1 z-10 w-[120px]">
              {TEXT_COLOURS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { exec('foreColor', c); setShowColour(false); }}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowHighlight(s => !s); setShowColour(false); setShowFontSize(false); setShowLink(false); }}
            className="p-1.5 rounded hover:bg-muted"
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          {showHighlight && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 flex flex-wrap gap-1 z-10 w-[120px]">
              <button
                type="button"
                onClick={() => { exec('hiliteColor', 'transparent'); setShowHighlight(false); }}
                className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center text-[8px] text-muted-foreground"
                title="Remove highlight"
              >✕</button>
              {HIGHLIGHT_COLOURS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { exec('hiliteColor', c); setShowHighlight(false); }}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Alignment */}
        <button type="button" onClick={() => exec('justifyLeft')}    className="p-1.5 rounded hover:bg-muted" title="Align left"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('justifyCenter')}  className="p-1.5 rounded hover:bg-muted" title="Align centre"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('justifyRight')}   className="p-1.5 rounded hover:bg-muted" title="Align right"><AlignRight className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Lists */}
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:bg-muted" title="Bullet list"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec('insertOrderedList')}   className="p-1.5 rounded hover:bg-muted" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Indent */}
        <button type="button" onClick={() => exec('indent')}   className="p-1.5 rounded hover:bg-muted text-[10px]" title="Indent">→</button>
        <button type="button" onClick={() => exec('outdent')}  className="p-1.5 rounded hover:bg-muted text-[10px]" title="Outdent">←</button>
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Link */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowLink(s => !s); setShowColour(false); setShowHighlight(false); setShowFontSize(false); }}
            className="p-1.5 rounded hover:bg-muted"
            title="Insert link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          {showLink && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 z-10 flex gap-1.5 min-w-[220px]">
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertLink()}
                placeholder="https://…"
                className="flex-1 h-7 text-xs border border-border rounded px-2 bg-background text-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={insertLink}
                className="h-7 px-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Insert
              </button>
            </div>
          )}
        </div>

        {/* Unlink */}
        <button type="button" onClick={() => exec('unlink')} className="p-1.5 rounded hover:bg-muted text-[10px]" title="Remove link">🔗✕</button>

        {/* Insert table */}
        <button type="button" onClick={insertTable} className="p-1.5 rounded hover:bg-muted" title="Insert table"><Table2 className="w-3.5 h-3.5" /></button>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Remove formatting */}
        <button type="button" onClick={() => exec('removeFormat')} className="p-1.5 rounded hover:bg-muted" title="Clear formatting"><RotateCcw className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ── Colour picker ──────────────────────────────────────────────────────────────

function ColourPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#1B4F8A'}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-border cursor-pointer shrink-0"
        />
        <Input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#1B4F8A"
          className="h-8 text-xs font-mono flex-1"
        />
      </div>
      <div className="flex gap-1 flex-wrap">
        {PRESET_COLOURS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main editor ────────────────────────────────────────────────────────────────

export default function RichDocumentEditor({ doc, onSave, readOnly }: RichDocumentEditorProps) {
  // Restore saved state from doc.fields
  const savedFields = doc.fields as Record<string, unknown> | undefined;
  const savedLayout   = (savedFields?._layout   as LayoutId | undefined) ?? DEFAULT_LAYOUT;
  const savedBranding = (() => {
    try { return JSON.parse(savedFields?._branding as string ?? '{}') as BrandingConfig; }
    catch { return {} as BrandingConfig; }
  })();
  const savedFlags = (() => {
    try { return JSON.parse(savedFields?._flags as string ?? '{}') as HeaderFlags; }
    catch { return {} as HeaderFlags; }
  })();

  const [title,    setTitle]    = useState(doc.title);
  const [layout,   setLayout]   = useState<LayoutId>(savedLayout);
  const [branding, setBranding] = useState<BrandingConfig>({
    orgName: '', tagline: '', logoUrl: '',
    primaryColour: '#1B4F8A', accentColour: '#1e1b8a',
    fontFamily: 'serif', showLogo: true, showOrgName: true, footerText: '',
    ...savedBranding,
  });
  const [flags, setFlags] = useState<HeaderFlags>({
    showRef: false, showDate: false, showVersion: false,
    showStatus: false, showDisclaimer: false,
    ...savedFlags,
  });

  // The editable body HTML (everything inside the article, excluding the
  // layout-rendered header/footer/title — just the user content sections)
  const [bodyHtml, setBodyHtml] = useState<string>(() => {
    // Try to extract body from existing content
    const raw = doc.content ?? doc.generatedContent ?? '';
    if (!raw) return '<p>Start typing your document content here…</p>';
    // Strip the outer article wrapper and extract inner body
    const parser = new DOMParser();
    const parsed = parser.parseFromString(raw, 'text/html');
    const article = parsed.querySelector('article.pdf-page');
    if (!article) return raw;
    // Remove header, title section, footer, disclaimer
    article.querySelectorAll('header, .pdf-title, footer, .pdf-footer, .pdf-disclaimer').forEach(el => el.remove());
    return article.innerHTML.trim() || '<p>Start typing your document content here…</p>';
  });

  // The full rendered preview (layout wrapper + body)
  const [previewHtml, setPreviewHtml] = useState('');

  // Editing mode: 'preview' = read-only rendered view, 'edit' = contentEditable
  const [mode, setMode] = useState<'preview' | 'edit'>('edit');

  // Floating toolbar
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  const editorRef = useRef<HTMLDivElement>(null);
  const isDirty = useRef(false);

  // Rebuild preview whenever state changes
  const rebuildPreview = useCallback(() => {
    const html = renderDocument({
      layout,
      title,
      docRef:  doc.docRef  ?? 'DOC-001',
      date:    formatDocDate(),
      version: String(doc.version ?? '1.0'),
      status:  String(doc.status  ?? 'Draft'),
      body:    bodyHtml,
      branding,
      flags,
    });
    setPreviewHtml(html);
  }, [layout, title, bodyHtml, branding, flags, doc]);

  useEffect(() => { rebuildPreview(); }, [rebuildPreview]);

  // Sync contentEditable → bodyHtml on input
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
      isDirty.current = true;
    }
  }, []);

  // Show/hide floating toolbar on selection
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setToolbarVisible(false);
      return;
    }
    // Only show if selection is inside our editor
    const range = sel.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false);
      return;
    }
    const rect = range.getBoundingClientRect();
    setToolbarPos({
      top:  rect.top  + window.scrollY - 44,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setToolbarVisible(true);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Insert a block snippet at cursor position
  function insertBlock(html: string) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.collapse(false);
      const frag = range.createContextualFragment(html);
      range.insertNode(frag);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.innerHTML += html;
    }
    handleEditorInput();
  }

  function handleSave() {
    const state: EditorState = {
      title, layout, branding, flags, bodyHtml,
      docRef:  doc.docRef  ?? 'DOC-001',
      version: String(doc.version ?? '1.0'),
      status:  String(doc.status  ?? 'draft'),
    };
    onSave(state);
    isDirty.current = false;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-background overflow-hidden">
        {/* Title */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Document Editor</h3>
            {isDirty.current && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">Unsaved</Badge>}
          </div>
          <Input
            value={title}
            onChange={e => { setTitle(e.target.value); isDirty.current = true; }}
            placeholder="Document title…"
            className="h-8 text-sm"
            disabled={readOnly}
          />
        </div>

        {/* Mode toggle */}
        <div className="px-4 py-2 border-b border-border shrink-0 flex gap-1.5">
          <Button
            size="sm"
            variant={mode === 'edit' ? 'default' : 'outline'}
            className="flex-1 text-xs h-7 gap-1"
            onClick={() => setMode('edit')}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant={mode === 'preview' ? 'default' : 'outline'}
            className="flex-1 text-xs h-7 gap-1"
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="insert" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 shrink-0 grid grid-cols-3">
            <TabsTrigger value="insert"   className="text-xs gap-1"><Plus className="w-3 h-3" />Insert</TabsTrigger>
            <TabsTrigger value="layout"   className="text-xs gap-1"><LayoutTemplate className="w-3 h-3" />Layout</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs gap-1"><Palette className="w-3 h-3" />Brand</TabsTrigger>
          </TabsList>

          {/* ── Insert tab ── */}
          <TabsContent value="insert" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-4 py-3">
              <p className="text-xs text-muted-foreground mb-3">
                Click a block to insert it at the cursor position in the document.
              </p>
              <div className="space-y-1.5">
                {BLOCK_SNIPPETS.map(b => {
                  const Icon = b.icon;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => insertBlock(b.html)}
                      disabled={readOnly || mode === 'preview'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted hover:border-primary/40 transition-colors text-left disabled:opacity-40"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{b.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Formatting tips */}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium mb-2">Editing Tips</p>
                <ul className="space-y-1 text-[10px] text-muted-foreground">
                  <li>• Select text to show the formatting toolbar</li>
                  <li>• Click any text in the document to edit it directly</li>
                  <li>• Press Enter to create a new paragraph</li>
                  <li>• Tab / Shift+Tab to indent / outdent lists</li>
                  <li>• Use the toolbar for bold, italic, headings, lists</li>
                </ul>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Layout tab ── */}
          <TabsContent value="layout" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-4 py-3">
              <p className="text-xs text-muted-foreground mb-3">
                Switch layout at any time — your content is preserved.
              </p>
              <div className="space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => { setLayout(l.id); isDirty.current = true; }}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      layout === l.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded shrink-0 ${l.preview}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        {l.name}
                        {layout === l.id && <Check className="w-3 h-3 text-primary" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{l.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Header field toggles */}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" /> Header Fields
                </p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  All fields are hidden by default. Enable only what you need.
                </p>
                <div className="space-y-2.5">
                  {([
                    ['showRef',        'Reference Number'],
                    ['showDate',       'Date'],
                    ['showVersion',    'Version'],
                    ['showStatus',     'Status Badge'],
                    ['showDisclaimer', 'Legal Disclaimer'],
                  ] as [keyof HeaderFlags, string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-xs text-foreground cursor-pointer">{label}</Label>
                      <Switch
                        checked={flags[key] === true}
                        onCheckedChange={v => { setFlags(f => ({ ...f, [key]: v })); isDirty.current = true; }}
                        disabled={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Branding tab ── */}
          <TabsContent value="branding" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-4 py-3">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Organisation / Company Name</Label>
                  <Input
                    value={branding.orgName ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, orgName: e.target.value })); isDirty.current = true; }}
                    placeholder="Leave blank to hide"
                    className="h-8 text-sm"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tagline (optional)</Label>
                  <Input
                    value={branding.tagline ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, tagline: e.target.value })); isDirty.current = true; }}
                    placeholder="e.g. Professional Services"
                    className="h-8 text-sm"
                    disabled={readOnly}
                  />
                </div>
                <LogoUploader
                  value={branding.logoUrl ?? ''}
                  onChange={url => { setBranding(b => ({ ...b, logoUrl: url })); isDirty.current = true; }}
                  disabled={readOnly}
                />
                <ColourPicker
                  label="Primary Colour"
                  value={branding.primaryColour ?? '#1B4F8A'}
                  onChange={v => { setBranding(b => ({ ...b, primaryColour: v })); isDirty.current = true; }}
                />
                <ColourPicker
                  label="Accent Colour"
                  value={branding.accentColour ?? '#1e1b8a'}
                  onChange={v => { setBranding(b => ({ ...b, accentColour: v })); isDirty.current = true; }}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Font Style</Label>
                  <Select
                    value={branding.fontFamily ?? 'serif'}
                    onValueChange={v => { setBranding(b => ({ ...b, fontFamily: v as BrandingConfig['fontFamily'] })); isDirty.current = true; }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Traditional)</SelectItem>
                      <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                      <SelectItem value="mono">Monospace (Technical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Footer Text (optional)</Label>
                  <Input
                    value={branding.footerText ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, footerText: e.target.value })); isDirty.current = true; }}
                    placeholder="e.g. Confidential — Internal Use Only"
                    className="h-8 text-sm"
                    disabled={readOnly}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branding.showOrgName !== false}
                      onChange={e => { setBranding(b => ({ ...b, showOrgName: e.target.checked })); isDirty.current = true; }}
                      className="rounded"
                      disabled={readOnly}
                    />
                    <span className="text-xs text-muted-foreground">Show organisation name</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  disabled={readOnly}
                  onClick={() => {
                    setBranding({
                      orgName: '', tagline: '', logoUrl: '',
                      primaryColour: '#1B4F8A', accentColour: '#1e1b8a',
                      fontFamily: 'serif', showLogo: true, showOrgName: true, footerText: '',
                    });
                    isDirty.current = true;
                  }}
                >
                  <RotateCcw className="w-3 h-3" /> Reset Branding
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        {!readOnly && (
          <div className="px-4 py-3 border-t border-border shrink-0">
            <Button size="sm" onClick={handleSave} className="w-full gap-1.5 text-xs">
              <Check className="w-3 h-3" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* ── Document canvas ── */}
      <div className="flex-1 overflow-auto bg-[#e8eaed] relative">
        {/* Floating toolbar */}
        <FloatingToolbar
          editorRef={editorRef}
          visible={toolbarVisible && mode === 'edit'}
          position={toolbarPos}
        />

        <div className="pdf-workspace">
          {mode === 'edit' ? (
            /* ── Editable mode: render layout shell, make body editable ── */
            (() => {
              // Build the full HTML, then split out the body portion for editing
              const fullHtml = renderDocument({
                layout, title,
                docRef:  doc.docRef  ?? 'DOC-001',
                date:    formatDocDate(),
                version: String(doc.version ?? '1.0'),
                status:  String(doc.status  ?? 'Draft'),
                body:    '<!--BODY_PLACEHOLDER-->',
                branding, flags,
              });

              const [before, after] = fullHtml.split('<!--BODY_PLACEHOLDER-->');

              return (
                <article className="pdf-page" style={{ position: 'relative' }}>
                  {/* Static header/title/footer rendered via dangerouslySetInnerHTML */}
                  <div dangerouslySetInnerHTML={{ __html: before.replace('<article class="pdf-page">', '').replace(/style="[^"]*"/, '') }} />

                  {/* Editable body */}
                  <div
                    ref={editorRef}
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    onBlur={handleEditorInput}
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    className="outline-none min-h-[200px] focus:ring-1 focus:ring-primary/30 rounded"
                    style={{ cursor: readOnly ? 'default' : 'text' }}
                    data-placeholder="Click here to start editing…"
                  />

                  {/* Static footer */}
                  <div dangerouslySetInnerHTML={{ __html: after.replace('</article>', '') }} />
                </article>
              );
            })()
          ) : (
            /* ── Preview mode: full rendered HTML, not editable ── */
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          )}
        </div>
      </div>
    </div>
  );
}
