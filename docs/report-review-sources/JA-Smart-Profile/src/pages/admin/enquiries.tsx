import { useState, useEffect } from 'react';
import { Mail, MailOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Enquiry { id: number; sender_name: string; sender_email: string; message: string; created_at: string; is_read: number; username: string; profile_name: string; user_email: string; }

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/enquiries', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setEnquiries(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Manage Enquiries</h1>
        <p className="text-muted-foreground mt-1">{enquiries.length} total enquiries</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No enquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <Card key={e.id} className={`border cursor-pointer ${!e.is_read ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
              <CardContent className="p-4" onClick={() => setExpanded(ex => ex === e.id ? null : e.id)}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!e.is_read ? 'bg-primary/20' : 'bg-muted'}`}>
                    {e.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{e.sender_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">/{e.username}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
                        {expanded === e.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{e.sender_email}</p>
                    {expanded !== e.id && <p className="text-sm text-muted-foreground mt-1 truncate">{e.message}</p>}
                  </div>
                </div>
                {expanded === e.id && (
                  <div className="mt-3 pl-11">
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{e.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Profile owner: {e.user_email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
