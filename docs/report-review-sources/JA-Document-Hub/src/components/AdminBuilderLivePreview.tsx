/**
 * AdminBuilderLivePreview
 *
 * Full-screen overlay that renders the exact customer-facing builder experience
 * inside the Admin Portal. Admins can:
 *  - Browse templates, fill fields, change branding/layout — exactly as a customer would
 *  - Open a side panel to edit the HTML/body template in real time
 *  - Save HTML edits directly to the database (builder overrides)
 *  - See the live document preview update as they type
 *
 * Used by Admin → Builder Manager when clicking "Live Preview" on any template.
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  X, Eye, Code2, Save, CheckCircle2, AlertTriangle, FileText,
  RefreshCw, Search, Layout, ChevronRight, ChevronLeft,
  Palette, Info, PenLine,
} from 'lucide-react';
import type { BuilderTemplate, BuilderId, BuilderLayoutId } from '@/lib/builder-framework';
import {
  BUILDER_LAYOUTS, BUILDER_DEFAULT_LAYOUT, todayISO,
} from '@/lib/builder-framework';
import BuilderDocPreview from '@/components/BuilderDocPreview';
import type { BrandingState } from '@/components/GenericBuilder';
import { LETTER_TEMPLATES } from '@/lib/builders/letter-templates';
import { EMAIL_BUILDER_TEMPLATES } from '@/lib/builders/email-builder-templates';
import { INVOICE_TEMPLATES } from '@/lib/builders/invoice-templates';
import { CONTRACT_TEMPLATES } from '@/lib/builders/contract-templates';
import { POLICY_TEMPLATES } from '@/lib/builders/policy-templates';
import { FORM_TEMPLATES } from '@/lib/builders/form-templates';
import { REPORT_TEMPLATES } from '@/lib/builders/report-templates';
import { MINUTES_TEMPLATES } from '@/lib/builders/minutes-templates';
import { PROPOSAL_TEMPLATES } from '@/lib/builders/proposal-templates';
import { CHECKLIST_TEMPLATES } from '@/lib/builders/checklist-templates';

// ── Static template registry ──────────────────────────────────────────────────

const STATIC_TEMPLATES: Record<BuilderId, BuilderTemplate[]> = {
  letter:    LETTER_TEMPLATES,
  email:     EMAIL_BUILDER_TEMPLATES,
  invoice:   INVOICE_TEMPLATES,
  contract:  CONTRACT_TEMPLATES,
  policy:    POLICY_TEMPLATES,
  form:      FORM_TEMPLATES,
  report:    REPORT_TEMPLATES,
  minutes:   MINUTES_TEMPLATES,
  proposal:  PROPOSAL_TEMPLATES,
  checklist: CHECKLIST_TEMPLATES,
};

const BUILDER_DOC_LABELS: Record<BuilderId, string> = {
  letter:    'LETTER',
  email:     'EMAIL',
  invoice:   'INVOICE',
  contract:  'CONTRACT',
  policy:    'POLICY',
  form:      'FORM',
  report:    'REPORT',
  minutes:   'MINUTES',
  proposal:  'PROPOSAL',
  checklist: 'CHECKLIST',
};

const PRESET_COLORS = [
  '#1B4F8A', '#1e1b8a', '#0f766e', '#7c3aed',
  '#b45309', '#dc2626', '#16a34a', '#0891b2', '#374151',
];

function sanitiseHtml(raw: string): string {
  let s = raw.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  s = s.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
  s = s.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  return s;
}

function buildDefaultFields(template: BuilderTemplate): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of template.fields) {
    if (f.type === 'section_heading') continue;
    out[f.id] = f.defaultValue ?? (f.type === 'date' ? todayISO() : '');
  }
  return out;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  builderId: BuilderId;
  /** If provided, jump straight to this template */
  initialTemplateId?: string;
  /** DB overrides already loaded by parent */
  overrides?: Record<string, Partial<BuilderTemplate>>;
  adminEmail?: string;
  onClose: () => void;
  /** Called after a successful save so parent can refresh its override list */
  onSaved?: (templateId: string, patch: Partial<BuilderTemplate>) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminBuilderLivePreview({
  builderId, initialTemplateId, overrides = {}, adminEmail = 'admin',
  onClose, onSaved,
}: Props) {
  // Merge static + overrides
  const allTemplates = (STATIC_TEMPLATES[builderId] ?? []).map(t => ({
    ...t,
    ...(overrides[t.id] ?? {}),
  }));

  // ── State ──────────────────────────────────────────────────────────────────

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<BuilderTemplate | null>(() => {
    if (initialTemplateId) return allTemplates.find(t => t.id === initialTemplateId) ?? null;
    return null;
  });
  const [fields, setFields] = useState<Record<string, string>>(() => {
    if (initialTemplateId) {
      const t = allTemplates.find(t => t.id === initialTemplateId);
      return t ? buildDefaultFields(t) : {};
    }
    return {};
  });
  const [branding, setBranding] = useState<BrandingState>({
    color: selectedTemplate?.accentColor ?? '#1B4F8A',
    logoUrl: '',
    orgName: '',
  });
  const [selectedLayout, setSelectedLayout] = useState<BuilderLayoutId>(
    selectedTemplate?.defaultLayout ?? BUILDER_DEFAULT_LAYOUT[builderId] ?? 'letter'
  );
  const [activeTab, setActiveTab] = useState<'template' | 'fields' | 'branding' | 'layout'>(
    initialTemplateId ? 'fields' : 'template'
  );

  // HTML editor panel
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlEditorTab, setHtmlEditorTab] = useState<'html' | 'preview'>('html');
  const [editingHtml, setEditingHtml] = useState('');
  const [htmlSaving, setHtmlSaving] = useState(false);
  const [htmlSaveError, setHtmlSaveError] = useState('');
  const [htmlSavedMsg, setHtmlSavedMsg] = useState('');

  // Sync HTML editor when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setEditingHtml(selectedTemplate.bodyTemplate ?? '');
    }
  }, [selectedTemplate?.id]);

  // ── Template selection ─────────────────────────────────────────────────────

  function selectTemplate(t: BuilderTemplate) {
    setSelectedTemplate(t);
    setFields(buildDefaultFields(t));
    setBranding(prev => ({ ...prev, color: t.accentColor ?? '#1B4F8A' }));
    setSelectedLayout(t.defaultLayout ?? BUILDER_DEFAULT_LAYOUT[builderId] ?? 'letter');
    setActiveTab('fields');
    setEditingHtml(t.bodyTemplate ?? '');
    setHtmlSaveError('');
    setHtmlSavedMsg('');
  }

  // ── HTML save ──────────────────────────────────────────────────────────────

  const saveHtml = useCallback(async () => {
    if (!selectedTemplate) return;
    setHtmlSaving(true);
    setHtmlSaveError('');
    try {
      const sanitised = sanitiseHtml(editingHtml);
      const res = await fetch('/api/admin/builder-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builderId,
          templateId: selectedTemplate.id,
          bodyTemplate: sanitised,
          updatedBy: adminEmail,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) {
        setHtmlSaveError(data.error ?? 'Failed to save.');
        return;
      }
      // Update local template so preview reflects the saved HTML
      setSelectedTemplate(prev => prev ? { ...prev, bodyTemplate: sanitised } : prev);
      onSaved?.(selectedTemplate.id, { bodyTemplate: sanitised });
      setHtmlSavedMsg('HTML saved to database.');
      setTimeout(() => setHtmlSavedMsg(''), 4000);
    } catch {
      setHtmlSaveError('Network error. Please try again.');
    } finally {
      setHtmlSaving(false);
    }
  }, [selectedTemplate, editingHtml, builderId, adminEmail, onSaved]);

  // ── Filtered templates ─────────────────────────────────────────────────────

  const categories = ['all', ...Array.from(new Set(allTemplates.map(t => t.category)))];
  const filtered = allTemplates.filter(t => {
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchSearch = !search
      || t.name.toLowerCase().includes(search.toLowerCase())
      || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && t.status !== 'retired';
  });

  // ── Live preview — use editingHtml if HTML editor is open ─────────────────

  const previewTemplate: BuilderTemplate | null = selectedTemplate
    ? { ...selectedTemplate, bodyTemplate: showHtmlEditor ? editingHtml : selectedTemplate.bodyTemplate }
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ── Top bar ── */}
      <div className="h-12 px-4 border-b border-border bg-card flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Admin Preview — {builderId.charAt(0).toUpperCase() + builderId.slice(1)} Builder
            </span>
            {selectedTemplate && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">{selectedTemplate.name}</Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedTemplate && (
            <Button
              variant={showHtmlEditor ? 'default' : 'outline'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setShowHtmlEditor(v => !v)}
            >
              <Code2 className="w-3.5 h-3.5" />
              {showHtmlEditor ? 'Hide HTML Editor' : 'Edit HTML'}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onClose}>
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Builder Manager
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Builder controls */}
        <div className="w-[420px] xl:w-[460px] flex flex-col border-r border-border shrink-0">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 pt-3 border-b border-border shrink-0">
              <TabsList className="h-8 w-full grid grid-cols-4">
                <TabsTrigger value="template" className="text-xs h-7">Template</TabsTrigger>
                <TabsTrigger value="fields" className="text-xs h-7" disabled={!selectedTemplate}>Fields</TabsTrigger>
                <TabsTrigger value="branding" className="text-xs h-7" disabled={!selectedTemplate}>Branding</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs h-7" disabled={!selectedTemplate}>Layout</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {/* Template picker */}
              <TabsContent value="template" className="p-4 space-y-3 mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search templates…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>
                <div className="space-y-2">
                  {filtered.map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedTemplate?.id === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: (t.accentColor ?? '#1B4F8A') + '20' }}
                      >
                        <FileText className="w-4 h-4" style={{ color: t.accentColor ?? '#1B4F8A' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{t.name}</span>
                          {t.popular && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Popular</Badge>}
                          {overrides[t.id] && <Badge className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700 border border-amber-200">Modified</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">{t.category}</Badge>
                          <Badge variant="outline" className="text-[10px] h-4 capitalize">{t.planRequired}</Badge>
                        </div>
                      </div>
                      {selectedTemplate?.id === t.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Fields */}
              <TabsContent value="fields" className="p-4 space-y-4 mt-0">
                {selectedTemplate && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Document Title</Label>
                      <Input
                        value={fields._docTitle ?? selectedTemplate.name}
                        onChange={e => setFields(prev => ({ ...prev, _docTitle: e.target.value }))}
                        className="h-8 text-sm"
                        placeholder="Document title…"
                      />
                    </div>
                    <Separator />
                    {selectedTemplate.fields.map(field => {
                      if (field.type === 'section_heading') {
                        return (
                          <div key={field.id} className="pt-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</p>
                          </div>
                        );
                      }
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <Label className="text-xs">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              value={fields[field.id] ?? ''}
                              onChange={e => setFields(prev => ({ ...prev, [field.id]: e.target.value }))}
                              placeholder={field.placeholder}
                              rows={3}
                              className="text-sm resize-none"
                            />
                          ) : field.type === 'select' ? (
                            <Select
                              value={fields[field.id] ?? ''}
                              onValueChange={v => setFields(prev => ({ ...prev, [field.id]: v }))}
                            >
                              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                              <SelectContent>
                                {(field.options ?? []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'toggle' ? (
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={fields[field.id] === 'true'}
                                onCheckedChange={v => setFields(prev => ({ ...prev, [field.id]: v ? 'true' : 'false' }))}
                              />
                              <span className="text-sm text-muted-foreground">{field.placeholder}</span>
                            </div>
                          ) : (
                            <Input
                              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                              value={fields[field.id] ?? ''}
                              onChange={e => setFields(prev => ({ ...prev, [field.id]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="h-8 text-sm"
                            />
                          )}
                          {field.helpText && <p className="text-[11px] text-muted-foreground">{field.helpText}</p>}
                        </div>
                      );
                    })}
                  </>
                )}
              </TabsContent>

              {/* Branding */}
              <TabsContent value="branding" className="p-4 space-y-4 mt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs">Organisation / Business Name</Label>
                  <Input
                    value={branding.orgName}
                    onChange={e => setBranding(prev => ({ ...prev, orgName: e.target.value }))}
                    className="h-8 text-sm"
                    placeholder="Appears in document header"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Accent Colour</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.color}
                      onChange={e => setBranding(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={branding.color}
                      onChange={e => setBranding(prev => ({ ...prev, color: e.target.value }))}
                      className="h-8 text-sm w-32 font-mono"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setBranding(prev => ({ ...prev, color: c }))}
                          className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                          style={{ background: c, borderColor: branding.color === c ? '#000' : 'transparent' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    value={branding.logoUrl}
                    onChange={e => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="h-8 text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {branding.logoUrl && (
                  <div className="border border-border rounded-lg p-3 bg-muted/20">
                    <img
                      src={branding.logoUrl}
                      alt="Logo preview"
                      className="max-h-16 max-w-48 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Layout */}
              <TabsContent value="layout" className="p-4 space-y-3 mt-0">
                <p className="text-xs text-muted-foreground">Choose how the document is structured and presented.</p>
                {(() => {
                  const suitable = BUILDER_LAYOUTS.filter(l => l.suitableFor.includes(builderId));
                  const other = BUILDER_LAYOUTS.filter(l => !l.suitableFor.includes(builderId));
                  return (
                    <div className="space-y-2">
                      {suitable.length > 0 && (
                        <>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommended</p>
                          {suitable.map(layout => (
                            <button
                              key={layout.id}
                              onClick={() => setSelectedLayout(layout.id)}
                              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedLayout === layout.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${selectedLayout === layout.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <Layout className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground">{layout.name}</div>
                                <div className="text-xs text-muted-foreground">{layout.description}</div>
                              </div>
                              {selectedLayout === layout.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                            </button>
                          ))}
                        </>
                      )}
                      {other.length > 0 && (
                        <>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-3">Other layouts</p>
                          {other.map(layout => (
                            <button
                              key={layout.id}
                              onClick={() => setSelectedLayout(layout.id)}
                              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedLayout === layout.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${selectedLayout === layout.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <Layout className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground">{layout.name}</div>
                                <div className="text-xs text-muted-foreground">{layout.description}</div>
                              </div>
                              {selectedLayout === layout.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Centre: Live document preview */}
        <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden min-w-0">
          <div className="px-4 py-2 border-b border-border bg-card flex items-center gap-2 shrink-0">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Live Preview</span>
            {previewTemplate && (
              <>
                <Badge variant="outline" className="text-[10px] h-5">{previewTemplate.name}</Badge>
                <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                  <Layout className="w-2.5 h-2.5" />
                  {BUILDER_LAYOUTS.find(l => l.id === selectedLayout)?.name ?? selectedLayout}
                </Badge>
                {showHtmlEditor && (
                  <Badge className="text-[10px] h-5 bg-amber-100 text-amber-700 border border-amber-200">
                    Previewing unsaved HTML
                  </Badge>
                )}
              </>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6 flex justify-center">
              {previewTemplate ? (
                <div className="shadow-xl rounded-sm overflow-hidden" style={{ width: '210mm' }}>
                  <BuilderDocPreview
                    fields={fields}
                    template={previewTemplate}
                    branding={branding}
                    layoutId={selectedLayout}
                    docTypeLabel={BUILDER_DOC_LABELS[builderId]}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Select a template to preview</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Choose from the Template tab on the left</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: HTML editor panel (shown when "Edit HTML" is active) */}
        {showHtmlEditor && selectedTemplate && (
          <div className="w-[420px] xl:w-[460px] flex flex-col border-l border-border shrink-0 bg-card">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">HTML Body Template</span>
              </div>
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => setShowHtmlEditor(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs: HTML / Preview */}
            <div className="px-4 pt-3 border-b border-border shrink-0">
              <Tabs value={htmlEditorTab} onValueChange={v => setHtmlEditorTab(v as typeof htmlEditorTab)}>
                <TabsList className="h-8">
                  <TabsTrigger value="html" className="text-xs gap-1.5">
                    <Code2 className="w-3 h-3" /> HTML
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs gap-1.5">
                    <Eye className="w-3 h-3" /> Rendered
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Editor body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {htmlEditorTab === 'html' ? (
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <Info className="w-3.5 h-3.5" /> Available placeholders
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-0.5 mt-1">
                      {selectedTemplate.fields.filter(f => f.type !== 'section_heading').map(f => (
                        <div key={f.id} className="flex items-center gap-2">
                          <code
                            className="text-primary font-mono cursor-pointer hover:underline"
                            onClick={() => setEditingHtml(prev => prev + `{{${f.id}}}`)}
                            title="Click to insert"
                          >
                            {`{{${f.id}}}`}
                          </code>
                          <span className="text-muted-foreground">{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Click a placeholder to insert it at the end of the editor.</p>
                  </div>
                  <Textarea
                    value={editingHtml}
                    onChange={e => setEditingHtml(e.target.value)}
                    className="flex-1 text-xs font-mono resize-none min-h-0"
                    style={{ height: 'calc(100vh - 380px)' }}
                    placeholder="<h2>{{recipient_name}}</h2><p>Dear {{recipient_name}},</p>…"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="border border-border rounded-lg bg-white text-foreground p-4 text-sm">
                      {editingHtml ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitiseHtml(editingHtml) }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-xs italic">No HTML entered yet.</p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Rendered HTML with sanitisation applied. Placeholders will be replaced with field values at document render time.
                    </p>
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Save footer */}
            <div className="px-4 py-3 border-t border-border shrink-0 space-y-2">
              {htmlSaveError && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {htmlSaveError}
                </div>
              )}
              {htmlSavedMsg && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {htmlSavedMsg}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  onClick={() => setEditingHtml(selectedTemplate.bodyTemplate ?? '')}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset to saved
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  onClick={saveHtml}
                  disabled={htmlSaving}
                >
                  {htmlSaving
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                    : <><Save className="w-3.5 h-3.5" /> Save to Database</>
                  }
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Saves immediately to the database. Changes appear in the live builder for all users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
