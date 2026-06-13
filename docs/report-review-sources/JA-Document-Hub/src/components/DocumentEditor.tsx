/**
 * DocumentEditor — Full rich-text document editor with layout switcher,
 * branding panel, section management, and live preview.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  LayoutTemplate, Palette, Type, AlignLeft, Trash2,
  ChevronUp, ChevronDown, Eye, EyeOff, Copy, GripVertical,
  Bold, Underline, List, ListOrdered, Table2,
  Minus, RotateCcw, Check, X,
} from 'lucide-react';
import { LAYOUTS, type LayoutId, type BrandingConfig, renderDocument } from '@/lib/document-layouts';
import type { SavedDocument } from '@/lib/document-types';
import { formatDocDate } from '@/lib/doc-ref';
import '@/styles/pdf-document.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'signature' | 'notice' | 'divider' | 'parties';
  title?: string;
  content: string;
  hidden?: boolean;
}

export interface DocumentEditorState {
  title: string;
  layout: LayoutId;
  branding: BrandingConfig;
  sections: ContentSection[];
  docRef: string;
  version: string;
  status: string;
}

interface DocumentEditorProps {
  doc: SavedDocument;
  onSave: (state: DocumentEditorState) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

// ── HTML → Sections parser ────────────────────────────────────────────────────
function parseHtmlToSections(html: string): ContentSection[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div');
  if (!root) return [];

  const sections: ContentSection[] = [];
  let id = 0;
  const nextId = () => `sec-${++id}`;

  // Walk top-level children of the article/body
  const children = Array.from(root.querySelectorAll('.pdf-section, .pdf-parties, .pdf-notice, .pdf-signatures, .pdf-divider, hr'));

  if (children.length === 0) {
    // Fallback: treat entire body as one editable paragraph
    const text = root.innerHTML.replace(/<article[^>]*>|<\/article>/gi, '').trim();
    if (text) {
      sections.push({ id: nextId(), type: 'paragraph', content: text });
    }
    return sections;
  }

  children.forEach((el) => {
    if (el.classList.contains('pdf-section')) {
      const h3 = el.querySelector('h3');
      const title = h3?.textContent?.trim() ?? '';
      h3?.remove();
      sections.push({ id: nextId(), type: 'heading', title, content: el.innerHTML.trim() });
    } else if (el.classList.contains('pdf-parties')) {
      sections.push({ id: nextId(), type: 'parties', content: el.outerHTML });
    } else if (el.classList.contains('pdf-notice')) {
      sections.push({ id: nextId(), type: 'notice', content: el.innerHTML.replace(/<p[^>]*>|<\/p>/gi, '').trim() });
    } else if (el.classList.contains('pdf-signatures')) {
      sections.push({ id: nextId(), type: 'signature', content: el.outerHTML });
    } else if (el.classList.contains('pdf-divider') || el.tagName === 'HR') {
      sections.push({ id: nextId(), type: 'divider', content: '' });
    }
  });

  return sections.length > 0 ? sections : [{ id: nextId(), type: 'paragraph', content: root.innerHTML }];
}

// ── Sections → HTML builder ───────────────────────────────────────────────────
function sectionsToHtml(sections: ContentSection[]): string {
  return sections
    .filter(s => !s.hidden)
    .map(s => {
      switch (s.type) {
        case 'heading':
          return `<section class="pdf-section"><h3>${s.title ?? ''}</h3>${s.content}</section>`;
        case 'paragraph':
          return `<section class="pdf-section">${s.content}</section>`;
        case 'notice':
          return `<div class="pdf-notice"><p>${s.content}</p></div>`;
        case 'divider':
          return `<hr class="pdf-divider" />`;
        case 'parties':
        case 'signature':
          return s.content;
        case 'table':
          return `<section class="pdf-section">${s.title ? `<h3>${s.title}</h3>` : ''}${s.content}</section>`;
        case 'list':
          return `<section class="pdf-section">${s.title ? `<h3>${s.title}</h3>` : ''}${s.content}</section>`;
        default:
          return s.content;
      }
    })
    .join('\n');
}

// ── Colour swatch ─────────────────────────────────────────────────────────────
const PRESET_COLOURS = [
  '#1B4F8A', '#1e1b8a', '#7c3aed', '#059669', '#dc2626',
  '#ea580c', '#b45309', '#0891b2', '#374151', '#1a1a2e',
];

function ColourPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#1B4F8A'}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-border cursor-pointer"
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

// ── Section editor ────────────────────────────────────────────────────────────
function SectionEditor({
  section, index, total,
  onChange, onDelete, onMove, onDuplicate, onToggleHide,
}: {
  section: ContentSection;
  index: number;
  total: number;
  onChange: (s: ContentSection) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  onToggleHide: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const typeLabel: Record<ContentSection['type'], string> = {
    heading: 'Section', paragraph: 'Content', table: 'Table', list: 'List',
    signature: 'Signatures', notice: 'Notice', divider: 'Divider', parties: 'Parties',
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${section.hidden ? 'opacity-50' : ''}`}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex-1 text-left">
          <span className="text-xs font-medium text-foreground truncate">
            {section.title || section.type === 'divider' ? '— Divider —' : typeLabel[section.type]}
            {section.title ? `: ${section.title}` : ''}
          </span>
        </button>
        <Badge variant="outline" className="text-[10px] shrink-0">{typeLabel[section.type]}</Badge>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => onMove('up')} disabled={index === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30" title="Move up">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onMove('down')} disabled={index === total - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30" title="Move down">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button type="button" onClick={onToggleHide} className="p-1 rounded hover:bg-muted" title={section.hidden ? 'Show' : 'Hide'}>
            {section.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button type="button" onClick={onDuplicate} className="p-1 rounded hover:bg-muted" title="Duplicate">
            <Copy className="w-3 h-3" />
          </button>
          <button type="button" onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-red-500" title="Delete">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Section body */}
      {expanded && section.type !== 'divider' && (
        <div className="p-3 space-y-2">
          {(section.type === 'heading' || section.type === 'table' || section.type === 'list') && (
            <div>
              <Label className="text-xs text-muted-foreground">Section Title</Label>
              <Input
                value={section.title ?? ''}
                onChange={e => onChange({ ...section, title: e.target.value })}
                placeholder="Section heading…"
                className="h-8 text-sm mt-1"
              />
            </div>
          )}
          {section.type !== 'signature' && section.type !== 'parties' && (
            <div>
              <Label className="text-xs text-muted-foreground">Content (HTML)</Label>
              <Textarea
                value={section.content}
                onChange={e => onChange({ ...section, content: e.target.value })}
                rows={section.type === 'notice' ? 3 : 6}
                className="text-xs font-mono mt-1 resize-y"
                placeholder="Enter HTML content…"
              />
            </div>
          )}
          {(section.type === 'signature' || section.type === 'parties') && (
            <div>
              <Label className="text-xs text-muted-foreground">Raw HTML</Label>
              <Textarea
                value={section.content}
                onChange={e => onChange({ ...section, content: e.target.value })}
                rows={8}
                className="text-xs font-mono mt-1 resize-y"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DocumentEditor({ doc, onSave, onCancel, readOnly }: DocumentEditorProps) {
  const [title, setTitle] = useState(doc.title);
  const [layout, setLayout] = useState<LayoutId>('corporate');
  const [branding, setBranding] = useState<BrandingConfig>({
    orgName: '',
    tagline: '',
    primaryColour: '#1B4F8A',
    accentColour: '#1e1b8a',
    fontFamily: 'serif',
    showLogo: false,
    showOrgName: true,
    footerText: '',
  });
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'branding'>('content');
  const [isDirty, setIsDirty] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse doc content into sections on mount
  useEffect(() => {
    const parsed = parseHtmlToSections(doc.content ?? '');
    setSections(parsed.length > 0 ? parsed : [{
      id: 'sec-1', type: 'paragraph', content: doc.content ?? '',
    }]);
    setTitle(doc.title);

    // Try to restore saved layout/branding from fields
    const fields = doc.fields as Record<string, unknown> | undefined;
    if (fields?._layout) setLayout(fields._layout as LayoutId);
    if (fields?._branding) {
      try { setBranding(JSON.parse(fields._branding as string)); } catch { /* ignore */ }
    }
  }, [doc]);

  // Rebuild preview whenever state changes
  const rebuildPreview = useCallback(() => {
    const body = sectionsToHtml(sections);
    const html = renderDocument({
      layout,
      title,
      docRef: doc.docRef ?? 'DOC-001',
      date: formatDocDate(),
      version: '1.0',
      status: doc.status ?? 'Draft',
      body,
      branding,
      flags: {},
    });
    setPreviewHtml(html);
  }, [layout, title, sections, branding, doc]);

  useEffect(() => { rebuildPreview(); }, [rebuildPreview]);

  function markDirty() { setIsDirty(true); }

  function updateSection(index: number, updated: ContentSection) {
    setSections(prev => prev.map((s, i) => i === index ? updated : s));
    markDirty();
  }

  function deleteSection(index: number) {
    setSections(prev => prev.filter((_, i) => i !== index));
    markDirty();
  }

  function moveSection(index: number, dir: 'up' | 'down') {
    setSections(prev => {
      const arr = [...prev];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
    markDirty();
  }

  function duplicateSection(index: number) {
    setSections(prev => {
      const arr = [...prev];
      const copy = { ...arr[index], id: `sec-${Date.now()}` };
      arr.splice(index + 1, 0, copy);
      return arr;
    });
    markDirty();
  }

  function toggleHideSection(index: number) {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, hidden: !s.hidden } : s));
    markDirty();
  }

  function addSection(type: ContentSection['type']) {
    const newSec: ContentSection = {
      id: `sec-${Date.now()}`,
      type,
      title: type === 'heading' ? 'New Section' : undefined,
      content: type === 'paragraph' ? '<p>Enter your content here.</p>'
        : type === 'notice' ? 'Important notice text here.'
        : type === 'table' ? `<table class="pdf-table"><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Value</td><td>Value</td></tr></tbody></table>`
        : type === 'list' ? '<ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>'
        : type === 'signature' ? `<section class="pdf-signatures"><h3>Signatures</h3><div class="pdf-sig-grid"><div class="signature-box"><p class="sig-label">Authorised Signatory</p><div class="signature-line"></div><p class="sig-field">Name: <span>&nbsp;</span></p><p class="sig-field">Date: <span>&nbsp;</span></p></div></div></section>`
        : type === 'parties' ? `<div class="pdf-parties"><div class="pdf-party-block"><h4>Party 1</h4><p>Name:</p><p>Address:</p></div><div class="pdf-party-block"><h4>Party 2</h4><p>Name:</p><p>Address:</p></div></div>`
        : '',
    };
    setSections(prev => [...prev, newSec]);
    markDirty();
  }

  function handleSave() {
    const state: DocumentEditorState = {
      title,
      layout,
      branding,
      sections,
      docRef: doc.docRef ?? 'DOC-001',
      version: '1.0',
      status: doc.status ?? 'draft',
    };
    onSave(state);
    setIsDirty(false);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel: editor controls ── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-border bg-background overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Document Editor</h3>
            {isDirty && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">Unsaved</Badge>}
          </div>
          <Input
            value={title}
            onChange={e => { setTitle(e.target.value); markDirty(); }}
            placeholder="Document title…"
            className="h-8 text-sm"
            disabled={readOnly}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 shrink-0 grid grid-cols-3">
            <TabsTrigger value="content" className="text-xs gap-1"><AlignLeft className="w-3 h-3" />Content</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs gap-1"><LayoutTemplate className="w-3 h-3" />Layout</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs gap-1"><Palette className="w-3 h-3" />Branding</TabsTrigger>
          </TabsList>

          {/* ── Content tab ── */}
          <TabsContent value="content" className="flex-1 overflow-hidden flex flex-col mt-0">
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={index}
                    total={sections.length}
                    onChange={updated => updateSection(index, updated)}
                    onDelete={() => deleteSection(index)}
                    onMove={dir => moveSection(index, dir)}
                    onDuplicate={() => duplicateSection(index)}
                    onToggleHide={() => toggleHideSection(index)}
                  />
                ))}
              </div>

              {/* Add section */}
              {!readOnly && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Add Section</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      ['heading', 'Section', AlignLeft],
                      ['paragraph', 'Paragraph', Type],
                      ['table', 'Table', Table2],
                      ['list', 'List', List],
                      ['notice', 'Notice', Bold],
                      ['divider', 'Divider', Minus],
                      ['signature', 'Signatures', Underline],
                      ['parties', 'Parties', ListOrdered],
                    ] as [ContentSection['type'], string, React.ElementType][]).map(([type, label, Icon]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addSection(type)}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors text-left"
                      >
                        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ── Layout tab ── */}
          <TabsContent value="layout" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-4 py-3">
              <p className="text-xs text-muted-foreground mb-3">Choose a document style. Switch at any time — your content is preserved.</p>
              <div className="space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => { setLayout(l.id); markDirty(); }}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      layout === l.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded shrink-0 ${l.preview}`} />
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
                    onChange={e => { setBranding(b => ({ ...b, orgName: e.target.value })); markDirty(); }}
                    placeholder="Your Organisation Name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tagline / Subtitle</Label>
                  <Input
                    value={branding.tagline ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, tagline: e.target.value })); markDirty(); }}
                    placeholder="e.g. Professional Services"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Logo URL (optional)</Label>
                  <Input
                    value={branding.logoUrl ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, logoUrl: e.target.value })); markDirty(); }}
                    placeholder="https://… or /assets/logo.png"
                    className="h-8 text-sm"
                  />
                </div>
                <ColourPicker
                  label="Primary Colour"
                  value={branding.primaryColour ?? '#1B4F8A'}
                  onChange={v => { setBranding(b => ({ ...b, primaryColour: v })); markDirty(); }}
                />
                <ColourPicker
                  label="Accent Colour"
                  value={branding.accentColour ?? '#1e1b8a'}
                  onChange={v => { setBranding(b => ({ ...b, accentColour: v })); markDirty(); }}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Font Style</Label>
                  <Select
                    value={branding.fontFamily ?? 'serif'}
                    onValueChange={v => { setBranding(b => ({ ...b, fontFamily: v as BrandingConfig['fontFamily'] })); markDirty(); }}
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
                  <Label className="text-xs text-muted-foreground">Footer Text</Label>
                  <Input
                    value={branding.footerText ?? ''}
                    onChange={e => { setBranding(b => ({ ...b, footerText: e.target.value })); markDirty(); }}
                    placeholder="e.g. Confidential — Internal Use Only"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branding.showOrgName !== false}
                      onChange={e => { setBranding(b => ({ ...b, showOrgName: e.target.checked })); markDirty(); }}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Show organisation name</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => {
                    setBranding({
                      orgName: '', tagline: '', logoUrl: '', primaryColour: '#1B4F8A',
                      accentColour: '#1e1b8a', fontFamily: 'serif', showLogo: false,
                      showOrgName: true, footerText: '',
                    });
                    markDirty();
                  }}
                >
                  <RotateCcw className="w-3 h-3" /> Reset Branding
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer actions */}
        {!readOnly && (
          <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 gap-1.5 text-xs">
                <X className="w-3 h-3" /> Cancel
              </Button>
            )}
            <Button size="sm" onClick={handleSave} className="flex-1 gap-1.5 text-xs">
              <Check className="w-3 h-3" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* ── Right panel: live preview ── */}
      <div className="flex-1 overflow-auto bg-[#e8eaed]">
        <div className="pdf-workspace" ref={previewRef}>
          <div
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
