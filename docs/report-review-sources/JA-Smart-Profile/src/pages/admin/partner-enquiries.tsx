import { useState, useEffect } from 'react';
import { Mail, Trash2, Check, Users, Handshake, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PartnerEnquiry {
  id: number;
  type: 'affiliate' | 'reseller';
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
  is_read: number;
  created_at: string;
}

export default function AdminPartnerEnquiries() {
  const [enquiries, setEnquiries] = useState<PartnerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/partner-enquiries', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setEnquiries(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/admin/partner-enquiries/${id}/read`, { method: 'PATCH', credentials: 'include' });
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, is_read: 1 } : e));
  };

  const remove = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/admin/partner-enquiries/${id}`, { method: 'DELETE', credentials: 'include' });
    setEnquiries(prev => prev.filter(e => e.id !== id));
    setDeleting(null);
  };

  const affiliates = enquiries.filter(e => e.type === 'affiliate');
  const resellers = enquiries.filter(e => e.type === 'reseller');
  const unread = enquiries.filter(e => !e.is_read).length;

  const EnquiryCard = ({ e }: { e: PartnerEnquiry }) => (
    <Card className={`bg-card border-border transition-all ${!e.is_read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground">{e.name}</span>
              {!e.is_read && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">New</Badge>
              )}
              <Badge className={`text-xs border-0 ${e.type === 'affiliate' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {e.type === 'affiliate' ? 'Affiliate' : 'Reseller'}
              </Badge>
            </div>
            <a href={`mailto:${e.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {e.email}
            </a>
            {e.company && <p className="text-xs text-muted-foreground mt-0.5">{e.company}</p>}
            {e.website && (
              <a href={e.website} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5">
                <ExternalLink className="w-3 h-3" /> {e.website}
              </a>
            )}
            {e.message && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border/50 pt-3">{e.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {!e.is_read && (
              <Button size="sm" variant="outline" className="border-border gap-1.5 text-xs" onClick={() => markRead(e.id)}>
                <Check className="w-3.5 h-3.5" /> Mark read
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
              onClick={() => remove(e.id)}
              disabled={deleting === e.id}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Handshake className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">No {type} interest registrations yet.</p>
      <p className="text-muted-foreground text-xs mt-1">They'll appear here when visitors register on the Partners page.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Partner Interest
            {unread > 0 && (
              <Badge className="bg-primary text-white border-0">{unread} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Visitors who registered interest in the Affiliate or Reseller programmes</p>
        </div>
        <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: enquiries.length, icon: Users, color: 'text-foreground' },
          { label: 'Affiliate', value: affiliates.length, icon: Handshake, color: 'text-green-400' },
          { label: 'Reseller', value: resellers.length, icon: Handshake, color: 'text-blue-400' },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="all">All ({enquiries.length})</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate ({affiliates.length})</TabsTrigger>
            <TabsTrigger value="reseller">Reseller ({resellers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {enquiries.length === 0 ? <EmptyState type="partner" /> : enquiries.map(e => <EnquiryCard key={e.id} e={e} />)}
          </TabsContent>
          <TabsContent value="affiliate" className="space-y-4">
            {affiliates.length === 0 ? <EmptyState type="affiliate" /> : affiliates.map(e => <EnquiryCard key={e.id} e={e} />)}
          </TabsContent>
          <TabsContent value="reseller" className="space-y-4">
            {resellers.length === 0 ? <EmptyState type="reseller" /> : resellers.map(e => <EnquiryCard key={e.id} e={e} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
