/**
 * Admin — Affiliate Programme Management
 * View applications, approve/reject, set commission rates, track payouts.
 */
import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, DollarSign, Percent, Banknote,
  ChevronDown, ChevronUp, Search, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/lib/admin-auth';

interface AffiliateApp {
  id: number;
  name: string;
  email: string;
  website: string | null;
  audience: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  commission_rate: number;
  affiliate_code: string | null;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  total_referrals: number;
  total_commission: number | null;
  paid_commission: number | null;
}

interface Commission {
  id: number;
  affiliate_name: string;
  affiliate_email: string;
  affiliate_code: string;
  plan_name: string;
  amount_gbp: number;
  commission_gbp: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at: string | null;
}

export default function AdminAffiliates() {
  useAdminAuth();
  const [apps, setApps] = useState<AffiliateApp[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; app: AffiliateApp | null }>({ open: false, app: null });
  const [commissionRate, setCommissionRate] = useState('10');
  const [approving, setApproving] = useState(false);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; app: AffiliateApp | null }>({ open: false, app: null });
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Edit commission dialog
  const [editDialog, setEditDialog] = useState<{ open: boolean; app: AffiliateApp | null }>({ open: false, app: null });
  const [editRate, setEditRate] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/affiliates', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/affiliate-commissions', { credentials: 'include' }).then(r => r.json()),
    ]).then(([appsData, commsData]) => {
      if (appsData.success) setApps(appsData.data);
      if (commsData.success) setCommissions(commsData.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter(a => a.status === 'pending');
  const approved = filtered.filter(a => a.status === 'approved');
  const rejected = filtered.filter(a => a.status === 'rejected');

  const handleApprove = async () => {
    if (!approveDialog.app) return;
    setApproving(true);
    const res = await fetch(`/api/admin/affiliates/${approveDialog.app.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ commission_rate: parseFloat(commissionRate) }),
    });
    const data = await res.json();
    if (data.success) {
      setApps(prev => prev.map(a => a.id === approveDialog.app!.id ? { ...a, ...data.data } : a));
      setApproveDialog({ open: false, app: null });
    }
    setApproving(false);
  };

  const handleReject = async () => {
    if (!rejectDialog.app) return;
    setRejecting(true);
    await fetch(`/api/admin/affiliates/${rejectDialog.app.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: rejectReason }),
    });
    setApps(prev => prev.map(a => a.id === rejectDialog.app!.id ? { ...a, status: 'rejected', rejection_reason: rejectReason } : a));
    setRejectDialog({ open: false, app: null });
    setRejecting(false);
  };

  const handleEditRate = async () => {
    if (!editDialog.app) return;
    setEditSaving(true);
    await fetch(`/api/admin/affiliates/${editDialog.app.id}/commission`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ commission_rate: parseFloat(editRate) }),
    });
    setApps(prev => prev.map(a => a.id === editDialog.app!.id ? { ...a, commission_rate: parseFloat(editRate) } : a));
    setEditDialog({ open: false, app: null });
    setEditSaving(false);
  };

  const markPaid = async (commissionId: number) => {
    await fetch(`/api/admin/affiliate-commissions/${commissionId}/paid`, {
      method: 'PATCH', credentials: 'include',
    });
    setCommissions(prev => prev.map(c => c.id === commissionId ? { ...c, status: 'paid', paid_at: new Date().toISOString() } : c));
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1 text-xs"><CheckCircle2 className="w-3 h-3" />Approved</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 gap-1 text-xs"><XCircle className="w-3 h-3" />Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 text-xs"><Clock className="w-3 h-3" />Pending</Badge>;
  };

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.commission_gbp, 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.commission_gbp, 0);

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliate Programme</h1>
          <p className="text-muted-foreground mt-1">
            {apps.length} applications · {approved.length} active affiliates
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="border-border gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending Review', value: pending.length, icon: Clock, color: 'text-amber-400' },
          { label: 'Active Affiliates', value: approved.length, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Pending Payout', value: `£${totalPending.toFixed(2)}`, icon: Banknote, color: 'text-amber-400' },
          { label: 'Total Paid Out', value: `£${totalPaid.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="bg-muted border border-border mb-6">
          <TabsTrigger value="applications">Applications {pending.length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>}</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        {/* ── Applications tab ── */}
        <TabsContent value="applications">
          <div className="flex justify-end mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search affiliates…"
                className="pl-9 bg-background border-border w-64" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">No affiliate applications yet.</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...pending, ...approved, ...rejected].map(app => (
                <Card key={app.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-foreground">{app.name}</p>
                          {statusBadge(app.status)}
                          {app.status === 'approved' && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                              <Percent className="w-3 h-3" />{app.commission_rate}% commission
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        {app.website && <p className="text-xs text-muted-foreground mt-0.5">{app.website}</p>}
                        {app.affiliate_code && (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">Code: {app.affiliate_code}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied {new Date(app.created_at).toLocaleDateString('en-GB')}
                          {app.total_referrals > 0 && ` · ${app.total_referrals} referrals · £${(app.total_commission ?? 0).toFixed(2)} earned`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1"
                              onClick={() => { setApproveDialog({ open: true, app }); setCommissionRate('10'); }}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                              onClick={() => { setRejectDialog({ open: true, app }); setRejectReason(''); }}>
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <Button size="sm" variant="outline" className="border-border gap-1"
                            onClick={() => { setEditDialog({ open: true, app }); setEditRate(String(app.commission_rate)); }}>
                            <Percent className="w-3.5 h-3.5" /> Edit Rate
                          </Button>
                        )}
                        <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                          {expanded === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expanded === app.id && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                        {app.audience && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Audience</p>
                            <p className="text-sm text-foreground">{app.audience}</p>
                          </div>
                        )}
                        {app.message && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">How they plan to promote</p>
                            <p className="text-sm text-foreground">{app.message}</p>
                          </div>
                        )}
                        {app.rejection_reason && (
                          <div>
                            <p className="text-xs font-medium text-red-400 mb-0.5">Rejection reason</p>
                            <p className="text-sm text-muted-foreground">{app.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Commissions tab ── */}
        <TabsContent value="commissions">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Commission Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {commissions.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">No commissions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Affiliate</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Plan</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Sale</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Commission</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Date</th>
                        <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map(c => (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{c.affiliate_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{c.affiliate_code}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{c.plan_name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">£{c.amount_gbp.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-400">£{c.commission_gbp.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            {c.status === 'paid'
                              ? <Badge className="bg-green-500/10 text-green-400 border-0 text-xs">Paid</Badge>
                              : <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">Pending</Badge>}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {c.status === 'pending' && (
                              <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7"
                                onClick={() => markPaid(c.id)}>
                                Mark Paid
                              </Button>
                            )}
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
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={open => !open && setApproveDialog({ open: false, app: null })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" /> Approve Affiliate
            </DialogTitle>
            <DialogDescription>
              Approve <strong>{approveDialog.app?.name}</strong> and set their commission rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Commission Rate (%)</Label>
              <Input type="number" min="1" max="100" value={commissionRate}
                onChange={e => setCommissionRate(e.target.value)}
                className="bg-background border-border" />
              <p className="text-xs text-muted-foreground">
                The affiliate earns this % of each subscription payment they refer.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, app: null })} className="border-border">Cancel</Button>
            <Button onClick={handleApprove} disabled={approving} className="bg-green-500 hover:bg-green-600 text-white">
              {approving ? 'Approving…' : 'Approve & Send Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => !open && setRejectDialog({ open: false, app: null })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" /> Reject Application
            </DialogTitle>
            <DialogDescription>
              Reject <strong>{rejectDialog.app?.name}</strong>'s affiliate application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Reason (shown to applicant)</Label>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="bg-background border-border resize-none" rows={3}
                placeholder="e.g. We're not accepting new affiliates at this time." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, app: null })} className="border-border">Cancel</Button>
            <Button onClick={handleReject} disabled={rejecting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {rejecting ? 'Rejecting…' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission Rate Dialog */}
      <Dialog open={editDialog.open} onOpenChange={open => !open && setEditDialog({ open: false, app: null })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Commission Rate</DialogTitle>
            <DialogDescription>Update commission rate for <strong>{editDialog.app?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Commission Rate (%)</Label>
              <Input type="number" min="1" max="100" value={editRate}
                onChange={e => setEditRate(e.target.value)}
                className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, app: null })} className="border-border">Cancel</Button>
            <Button onClick={handleEditRate} disabled={editSaving} className="bg-primary">
              {editSaving ? 'Saving…' : 'Save Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
