import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Building2, Search, CheckCircle2, XCircle, PauseCircle, PlayCircle,
  PoundSterling, Users, Megaphone, BookOpen, LifeBuoy, Plus, Loader2,
  ChevronDown, ChevronUp, UserPlus,
} from 'lucide-react';

function pence(p: number) { return `£${(p / 100).toFixed(2)}`; }

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-slate-100 text-slate-700 border-slate-200',
};

const COMM_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  on_hold: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface Reseller {
  uuid: string; fullName: string; email: string; company: string | null;
  status: string; commissionRate: number; commissionType: string;
  customerCount: number; commissionPending: number; commissionApproved: number; commissionPaid: number;
  referralCode: string | null; createdAt: string; adminNotes: string | null;
}

interface Commission {
  commission: { uuid: string; type: string; plan: string | null; amountGbp: number; commissionGbp: number; status: string; paymentRef: string | null; createdAt: string };
  resellerName: string; resellerEmail: string;
}

interface Resource { uuid: string; title: string; description: string | null; category: string; fileUrl: string | null; externalUrl: string | null; fileType: string | null; isActive: boolean; }
interface Announcement { uuid: string; title: string; body: string; priority: string; isActive: boolean; createdAt: string; }

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionReseller, setActionReseller] = useState<Reseller | null>(null);
  const [actionType, setActionType] = useState<string>('');
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [commAction, setCommAction] = useState<{ uuid: string; action: string; paymentRef?: string } | null>(null);
  const [newResource, setNewResource] = useState<{ title: string; description: string; category: string; fileUrl: string; externalUrl: string; fileType: string } | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState<{ title: string; body: string; priority: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Create partner user dialog
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState<'reseller' | 'affiliate'>('reseller');
  const [createUserForm, setCreateUserForm] = useState({ fullName: '', email: '', company: '', phone: '' });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserMsg, setCreateUserMsg] = useState('');
  const [createUserError, setCreateUserError] = useState('');

  function loadAll() {
    Promise.all([
      fetch('/api/admin/resellers', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/resellers/commissions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/resellers/resources', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/resellers/announcements', { credentials: 'include' }).then(r => r.json()),
    ]).then(([r, c, res, ann]) => {
      if (r.success) setResellers(r.resellers);
      if (c.success) setCommissions(c.commissions);
      if (res.success) setResources(res.resources);
      if (ann.success) setAnnouncements(ann.announcements);
    }).catch(() => setError('Failed to load data.')).finally(() => setLoading(false));
  }

  useEffect(() => { loadAll(); }, []);

  async function doAction() {
    if (!actionReseller) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/resellers/${actionReseller.uuid}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, rejectionReason: actionNote, adminNotes: actionNote }),
      });
      setActionReseller(null); setActionNote('');
      loadAll();
    } finally { setActionLoading(false); }
  }

  async function doCommAction() {
    if (!commAction) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/resellers/commissions/${commAction.uuid}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: commAction.action, paymentRef: commAction.paymentRef }),
      });
      setCommAction(null);
      loadAll();
    } finally { setSaving(false); }
  }

  async function saveResource() {
    if (!newResource) return;
    setSaving(true);
    try {
      await fetch('/api/admin/resellers/resources', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource),
      });
      setNewResource(null); loadAll();
    } finally { setSaving(false); }
  }

  async function saveAnnouncement() {
    if (!newAnnouncement) return;
    setSaving(true);
    try {
      await fetch('/api/admin/resellers/announcements', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement),
      });
      setNewAnnouncement(null); loadAll();
    } finally { setSaving(false); }
  }

  async function createPartnerUser() {
    setCreateUserError('');
    setCreateUserMsg('');
    if (!createUserForm.fullName || !createUserForm.email) {
      setCreateUserError('Full name and email are required.');
      return;
    }
    setCreateUserLoading(true);
    try {
      const endpoint = createUserType === 'reseller' ? '/api/reseller/apply' : '/api/affiliate/apply';
      const res = await fetch(endpoint, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createUserForm,
          agreedToTerms: true,
          adminCreated: true,
          businessType: 'other',
          expectedVolume: 'unknown',
          howHeard: 'admin',
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setCreateUserMsg(`${createUserType === 'reseller' ? 'Reseller' : 'Affiliate'} account created and approval email sent to ${createUserForm.email}.`);
        setCreateUserForm({ fullName: '', email: '', company: '', phone: '' });
        loadAll();
      } else {
        setCreateUserError(data.error ?? 'Failed to create user.');
      }
    } catch {
      setCreateUserError('Network error. Please try again.');
    } finally {
      setCreateUserLoading(false);
    }
  }

  const filtered = resellers.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.company ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <Helmet><title>Resellers — Admin Portal</title></Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resellers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage reseller applications, commissions, and resources.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => { setCreateUserOpen(true); setCreateUserMsg(''); setCreateUserError(''); }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Partner User
            </Button>
            <Badge variant="secondary">{resellers.length} total</Badge>
          </div>
        </div>

        {/* Create Partner User Dialog */}
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Partner User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={createUserType === 'reseller' ? 'default' : 'outline'}
                  onClick={() => setCreateUserType('reseller')}
                  className="flex-1"
                >
                  Reseller
                </Button>
                <Button
                  size="sm"
                  variant={createUserType === 'affiliate' ? 'default' : 'outline'}
                  onClick={() => setCreateUserType('affiliate')}
                  className="flex-1"
                >
                  Affiliate
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cu-name">Full Name *</Label>
                <Input
                  id="cu-name"
                  value={createUserForm.fullName}
                  onChange={e => setCreateUserForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cu-email">Email Address *</Label>
                <Input
                  id="cu-email"
                  type="email"
                  value={createUserForm.email}
                  onChange={e => setCreateUserForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cu-company">Company</Label>
                <Input
                  id="cu-company"
                  value={createUserForm.company}
                  onChange={e => setCreateUserForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Acme Ltd"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cu-phone">Phone</Label>
                <Input
                  id="cu-phone"
                  value={createUserForm.phone}
                  onChange={e => setCreateUserForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+44 7700 000000"
                />
              </div>
              {createUserError && <Alert variant="destructive"><AlertDescription>{createUserError}</AlertDescription></Alert>}
              {createUserMsg && <Alert><AlertDescription className="text-green-700">{createUserMsg}</AlertDescription></Alert>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
              <Button onClick={createPartnerUser} disabled={createUserLoading}>
                {createUserLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Create {createUserType === 'reseller' ? 'Reseller' : 'Affiliate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        <Tabs defaultValue="resellers">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="resellers">Resellers ({resellers.length})</TabsTrigger>
            <TabsTrigger value="commissions">Commissions ({commissions.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
            <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
          </TabsList>

          {/* ── Resellers tab ── */}
          <TabsContent value="resellers" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search resellers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
                ) : !filtered.length ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No resellers found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Reseller</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Commission</th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground">Customers</th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground">Pending £</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Applied</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filtered.map(r => (
                          <tr key={r.uuid} className="hover:bg-muted/20">
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{r.fullName}</div>
                              <div className="text-xs text-muted-foreground">{r.email}</div>
                              {r.company && <div className="text-xs text-muted-foreground">{r.company}</div>}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`text-xs ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {r.commissionRate}{r.commissionType === 'percentage' ? '%' : 'p'}
                            </td>
                            <td className="py-3 px-4 text-right text-foreground">{r.customerCount}</td>
                            <td className="py-3 px-4 text-right text-amber-600 font-medium">{pence(r.commissionPending)}</td>
                            <td className="py-3 px-4 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1 flex-wrap">
                                {r.status === 'applied' && (
                                  <>
                                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => { setActionReseller(r); setActionType('approve'); }}>
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setActionReseller(r); setActionType('reject'); }}>
                                      <XCircle className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                  </>
                                )}
                                {r.status === 'approved' && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setActionReseller(r); setActionType('suspend'); }}>
                                    <PauseCircle className="w-3 h-3 mr-1" /> Suspend
                                  </Button>
                                )}
                                {r.status === 'suspended' && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setActionReseller(r); setActionType('reactivate'); }}>
                                    <PlayCircle className="w-3 h-3 mr-1" /> Reactivate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Commissions tab ── */}
          <TabsContent value="commissions" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Reseller</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Sale</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Commission</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commissions.map(({ commission: c, resellerName, resellerEmail }) => (
                        <tr key={c.uuid} className="hover:bg-muted/20">
                          <td className="py-3 px-4 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 px-4">
                            <div className="text-foreground font-medium">{resellerName}</div>
                            <div className="text-xs text-muted-foreground">{resellerEmail}</div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground capitalize">{c.type}</td>
                          <td className="py-3 px-4 text-right text-foreground">{pence(c.amountGbp)}</td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">{pence(c.commissionGbp)}</td>
                          <td className="py-3 px-4">
                            <Badge className={`text-xs ${COMM_STATUS_STYLES[c.status] ?? ''}`}>{c.status.replace('_', ' ')}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {c.status === 'pending' && (
                                <Button size="sm" className="h-7 text-xs" onClick={() => setCommAction({ uuid: c.uuid, action: 'approve' })}>Approve</Button>
                              )}
                              {c.status === 'approved' && (
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => setCommAction({ uuid: c.uuid, action: 'paid', paymentRef: '' })}>Mark Paid</Button>
                              )}
                              {(c.status === 'pending' || c.status === 'approved') && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCommAction({ uuid: c.uuid, action: 'on_hold' })}>Hold</Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Resources tab ── */}
          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setNewResource({ title: '', description: '', category: 'general', fileUrl: '', externalUrl: '', fileType: 'pdf' })}>
                <Plus className="w-4 h-4 mr-2" /> Add Resource
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => (
                <Card key={r.uuid} className={!r.isActive ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="font-medium text-foreground text-sm mb-1">{r.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">{r.category} · {r.fileType ?? 'link'}</div>
                    {r.description && <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{r.description}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                        await fetch(`/api/admin/resellers/resources/${r.uuid}`, {
                          method: 'PATCH', credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isActive: !r.isActive }),
                        });
                        loadAll();
                      }}>{r.isActive ? 'Deactivate' : 'Activate'}</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={async () => {
                        await fetch(`/api/admin/resellers/resources/${r.uuid}`, { method: 'DELETE', credentials: 'include' });
                        loadAll();
                      }}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Announcements tab ── */}
          <TabsContent value="announcements" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setNewAnnouncement({ title: '', body: '', priority: 'normal' })}>
                <Plus className="w-4 h-4 mr-2" /> New Announcement
              </Button>
            </div>
            <div className="space-y-3">
              {announcements.map(a => (
                <Card key={a.uuid} className={!a.isActive ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground text-sm">{a.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge className={a.priority === 'urgent' ? 'bg-red-100 text-red-700' : a.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                          {a.priority}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                          await fetch(`/api/admin/resellers/announcements/${a.uuid}`, {
                            method: 'PATCH', credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isActive: !a.isActive }),
                          });
                          loadAll();
                        }}>{a.isActive ? 'Deactivate' : 'Activate'}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action dialog */}
      <Dialog open={!!actionReseller} onOpenChange={v => { if (!v) setActionReseller(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Reseller</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {actionType === 'approve' ? `Approve ${actionReseller?.fullName} as a reseller? They will receive login credentials by email.` :
               actionType === 'reject' ? `Reject ${actionReseller?.fullName}'s application?` :
               actionType === 'suspend' ? `Suspend ${actionReseller?.fullName}'s account?` :
               `Reactivate ${actionReseller?.fullName}'s account?`}
            </p>
            {(actionType === 'reject' || actionType === 'suspend') && (
              <div className="space-y-1.5">
                <Label>{actionType === 'reject' ? 'Rejection reason (optional)' : 'Notes (optional)'}</Label>
                <Textarea value={actionNote} onChange={e => setActionNote(e.target.value)} rows={3} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionReseller(null)}>Cancel</Button>
            <Button onClick={doAction} disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission action dialog */}
      <Dialog open={!!commAction} onOpenChange={v => { if (!v) setCommAction(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="capitalize">{commAction?.action?.replace('_', ' ')} Commission</DialogTitle></DialogHeader>
          {commAction?.action === 'paid' && (
            <div className="space-y-1.5">
              <Label>Payment Reference (optional)</Label>
              <Input value={commAction.paymentRef ?? ''} onChange={e => setCommAction(c => c ? { ...c, paymentRef: e.target.value } : c)} placeholder="e.g. BACS-2026-001" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommAction(null)}>Cancel</Button>
            <Button onClick={doCommAction} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New resource dialog */}
      <Dialog open={!!newResource} onOpenChange={v => { if (!v) setNewResource(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={newResource?.title ?? ''} onChange={e => setNewResource(r => r ? { ...r, title: e.target.value } : r)} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={newResource?.description ?? ''} onChange={e => setNewResource(r => r ? { ...r, description: e.target.value } : r)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Category</Label><Input value={newResource?.category ?? ''} onChange={e => setNewResource(r => r ? { ...r, category: e.target.value } : r)} placeholder="marketing, brand, product…" /></div>
              <div className="space-y-1.5"><Label>File Type</Label><Input value={newResource?.fileType ?? ''} onChange={e => setNewResource(r => r ? { ...r, fileType: e.target.value } : r)} placeholder="pdf, docx, image, link" /></div>
            </div>
            <div className="space-y-1.5"><Label>File URL (download)</Label><Input value={newResource?.fileUrl ?? ''} onChange={e => setNewResource(r => r ? { ...r, fileUrl: e.target.value } : r)} /></div>
            <div className="space-y-1.5"><Label>External URL (link)</Label><Input value={newResource?.externalUrl ?? ''} onChange={e => setNewResource(r => r ? { ...r, externalUrl: e.target.value } : r)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewResource(null)}>Cancel</Button>
            <Button onClick={saveResource} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Resource'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New announcement dialog */}
      <Dialog open={!!newAnnouncement} onOpenChange={v => { if (!v) setNewAnnouncement(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={newAnnouncement?.title ?? ''} onChange={e => setNewAnnouncement(a => a ? { ...a, title: e.target.value } : a)} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={4} value={newAnnouncement?.body ?? ''} onChange={e => setNewAnnouncement(a => a ? { ...a, body: e.target.value } : a)} /></div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground" value={newAnnouncement?.priority ?? 'normal'} onChange={e => setNewAnnouncement(a => a ? { ...a, priority: e.target.value } : a)}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAnnouncement(null)}>Cancel</Button>
            <Button onClick={saveAnnouncement} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Announcement'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
