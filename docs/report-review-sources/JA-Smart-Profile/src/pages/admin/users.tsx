import { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Search, Infinity, Crown, PauseCircle, PlayCircle, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface User {
  id: number; email: string; name: string; role: string;
  plan_id: number; plan_name: string; profile_count: number;
  created_at: string; lifetime_access: number; lifetime_plan_id: number | null;
  is_paused: number; pause_reason: string | null;
}
interface Plan { id: number; name: string; }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ role: '', plan_id: '' });

  // Global pause state
  const [globalPaused, setGlobalPaused] = useState(false);
  const [globalPauseMsg, setGlobalPauseMsg] = useState('');
  const [savingGlobalPause, setSavingGlobalPause] = useState(false);

  // Per-user pause dialog
  const [pauseDialog, setPauseDialog] = useState<{ open: boolean; user: User | null; pausing: boolean }>({ open: false, user: null, pausing: true });
  const [pauseReason, setPauseReason] = useState('');
  const [pauseLoading, setPauseLoading] = useState(false);

  // Lifetime dialog
  const [lifetimeDialog, setLifetimeDialog] = useState<{ open: boolean; user: User | null; mode: 'grant' | 'revoke' }>({
    open: false, user: null, mode: 'grant',
  });
  const [lifetimePlanId, setLifetimePlanId] = useState('');
  const [lifetimeLoading, setLifetimeLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/plans', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/pause', { credentials: 'include' }).then(r => r.json()),
    ]).then(([usersData, plansData, pauseData]) => {
      if (usersData.success) setUsers(usersData.data);
      if (plansData.success) setPlans(plansData.data.filter((p: Plan & { is_active: number }) => p.is_active));
      if (pauseData.success) { setGlobalPaused(pauseData.paused); setGlobalPauseMsg(pauseData.message ?? ''); }
      setLoading(false);
    });
  }, []);
  const saveGlobalPause = async (paused: boolean) => {
    setSavingGlobalPause(true);
    await fetch('/api/admin/pause', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paused, message: globalPauseMsg }),
    });
    setGlobalPaused(paused);
    setSavingGlobalPause(false);
  };

  const openPauseDialog = (user: User, pausing: boolean) => {
    setPauseDialog({ open: true, user, pausing });
    setPauseReason(user.pause_reason ?? '');
  };

  const confirmPause = async () => {
    if (!pauseDialog.user) return;
    setPauseLoading(true);
    const res = await fetch(`/api/admin/users/${pauseDialog.user.id}/pause`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paused: pauseDialog.pausing, reason: pauseReason }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(u => u.map(x => x.id === pauseDialog.user!.id
        ? { ...x, is_paused: pauseDialog.pausing ? 1 : 0, pause_reason: pauseReason || null }
        : x));
      setPauseDialog({ open: false, user: null, pausing: true });
    }
    setPauseLoading(false);
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: editData.role, plan_id: parseInt(editData.plan_id) }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(u => u.map(x => x.id === id ? { ...x, role: editData.role, plan_id: parseInt(editData.plan_id) } : x));
      setEditingId(null);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    setUsers(u => u.filter(x => x.id !== id));
  };

  const openLifetimeGrant = (user: User) => {
    setLifetimeDialog({ open: true, user, mode: 'grant' });
    setLifetimePlanId(String(user.plan_id));
  };

  const openLifetimeRevoke = (user: User) => {
    setLifetimeDialog({ open: true, user, mode: 'revoke' });
  };

  const confirmLifetime = async () => {
    if (!lifetimeDialog.user) return;
    setLifetimeLoading(true);
    const { user, mode } = lifetimeDialog;
    const url = `/api/admin/users/${user.id}/lifetime`;
    const res = await fetch(url, {
      method: mode === 'grant' ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: mode === 'grant' ? JSON.stringify({ plan_id: parseInt(lifetimePlanId) }) : undefined,
    });
    const data = await res.json();
    if (data.success) {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, ...data.data } : x));
      setLifetimeDialog({ open: false, user: null, mode: 'grant' });
    }
    setLifetimeLoading(false);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const lifetimeCount = users.filter(u => u.lifetime_access).length;

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} total users
            {lifetimeCount > 0 && <span className="ml-2 text-amber-400">· {lifetimeCount} lifetime</span>}
          </p>
        </div>
      </div>

      {/* ── Global Pause Control ── */}
      <Card className={`mb-6 border-2 ${globalPaused ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-card'}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">Global Plan Pause</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    When enabled, all new sign-ups and plan upgrades are blocked. Existing users are unaffected.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground">{globalPaused ? 'Paused' : 'Active'}</Label>
                  <Switch
                    checked={globalPaused}
                    onCheckedChange={v => saveGlobalPause(v)}
                    disabled={savingGlobalPause}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
              </div>
              {globalPaused && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={globalPauseMsg}
                    onChange={e => setGlobalPauseMsg(e.target.value)}
                    placeholder="Message shown to users (e.g. 'Contact us to activate your plan')"
                    className="bg-background border-border text-sm flex-1"
                  />
                  <Button size="sm" onClick={() => saveGlobalPause(true)} disabled={savingGlobalPause} className="bg-primary shrink-0">
                    Save Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="pl-9 bg-background border-border w-64" />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Role</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Plan</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Access</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Profiles</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Joined</th>
                    <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.lifetime_access ? <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : null}
                          {user.is_paused ? <PauseCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" /> : null}
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.is_paused && user.pause_reason && (
                              <p className="text-xs text-orange-400 mt-0.5 truncate max-w-48">{user.pause_reason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <Select value={editData.role} onValueChange={v => setEditData(d => ({ ...d, role: v }))}>
                            <SelectTrigger className="w-24 h-7 text-xs bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`text-xs border-0 ${user.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-muted text-muted-foreground'}`}>
                            {user.role}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <Select value={editData.plan_id} onValueChange={v => setEditData(d => ({ ...d, plan_id: v }))}>
                            <SelectTrigger className="w-28 h-7 text-xs bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {plans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">{user.plan_name || 'Free'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.lifetime_access ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs gap-1">
                            <Infinity className="w-3 h-3" /> Lifetime
                          </Badge>
                        ) : user.is_paused ? (
                          <Badge className="bg-orange-500/10 text-orange-400 border-0 text-xs gap-1">
                            <PauseCircle className="w-3 h-3" /> Paused
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Standard</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.profile_count}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {editingId === user.id ? (
                            <>
                              <button onClick={() => saveEdit(user.id)} className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {user.lifetime_access ? (
                                <button onClick={() => openLifetimeRevoke(user)} title="Revoke lifetime access"
                                  className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10">
                                  <Infinity className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => openLifetimeGrant(user)} title="Grant lifetime access"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10">
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {user.is_paused ? (
                                <button onClick={() => openPauseDialog(user, false)} title="Unpause account"
                                  className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/10">
                                  <PlayCircle className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => openPauseDialog(user, true)} title="Pause account"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10">
                                  <PauseCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => { setEditingId(user.id); setEditData({ role: user.role, plan_id: String(user.plan_id) }); }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteUser(user.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifetime Access Dialog */}
      <Dialog open={lifetimeDialog.open} onOpenChange={open => !open && setLifetimeDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {lifetimeDialog.mode === 'grant' ? 'Grant Lifetime Access' : 'Revoke Lifetime Access'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {lifetimeDialog.mode === 'grant'
                ? `Grant ${lifetimeDialog.user?.name} permanent access to a plan — no subscription required.`
                : `Remove lifetime access from ${lifetimeDialog.user?.name}. They will be moved to the Free plan.`}
            </DialogDescription>
          </DialogHeader>

          {lifetimeDialog.mode === 'grant' && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Select Plan</label>
                <Select value={lifetimePlanId} onValueChange={setLifetimePlanId}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Choose a plan…" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setLifetimeDialog(d => ({ ...d, open: false }))}
              className="border-border">Cancel</Button>
            <Button
              onClick={confirmLifetime}
              disabled={lifetimeLoading || (lifetimeDialog.mode === 'grant' && !lifetimePlanId)}
              className={lifetimeDialog.mode === 'grant'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}
            >
              {lifetimeLoading ? 'Processing…' : lifetimeDialog.mode === 'grant' ? 'Grant Lifetime Access' : 'Revoke Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause / Unpause User Dialog */}
      <Dialog open={pauseDialog.open} onOpenChange={open => !open && setPauseDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {pauseDialog.pausing
                ? <><PauseCircle className="w-5 h-5 text-orange-400" /> Pause Account</>
                : <><PlayCircle className="w-5 h-5 text-green-400" /> Unpause Account</>}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {pauseDialog.pausing
                ? `${pauseDialog.user?.name}'s dashboard access will be blocked. They'll see a contact-us message.`
                : `Restore full dashboard access for ${pauseDialog.user?.name}.`}
            </DialogDescription>
          </DialogHeader>
          {pauseDialog.pausing && (
            <div className="py-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Reason (shown to user)</label>
              <Input
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                placeholder="e.g. Payment required — please contact us to reactivate"
                className="bg-background border-border"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialog(d => ({ ...d, open: false }))} className="border-border">Cancel</Button>
            <Button
              onClick={confirmPause}
              disabled={pauseLoading}
              className={pauseDialog.pausing ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {pauseLoading ? 'Processing…' : pauseDialog.pausing ? 'Pause Account' : 'Unpause Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
