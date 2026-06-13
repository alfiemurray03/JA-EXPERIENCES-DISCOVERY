import { useState, useEffect } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile { id: number; username: string; display_name: string; user_email: string; user_name: string; is_published: number; view_count: number; link_count: number; created_at: string; }

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/profiles', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setProfiles(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const deleteProfile = async (id: number) => {
    if (!confirm('Delete this profile?')) return;
    await fetch(`/api/admin/profiles/${id}`, { method: 'DELETE', credentials: 'include' });
    setProfiles(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Manage Profiles</h1>
        <p className="text-muted-foreground mt-1">{profiles.length} total profiles</p>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Username', 'Display Name', 'User', 'Status', 'Views', 'Links', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-primary">/{p.username}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{p.display_name || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-foreground">{p.user_name}</p>
                        <p className="text-xs text-muted-foreground">{p.user_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border-0 ${p.is_published ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {p.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.view_count}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.link_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`/${p.username}`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => deleteProfile(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
}
