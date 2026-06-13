/**
 * Admin — Issue Reports
 * View and manage platform issue reports submitted via /report-issue.
 */
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface IssueReport {
  id: number;
  name: string;
  email: string;
  issue_type: string;
  subject: string | null;
  description: string;
  page_url: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-500/10 text-red-400',
  in_progress: 'bg-amber-500/10 text-amber-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  display: 'Display',
  performance: 'Performance',
  account: 'Account',
  billing: 'Billing',
  security: 'Security',
  other: 'Other',
};

export default function AdminIssueReports() {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editDialog, setEditDialog] = useState<IssueReport | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/issue-reports', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setReports(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (r: IssueReport) => {
    setEditDialog(r);
    setEditStatus(r.status);
    setEditNotes(r.admin_notes ?? '');
  };

  const saveEdit = async () => {
    if (!editDialog) return;
    setSaving(true);
    const res = await fetch(`/api/admin/issue-reports/${editDialog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: editStatus, admin_notes: editNotes }),
    });
    const data = await res.json();
    if (data.success) {
      setReports(prev => prev.map(r => r.id === editDialog.id
        ? { ...r, status: editStatus as IssueReport['status'], admin_notes: editNotes }
        : r
      ));
      setEditDialog(null);
    }
    setSaving(false);
  };

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.subject ?? '').toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    open: reports.filter(r => r.status === 'open').length,
    in_progress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issue Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {reports.length} total · <span className="text-red-400">{counts.open} open</span>
            {counts.in_progress > 0 && <> · <span className="text-amber-400">{counts.in_progress} in progress</span></>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="border-border gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Open', count: counts.open, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
          { label: 'In Progress', count: counts.in_progress, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Resolved', count: counts.resolved, color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
            className="pl-9 bg-background border-border" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reports found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(r => (
                <div key={r.id}>
                  <div
                    className="px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {r.status === 'open' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                           r.status === 'in_progress' ? <Clock className="w-4 h-4 text-amber-400" /> :
                           <CheckCircle className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">
                              {r.subject || r.description.slice(0, 60)}
                            </p>
                            <Badge className={`text-xs border-0 ${STATUS_COLORS[r.status]}`}>
                              {r.status.replace('_', ' ')}
                            </Badge>
                            <Badge className="text-xs border-0 bg-muted text-muted-foreground">
                              {TYPE_LABELS[r.issue_type] ?? r.issue_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.name} · {r.email} · {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="border-border h-7 text-xs"
                          onClick={e => { e.stopPropagation(); openEdit(r); }}>
                          Update
                        </Button>
                        {expanded === r.id
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {expanded === r.id && (
                    <div className="px-4 pb-4 bg-muted/10 border-t border-border/50">
                      <div className="pt-3 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{r.description}</p>
                        </div>
                        {r.page_url && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Page URL</p>
                            <a href={r.page_url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1">
                              {r.page_url} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {r.admin_notes && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{r.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Update Issue Report #{editDialog?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Admin Notes (internal)</p>
              <Textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add internal notes about this issue…"
                className="bg-background border-border resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)} className="border-border">Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
