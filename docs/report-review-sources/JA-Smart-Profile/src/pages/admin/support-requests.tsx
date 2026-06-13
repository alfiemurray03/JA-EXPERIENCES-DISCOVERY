import { useState, useEffect } from 'react';
import { HelpCircle, Mail, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SupportRequest {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  user_name: string | null;
  plan_id: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved:    'bg-green-500/10 text-green-400 border-green-500/20',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  open:        Clock,
  in_progress: AlertCircle,
  resolved:    CheckCircle2,
};

export default function AdminSupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/support-requests', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setRequests(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    await fetch(`/api/admin/support-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as SupportRequest['status'] } : r));
    setUpdating(null);
  };

  const open       = requests.filter(r => r.status === 'open').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const resolved   = requests.filter(r => r.status === 'resolved').length;

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Support Requests
            {open > 0 && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{open} open</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">Customer support requests submitted via the dashboard</p>
        </div>
        <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Open',        value: open,       color: 'text-amber-400',  Icon: Clock },
          { label: 'In Progress', value: inProgress, color: 'text-blue-400',   Icon: AlertCircle },
          { label: 'Resolved',    value: resolved,   color: 'text-green-400',  Icon: CheckCircle2 },
        ].map(({ label, value, color, Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No support requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const StatusIcon = STATUS_ICONS[r.status] ?? Clock;
            return (
              <Card key={r.id} className={`bg-card border-border transition-all ${r.status === 'open' ? 'border-amber-500/20' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(e => e === r.id ? null : r.id)}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground text-sm">{r.subject}</span>
                        <Badge className={`text-xs ${STATUS_STYLES[r.status] ?? ''}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />{r.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{r.name}</span>
                        <span>·</span>
                        <a href={`mailto:${r.email}`} className="text-primary hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Mail className="w-3 h-3" />{r.email}
                        </a>
                        <span>·</span>
                        <span>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {expanded === r.id && (
                        <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{r.message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-36">
                      <Select
                        value={r.status}
                        onValueChange={v => updateStatus(r.id, v)}
                        disabled={updating === r.id}
                      >
                        <SelectTrigger className="bg-background border-border text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
