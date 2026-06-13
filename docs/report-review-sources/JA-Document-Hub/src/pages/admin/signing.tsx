import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PenLine, Search, RefreshCw, XCircle, Shield, Settings,
  Eye, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Users, FileText, Clock, Paperclip,
} from 'lucide-react';
import type { SigningStatus } from '@/lib/signing-types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/signing-types';

interface AdminSigningRequest {
  uuid: string;
  title: string;
  status: SigningStatus;
  ownerName: string;
  ownerEmail: string;
  signerCount: number;
  signedCount: number;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
  documentName: string | null;
}

interface SigningConfig {
  signing_enabled: string;
  signing_plans: string;
  signing_max_docs_professional: string;
  signing_max_docs_org_starter: string;
  signing_max_docs_org_growth: string;
  signing_max_docs_org_professional: string;
  signing_max_signers: string;
  signing_default_expiry_days: string;
  signing_reminder_days: string;
  signing_max_attachments: string;
  signing_max_attachment_size_mb: string;
  signing_allowed_attachment_types: string;
  signing_append_to_final_pack_default: string;
  signing_email_template_request: string;
  signing_email_template_reminder: string;
  signing_email_template_completed: string;
  signing_email_template_declined: string;
  signing_branding_logo_url: string;
  signing_branding_company_name: string;
  signing_branding_footer_text: string;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'partially_signed', label: 'Partially Signed' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminSigningPage() {
  const [requests, setRequests] = useState<AdminSigningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [config, setConfig] = useState<SigningConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<Record<string, {
    signers: Array<{ name: string; email: string; status: string; signedAt: string | null; ipAddress: string | null }>;
    fields: Array<{ fieldType: string; page: number; x: number; y: number; width: number; height: number; required: boolean; label: string | null; value: string | null }>;
    attachments: Array<{ uuid: string; originalName: string; mimeType: string; fileSize: number; filePath: string; visibleToSigners: boolean; appendToFinalPack: boolean }>;
    audit: Array<{ event: string; detail: string | null; signerEmail: string | null; ipAddress: string | null; createdAt: string }>;
  }>>({});
  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/signing', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } finally { setLoading(false); }
  }

  async function loadConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/admin/signing/config', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setConfig(data.config);
    } finally { setConfigLoading(false); }
  }

  useEffect(() => { loadRequests(); loadConfig(); }, []);

  async function saveConfig() {
    if (!config) return;
    setConfigSaving(true); setConfigError(''); setConfigSuccess('');
    try {
      const res = await fetch('/api/admin/signing/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (data.success) setConfigSuccess('Configuration saved.');
      else setConfigError(data.error);
    } catch { setConfigError('Failed to save.'); }
    finally { setConfigSaving(false); }
  }

  async function cancelRequest(uuid: string) {
    if (!confirm('Cancel this signing request?')) return;
    setActionLoading(uuid); setActionMsg('');
    const res = await fetch(`/api/admin/signing/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'cancel' }),
    });
    const data = await res.json();
    setActionLoading('');
    if (data.success) { setActionMsg('Request cancelled.'); loadRequests(); }
    else setActionMsg(data.error);
  }

  async function loadAudit(uuid: string) {
    if (expandedAudit === uuid) { setExpandedAudit(null); return; }
    setExpandedAudit(uuid);
    if (auditData[uuid]) return;
    const res = await fetch(`/api/admin/signing/${uuid}/audit`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) setAuditData(prev => ({ ...prev, [uuid]: { signers: data.signers, audit: data.audit } }));
  }

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.ownerEmail.toLowerCase().includes(search.toLowerCase()) || r.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: requests.length,
    active: requests.filter(r => ['sent', 'viewed', 'partially_signed'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    declined: requests.filter(r => ['declined', 'expired', 'cancelled'].includes(r.status)).length,
  };

  return (
    <div id="admin-theme-root" className="min-h-screen bg-background text-foreground">
      <Helmet><title>Document Signing — Admin Portal</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Document Signing</h1>
            <p className="text-sm text-muted-foreground">Manage all signing requests and configuration</p>
          </div>
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests" className="gap-1"><FileText className="w-3 h-3" /> Requests</TabsTrigger>
            <TabsTrigger value="config" className="gap-1"><Settings className="w-3 h-3" /> Configuration</TabsTrigger>
          </TabsList>

          {/* Requests tab */}
          <TabsContent value="requests" className="space-y-4 mt-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: stats.total, color: 'text-foreground' },
                { label: 'Active', value: stats.active, color: 'text-blue-600' },
                { label: 'Completed', value: stats.completed, color: 'text-green-600' },
                { label: 'Declined/Expired', value: stats.declined, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {actionMsg && <div className="p-3 rounded-lg bg-muted text-sm text-foreground">{actionMsg}</div>}

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by title, owner…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRequests} className="gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PenLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No signing requests found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => (
                  <div key={r.uuid} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">{r.title}</span>
                          <Badge className={`text-[10px] h-5 px-2 ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.ownerName} ({r.ownerEmail})</span>
                          <span>{r.signerCount} signers · {r.signedCount} signed</span>
                          <span>{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                          {r.documentName && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{r.documentName}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => loadAudit(r.uuid)} className="gap-1 text-xs">
                          <Shield className="w-3 h-3" /> Audit
                          {expandedAudit === r.uuid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                        {!['completed', 'cancelled', 'expired'].includes(r.status) && (
                          <Button variant="ghost" size="sm" onClick={() => cancelRequest(r.uuid)} disabled={actionLoading === r.uuid} className="gap-1 text-xs text-red-600 hover:text-red-700">
                            {actionLoading === r.uuid ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Audit panel */}
                    {expandedAudit === r.uuid && auditData[r.uuid] && (
                      <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        {/* Signers */}
                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Signers</h4>
                          <div className="space-y-1">
                            {auditData[r.uuid].signers.map((s, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{s.name}</span>
                                <span>{s.email}</span>
                                <Badge variant="outline" className="text-[10px] h-4">{s.status}</Badge>
                                {s.signedAt && <span>Signed {new Date(s.signedAt).toLocaleString('en-GB')}</span>}
                                {s.ipAddress && <span>IP: {s.ipAddress}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fields */}
                        {auditData[r.uuid].fields.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Field Placements ({auditData[r.uuid].fields.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                              {auditData[r.uuid].fields.map((f, i) => (
                                <div key={i} className="text-[10px] text-muted-foreground bg-background border border-border rounded px-2 py-1">
                                  <span className="font-medium text-foreground">{f.fieldType}</span>
                                  {f.label && <span> · {f.label}</span>}
                                  <span className="block">Page {f.page} · {f.x},{f.y} · {f.width}×{f.height}</span>
                                  {f.value && <span className="text-green-600 block truncate">Filled</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {auditData[r.uuid].attachments.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Paperclip className="w-3 h-3" /> Attachments ({auditData[r.uuid].attachments.length})</h4>
                            <div className="space-y-1">
                              {auditData[r.uuid].attachments.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">{a.originalName}</span>
                                  <span>{(a.fileSize / 1024).toFixed(1)} KB</span>
                                  {a.visibleToSigners && <Badge variant="outline" className="text-[10px] h-4">Visible to signers</Badge>}
                                  {a.appendToFinalPack && <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-700">In final pack</Badge>}
                                  <button onClick={() => window.open(`/airo-assets/uploads/${a.filePath}`, '_blank')} className="text-primary hover:underline">View</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Audit events */}
                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Audit Events ({auditData[r.uuid].audit.length})</h4>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {auditData[r.uuid].audit.map((a, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(a.createdAt).toLocaleString('en-GB')}</span>
                                <span className="font-medium text-foreground shrink-0">{a.event}</span>
                                {a.signerEmail && <span>{a.signerEmail}</span>}
                                {a.ipAddress && <span>IP: {a.ipAddress}</span>}
                                {a.detail && <span className="truncate">{a.detail}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Config tab */}
          <TabsContent value="config" className="mt-4">
            {configLoading ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : config && (
              <div className="max-w-2xl space-y-6">
                {configSuccess && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" />{configSuccess}</div>}
                {configError && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"><AlertTriangle className="w-4 h-4" />{configError}</div>}

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold text-foreground">Feature Access</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Document Signing Enabled</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Enable or disable Document Signing for all users</p>
                    </div>
                    <Switch
                      checked={config.signing_enabled === 'true'}
                      onCheckedChange={v => setConfig(c => c ? { ...c, signing_enabled: v ? 'true' : 'false' } : c)}
                    />
                  </div>
                  <div>
                    <Label>Plans with Access</Label>
                    <p className="text-xs text-muted-foreground mb-1">Comma-separated plan IDs (e.g. professional,org_starter,org_growth,org_professional)</p>
                    <Input value={config.signing_plans} onChange={e => setConfig(c => c ? { ...c, signing_plans: e.target.value } : c)} />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold text-foreground">Document Limits</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'signing_max_docs_professional', label: 'Professional' },
                      { key: 'signing_max_docs_org_starter', label: 'Org Starter' },
                      { key: 'signing_max_docs_org_growth', label: 'Org Growth' },
                      { key: 'signing_max_docs_org_professional', label: 'Org Professional' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-xs">{label} — Max Documents</Label>
                        <Input
                          type="number" min={0}
                          value={config[key as keyof SigningConfig]}
                          onChange={e => setConfig(c => c ? { ...c, [key]: e.target.value } : c)}
                          className="mt-1 h-9"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Max Signers per Document</Label>
                      <Input type="number" min={1} value={config.signing_max_signers} onChange={e => setConfig(c => c ? { ...c, signing_max_signers: e.target.value } : c)} className="mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Default Expiry (days)</Label>
                      <Input type="number" min={1} value={config.signing_default_expiry_days} onChange={e => setConfig(c => c ? { ...c, signing_default_expiry_days: e.target.value } : c)} className="mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Reminder (days before expiry)</Label>
                      <Input type="number" min={1} value={config.signing_reminder_days} onChange={e => setConfig(c => c ? { ...c, signing_reminder_days: e.target.value } : c)} className="mt-1 h-9" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold text-foreground">Attachments</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Max Attachments per Request</Label>
                      <Input type="number" min={0} max={50} value={config.signing_max_attachments} onChange={e => setConfig(c => c ? { ...c, signing_max_attachments: e.target.value } : c)} className="mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Max Attachment Size (MB)</Label>
                      <Input type="number" min={1} max={100} value={config.signing_max_attachment_size_mb} onChange={e => setConfig(c => c ? { ...c, signing_max_attachment_size_mb: e.target.value } : c)} className="mt-1 h-9" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Allowed File Types (comma-separated extensions)</Label>
                    <Input value={config.signing_allowed_attachment_types} onChange={e => setConfig(c => c ? { ...c, signing_allowed_attachment_types: e.target.value } : c)} className="mt-1" placeholder="pdf,png,jpg,jpeg,doc,docx" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Append to Final Pack by Default</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">New attachments default to being included in the final document pack</p>
                    </div>
                    <Switch
                      checked={config.signing_append_to_final_pack_default === 'true'}
                      onCheckedChange={v => setConfig(c => c ? { ...c, signing_append_to_final_pack_default: v ? 'true' : 'false' } : c)}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold text-foreground">Branding</h2>
                  <div>
                    <Label className="text-xs">Company Name (shown in emails)</Label>
                    <Input value={config.signing_branding_company_name} onChange={e => setConfig(c => c ? { ...c, signing_branding_company_name: e.target.value } : c)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Logo URL (shown in signing emails)</Label>
                    <Input value={config.signing_branding_logo_url ?? ''} onChange={e => setConfig(c => c ? { ...c, signing_branding_logo_url: e.target.value } : c)} className="mt-1" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-xs">Email Footer Text</Label>
                    <Input value={config.signing_branding_footer_text} onChange={e => setConfig(c => c ? { ...c, signing_branding_footer_text: e.target.value } : c)} className="mt-1" />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold text-foreground">Email Templates</h2>
                  <p className="text-xs text-muted-foreground">Customise the body text for each email type. Leave blank to use the default template.</p>
                  {[
                    { key: 'signing_email_template_request', label: 'Signing Request Email' },
                    { key: 'signing_email_template_reminder', label: 'Reminder Email' },
                    { key: 'signing_email_template_completed', label: 'Completion Email' },
                    { key: 'signing_email_template_declined', label: 'Declined Email' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <textarea
                        rows={3}
                        value={config[key as keyof SigningConfig] ?? ''}
                        onChange={e => setConfig(c => c ? { ...c, [key]: e.target.value } : c)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[80px]"
                        placeholder="Leave blank to use default template…"
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={saveConfig} disabled={configSaving} className="gap-2">
                  {configSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {configSaving ? 'Saving…' : 'Save Configuration'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
