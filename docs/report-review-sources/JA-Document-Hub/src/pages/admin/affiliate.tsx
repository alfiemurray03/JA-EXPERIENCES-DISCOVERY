import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, TrendingUp, PoundSterling, CheckCircle2, XCircle,
  MoreHorizontal, RefreshCw, Search, Eye, AlertTriangle,
  Clock, ShieldOff, RotateCcw, Edit2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Affiliate {
  id: number; uuid: string; full_name: string; email: string;
  phone: string | null; company: string | null; website: string | null;
  referral_code: string | null; commission_rate: number; status: string;
  referral_method: string | null; expected_audience: string | null;
  admin_notes: string | null; approved_by: string | null; approved_at: string | null;
  created_at: string; clicks: number; signups: number;
  commission_pending: number; commission_paid: number;
}

interface Conversion {
  id: number; affiliate_id: number; type: string; plan: string | null;
  amount_gbp: number; commission_gbp: number; status: string;
  paid_at: string | null; paid_by: string | null; created_at: string;
  affiliate_name: string; affiliate_email: string; referral_code: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  applied:   { label: 'Applied',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  approved:  { label: 'Approved',  className: 'bg-green-100 text-green-800 border-green-200' },
  rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-800 border-red-200' },
  suspended: { label: 'Suspended', className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const CONV_STATUS: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  paid:     { label: 'Paid',     className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
};

function pence(p: number) { return `£${(Number(p) / 100).toFixed(2)}`; }

export default function AdminAffiliatePage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [affRes, convRes] = await Promise.all([
        fetch('/api/admin/affiliates', { credentials: 'include' }),
        fetch('/api/admin/affiliates/conversions', { credentials: 'include' }),
      ]);
      const [affData, convData] = await Promise.all([affRes.json(), convRes.json()]);
      if (affData.success) setAffiliates(affData.affiliates ?? []);
      if (convData.success) setConversions(convData.conversions ?? []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function doAction(id: number, action: string, extra?: Record<string, unknown>) {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        await load();
        if (selected?.id === id) {
          const updated = affiliates.find(a => a.id === id);
          if (updated) setSelected({ ...updated });
        }
      } else {
        setActionError(data.error ?? 'Action failed.');
      }
    } catch {
      setActionError('Network error.');
    }
    setActionLoading(false);
  }

  async function doConvAction(id: number, action: string) {
    try {
      const res = await fetch(`/api/admin/affiliates/conversions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) await load();
    } catch { /* silent */ }
  }

  const filtered = affiliates.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.company ?? '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: affiliates.length,
    approved: affiliates.filter(a => a.status === 'approved').length,
    applied: affiliates.filter(a => a.status === 'applied').length,
    totalPaid: conversions.reduce((s, c) => s + (c.status === 'paid' ? Number(c.commission_gbp) : 0), 0),
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Affiliate Programme — Admin Portal</title>
      </Helmet>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-white">Affiliate Programme</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage affiliate applications, commissions, and payouts.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total affiliates', value: stats.total, icon: Users, color: 'text-blue-600' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Pending review', value: stats.applied, icon: Clock, color: 'text-amber-600' },
            { label: 'Total paid out', value: pence(stats.totalPaid), icon: PoundSterling, color: 'text-purple-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground dark:text-white">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="affiliates">
          <TabsList>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="conversions">Conversions & Payouts</TabsTrigger>
          </TabsList>

          {/* Affiliates tab */}
          <TabsContent value="affiliates" className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search name, email, company…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Signups</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No affiliates found.</TableCell></TableRow>
                    ) : filtered.map(aff => {
                      const sb = STATUS_BADGE[aff.status] ?? { label: aff.status, className: '' };
                      return (
                        <TableRow key={aff.id}>
                          <TableCell>
                            <div className="font-medium text-foreground dark:text-white text-sm">{aff.full_name}</div>
                            <div className="text-xs text-muted-foreground">{aff.email}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{aff.company ?? '—'}</TableCell>
                          <TableCell><Badge className={sb.className}>{sb.label}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{aff.referral_code ?? '—'}</TableCell>
                          <TableCell className="text-sm">{aff.commission_rate}%</TableCell>
                          <TableCell className="text-sm">{Number(aff.clicks)}</TableCell>
                          <TableCell className="text-sm">{Number(aff.signups)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(aff.created_at).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelected(aff); setEditCommission(String(aff.commission_rate)); setEditCode(aff.referral_code ?? ''); setEditNotes(aff.admin_notes ?? ''); setActionError(''); }}>
                                  <Eye className="w-4 h-4 mr-2" /> View / Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {aff.status === 'applied' && (
                                  <>
                                    <DropdownMenuItem onClick={() => doAction(aff.id, 'approve')} className="text-green-700">
                                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => doAction(aff.id, 'reject')} className="text-red-700">
                                      <XCircle className="w-4 h-4 mr-2" /> Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {aff.status === 'approved' && (
                                  <DropdownMenuItem onClick={() => doAction(aff.id, 'suspend')} className="text-amber-700">
                                    <ShieldOff className="w-4 h-4 mr-2" /> Suspend
                                  </DropdownMenuItem>
                                )}
                                {aff.status === 'suspended' && (
                                  <DropdownMenuItem onClick={() => doAction(aff.id, 'reactivate')} className="text-green-700">
                                    <RotateCcw className="w-4 h-4 mr-2" /> Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Conversions tab */}
          <TabsContent value="conversions" className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : conversions.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No conversions yet.</TableCell></TableRow>
                    ) : conversions.map(conv => {
                      const cs = CONV_STATUS[conv.status] ?? { label: conv.status, className: '' };
                      return (
                        <TableRow key={conv.id}>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground dark:text-white">{conv.affiliate_name}</div>
                            <div className="text-xs text-muted-foreground">{conv.affiliate_email}</div>
                          </TableCell>
                          <TableCell className="text-sm capitalize">{conv.type}</TableCell>
                          <TableCell className="text-sm">{conv.plan ?? '—'}</TableCell>
                          <TableCell className="text-sm">{pence(conv.amount_gbp)}</TableCell>
                          <TableCell className="text-sm font-medium text-green-700">{pence(conv.commission_gbp)}</TableCell>
                          <TableCell><Badge className={cs.className}>{cs.label}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(conv.created_at).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {conv.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => doConvAction(conv.id, 'approve')} className="text-blue-700">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                  </DropdownMenuItem>
                                )}
                                {conv.status === 'approved' && (
                                  <DropdownMenuItem onClick={() => doConvAction(conv.id, 'mark_paid')} className="text-green-700">
                                    <PoundSterling className="w-4 h-4 mr-2" /> Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                {(conv.status === 'pending' || conv.status === 'approved') && (
                                  <DropdownMenuItem onClick={() => doConvAction(conv.id, 'reject')} className="text-red-700">
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Affiliate detail sheet */}
      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle>{selected.full_name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={STATUS_BADGE[selected.status]?.className ?? ''}>
                    {STATUS_BADGE[selected.status]?.label ?? selected.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selected.email}</span>
                </div>
              </SheetHeader>

              {actionError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 text-sm">
                {[
                  { label: 'Phone', value: selected.phone },
                  { label: 'Company', value: selected.company },
                  { label: 'Website', value: selected.website },
                  { label: 'Referral method', value: selected.referral_method },
                  { label: 'Expected audience', value: selected.expected_audience },
                  { label: 'Applied', value: new Date(selected.created_at).toLocaleString('en-GB') },
                  { label: 'Approved by', value: selected.approved_by },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">{row.label}:</span>
                    <span className="text-foreground">{row.value}</span>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-muted/50 rounded-md p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{Number(selected.clicks)}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{Number(selected.signups)}</div>
                    <div className="text-xs text-muted-foreground">Signups</div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3 text-center">
                    <div className="text-lg font-bold text-green-700">{pence(selected.commission_paid)}</div>
                    <div className="text-xs text-muted-foreground">Paid</div>
                  </div>
                </div>

                {/* Edit commission */}
                <div className="space-y-1.5 pt-2">
                  <Label>Commission rate (%)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} max={100} value={editCommission} onChange={e => setEditCommission(e.target.value)} className="w-24" />
                    <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => doAction(selected.id, 'set_commission', { commissionRate: Number(editCommission) })}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>

                {/* Edit referral code */}
                <div className="space-y-1.5">
                  <Label>Referral code</Label>
                  <div className="flex gap-2">
                    <Input value={editCode} onChange={e => setEditCode(e.target.value)} className="font-mono uppercase" placeholder="e.g. JANE2024" />
                    <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => doAction(selected.id, 'set_code', { referralCode: editCode })}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>

                {/* Admin notes */}
                <div className="space-y-1.5">
                  <Label>Admin notes</Label>
                  <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} placeholder="Internal notes…" />
                  <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => doAction(selected.id, 'set_notes', { adminNotes: editNotes })}>
                    Save notes
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {selected.status === 'applied' && (
                    <>
                      <Button size="sm" className="gap-1.5 bg-green-700 hover:bg-green-800" disabled={actionLoading} onClick={() => doAction(selected.id, 'approve')}>
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1.5" disabled={actionLoading} onClick={() => doAction(selected.id, 'reject')}>
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  )}
                  {selected.status === 'approved' && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-amber-700 border-amber-300" disabled={actionLoading} onClick={() => doAction(selected.id, 'suspend')}>
                      <AlertTriangle className="w-4 h-4" /> Suspend
                    </Button>
                  )}
                  {selected.status === 'suspended' && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300" disabled={actionLoading} onClick={() => doAction(selected.id, 'reactivate')}>
                      <RotateCcw className="w-4 h-4" /> Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
