/**
 * Admin GDPR / Subject Access Requests
 * Full SAR management: view, filter, verify identity, approve/reject,
 * generate export, download, audit log. Theme-aware (light/dark).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Shield, Search, RefreshCw, AlertTriangle, Clock, CheckCircle2,
  XCircle, ChevronRight, User, Mail, Calendar, Download, FileText,
  UserCheck, Eye, Lock, AlertCircle, Loader2, Info, Package,
  ArrowRight, Trash2,
} from 'lucide-react';
import { adminCls } from '@/lib/admin-theme-classes';
import { formatDistanceToNow } from '@/lib/date-utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SarRequest {
  id: number;
  uuid: string;
  userId: number;
  email: string;
  fullName: string;
  requestType: string;
  notes: string | null;
  status: string;
  deadlineAt: string;
  deadlineExtendedAt: string | null;
  deadlineExtendReason: string | null;
  identityVerified: boolean;
  identityVerifiedBy: string | null;
  identityVerifiedAt: string | null;
  identityNotes: string | null;
  assignedTo: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  exportGeneratedAt: string | null;
  exportGeneratedBy: string | null;
  exportFileSizeBytes: number | null;
  downloadCount: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  total: number;
  submitted: number;
  in_review: number;
  processing: number;
  ready: number;
  completed: number;
  overdue: number;
  urgent: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',                label: 'All Statuses' },
  { value: 'submitted',          label: 'Submitted' },
  { value: 'in_review',          label: 'In Review' },
  { value: 'processing',         label: 'Processing' },
  { value: 'ready',              label: 'Ready' },
  { value: 'completed',          label: 'Completed' },
  { value: 'rejected',           label: 'Rejected' },
  { value: 'unable_to_complete', label: 'Unable to Complete' },
];

const TYPE_OPTIONS = [
  { value: 'all',           label: 'All Types' },
  { value: 'sar',           label: 'Subject Access Request' },
  { value: 'export',        label: 'Data Export' },
  { value: 'deletion',      label: 'Right to Erasure' },
  { value: 'rectification', label: 'Right to Rectification' },
  { value: 'restriction',   label: 'Right to Restriction' },
  { value: 'portability',   label: 'Right to Portability' },
  { value: 'objection',     label: 'Right to Object' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  submitted:          { label: 'Submitted',          cls: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' },
  in_review:          { label: 'In Review',          cls: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' },
  processing:         { label: 'Processing',         cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' },
  ready:              { label: 'Ready',              cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' },
  completed:          { label: 'Completed',          cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' },
  rejected:           { label: 'Rejected',           cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' },
  unable_to_complete: { label: 'Unable to Complete', cls: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700' },
};

const TERMINAL = ['completed', 'rejected', 'unable_to_complete'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminGdprPage() {
  const [requests, setRequests] = useState<SarRequest[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Selected request
  const [selected, setSelected] = useState<SarRequest | null>(null);

  // Action states
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Edit fields
  const [editStatus, setEditStatus] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editRejectionReason, setEditRejectionReason] = useState('');
  const [editIdentityVerified, setEditIdentityVerified] = useState(false);
  const [editIdentityNotes, setEditIdentityNotes] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [extendDeadline, setExtendDeadline] = useState(false);
  const [extendReason, setExtendReason] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('requestType', typeFilter);
      if (search.trim()) params.set('search', search.trim());
      if (overdueOnly) params.set('overdue', 'true');

      const res = await fetch(`/api/admin/sar?${params}`, { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await res.json() as { success: boolean; requests?: SarRequest[]; summary?: Summary; error?: string };
      if (data.success) {
        setRequests(data.requests ?? []);
        setSummary(data.summary ?? null);
      } else {
        setError(data.error ?? 'Failed to load requests.');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, overdueOnly]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const openRequest = (sar: SarRequest) => {
    setSelected(sar);
    setEditStatus(sar.status);
    setEditAdminNotes(sar.adminNotes ?? '');
    setEditRejectionReason(sar.rejectionReason ?? '');
    setEditIdentityVerified(sar.identityVerified);
    setEditIdentityNotes(sar.identityNotes ?? '');
    setEditAssignedTo(sar.assignedTo ?? '');
    setExtendDeadline(false);
    setExtendReason('');
    setActionError(null);
    setActionSuccess(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/sar/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: editStatus !== selected.status ? editStatus : undefined,
          adminNotes: editAdminNotes,
          rejectionReason: editRejectionReason,
          identityVerified: editIdentityVerified,
          identityNotes: editIdentityNotes,
          assignedTo: editAssignedTo,
          extendDeadline: extendDeadline || undefined,
          deadlineExtendReason: extendReason || undefined,
        }),
      });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (data.success) {
        setActionSuccess(data.message ?? 'Request updated.');
        void loadRequests();
        // Refresh selected
        const updated = { ...selected, status: editStatus, adminNotes: editAdminNotes, rejectionReason: editRejectionReason, identityVerified: editIdentityVerified, identityNotes: editIdentityNotes, assignedTo: editAssignedTo };
        setSelected(updated);
      } else {
        setActionError(data.error ?? 'Failed to save.');
      }
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateExport = async () => {
    if (!selected) return;
    setGenerating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/sar/${selected.id}/generate-export`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      const data = await res.json() as { success: boolean; message?: string; fileSizeKb?: number; tokenExpiresAt?: string; error?: string };
      if (data.success) {
        setActionSuccess(`${data.message ?? 'Export generated.'} File size: ${data.fileSizeKb ?? '?'}KB. Download token valid for 72 hours.`);
        void loadRequests();
        // Update selected status
        setSelected(s => s ? { ...s, status: 'ready', exportGeneratedAt: new Date().toISOString() } : s);
        setEditStatus('ready');
      } else {
        setActionError(data.error ?? 'Export generation failed.');
      }
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAdminDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/sar/${selected.id}/download`, { credentials: 'include' });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SAR-Export-${selected.uuid.slice(0, 8).toUpperCase()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json() as { error?: string };
        setActionError(err.error ?? 'Download failed.');
      }
    } catch {
      setActionError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>GDPR / SAR Requests — Admin Portal</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AdminLayout>
        <div className={`min-h-screen ${adminCls.pageBg} p-6`}>
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${adminCls.text} flex items-center gap-2`}>
                  <Shield className="w-6 h-6 text-blue-500" aria-hidden="true" />
                  GDPR / Subject Access Requests
                </h1>
                <p className={`text-sm ${adminCls.muted} mt-1`}>
                  Manage UK GDPR data rights requests. All actions are audit-logged.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadRequests()}
                disabled={loading}
                className={`gap-2 ${adminCls.outlineBtn}`}
                aria-label="Refresh requests"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            </div>

            {/* Summary stats */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'Total',      value: summary.total,      color: 'text-gray-600 dark:text-slate-300' },
                  { label: 'Submitted',  value: summary.submitted,  color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'In Review',  value: summary.in_review,  color: 'text-purple-600 dark:text-purple-400' },
                  { label: 'Processing', value: summary.processing, color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Ready',      value: summary.ready,      color: 'text-green-600 dark:text-green-400' },
                  { label: 'Completed',  value: summary.completed,  color: 'text-green-600 dark:text-green-400' },
                  { label: 'Overdue',    value: summary.overdue,    color: 'text-red-600 dark:text-red-400' },
                  { label: 'Urgent',     value: summary.urgent,     color: 'text-orange-600 dark:text-orange-400' },
                ].map(stat => (
                  <Card key={stat.label} className={`${adminCls.card} border`}>
                    <CardContent className="p-3 text-center">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className={`text-[10px] ${adminCls.muted} mt-0.5`}>{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Overdue / urgent alerts */}
            {summary && summary.overdue > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    {summary.overdue} overdue request{summary.overdue !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    UK GDPR requires responses within 30 days. Overdue requests must be processed immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <Card className={`${adminCls.card} border`}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>Search</label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${adminCls.muted}`} aria-hidden="true" />
                      <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Email, name, or reference…"
                        className={`pl-9 text-sm ${adminCls.input}`}
                        aria-label="Search requests"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className={`text-sm ${adminCls.input}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={adminCls.selectContent}>
                        {STATUS_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value} className={adminCls.selectItem}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>Request Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className={`text-sm ${adminCls.input}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={adminCls.selectContent}>
                        {TYPE_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value} className={adminCls.selectItem}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="overdue-filter"
                      checked={overdueOnly}
                      onCheckedChange={setOverdueOnly}
                      aria-label="Show overdue only"
                    />
                    <Label htmlFor="overdue-filter" className={`text-sm ${adminCls.text} cursor-pointer`}>
                      Overdue only
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request table */}
            <Card className={`${adminCls.card} border`}>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12" aria-live="polite">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" aria-hidden="true" />
                    <span className={`ml-2 text-sm ${adminCls.muted}`}>Loading requests…</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-3 p-6 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <p className="text-sm">{error}</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className={`w-10 h-10 ${adminCls.muted} mx-auto mb-3`} aria-hidden="true" />
                    <p className={`text-sm ${adminCls.muted}`}>No requests found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" role="table" aria-label="SAR requests">
                      <thead>
                        <tr className={`border-b ${adminCls.tableHead}`}>
                          <th className="text-left px-4 py-3 font-medium text-xs">Reference</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Customer</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Type</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Deadline</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Identity</th>
                          <th className="text-left px-4 py-3 font-medium text-xs">Submitted</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(sar => {
                          const badge = STATUS_BADGE[sar.status] ?? STATUS_BADGE.submitted;
                          const deadlineRaw = sar.deadlineExtendedAt ?? sar.deadlineAt;
                          const deadline = deadlineRaw instanceof Date ? deadlineRaw.toISOString() : String(deadlineRaw ?? new Date().toISOString());
                          return (
                            <tr
                              key={sar.id}
                              className={`border-b ${adminCls.divider} ${adminCls.rowHover} cursor-pointer`}
                              onClick={() => openRequest(sar)}
                              role="row"
                              aria-label={`SAR request from ${sar.email}`}
                            >
                              <td className="px-4 py-3">
                                <span className={`font-mono text-xs ${adminCls.muted}`}>
                                  {sar.uuid.slice(0, 8).toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className={`font-medium text-xs ${adminCls.text}`}>{sar.fullName}</p>
                                <p className={`text-[10px] ${adminCls.muted}`}>{sar.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs ${adminCls.muted}`}>
                                  {TYPE_OPTIONS.find(t => t.value === sar.requestType)?.label ?? sar.requestType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${badge.cls}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs ${sar.isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : sar.isUrgent ? 'text-amber-600 dark:text-amber-400' : adminCls.muted}`}>
                                  {new Date(deadline).toLocaleDateString('en-GB')}
                                  {!TERMINAL.includes(sar.status) && (
                                    <span className="block text-[10px]">
                                      {sar.isOverdue ? `${Math.abs(sar.daysRemaining)}d overdue` : `${sar.daysRemaining}d left`}
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {sar.identityVerified
                                  ? <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400"><UserCheck className="w-3 h-3" aria-hidden="true" />Verified</span>
                                  : <span className={`text-[10px] ${adminCls.muted}`}>Pending</span>
                                }
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] ${adminCls.muted}`}>{formatDistanceToNow(sar.createdAt instanceof Date ? sar.createdAt.toISOString() : sar.createdAt)} ago</span>
                              </td>
                              <td className="px-4 py-3">
                                <ChevronRight className={`w-4 h-4 ${adminCls.muted}`} aria-hidden="true" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </AdminLayout>

      {/* Request detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto ${adminCls.dialog}`}>
          {selected && (
            <SarDetailPanel
              sar={selected}
              editStatus={editStatus}
              setEditStatus={setEditStatus}
              editAdminNotes={editAdminNotes}
              setEditAdminNotes={setEditAdminNotes}
              editRejectionReason={editRejectionReason}
              setEditRejectionReason={setEditRejectionReason}
              editIdentityVerified={editIdentityVerified}
              setEditIdentityVerified={setEditIdentityVerified}
              editIdentityNotes={editIdentityNotes}
              setEditIdentityNotes={setEditIdentityNotes}
              editAssignedTo={editAssignedTo}
              setEditAssignedTo={setEditAssignedTo}
              extendDeadline={extendDeadline}
              setExtendDeadline={setExtendDeadline}
              extendReason={extendReason}
              setExtendReason={setExtendReason}
              saving={saving}
              generating={generating}
              downloading={downloading}
              actionError={actionError}
              actionSuccess={actionSuccess}
              onSave={() => void handleSave()}
              onGenerateExport={() => void handleGenerateExport()}
              onAdminDownload={() => void handleAdminDownload()}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  sar: SarRequest;
  editStatus: string;
  setEditStatus: (v: string) => void;
  editAdminNotes: string;
  setEditAdminNotes: (v: string) => void;
  editRejectionReason: string;
  setEditRejectionReason: (v: string) => void;
  editIdentityVerified: boolean;
  setEditIdentityVerified: (v: boolean) => void;
  editIdentityNotes: string;
  setEditIdentityNotes: (v: string) => void;
  editAssignedTo: string;
  setEditAssignedTo: (v: string) => void;
  extendDeadline: boolean;
  setExtendDeadline: (v: boolean) => void;
  extendReason: string;
  setExtendReason: (v: string) => void;
  saving: boolean;
  generating: boolean;
  downloading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
  onSave: () => void;
  onGenerateExport: () => void;
  onAdminDownload: () => void;
}

function SarDetailPanel({
  sar, editStatus, setEditStatus, editAdminNotes, setEditAdminNotes,
  editRejectionReason, setEditRejectionReason, editIdentityVerified, setEditIdentityVerified,
  editIdentityNotes, setEditIdentityNotes, editAssignedTo, setEditAssignedTo,
  extendDeadline, setExtendDeadline, extendReason, setExtendReason,
  saving, generating, downloading, actionError, actionSuccess,
  onSave, onGenerateExport, onAdminDownload,
}: DetailPanelProps) {
  // Defensive: ensure all date fields are strings before passing to date helpers
  const safeDate = (v: unknown): string | null => {
    if (!v) return null;
    if (typeof v === 'string') return v;
    if (v instanceof Date) return v.toISOString();
    return String(v);
  };

  const deadline = safeDate(sar.deadlineExtendedAt ?? sar.deadlineAt) ?? new Date().toISOString();
  const daysRemaining = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && !TERMINAL.includes(sar.status);
  const typeLabel = TYPE_OPTIONS.find(t => t.value === sar.requestType)?.label ?? sar.requestType;
  const badge = STATUS_BADGE[sar.status] ?? STATUS_BADGE.submitted;

  return (
    <>
      <DialogHeader>
        <DialogTitle className={`text-base font-semibold ${adminCls.text} pr-8`}>
          {typeLabel}
        </DialogTitle>
        <DialogDescription className={`text-xs ${adminCls.muted}`}>
          Ref: <strong>{(sar.uuid ?? '').slice(0, 8).toUpperCase()}</strong> · {sar.email} · Submitted {formatDistanceToNow(safeDate(sar.createdAt))} ago
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-2">

        {/* Feedback */}
        {actionSuccess && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-green-700 dark:text-green-300">{actionSuccess}</p>
          </div>
        )}
        {actionError && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-red-700 dark:text-red-300">{actionError}</p>
          </div>
        )}

        {/* Customer info */}
        <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg border ${adminCls.rowBg} ${adminCls.divider}`}>
          <div>
            <p className={`text-[10px] ${adminCls.muted} mb-0.5`}>Customer</p>
            <p className={`text-xs font-medium ${adminCls.text}`}>{sar.fullName}</p>
            <p className={`text-[10px] ${adminCls.muted}`}>{sar.email}</p>
          </div>
          <div>
            <p className={`text-[10px] ${adminCls.muted} mb-0.5`}>UK GDPR Deadline</p>
            <p className={`text-xs font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : adminCls.text}`}>
              {new Date(deadline).toLocaleDateString('en-GB')}
            </p>
            {!TERMINAL.includes(sar.status) && (
              <p className={`text-[10px] ${isOverdue ? 'text-red-600 dark:text-red-400' : adminCls.muted}`}>
                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
              </p>
            )}
          </div>
        </div>

        {/* Customer notes */}
        {sar.notes && (
          <div className={`p-3 rounded-lg border ${adminCls.rowBg} ${adminCls.divider}`}>
            <p className={`text-[10px] font-medium ${adminCls.muted} mb-1`}>Customer Notes</p>
            <p className={`text-xs ${adminCls.text} whitespace-pre-wrap`}>{sar.notes}</p>
          </div>
        )}

        {/* Identity verification */}
        <div className={`p-3 rounded-lg border ${adminCls.divider} ${editIdentityVerified ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' : adminCls.rowBg}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-semibold ${adminCls.text} flex items-center gap-1.5`}>
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Identity Verification
            </p>
            <div className="flex items-center gap-2">
              <Switch
                id="identity-verified"
                checked={editIdentityVerified}
                onCheckedChange={setEditIdentityVerified}
                aria-label="Mark identity as verified"
              />
              <Label htmlFor="identity-verified" className={`text-xs ${adminCls.text} cursor-pointer`}>
                {editIdentityVerified ? 'Verified' : 'Not verified'}
              </Label>
            </div>
          </div>
          {sar.identityVerifiedBy && (
            <p className={`text-[10px] ${adminCls.muted} mb-2`}>
              Verified by {sar.identityVerifiedBy} on {sar.identityVerifiedAt ? new Date(sar.identityVerifiedAt instanceof Date ? sar.identityVerifiedAt.toISOString() : sar.identityVerifiedAt).toLocaleDateString('en-GB') : '?'}
            </p>
          )}
          <Textarea
            value={editIdentityNotes}
            onChange={e => setEditIdentityNotes(e.target.value)}
            placeholder="Identity verification notes (e.g. verified via email confirmation, photo ID checked)…"
            rows={2}
            className={`text-xs resize-none ${adminCls.input}`}
            aria-label="Identity verification notes"
          />
        </div>

        {/* Status + assignment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>Status</Label>
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className={`text-sm ${adminCls.input}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={adminCls.selectContent}>
                {STATUS_OPTIONS.filter(o => o.value !== 'all').map(o => (
                  <SelectItem key={o.value} value={o.value} className={adminCls.selectItem}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>Assigned To</Label>
            <Input
              value={editAssignedTo}
              onChange={e => setEditAssignedTo(e.target.value)}
              placeholder="Admin email or name…"
              className={`text-sm ${adminCls.input}`}
              aria-label="Assign to admin"
            />
          </div>
        </div>

        {/* Rejection reason (shown when rejecting) */}
        {(editStatus === 'rejected' || editStatus === 'unable_to_complete') && (
          <div>
            <Label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>
              Reason <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Textarea
              value={editRejectionReason}
              onChange={e => setEditRejectionReason(e.target.value)}
              placeholder="Explain why this request is being rejected or cannot be completed. This will be visible to the customer."
              rows={3}
              className={`text-xs resize-none ${adminCls.input}`}
              aria-label="Rejection reason"
            />
          </div>
        )}

        {/* Admin notes */}
        <div>
          <Label className={`text-xs font-medium ${adminCls.muted} mb-1 block`}>
            Admin Notes <span className={`font-normal ${adminCls.muted}`}>(visible to customer)</span>
          </Label>
          <Textarea
            value={editAdminNotes}
            onChange={e => setEditAdminNotes(e.target.value)}
            placeholder="Any notes or messages for the customer…"
            rows={3}
            className={`text-xs resize-none ${adminCls.input}`}
            aria-label="Admin notes for customer"
          />
        </div>

        {/* Deadline extension */}
        <div className={`p-3 rounded-lg border ${adminCls.divider} ${adminCls.rowBg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Switch
              id="extend-deadline"
              checked={extendDeadline}
              onCheckedChange={setExtendDeadline}
              aria-label="Extend deadline by 2 months"
            />
            <Label htmlFor="extend-deadline" className={`text-xs ${adminCls.text} cursor-pointer`}>
              Extend deadline by 2 months (complex request — UK GDPR Article 12(3))
            </Label>
          </div>
          {extendDeadline && (
            <Input
              value={extendReason}
              onChange={e => setExtendReason(e.target.value)}
              placeholder="Reason for extension…"
              className={`text-xs ${adminCls.input}`}
              aria-label="Deadline extension reason"
            />
          )}
        </div>

        {/* Export section */}
        <div className={`p-4 rounded-lg border ${adminCls.divider} ${adminCls.rowBg}`}>
          <p className={`text-xs font-semibold ${adminCls.text} flex items-center gap-1.5 mb-3`}>
            <Package className="w-3.5 h-3.5" aria-hidden="true" />
            Data Export Package
          </p>

          {sar.exportGeneratedAt ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                <div>
                  <p className={`text-xs font-medium ${adminCls.text}`}>Export generated</p>
                  <p className={`text-[10px] ${adminCls.muted}`}>
                    By {sar.exportGeneratedBy ?? '?'} · {formatDistanceToNow(safeDate(sar.exportGeneratedAt))} ago
                    {sar.exportFileSizeBytes && ` · ${Math.round(sar.exportFileSizeBytes / 1024)}KB`}
                    {sar.downloadCount > 0 && ` · Downloaded ${sar.downloadCount}×`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGenerateExport}
                  disabled={generating}
                  className={`gap-2 text-xs ${adminCls.outlineBtn}`}
                  aria-label="Regenerate export"
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={onAdminDownload}
                  disabled={downloading}
                  className="gap-2 text-xs"
                  aria-label="Download export as admin"
                >
                  {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Download className="w-3.5 h-3.5" aria-hidden="true" />}
                  {downloading ? 'Downloading…' : 'Download Export'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-xs ${adminCls.muted}`}>
                No export generated yet. Generate a complete data export ZIP containing all customer data.
                The customer will receive a secure download link valid for 72 hours.
              </p>
              <Button
                size="sm"
                onClick={onGenerateExport}
                disabled={generating || TERMINAL.includes(sar.status)}
                className="gap-2 text-xs"
                aria-label="Generate data export"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Package className="w-3.5 h-3.5" aria-hidden="true" />}
                {generating ? 'Generating…' : 'Generate Data Export'}
              </Button>
              {TERMINAL.includes(sar.status) && (
                <p className={`text-[10px] ${adminCls.muted}`}>Cannot generate export for a completed/rejected request.</p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={saving}
            className={`gap-2 ${adminCls.outlineBtn}`}
            aria-label="Save changes"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>

        {/* Audit note */}
        <p className={`text-[10px] ${adminCls.muted} text-center`}>
          All actions are audit-logged with your admin identity and timestamp.
        </p>
      </div>
    </>
  );
}
