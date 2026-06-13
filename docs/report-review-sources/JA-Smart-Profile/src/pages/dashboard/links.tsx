import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronUp, ChevronDown, Check, X, Globe, Linkedin, Twitter, Instagram, Facebook, Youtube, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

interface Link { id: number; type: string; platform: string | null; label: string; url: string; is_enabled: number; sort_order: number; }
interface Profile { id: number; username: string; }
interface Plan { max_links: number; name: string; }

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter / X', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'tiktok', label: 'TikTok', icon: Globe },
  { value: 'whatsapp', label: 'WhatsApp', icon: Globe },
  { value: 'telegram', label: 'Telegram', icon: Globe },
];

function PlatformIcon({ platform }: { platform: string | null }) {
  const p = PLATFORMS.find(p => p.value === platform);
  if (p) return <p.icon className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

export default function LinksPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [newLink, setNewLink] = useState({ type: 'custom', platform: '', label: '', url: '' });
  const [editLink, setEditLink] = useState({ label: '', url: '' });

  useEffect(() => {
    async function load() {
      const [profilesRes, plansRes] = await Promise.all([
        fetch('/api/profiles/me', { credentials: 'include' }),
        fetch('/api/plans'),
      ]);
      const profilesData = await profilesRes.json();
      const plansData = await plansRes.json();

      if (profilesData.success && profilesData.data.length > 0) {
        const p = profilesData.data[0];
        setProfile(p);
        const linksRes = await fetch(`/api/links/${p.id}`, { credentials: 'include' });
        const linksData = await linksRes.json();
        if (linksData.success) setLinks(linksData.data);
      }
      if (plansData.success) {
        const userPlan = plansData.data.find((p: { id: number }) => p.id === user?.plan_id);
        setPlan(userPlan || plansData.data[0]);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const addLink = async () => {
    if (!profile || !newLink.label || !newLink.url) return setError('Label and URL are required');
    setError('');
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profile_id: profile.id, ...newLink, platform: newLink.type === 'social' ? newLink.platform : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinks(l => [...l, data.data]);
      setNewLink({ type: 'custom', platform: '', label: '', url: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  const toggleLink = async (link: Link) => {
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_enabled: link.is_enabled ? 0 : 1 }),
    });
    const data = await res.json();
    if (data.success) setLinks(l => l.map(x => x.id === link.id ? data.data : x));
  };

  const deleteLink = async (id: number) => {
    if (!confirm('Delete this link?')) return;
    await fetch(`/api/links/${id}`, { method: 'DELETE', credentials: 'include' });
    setLinks(l => l.filter(x => x.id !== id));
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editLink),
    });
    const data = await res.json();
    if (data.success) {
      setLinks(l => l.map(x => x.id === id ? data.data : x));
      setEditingId(null);
    }
  };

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    const updated = newLinks.map((l, i) => ({ ...l, sort_order: i }));
    setLinks(updated);
    await fetch('/api/links/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ links: updated.map(l => ({ id: l.id, sort_order: l.sort_order })) }),
    });
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 lg:pb-0">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Links Manager</h1>
          <p className="text-muted-foreground mt-1">Manage your profile links and buttons</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-primary gap-2">
          <Plus className="w-4 h-4" /> Add Link
        </Button>
      </div>

      {/* Plan limit */}
      {plan && (
        <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{links.length}</span> of{' '}
            <span className="text-foreground font-medium">{plan.max_links >= 999 ? 'unlimited' : plan.max_links}</span> links used
          </span>
          <Badge variant="outline" className="text-xs">{plan.name} plan</Badge>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {/* Add form */}
      {showAddForm && (
        <Card className="bg-card border-primary/30 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add New Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newLink.type} onValueChange={v => setNewLink(l => ({ ...l, type: v, platform: '' }))}>
                  <SelectTrigger className="mt-1.5 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Link</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newLink.type === 'social' && (
                <div>
                  <Label>Platform</Label>
                  <Select value={newLink.platform} onValueChange={v => {
                    const p = PLATFORMS.find(p => p.value === v);
                    setNewLink(l => ({ ...l, platform: v, label: p?.label || '' }));
                  }}>
                    <SelectTrigger className="mt-1.5 bg-background border-border">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label>Label</Label>
              <Input value={newLink.label} onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))}
                className="mt-1.5 bg-background border-border" placeholder="My Portfolio" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={newLink.url} onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                className="mt-1.5 bg-background border-border" placeholder="https://..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={addLink} className="bg-primary">Add Link</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-border">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No links yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Add your first link to get started</p>
          <Button onClick={() => setShowAddForm(true)} className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Add Your First Link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={link.id} className={`rounded-xl border p-4 transition-all ${link.is_enabled ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'}`}>
              {editingId === link.id ? (
                <div className="space-y-3">
                  <Input value={editLink.label} onChange={e => setEditLink(l => ({ ...l, label: e.target.value }))}
                    className="bg-background border-border" placeholder="Label" />
                  <Input value={editLink.url} onChange={e => setEditLink(l => ({ ...l, url: e.target.value }))}
                    className="bg-background border-border" placeholder="URL" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(link.id)} className="bg-primary gap-1"><Check className="w-3 h-3" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="border-border gap-1"><X className="w-3 h-3" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveLink(index, 'up')} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <PlatformIcon platform={link.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{link.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={!!link.is_enabled} onCheckedChange={() => toggleLink(link)} />
                    <button onClick={() => { setEditingId(link.id); setEditLink({ label: link.label, url: link.url }); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteLink(link.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
