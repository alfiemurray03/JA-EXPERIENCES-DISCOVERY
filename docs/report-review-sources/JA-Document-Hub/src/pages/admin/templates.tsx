/**
 * Admin — Template Management
 * Full CRUD: view all code templates, create/edit/delete DB-driven templates,
 * edit metadata + fields + HTML source, live preview.
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, Star, FileText, Layers, Eye,
  BarChart2, Unlock, Edit2, Save, RefreshCw,
  Code2, Monitor, Tag, Info, Plus, Trash2, Database,
  AlertCircle, CheckCircle2, Loader2, Copy,
} from 'lucide-react';
import { ALL_TEMPLATES } from '@/lib/templates';
import type { DocumentTemplate, TemplateCategory, TemplateSection } from '@/lib/document-types';
import { adminCls, planBadgeCls } from '@/lib/admin-theme-classes';

// ── Category display names ────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'board-meeting':    'Corporate & Governance',
  'director':         'Corporate & Governance',
  'shareholder':      'Corporate & Governance',
  'company-admin':    'Company Admin',
  'company':          'Company Admin',
  'business':         'Business Documents',
  'business-letters': 'Business Letters',
  'finance':          'Finance',
  'contracts':        'Contracts & Agreements',
  'hr':               'HR & Employment',
  'policies':         'Policies & Compliance',
  'consumer':         'Consumer Documents',
  'complaints':       'Complaints',
  'charity':          'Charity & Community',
  'education':        'Education',
  'property':         'Property & Home',
  'care':             'Care & Support',
  'reports':          'Reports',
  'forms':            'Forms',
  'letters':          'Letters',
  'consent':          'Personal & General',
  'travel':           'Personal & General',
  'personal':         'Personal & General',
  'legal':            'Legal',
  'accounting':       'Finance & Accounting',
  'marketing':        'Marketing & Sales',
  'it-tech':          'IT & Technology',
  'healthcare':       'Healthcare & Medical',
  'construction':     'Construction & Trades',
  'hospitality':      'Hospitality & Events',
  'nonprofit':        'Nonprofit & Voluntary',
  'real-estate':      'Real Estate',
  'personal-finance': 'Personal Finance',
  'creative':         'Creative & Media',
  'logistics':        'Logistics & Supply Chain',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

const CATEGORY_GROUPS: Record<string, TemplateCategory[]> = {
  'Corporate & Governance': ['board-meeting', 'director', 'shareholder', 'company-admin'],
  'Business':               ['business', 'business-letters', 'finance'],
  'Contracts & Agreements': ['contracts'],
  'HR & Employment':        ['hr'],
  'Policies & Compliance':  ['policies'],
  'Consumer & Complaints':  ['consumer', 'complaints'],
  'Charity & Education':    ['charity', 'education'],
  'Property & Care':        ['property', 'care'],
  'Reports & Forms':        ['reports', 'forms'],
  'Letters & Personal':     ['letters', 'personal', 'consent', 'travel'],
  'Legal':                  ['legal'],
  'Finance & Accounting':   ['accounting', 'personal-finance'],
  'Marketing & Sales':      ['marketing'],
  'IT & Technology':        ['it-tech'],
  'Healthcare':             ['healthcare'],
  'Construction & Trades':  ['construction'],
  'Hospitality & Events':   ['hospitality'],
  'Nonprofit & Voluntary':  ['nonprofit'],
  'Real Estate':            ['real-estate'],
  'Creative & Media':       ['creative'],
  'Logistics':              ['logistics'],
};

const PLAN_STYLES: Record<string, string> = {
  free:         planBadgeCls.free,
  business:     planBadgeCls.standard,
  professional: planBadgeCls.professional,
};

const PLAN_LABELS: Record<string, string> = {
  free:         'Free',
  business:     'Standard',
  professional: 'Professional',
};

function getCategoryGroup(cat: TemplateCategory): string {
  for (const [group, cats] of Object.entries(CATEGORY_GROUPS)) {
    if ((cats as TemplateCategory[]).includes(cat)) return group;
  }
  return 'Other';
}

// ── DB template type ──────────────────────────────────────────────────────────
interface DbTemplate {
  id: number;
  uuid: string;
  templateId: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  planRequired: string;
  tags: string[];
  sections: TemplateSection[];
  generateFn: string;
  isActive: boolean;
  isCustom: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Build sample data for preview ────────────────────────────────────────────
function buildSampleData(template: DocumentTemplate | DbTemplate): Record<string, string> {
  const sections = template.sections as TemplateSection[];
  const data: Record<string, string> = {};
  for (const sec of sections) {
    for (const field of sec.fields) {
      switch (field.type) {
        case 'date':        data[field.id] = new Date().toLocaleDateString('en-GB'); break;
        case 'number':      data[field.id] = field.defaultValue ?? '1000'; break;
        case 'email':       data[field.id] = field.defaultValue ?? 'example@company.co.uk'; break;
        case 'phone':       data[field.id] = field.defaultValue ?? '01234 567890'; break;
        case 'select':
        case 'multiselect': data[field.id] = field.defaultValue ?? (field.options?.[0] ?? 'Option A'); break;
        case 'textarea':    data[field.id] = field.defaultValue ?? `[Sample ${field.label}]`; break;
        default:            data[field.id] = field.defaultValue ?? `[Sample ${field.label}]`;
      }
    }
  }
  return data;
}

function runGenerateFn(fn: string, data: Record<string, string>): string {
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('data', fn) as (d: Record<string, string>) => string;
    return f(data);
  } catch (e) {
    return `<p style="color:red;font-family:monospace;">Error in generateDocument: ${String(e)}</p>`;
  }
}

// ── Default generateFn starter ────────────────────────────────────────────────
const DEFAULT_GENERATE_FN = `// 'data' contains all field values keyed by field id.
// Return an HTML string for the document body.
// Available helpers are NOT available here — write plain HTML.
const lines = [];
lines.push('<h2>' + (data.title || 'Document Title') + '</h2>');
lines.push('<p>' + (data.body || 'Document content goes here.') + '</p>');
return lines.join('');`;

// ── Default sections starter ──────────────────────────────────────────────────
const DEFAULT_SECTIONS: TemplateSection[] = [
  {
    id: 'main',
    title: 'Document Details',
    fields: [
      { id: 'title', label: 'Title', type: 'text', required: true },
      { id: 'body',  label: 'Content', type: 'textarea', required: false },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Code Template View Modal (read-only info + preview) ───────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CodeTemplateModal({ template, onClose }: { template: DocumentTemplate | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'fields' | 'preview' | 'html'>('info');

  const fieldCount = useMemo(() => template
    ? template.sections.reduce((acc, s) => acc + s.fields.length, 0) : 0, [template]);

  const previewHtml = useMemo(() => {
    if (!template) return '';
    try { return template.generateDocument(buildSampleData(template)); }
    catch { return '<p style="color:red">Error generating preview</p>'; }
  }, [template]);

  useEffect(() => { if (template) setActiveTab('info'); }, [template?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!template) return null;

  return (
    <Dialog open={!!template} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={`max-w-4xl w-full max-h-[92vh] flex flex-col p-0 gap-0 ${adminCls.dialog}`}>
        <DialogHeader className={`px-5 pt-5 pb-3 border-b shrink-0 ${adminCls.divider}`}>
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <DialogTitle className={`text-base font-semibold leading-tight ${adminCls.text}`}>{template.name}</DialogTitle>
              <p className={`text-xs mt-0.5 font-mono ${adminCls.muted}`}>{template.id}</p>
            </div>
            <Badge variant="outline" className={`ml-auto shrink-0 text-[10px] ${adminCls.divider} ${adminCls.muted}`}>Code-defined</Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className={`mx-5 mt-3 h-8 shrink-0 ${adminCls.tabsList}`}>
            <TabsTrigger value="info"    className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Info className="w-3 h-3" />Info</TabsTrigger>
            <TabsTrigger value="fields"  className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Tag className="w-3 h-3" />Fields ({fieldCount})</TabsTrigger>
            <TabsTrigger value="preview" className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Monitor className="w-3 h-3" />Preview</TabsTrigger>
            <TabsTrigger value="html"    className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Code2 className="w-3 h-3" />HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-5 py-4 space-y-4 mt-0">
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${PLAN_STYLES[template.planRequired] ?? PLAN_STYLES.free}`}>
                {PLAN_LABELS[template.planRequired] ?? template.planRequired} plan
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${adminCls.statBg} ${adminCls.muted} ${adminCls.divider}`}>
                {CATEGORY_LABELS[template.category] ?? template.category}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${adminCls.statBg} ${adminCls.muted} ${adminCls.divider}`}>
                {template.sections.length} sections · {fieldCount} fields
              </span>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide mb-1 ${adminCls.subtle}`}>Description</p>
              <p className={`text-sm ${adminCls.muted}`}>{template.description}</p>
            </div>
            {template.tags.length > 0 && (
              <div>
                <p className={`text-[10px] uppercase tracking-wide mb-2 ${adminCls.subtle}`}>Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map(tag => (
                    <span key={tag} className={`text-[10px] px-2 py-0.5 rounded border ${adminCls.rowBg} ${adminCls.muted} ${adminCls.divider}`}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div className={`border rounded-lg p-3 text-xs ${adminCls.rowBg} ${adminCls.divider} ${adminCls.muted}`}>
              <p className={`font-medium mb-1 ${adminCls.text}`}>This is a code-defined template.</p>
              <p>To permanently modify it, edit the source file in <span className="font-mono text-blue-600 dark:text-blue-300">src/lib/templates/</span>. Use the <strong>New Template</strong> button to create a DB-driven template instead.</p>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="flex-1 overflow-y-auto px-5 py-4 mt-0">
            <div className="space-y-3">
              {template.sections.map(sec => (
                <div key={sec.id} className={`rounded-lg overflow-hidden border ${adminCls.divider}`}>
                  <div className={`px-3 py-2 border-b ${adminCls.tableHead} ${adminCls.divider}`}>
                    <p className={`text-xs font-semibold ${adminCls.text}`}>{sec.title}</p>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sec.fields.map(field => (
                      <div key={field.id} className={`rounded p-2 border ${adminCls.statBg} ${adminCls.divider}`}>
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-xs font-medium truncate ${adminCls.text}`}>{field.label}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {field.required && <span className="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/30">req</span>}
                            <span className={`text-[9px] px-1 py-0.5 rounded ${adminCls.rowBg} ${adminCls.muted}`}>{field.type}</span>
                          </div>
                        </div>
                        <p className={`text-[10px] font-mono ${adminCls.subtle}`}>{field.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className={`px-5 py-2 border-b flex items-center justify-between shrink-0 ${adminCls.divider}`}>
              <p className={`text-[10px] ${adminCls.muted}`}>Live preview with sample data</p>
              <Badge variant="outline" className={`text-[10px] ${adminCls.divider} ${adminCls.muted}`}>Sample Data</Badge>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <div className="p-8 min-h-full" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className={`px-5 py-2 border-b flex items-center justify-between shrink-0 ${adminCls.divider}`}>
              <p className={`text-[10px] ${adminCls.muted}`}>Raw HTML output</p>
              <button onClick={() => void navigator.clipboard.writeText(previewHtml)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 p-4">
              <pre className="text-[11px] text-green-300 font-mono whitespace-pre-wrap break-all leading-relaxed">{previewHtml}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── DB Template Editor Modal (full CRUD) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
interface DbEditorProps {
  template: DbTemplate | null; // null = create new
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function DbTemplateEditor({ template, open, onClose, onSaved }: DbEditorProps) {
  const isNew = !template;
  const [activeTab, setActiveTab] = useState<'info' | 'sections' | 'code' | 'preview'>('info');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [templateId, setTemplateId]     = useState('');
  const [name, setName]                 = useState('');
  const [category, setCategory]         = useState<string>('finance');
  const [description, setDescription]   = useState('');
  const [icon, setIcon]                 = useState('FileText');
  const [planRequired, setPlanRequired] = useState<'free' | 'business' | 'professional'>('free');
  const [tags, setTags]                 = useState('');
  const [sectionsJson, setSectionsJson] = useState('');
  const [generateFn, setGenerateFn]     = useState('');
  const [isActive, setIsActive]         = useState(true);
  const [sectionsError, setSectionsError] = useState('');

  // Reset on open/template change
  useEffect(() => {
    if (!open) return;
    if (template) {
      setTemplateId(template.templateId);
      setName(template.name);
      setCategory(template.category);
      setDescription(template.description);
      setIcon(template.icon);
      setPlanRequired(template.planRequired as 'free' | 'business' | 'professional');
      setTags(template.tags.join(', '));
      setSectionsJson(JSON.stringify(template.sections, null, 2));
      setGenerateFn(template.generateFn);
      setIsActive(template.isActive);
    } else {
      setTemplateId('');
      setName('');
      setCategory('finance');
      setDescription('');
      setIcon('FileText');
      setPlanRequired('free');
      setTags('');
      setSectionsJson(JSON.stringify(DEFAULT_SECTIONS, null, 2));
      setGenerateFn(DEFAULT_GENERATE_FN);
      setIsActive(true);
    }
    setError('');
    setSuccess('');
    setSectionsError('');
    setActiveTab('info');
  }, [open, template?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parse sections for preview
  const parsedSections = useMemo((): TemplateSection[] => {
    try {
      const parsed = JSON.parse(sectionsJson) as TemplateSection[];
      setSectionsError('');
      return parsed;
    } catch {
      setSectionsError('Invalid JSON — check sections format.');
      return [];
    }
  }, [sectionsJson]);

  const previewHtml = useMemo(() => {
    if (parsedSections.length === 0) return '<p style="color:#9ca3af">Fix sections JSON to see preview.</p>';
    const fakeTemplate = { sections: parsedSections } as DocumentTemplate;
    const sampleData = buildSampleData(fakeTemplate);
    return runGenerateFn(generateFn, sampleData);
  }, [parsedSections, generateFn]);

  async function handleSave() {
    setError('');
    setSuccess('');
    if (!name.trim())        { setError('Name is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (isNew && !templateId.trim()) { setError('Template ID is required.'); return; }
    if (sectionsError)       { setError('Fix sections JSON before saving.'); return; }

    setSaving(true);
    try {
      const body = {
        templateId: templateId.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
        category,
        description: description.trim(),
        icon: icon.trim() || 'FileText',
        planRequired,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        sections: parsedSections,
        generateFn,
        isActive,
        createdBy: 'admin',
      };

      const url = isNew ? '/api/admin/templates' : `/api/admin/templates/${template!.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { setError(data.error ?? 'Save failed.'); return; }
      setSuccess(isNew ? 'Template created successfully.' : 'Template updated successfully.');
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Auto-generate template ID from name
  function handleNameChange(v: string) {
    setName(v);
    if (isNew) setTemplateId(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={`max-w-5xl w-full max-h-[95vh] flex flex-col p-0 gap-0 ${adminCls.dialog}`}>
        {/* Header */}
        <DialogHeader className={`px-5 pt-5 pb-3 border-b shrink-0 ${adminCls.divider}`}>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0" />
            <div>
              <DialogTitle className={`text-base font-semibold ${adminCls.text}`}>
                {isNew ? 'Create New Template' : `Edit: ${template?.name}`}
              </DialogTitle>
              <p className={`text-xs mt-0.5 ${adminCls.muted}`}>
                {isNew ? 'DB-driven template — stored in database, immediately live' : `ID: ${template?.templateId}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Feedback */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-300 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mx-5 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 dark:bg-green-900/30 dark:border-green-700/50 rounded-lg px-3 py-2 text-xs text-green-600 dark:text-green-300 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {success}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className={`mx-5 mt-3 h-8 shrink-0 ${adminCls.tabsList}`}>
            <TabsTrigger value="info"     className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Info className="w-3 h-3" />Info</TabsTrigger>
            <TabsTrigger value="sections" className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Tag className="w-3 h-3" />Sections / Fields</TabsTrigger>
            <TabsTrigger value="code"     className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Code2 className="w-3 h-3" />HTML Generator</TabsTrigger>
            <TabsTrigger value="preview"  className={`text-xs h-6 gap-1 ${adminCls.tabsTrigger}`}><Monitor className="w-3 h-3" />Preview</TabsTrigger>
          </TabsList>

          {/* ── Info Tab ── */}
          <TabsContent value="info" className="flex-1 overflow-y-auto px-5 py-4 space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Template Name *</label>
                <Input value={name} onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Credit Note" className={`text-sm ${adminCls.input}`} />
              </div>
              <div>
                <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Template ID *</label>
                <Input value={templateId} onChange={e => setTemplateId(e.target.value)}
                  placeholder="e.g. credit-note" disabled={!isNew}
                  className={`text-sm font-mono disabled:opacity-50 ${adminCls.input}`} />
                {isNew && <p className={`text-[10px] mt-0.5 ${adminCls.subtle}`}>Auto-generated from name. Must be unique.</p>}
              </div>
            </div>

            <div>
              <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Description *</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="What does this template do?"
                className={`text-sm resize-none ${adminCls.input}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`text-sm ${adminCls.input}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`max-h-64 ${adminCls.selectContent}`}>
                    {ALL_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className={`text-xs ${adminCls.selectItem}`}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Plan Required</label>
                <Select value={planRequired} onValueChange={v => setPlanRequired(v as typeof planRequired)}>
                  <SelectTrigger className={`text-sm ${adminCls.input}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={adminCls.selectContent}>
                    <SelectItem value="free"         className={adminCls.selectItem}>Free</SelectItem>
                    <SelectItem value="business"     className={adminCls.selectItem}>Standard</SelectItem>
                    <SelectItem value="professional" className={adminCls.selectItem}>Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Icon Name</label>
                <Input value={icon} onChange={e => setIcon(e.target.value)}
                  placeholder="e.g. FileText, Receipt"
                  className={`text-sm ${adminCls.input}`} />
              </div>
            </div>

            <div>
              <label className={`text-[10px] uppercase tracking-wide block mb-1 ${adminCls.subtle}`}>Tags (comma-separated)</label>
              <Input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="e.g. invoice, billing, vat"
                className={`text-sm ${adminCls.input}`} />
            </div>

            <div className="flex items-center gap-3">
              <label className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>Active</label>
              <button
                onClick={() => setIsActive(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs ${adminCls.muted}`}>{isActive ? 'Visible to users' : 'Hidden from users'}</span>
            </div>
          </TabsContent>

          {/* ── Sections / Fields Tab ── */}
          <TabsContent value="sections" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className={`px-5 py-2 border-b shrink-0 flex items-center justify-between ${adminCls.divider}`}>
              <div>
                <p className={`text-xs font-medium ${adminCls.text}`}>Sections JSON</p>
                <p className={`text-[10px] ${adminCls.subtle}`}>Edit the sections array directly. Each section has an id, title, and fields array.</p>
              </div>
              <button
                onClick={() => setSectionsJson(JSON.stringify(DEFAULT_SECTIONS, null, 2))}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset to default
              </button>
            </div>
            {sectionsError && (
              <div className="mx-5 mt-2 flex items-center gap-2 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700/50 rounded px-3 py-1.5 text-xs text-red-600 dark:text-red-300 shrink-0">
                <AlertCircle className="w-3 h-3 shrink-0" /> {sectionsError}
              </div>
            )}
            <div className="flex-1 overflow-hidden flex gap-0">
              {/* JSON editor */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <Textarea
                  value={sectionsJson}
                  onChange={e => setSectionsJson(e.target.value)}
                  className="flex-1 bg-slate-950 border-0 text-green-300 font-mono text-[11px] resize-none rounded-none leading-relaxed p-4 focus-visible:ring-0"
                  spellCheck={false}
                />
              </div>
              {/* Live field preview */}
              <div className={`w-64 border-l overflow-y-auto p-3 shrink-0 ${adminCls.divider} ${adminCls.statBg}`}>
                <p className={`text-[10px] uppercase tracking-wide mb-2 ${adminCls.subtle}`}>Field Preview</p>
                {parsedSections.length === 0 ? (
                  <p className={`text-[10px] ${adminCls.subtle}`}>Fix JSON to see fields.</p>
                ) : parsedSections.map(sec => (
                  <div key={sec.id} className="mb-3">
                    <p className={`text-[10px] font-semibold mb-1 ${adminCls.text}`}>{sec.title}</p>
                    {sec.fields.map(f => (
                      <div key={f.id} className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] px-1 py-0.5 rounded ${adminCls.rowBg} ${adminCls.muted} shrink-0`}>{f.type}</span>
                        <span className={`text-[10px] truncate ${adminCls.muted}`}>{f.label}</span>
                        {f.required && <span className="text-[9px] text-red-500 dark:text-red-400 shrink-0">*</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Schema reference */}
            <div className={`px-5 py-2 border-t shrink-0 ${adminCls.divider} ${adminCls.statBg}`}>
              <p className={`text-[10px] font-mono ${adminCls.subtle}`}>
                Field types: <span className={adminCls.muted}>text | textarea | date | select | multiselect | number | email | phone</span>
              </p>
            </div>
          </TabsContent>

          {/* ── HTML Generator Tab ── */}
          <TabsContent value="code" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className={`px-5 py-2 border-b shrink-0 ${adminCls.divider}`}>
              <p className={`text-xs font-medium ${adminCls.text}`}>generateDocument(data) — function body</p>
              <p className={`text-[10px] ${adminCls.subtle}`}>Write the body of the function. <code className="text-blue-600 dark:text-blue-300">data</code> contains all field values. Return an HTML string.</p>
            </div>
            <Textarea
              value={generateFn}
              onChange={e => setGenerateFn(e.target.value)}
              className="flex-1 bg-slate-950 border-0 text-green-300 font-mono text-[11px] resize-none rounded-none leading-relaxed p-4 focus-visible:ring-0"
              spellCheck={false}
            />
            <div className={`px-5 py-2 border-t shrink-0 ${adminCls.divider} ${adminCls.statBg}`}>
              <p className={`text-[10px] ${adminCls.subtle}`}>
                Tip: Use <code className="text-blue-600 dark:text-blue-300">data.fieldId</code> to access field values. Build HTML strings and return them.
              </p>
            </div>
          </TabsContent>

          {/* ── Preview Tab ── */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className={`px-5 py-2 border-b flex items-center justify-between shrink-0 ${adminCls.divider}`}>
              <p className={`text-[10px] ${adminCls.muted}`}>Live preview using sample data + your generateDocument code</p>
              <Badge variant="outline" className={`text-[10px] ${adminCls.divider} ${adminCls.muted}`}>Sample Data</Badge>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <div className="p-8 min-h-full" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className={`px-5 py-3 border-t shrink-0 flex items-center justify-between gap-3 ${adminCls.divider}`}>
          <p className={`text-[10px] ${adminCls.subtle}`}>
            {isNew ? 'Template will be saved to the database and immediately available.' : 'Changes are saved to the database immediately.'}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}
              className={`text-xs h-8 ${adminCls.iconBtn}`}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}
              className="bg-green-600 hover:bg-green-500 text-white text-xs h-8 gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isNew ? 'Create Template' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Page ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminTemplates() {
  const [search, setSearch]           = useState('');
  const [planFilter, setPlanFilter]   = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'code' | 'db'>('all');
  const [tab, setTab]                 = useState('list');

  // Code template view modal
  const [viewTemplate, setViewTemplate] = useState<DocumentTemplate | null>(null);

  // DB template editor
  const [dbTemplates, setDbTemplates]   = useState<DbTemplate[]>([]);
  const [editorOpen, setEditorOpen]     = useState(false);
  const [editingDb, setEditingDb]       = useState<DbTemplate | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<DbTemplate | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const loadDbTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/templates', { credentials: 'include' });
      const data = await res.json() as { success: boolean; templates?: DbTemplate[] };
      if (data.success) setDbTemplates(data.templates ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void loadDbTemplates(); }, [loadDbTemplates]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/templates/${deleteTarget.id}`, {
        method: 'DELETE', credentials: 'include',
      });
      await loadDbTemplates();
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  }

  const stats = useMemo(() => ({
    total:        ALL_TEMPLATES.length + dbTemplates.length,
    code:         ALL_TEMPLATES.length,
    db:           dbTemplates.length,
    free:         ALL_TEMPLATES.filter(t => t.planRequired === 'free').length + dbTemplates.filter(t => t.planRequired === 'free').length,
    standard:     ALL_TEMPLATES.filter(t => t.planRequired === 'business').length + dbTemplates.filter(t => t.planRequired === 'business').length,
    professional: ALL_TEMPLATES.filter(t => t.planRequired === 'professional').length + dbTemplates.filter(t => t.planRequired === 'professional').length,
  }), [dbTemplates]);

  // Merge code + DB templates for display
  const allForDisplay = useMemo(() => {
    const code = ALL_TEMPLATES.map(t => ({ ...t, _source: 'code' as const }));
    const db   = dbTemplates.map(t => ({ ...t, _source: 'db' as const, planRequired: t.planRequired as string }));
    return [...code, ...db];
  }, [dbTemplates]);

  const filtered = useMemo(() => {
    let list = allForDisplay;
    if (sourceFilter === 'code') list = list.filter(t => t._source === 'code');
    if (sourceFilter === 'db')   list = list.filter(t => t._source === 'db');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.tags as string[]).some(tag => tag.toLowerCase().includes(q)) ||
        (CATEGORY_LABELS[t.category as TemplateCategory] ?? t.category).toLowerCase().includes(q)
      );
    }
    if (planFilter !== 'all') list = list.filter(t => t.planRequired === planFilter);
    if (groupFilter !== 'all') {
      const cats = CATEGORY_GROUPS[groupFilter] as TemplateCategory[] | undefined;
      if (cats) list = list.filter(t => cats.includes(t.category as TemplateCategory));
    }
    return list;
  }, [allForDisplay, search, planFilter, groupFilter, sourceFilter]);

  const groupedView = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const g = getCategoryGroup(t.category as TemplateCategory);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(t);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Template Management — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Template Management" subtitle={`${stats.total} templates (${stats.code} code-defined · ${stats.db} DB-driven)`}>
        <div className="space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total',        value: stats.total,        color: adminCls.text,                                    icon: FileText },
              { label: 'Code-defined', value: stats.code,         color: adminCls.muted,                                   icon: Code2 },
              { label: 'DB-driven',    value: stats.db,           color: 'text-green-600 dark:text-green-400',             icon: Database },
              { label: 'Free Plan',    value: stats.free,         color: adminCls.muted,                                   icon: Unlock },
              { label: 'Professional', value: stats.professional, color: 'text-purple-600 dark:text-purple-400',           icon: Star },
            ].map((s) => (
              <Card key={s.label} className={adminCls.card}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className={`text-xs mt-0.5 ${adminCls.muted}`}>{s.label}</p>
                    </div>
                    <s.icon className={`w-5 h-5 ${s.color} opacity-60`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${adminCls.muted}`} />
              <Input
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-9 ${adminCls.input}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Source filter */}
              <div className={`flex rounded-md overflow-hidden border ${adminCls.divider}`}>
                {(['all', 'code', 'db'] as const).map(s => (
                  <button key={s} onClick={() => setSourceFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${sourceFilter === s ? 'bg-blue-600 text-white' : `${adminCls.statBg} ${adminCls.muted} hover:text-gray-900 dark:hover:text-white`}`}>
                    {s === 'all' ? 'All' : s === 'code' ? 'Code' : 'DB'}
                  </button>
                ))}
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className={`text-sm w-36 ${adminCls.input}`}>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent className={adminCls.selectContent}>
                  <SelectItem value="all"          className={adminCls.selectItem}>All Plans</SelectItem>
                  <SelectItem value="free"         className={adminCls.selectItem}>Free</SelectItem>
                  <SelectItem value="business"     className={adminCls.selectItem}>Standard</SelectItem>
                  <SelectItem value="professional" className={adminCls.selectItem}>Professional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className={`text-sm w-44 ${adminCls.input}`}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className={`max-h-64 overflow-y-auto ${adminCls.selectContent}`}>
                  <SelectItem value="all" className={adminCls.selectItem}>All Categories</SelectItem>
                  {Object.keys(CATEGORY_GROUPS).map(g => (
                    <SelectItem key={g} value={g} className={adminCls.selectItem}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className={`flex rounded-md overflow-hidden border ${adminCls.divider}`}>
                {(['list', 'grouped'] as const).map(v => (
                  <button key={v} onClick={() => setTab(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${tab === v ? 'bg-blue-600 text-white' : `${adminCls.statBg} ${adminCls.muted} hover:text-gray-900 dark:hover:text-white`}`}>
                    {v}
                  </button>
                ))}
              </div>
              {/* New template button */}
              <Button
                size="sm"
                onClick={() => { setEditingDb(null); setEditorOpen(true); }}
                className="bg-green-600 hover:bg-green-500 text-white text-xs h-8 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Template
              </Button>
            </div>
          </div>

          {/* Results count */}
          <p className={`text-xs ${adminCls.subtle}`}>
            Showing <span className={`font-medium ${adminCls.muted}`}>{filtered.length}</span> of {stats.total} templates
            {(search || planFilter !== 'all' || groupFilter !== 'all' || sourceFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setPlanFilter('all'); setGroupFilter('all'); setSourceFilter('all'); }}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                Clear filters
              </button>
            )}
          </p>

          {/* ── List View ── */}
          {tab === 'list' && (
            <Card className={`${adminCls.card} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b text-xs font-medium ${adminCls.tableHead}`}>
                      <th className="text-left px-4 py-3">Template</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3">Plan</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Source</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`px-4 py-12 text-center text-sm ${adminCls.muted}`}>
                          No templates match your filters.
                        </td>
                      </tr>
                    ) : filtered.map((t) => {
                      const isDb = t._source === 'db';
                      const dbT = isDb ? (t as unknown as DbTemplate & { _source: 'db' }) : null;
                      return (
                        <tr key={`${t._source}-${(t as unknown as Record<string,unknown>).templateId ?? (t as unknown as Record<string,unknown>).id ?? t.name}`}
                          className={`border-b transition-colors ${adminCls.divider} ${adminCls.rowHover}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isDb
                                ? <Database className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0" />
                                : <FileText className={`w-3.5 h-3.5 shrink-0 ${adminCls.muted}`} />
                              }
                              <span className={`text-xs font-medium ${adminCls.text}`}>{t.name}</span>
                              {isDb && !(dbT as unknown as DbTemplate).isActive && (
                                <span className={`text-[9px] px-1 py-0.5 rounded border ${adminCls.rowBg} ${adminCls.muted} ${adminCls.divider}`}>inactive</span>
                              )}
                            </div>
                            <p className={`text-[10px] ml-5 font-mono truncate max-w-[200px] ${adminCls.subtle}`}>
                              {isDb ? (t as unknown as DbTemplate).templateId : (t as unknown as DocumentTemplate).id}
                            </p>
                          </td>
                          <td className={`px-4 py-3 text-xs hidden md:table-cell ${adminCls.muted}`}>
                            {CATEGORY_LABELS[t.category as TemplateCategory] ?? t.category}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${PLAN_STYLES[t.planRequired] ?? PLAN_STYLES.free}`}>
                              {PLAN_LABELS[t.planRequired] ?? t.planRequired}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isDb ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/30' : `${adminCls.statBg} ${adminCls.muted} ${adminCls.divider}`}`}>
                              {isDb ? 'DB' : 'Code'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isDb ? (
                                <>
                                  <Button variant="ghost" size="sm"
                                    className="h-7 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 text-xs gap-1"
                                    onClick={() => { setEditingDb(dbT as unknown as DbTemplate); setEditorOpen(true); }}>
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                  </Button>
                                  <Button variant="ghost" size="sm"
                                    className="h-7 px-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-slate-700 text-xs gap-1"
                                    onClick={() => setDeleteTarget(dbT as unknown as DbTemplate)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="sm"
                                  className={`h-7 px-2 text-xs gap-1 ${adminCls.iconBtn}`}
                                  onClick={() => setViewTemplate(t as unknown as DocumentTemplate)}>
                                  <Eye className="w-3.5 h-3.5" /> View
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Grouped View ── */}
          {tab === 'grouped' && (
            <div className="space-y-4">
              {groupedView.length === 0 ? (
                <Card className={adminCls.card}>
                  <CardContent className={`py-12 text-center text-sm ${adminCls.muted}`}>No templates match your filters.</CardContent>
                </Card>
              ) : groupedView.map(([group, templates]) => (
                <Card key={group} className={`${adminCls.card} overflow-hidden`}>
                  <CardHeader className={`px-4 py-3 border-b ${adminCls.divider} ${adminCls.statBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className={`text-sm font-semibold ${adminCls.text}`}>{group}</span>
                      </div>
                      <span className={`text-xs ${adminCls.muted}`}>{templates.length} template{templates.length !== 1 ? 's' : ''}</span>
                    </div>
                  </CardHeader>
                  <div className={`divide-y ${adminCls.divider}`}>
                    {templates.map(t => {
                      const isDb = t._source === 'db';
                      const dbT = isDb ? (t as unknown as DbTemplate) : null;
                      return (
                        <div key={`${t._source}-${t.id ?? t.name}`}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${adminCls.rowHover}`}>
                          {isDb
                            ? <Database className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0" />
                            : <FileText className={`w-3.5 h-3.5 shrink-0 ${adminCls.subtle}`} />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${adminCls.text}`}>{t.name}</p>
                            <p className={`text-[10px] truncate ${adminCls.subtle}`}>{t.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PLAN_STYLES[t.planRequired] ?? PLAN_STYLES.free}`}>
                              {PLAN_LABELS[t.planRequired] ?? t.planRequired}
                            </span>
                            {isDb ? (
                              <Button variant="ghost" size="sm"
                                className={`h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700`}
                                onClick={() => { setEditingDb(dbT); setEditorOpen(true); }}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm"
                                className={`h-6 px-2 text-xs ${adminCls.iconBtn}`}
                                onClick={() => setViewTemplate(t as unknown as DocumentTemplate)}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Category breakdown */}
          <Card className={adminCls.card}>
            <CardHeader className={`px-4 py-3 border-b ${adminCls.divider}`}>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className={`text-sm font-semibold ${adminCls.text}`}>Category Breakdown</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => {
                  const count = allForDisplay.filter(t => (cats as TemplateCategory[]).includes(t.category as TemplateCategory)).length;
                  return (
                    <button key={group} onClick={() => { setGroupFilter(group); setTab('list'); }}
                      className={`border rounded-lg p-3 text-left transition-colors hover:border-blue-500/50 ${adminCls.statBg} ${adminCls.divider} ${adminCls.rowHover}`}>
                      <p className={`text-lg font-bold ${adminCls.text}`}>{count}</p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${adminCls.muted}`}>{group}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </AdminLayout>

      {/* Code template view modal */}
      <CodeTemplateModal template={viewTemplate} onClose={() => setViewTemplate(null)} />

      {/* DB template editor */}
      <DbTemplateEditor
        template={editingDb}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingDb(null); }}
        onSaved={() => void loadDbTemplates()}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent className={adminCls.dialog}>
          <AlertDialogHeader>
            <AlertDialogTitle className={adminCls.text}>Delete template?</AlertDialogTitle>
            <AlertDialogDescription className={adminCls.muted}>
              Are you sure you want to permanently delete <strong className={adminCls.text}>{deleteTarget?.name}</strong>?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={adminCls.outlineBtn}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white gap-1.5"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
