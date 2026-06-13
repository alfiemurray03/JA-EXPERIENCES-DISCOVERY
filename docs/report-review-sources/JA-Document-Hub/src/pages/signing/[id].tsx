import { useState, useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, RefreshCw, Send, Bell, XCircle, Download,
  FileText, Users, Clock, CheckCircle2, AlertTriangle,
  Eye, Shield, ChevronDown, ChevronUp, Paperclip, Package,
  Trash2, Upload,
} from 'lucide-react';
import type { SigningRequest, SigningSigner, SigningAuditEntry, SigningAttachment } from '@/lib/signing-types';
import { STATUS_LABELS, STATUS_COLORS, SIGNER_STATUS_COLORS, AUDIT_EVENT_LABELS } from '@/lib/signing-types';

export default function SigningRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<SigningRequest | null>(null);
  const [signers, setSigners] = useState<SigningSigner[]>([]);
  const [audit, setAudit] = useState<SigningAuditEntry[]>([]);
  const [attachments, setAttachments] = useState<SigningAttachment[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const attachFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/signing/requests/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setRequest(data.request);
        setSigners(data.signers);
        setAudit(data.audit);
        setAttachments(data.attachments ?? []);
      } else {
        setError(data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function handleRemind(signerUuid?: string) {
    setActionLoading('remind'); setError(''); setSuccess('');
    const res = await fetch(`/api/signing/requests/${id}/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(signerUuid ? { signerIds: [signerUuid] } : {}),
    });
    const data = await res.json();
    setActionLoading('');
    if (data.success) { setSuccess(`Reminder sent to ${data.sent?.length ?? 0} signer(s).`); load(); }
    else setError(data.error);
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this signing request? This cannot be undone.')) return;
    setActionLoading('cancel'); setError(''); setSuccess('');
    const res = await fetch(`/api/signing/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'cancel' }),
    });
    const data = await res.json();
    setActionLoading('');
    if (data.success) { setSuccess('Request cancelled.'); load(); }
    else setError(data.error);
  }

  async function handleAttachmentUpload(file: File) {
    setUploadingAttachment(true); setError(''); setSuccess('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`/api/signing/requests/${id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, data: base64, visibleToSigners: true, appendToFinalPack: false }),
      });
      const data = await res.json();
      if (data.success) { setSuccess('Attachment uploaded.'); load(); }
      else setError(data.error);
    } catch { setError('Failed to upload attachment.'); }
    finally { setUploadingAttachment(false); }
  }

  async function handleAttachmentDelete(attachmentUuid: string) {
    if (!confirm('Delete this attachment?')) return;
    const res = await fetch(`/api/signing/requests/${id}/attachments/${attachmentUuid}`, {
      method: 'DELETE', credentials: 'include',
    });
    const data = await res.json();
    if (data.success) { setSuccess('Attachment deleted.'); load(); }
    else setError(data.error);
  }

  async function handleAttachmentToggle(attachmentUuid: string, field: 'visibleToSigners' | 'appendToFinalPack', value: boolean) {
    const res = await fetch(`/api/signing/requests/${id}/attachments/${attachmentUuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();
    if (data.success) load();
    else setError(data.error);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-24"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
    </DashboardLayout>
  );

  if (!request) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-foreground mb-2">Request Not Found</h1>
        <p className="text-muted-foreground mb-4">{error || 'This signing request could not be found.'}</p>
        <Button variant="outline" onClick={() => navigate('/signing')}>Back to Dashboard</Button>
      </div>
    </DashboardLayout>
  );

  const isActive = ['sent', 'viewed', 'partially_signed'].includes(request.status);
  const isCompleted = request.status === 'completed';
  const isDraft = request.status === 'draft';

  return (
    <DashboardLayout>
      <Helmet><title>{request.title} — Document Signing</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/signing')} className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground truncate">{request.title}</h1>
              <Badge className={`${STATUS_COLORS[request.status]} text-xs`}>{STATUS_LABELS[request.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(request.createdAt).toLocaleDateString('en-GB')}
              {request.expiresAt && ` · Expires ${new Date(request.expiresAt).toLocaleDateString('en-GB')}`}
              {request.completedAt && ` · Completed ${new Date(request.completedAt).toLocaleDateString('en-GB')}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isActive && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleRemind()} disabled={!!actionLoading} className="gap-1">
                  {actionLoading === 'remind' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                  Send Reminder
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={!!actionLoading} className="gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  {actionLoading === 'cancel' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                  Cancel
                </Button>
              </>
            )}
            {isDraft && (
              <Button size="sm" onClick={() => navigate(`/signing/new`)} className="gap-1">
                <Send className="w-3 h-3" /> Continue Setup
              </Button>
            )}
            {isCompleted && (
              <>
                <Button variant="outline" size="sm" onClick={() => window.open(`/api/signing/requests/${id}/certificate`, '_blank')} className="gap-1">
                  <Download className="w-3 h-3" /> Audit Certificate
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/api/signing/requests/${id}/pack`, '_blank')} className="gap-1">
                  <Package className="w-3 h-3" /> Download Pack
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Feedback */}
        {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
        {success && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Document info */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-primary" /> Document</h2>
              {request.documentName ? (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{request.documentName}</div>
                    {request.documentHash && <div className="text-[10px] text-muted-foreground font-mono truncate">SHA-256: {request.documentHash}</div>}
                  </div>
                  {request.documentPath && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/airo-assets/uploads/${request.documentPath}`, '_blank')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No document uploaded.</p>
              )}
              {request.message && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  <strong>Message to signers:</strong> {request.message}
                </div>
              )}
            </div>

            {/* Signers */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" /> Signers ({signers.length})
              </h2>
              {signers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No signers added.</p>
              ) : (
                <div className="space-y-2">
                  {signers.map((s, i) => (
                    <div key={s.uuid} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}{s.role && ` · ${s.role}`}</div>
                        {s.signedAt && <div className="text-xs text-green-600 mt-0.5">Signed {new Date(s.signedAt).toLocaleString('en-GB')}</div>}
                        {s.declinedAt && <div className="text-xs text-red-600 mt-0.5">Declined {new Date(s.declinedAt).toLocaleString('en-GB')}{s.declineReason && `: ${s.declineReason}`}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] ${SIGNER_STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                        {isActive && s.status !== 'signed' && s.status !== 'declined' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemind(s.uuid)} disabled={!!actionLoading} className="h-7 text-xs gap-1">
                            <Bell className="w-3 h-3" /> Remind
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-primary" /> Attachments ({attachments.length})
                </h2>
                {!isCompleted && request.status !== 'cancelled' && (
                  <>
                    <input
                      ref={attachFileRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAttachmentUpload(f); e.target.value = ''; }}
                    />
                    <Button variant="outline" size="sm" onClick={() => attachFileRef.current?.click()} disabled={uploadingAttachment} className="gap-1">
                      {uploadingAttachment ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      Add Attachment
                    </Button>
                  </>
                )}
              </div>
              {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attachments added.</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.uuid} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{att.originalName}</div>
                        <div className="text-xs text-muted-foreground">{(att.fileSize / 1024).toFixed(1)} KB · {att.mimeType}</div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <Switch
                              checked={att.visibleToSigners}
                              onCheckedChange={v => handleAttachmentToggle(att.uuid, 'visibleToSigners', v)}
                              className="scale-75"
                            />
                            Visible to signers
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <Switch
                              checked={att.appendToFinalPack}
                              onCheckedChange={v => handleAttachmentToggle(att.uuid, 'appendToFinalPack', v)}
                              className="scale-75"
                            />
                            Include in final pack
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/airo-assets/uploads/${att.filePath}`, '_blank')} className="h-7 w-7 p-0">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!isCompleted && (
                          <Button variant="ghost" size="sm" onClick={() => handleAttachmentDelete(att.uuid)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-primary" /> Progress</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Signers</span><span className="font-medium">{signers.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Signed</span><span className="font-medium text-green-600">{signers.filter(s => s.status === 'signed').length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-medium text-amber-600">{signers.filter(s => ['pending', 'sent', 'viewed'].includes(s.status)).length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Declined</span><span className="font-medium text-red-600">{signers.filter(s => s.status === 'declined').length}</span></div>
              </div>
              {signers.length > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(signers.filter(s => s.status === 'signed').length / signers.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {signers.filter(s => s.status === 'signed').length}/{signers.length} signed
                  </p>
                </div>
              )}
            </div>

            {/* Signing order */}
            <div className="bg-card border border-border rounded-xl p-4 text-sm">
              <div className="flex justify-between mb-1"><span className="text-muted-foreground">Signing order</span><span className="font-medium capitalize">{request.signerOrder}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reminder</span><span className="font-medium">{request.reminderDays ?? 3} days before expiry</span></div>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAudit(v => !v)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
          >
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Audit Trail ({audit.length} events)
            </h2>
            {showAudit ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showAudit && (
            <div className="border-t border-border divide-y divide-border">
              {audit.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No audit events yet.</p>
              ) : (
                audit.map(entry => (
                  <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{AUDIT_EVENT_LABELS[entry.event] ?? entry.event}</span>
                        {entry.signerEmail && <span className="text-xs text-muted-foreground">{entry.signerEmail}</span>}
                      </div>
                      {entry.detail && <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                        <span>{new Date(entry.createdAt).toLocaleString('en-GB')}</span>
                        {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                        {entry.authMethod && <span>Auth: {entry.authMethod}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
