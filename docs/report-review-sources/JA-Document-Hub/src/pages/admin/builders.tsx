/**
 * Admin — Builder Template Manager
 *
 * Full CRUD for all builder templates stored in ja_builder_templates.
 * All 146+ templates are DB-driven. No hardcoded templates anywhere.
 *
 * Features:
 * - List all templates with search, filter by builder/status/category
 * - Create, Edit, Duplicate, Archive, Restore, Delete templates
 * - Code editor for bodyTemplate with token insertion
 * - Fields editor (add/remove/reorder fields)
 * - Version tracking (auto-increments on body change)
 * - Featured / Draft / Published / Archived flags
 * - Access level & plan restrictions
 * - Builder Settings panel (name, description, accent colour)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, Edit2, Trash2, Copy, Archive, RotateCcw, Eye, EyeOff,
  Star, FileText, Loader2, CheckCircle2, AlertTriangle, Code2,
  ChevronDown, ChevronUp, GripVertical, Tag, Settings2, RefreshCw,
  Database, Filter, BarChart2, Layers, Lock, Globe, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminTemplate {
  id: number;
  templateId: string;
  builderId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  industries: string[];
  planRequired: string;
  accessLevel: string;
  orgRestriction: string | null;
  status: string;
  popular: boolean;
  isFeatured: boolean;
  isDraft: boolean;
  isPublished: boolean;
  isArchived: boolean;
  supportsBranding: boolean;
  showDocHeader: boolean;
  accentColor: string | null;
  defaultLayout: string | null;
  bodyTemplate: string;
  fields: FieldDef[];
  tags: string[];
  sortOrder: number;
  version: number;
  versionNotes: string | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  useCount: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  helpText?: string;
  group?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BUILDER_LABELS: Record<string, string> = {
  letter:    'Letter Builder',
  email:     'Email Builder',
  invoice:   'Invoice Builder',
  contract:  'Contract Builder',
  policy:    'Policy Builder',
  form:      'Form Builder',
  report:    'Report Builder',
  minutes:   'Minutes Builder',
  proposal:  'Proposal Builder',
  checklist: 'Checklist Builder',
};

const ALL_BUILDER_IDS = Object.keys(BUILDER_LABELS);

const PLAN_OPTIONS = [
  { value: 'free',         label: 'Free' },
  { value: 'personal',     label: 'Personal' },
  { value: 'standard',     label: 'Standard' },
  { value: 'professional', label: 'Professional' },
];

const ACCESS_OPTIONS = [
  { value: 'all',        label: 'All users' },
  { value: 'paid',       label: 'Paid plans only' },
  { value: 'org_only',   label: 'Organisations only' },
  { value: 'admin_only', label: 'Admin only' },
];

const STATUS_OPTIONS = [
  { value: 'active',  label: 'Active' },
  { value: 'draft',   label: 'Draft' },
  { value: 'retired', label: 'Retired' },
];

const FIELD_TYPES = ['text','textarea','date','select','number','email','phone','toggle','section_heading'];

const LAYOUT_OPTIONS = [
  { value: 'letter',   label: 'Formal Letter' },
  { value: 'email',    label: 'Email' },
  { value: 'invoice',  label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'policy',   label: 'Policy' },
  { value: 'report',   label: 'Report' },
  { value: 'minutes',  label: 'Minutes' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'checklist','label': 'Checklist' },
  { value: 'form',     label: 'Form' },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ t }: { t: AdminTemplate }) {
  if (t.isArchived)  return <Badge variant="outline" className="text-[10px] text-slate-500">Archived</Badge>;
  if (t.isDraft)     return <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">Draft</Badge>;
  if (!t.isPublished) return <Badge variant="outline" className="text-[10px] text-slate-500">Unpublished</Badge>;
  if (t.status === 'retired') return <Badge variant="outline" className="text-[10px] text-red-500 border-red-300">Retired</Badge>;
  return <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">Active</Badge>;
}

function PlanBadge({ plan }: { plan: string }) {
  const cls = plan === 'free' ? 'bg-muted text-muted-foreground' :
              plan === 'personal' ? 'bg-emerald-100 text-emerald-700' :
              plan === 'standard' ? 'bg-blue-100 text-blue-700' :
              'bg-primary/10 text-primary';
  return <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize', cls)}>{plan}</span>;
}

// ── Fields editor ─────────────────────────────────────────────────────────────

function FieldsEditor({ fields, onChange }: { fields: FieldDef[]; onChange: (f: FieldDef[]) => void }) {
  function addField() {
    onChange([...fields, { id: `field_${Date.now()}`, label: 'New Field', type: 'text' }]);
  }
  function removeField(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
  }
  function updateField(idx: number, patch: Partial<FieldDef>) {
    onChange(fields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }
  function moveField(idx: number, dir: -1 | 1) {
    const arr = [...fields];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  }

  return (
    <div className="space-y-2">
      {fields.map((f, idx) => (
        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
          <div className="flex flex-col gap-0.5 mt-1 shrink-0">
            <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-0.5 hover:text-foreground text-muted-foreground disabled:opacity-30">
              <ChevronUp className="w-3 h-3" />
            </button>
            <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="p-0.5 hover:text-foreground text-muted-foreground disabled:opacity-30">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <div>
              <Label className="text-[10px] text-muted-foreground">Field ID</Label>
              <Input value={f.id} onChange={e => updateField(idx, { id: e.target.value })} className="h-7 text-xs font-mono" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Label</Label>
              <Input value={f.label} onChange={e => updateField(idx, { label: e.target.value })} className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Type</Label>
              <Select value={f.type} onValueChange={v => updateField(idx, { type: v })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Placeholder</Label>
              <Input value={f.placeholder ?? ''} onChange={e => updateField(idx, { placeholder: e.target.value })} className="h-7 text-xs" />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Switch checked={f.required ?? false} onCheckedChange={v => updateField(idx, { required: v })} />
              <Label className="text-xs">Required</Label>
              <Input value={f.defaultValue ?? ''} onChange={e => updateField(idx, { defaultValue: e.target.value })} placeholder="Default value" className="h-7 text-xs flex-1" />
            </div>
          </div>
          <button onClick={() => removeField(idx)} className="p-1 text-muted-foreground hover:text-destructive shrink-0 mt-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addField} className="gap-2 w-full">
        <Plus className="w-3.5 h-3.5" /> Add Field
      </Button>
    </div>
  );
}

// ── Code editor ───────────────────────────────────────────────────────────────

function CodeEditor({
  value, onChange, fields,
}: { value: string; onChange: (v: string) => void; fields: FieldDef[] }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertToken(token: string) {
    const el = ref.current;
    if (!el) { onChange(value + `{{${token}}}`); return; }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = value.slice(0, start) + `{{${token}}}` + value.slice(end);
    onChange(next);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + token.length + 4;
      el.focus();
    }, 0);
  }

  return (
    <div className="space-y-2">
      {/* Token buttons */}
      {fields.filter(f => f.type !== 'section_heading').length > 0 && (
        <div className="flex flex-wrap gap-1">
          {fields.filter(f => f.type !== 'section_heading').map(f => (
            <button
              key={f.id}
              onClick={() => insertToken(f.id)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-mono transition-colors"
            >
              {`{{${f.id}}}`}
            </button>
          ))}
        </div>
      )}
      {/* Editor */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <div className="bg-slate-900 px-3 py-1.5 flex items-center gap-2 border-b border-slate-700">
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono">Template Body</span>
          <span className="ml-auto text-[10px] text-slate-500">{value.length} chars</span>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-3 resize-none focus:outline-none min-h-[300px]"
          spellCheck={false}
          style={{ lineHeight: '1.6' }}
        />
      </div>
    </div>
  );
}

// ── Template form ─────────────────────────────────────────────────────────────

type FormData = Omit<AdminTemplate, 'id' | 'useCount' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'version'>;

function emptyForm(builderId = 'letter'): FormData {
  return {
    templateId: '',
    builderId,
    name: '',
    description: '',
    category: 'General',
    subcategory: null,
    industries: [],
    planRequired: 'free',
    accessLevel: 'all',
    orgRestriction: null,
    status: 'active',
    popular: false,
    isFeatured: false,
    isDraft: false,
    isPublished: true,
    isArchived: false,
    supportsBranding: true,
    showDocHeader: false,
    accentColor: '#1B4F8A',
    defaultLayout: builderId,
    bodyTemplate: '',
    fields: [],
    tags: [],
    sortOrder: 0,
    versionNotes: null,
    thumbnailUrl: null,
    previewUrl: null,
  };
}

function templateToForm(t: AdminTemplate): FormData {
  return {
    templateId: t.templateId,
    builderId: t.builderId,
    name: t.name,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
    industries: t.industries,
    planRequired: t.planRequired,
    accessLevel: t.accessLevel,
    orgRestriction: t.orgRestriction,
    status: t.status,
    popular: t.popular,
    isFeatured: t.isFeatured,
    isDraft: t.isDraft,
    isPublished: t.isPublished,
    isArchived: t.isArchived,
    supportsBranding: t.supportsBranding,
    showDocHeader: t.showDocHeader,
    accentColor: t.accentColor,
    defaultLayout: t.defaultLayout,
    bodyTemplate: t.bodyTemplate,
    fields: t.fields,
    tags: t.tags,
    sortOrder: t.sortOrder,
    versionNotes: t.versionNotes,
    thumbnailUrl: t.thumbnailUrl,
    previewUrl: t.previewUrl,
  };
}

// ── Template edit dialog ──────────────────────────────────────────────────────

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  template: AdminTemplate | null; // null = create
  onSaved: () => void;
  defaultBuilderId?: string;
}

function EditDialog({ open, onClose, template, onSaved, defaultBuilderId }: EditDialogProps) {
  const isCreate = template === null;
  const [form, setForm] = useState<FormData>(emptyForm(defaultBuilderId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open) {
      setForm(template ? templateToForm(template) : emptyForm(defaultBuilderId));
      setError('');
      setActiveTab('details');
    }
  }, [open, template, defaultBuilderId]);

  function patch(key: keyof FormData, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Template name is required.'); return; }
    if (!form.templateId.trim()) { setError('Template ID is required.'); return; }
    if (!form.builderId) { setError('Builder is required.'); return; }

    setSaving(true);
    setError('');
    try {
      const url = isCreate
        ? '/api/admin/builder-templates'
        : `/api/admin/builder-templates/${template!.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.error ?? 'Failed to save template.');
      }
    } catch {
      setError('Network error saving template.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle>{isCreate ? 'Create Template' : `Edit: ${template?.name}`}</DialogTitle>
          <DialogDescription>
            {isCreate ? 'Add a new template to the database.' : `Template ID: ${template?.templateId} · v${template?.version}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 shrink-0 justify-start">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Template Body</TabsTrigger>
            <TabsTrigger value="fields" className="text-xs">Fields ({form.fields.length})</TabsTrigger>
            <TabsTrigger value="access" className="text-xs">Access & Flags</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4 space-y-4">

              {/* Details tab */}
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Template ID *</Label>
                    <Input value={form.templateId} onChange={e => patch('templateId', e.target.value)}
                      placeholder="e.g. letter-formal-business" className="font-mono text-xs mt-1"
                      disabled={!isCreate} />
                    {isCreate && <p className="text-[10px] text-muted-foreground mt-0.5">Unique identifier. Cannot be changed after creation.</p>}
                  </div>
                  <div>
                    <Label className="text-xs">Builder *</Label>
                    <Select value={form.builderId} onValueChange={v => patch('builderId', v)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_BUILDER_IDS.map(id => (
                          <SelectItem key={id} value={id} className="text-xs">{BUILDER_LABELS[id]}</SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-xs">Custom Builder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Template Name *</Label>
                    <Input value={form.name} onChange={e => patch('name', e.target.value)} className="mt-1 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={form.description} onChange={e => patch('description', e.target.value)} rows={2} className="mt-1 text-xs resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Input value={form.category} onChange={e => patch('category', e.target.value)} className="mt-1 text-xs" placeholder="e.g. Business, HR, Legal" />
                  </div>
                  <div>
                    <Label className="text-xs">Subcategory</Label>
                    <Input value={form.subcategory ?? ''} onChange={e => patch('subcategory', e.target.value || null)} className="mt-1 text-xs" placeholder="Optional" />
                  </div>
                  <div>
                    <Label className="text-xs">Default Layout</Label>
                    <Select value={form.defaultLayout ?? ''} onValueChange={v => patch('defaultLayout', v || null)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="Select layout" /></SelectTrigger>
                      <SelectContent>
                        {LAYOUT_OPTIONS.map(l => <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Accent Colour</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.accentColor ?? '#1B4F8A'} onChange={e => patch('accentColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-border" />
                      <Input value={form.accentColor ?? ''} onChange={e => patch('accentColor', e.target.value)} className="text-xs font-mono flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={form.status} onValueChange={v => patch('status', v)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Sort Order</Label>
                    <Input type="number" value={form.sortOrder} onChange={e => patch('sortOrder', parseInt(e.target.value) || 0)} className="mt-1 text-xs" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Version Notes</Label>
                    <Input value={form.versionNotes ?? ''} onChange={e => patch('versionNotes', e.target.value || null)} className="mt-1 text-xs" placeholder="What changed in this version?" />
                  </div>
                </div>
              </TabsContent>

              {/* Content tab */}
              <TabsContent value="content" className="mt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  Use <code className="bg-muted px-1 rounded">{'{{field_id}}'}</code> tokens to insert field values.
                  Saving a changed body auto-increments the version number.
                </p>
                <CodeEditor value={form.bodyTemplate} onChange={v => patch('bodyTemplate', v)} fields={form.fields} />
              </TabsContent>

              {/* Fields tab */}
              <TabsContent value="fields" className="mt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  Define the input fields for this template. Field IDs become <code className="bg-muted px-1 rounded">{'{{field_id}}'}</code> tokens in the body.
                </p>
                <FieldsEditor fields={form.fields} onChange={f => patch('fields', f)} />
              </TabsContent>

              {/* Access & Flags tab */}
              <TabsContent value="access" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Plan Required</Label>
                    <Select value={form.planRequired} onValueChange={v => patch('planRequired', v)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Access Level</Label>
                    <Select value={form.accessLevel} onValueChange={v => patch('accessLevel', v)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACCESS_OPTIONS.map(a => <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <div className="space-y-3">
                  {([
                    ['popular',         'Popular',          'Show in popular/featured sections'],
                    ['isFeatured',      'Featured',         'Highlight as a featured template'],
                    ['isDraft',         'Draft',            'Hidden from customers until published'],
                    ['isPublished',     'Published',        'Visible to customers'],
                    ['isArchived',      'Archived',         'Hidden and no longer available'],
                    ['supportsBranding','Supports Branding','Allow custom logo/colour branding'],
                    ['showDocHeader',   'Show Doc Header',  'Display document header in preview'],
                  ] as [keyof FormData, string, string][]).map(([key, label, desc]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={Boolean(form[key])}
                        onCheckedChange={v => patch(key, v)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

            </div>
          </ScrollArea>
        </Tabs>

        {error && (
          <div className="mx-6 mb-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Saving…' : isCreate ? 'Create Template' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminBuildersPage() {
  const [templates, setTemplates]       = useState<AdminTemplate[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterBuilder, setFilterBuilder] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editTarget, setEditTarget]     = useState<AdminTemplate | null | undefined>(undefined); // undefined = closed
  const [deleteTarget, setDeleteTarget] = useState<AdminTemplate | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast]               = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterBuilder !== 'all') params.set('builderId', filterBuilder);
      if (filterStatus !== 'all')  params.set('status', filterStatus);
      if (search.trim())           params.set('search', search.trim());
      const res = await fetch(`/api/admin/builder-templates?${params}`, { credentials: 'include' });
      const data = await res.json() as { success: boolean; templates?: AdminTemplate[]; error?: string };
      if (data.success) setTemplates(data.templates ?? []);
      else setError(data.error ?? 'Failed to load templates.');
    } catch {
      setError('Network error loading templates.');
    } finally {
      setLoading(false);
    }
  }, [filterBuilder, filterStatus, search]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  async function handleDuplicate(t: AdminTemplate) {
    setActionLoading(t.id);
    try {
      const res = await fetch(`/api/admin/builder-templates/${t.id}/duplicate`, {
        method: 'POST', credentials: 'include',
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) { showToast('Template duplicated.'); loadTemplates(); }
      else showToast(data.error ?? 'Failed to duplicate.');
    } catch { showToast('Network error.'); }
    finally { setActionLoading(null); }
  }

  async function handleArchiveToggle(t: AdminTemplate) {
    setActionLoading(t.id);
    try {
      const res = await fetch(`/api/admin/builder-templates/${t.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !t.isArchived, status: t.isArchived ? 'active' : t.status }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) { showToast(t.isArchived ? 'Template restored.' : 'Template archived.'); loadTemplates(); }
      else showToast(data.error ?? 'Failed.');
    } catch { showToast('Network error.'); }
    finally { setActionLoading(null); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/builder-templates/${deleteTarget.id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) { showToast('Template deleted.'); loadTemplates(); }
      else showToast(data.error ?? 'Failed to delete.');
    } catch { showToast('Network error.'); }
    finally { setActionLoading(null); setDeleteTarget(null); }
  }

  // Stats
  const stats = {
    total:    templates.length,
    active:   templates.filter(t => !t.isArchived && t.isPublished && t.status === 'active').length,
    draft:    templates.filter(t => t.isDraft).length,
    archived: templates.filter(t => t.isArchived).length,
    featured: templates.filter(t => t.isFeatured).length,
  };

  const builderCounts = ALL_BUILDER_IDS.reduce<Record<string, number>>((acc, id) => {
    acc[id] = templates.filter(t => t.builderId === id).length;
    return acc;
  }, {});

  return (
    <AdminLayout title="Builder Template Manager" subtitle="Manage all document builder templates — database-driven, no hardcoded templates">
      <div className="space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total',    value: stats.total,    icon: Database,     color: 'text-primary' },
            { label: 'Active',   value: stats.active,   icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Draft',    value: stats.draft,    icon: Edit2,        color: 'text-amber-600' },
            { label: 'Archived', value: stats.archived, icon: Archive,      color: 'text-slate-500' },
            { label: 'Featured', value: stats.featured, icon: Star,         color: 'text-yellow-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <Icon className={cn('w-5 h-5 shrink-0', color)} />
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterBuilder} onValueChange={setFilterBuilder}>
            <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All builders" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All builders</SelectItem>
              {ALL_BUILDER_IDS.map(id => (
                <SelectItem key={id} value={id} className="text-sm">
                  {BUILDER_LABELS[id]} ({builderCounts[id] ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadTemplates} className="gap-2 h-9">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => setEditTarget(null)} className="gap-2 h-9 ml-auto">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Template table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm mt-1">Try adjusting your filters or create a new template.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Template</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Builder</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">v</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Uses</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id} className={cn('border-b border-border/50 hover:bg-muted/20 transition-colors', t.isArchived && 'opacity-50')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.isFeatured && <Star className="w-3 h-3 text-yellow-500 shrink-0" />}
                          {t.popular && !t.isFeatured && <Star className="w-3 h-3 text-muted-foreground shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{t.templateId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{BUILDER_LABELS[t.builderId] ?? t.builderId}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{t.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge t={t} />
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <PlanBadge plan={t.planRequired} />
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">v{t.version}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">{t.useCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actionLoading === t.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <button
                                onClick={() => setEditTarget(t)}
                                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(t)}
                                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleArchiveToggle(t)}
                                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title={t.isArchived ? 'Restore' : 'Archive'}
                              >
                                {t.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(t)}
                                className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Edit/Create dialog */}
        <EditDialog
          open={editTarget !== undefined}
          onClose={() => setEditTarget(undefined)}
          template={editTarget ?? null}
          onSaved={loadTemplates}
          defaultBuilderId={filterBuilder !== 'all' ? filterBuilder : 'letter'}
        />

        {/* Delete confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete template?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.templateId}).
                This action cannot be undone. Consider archiving instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            {toast}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
