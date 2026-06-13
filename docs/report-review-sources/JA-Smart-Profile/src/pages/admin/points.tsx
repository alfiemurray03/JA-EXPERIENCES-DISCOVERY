/**
 * Admin — Points & Rewards Management
 * Full CRUD for rules, rewards, member balances, manual adjustments, redemptions, referral activity.
 */
import { useState, useEffect } from 'react';
import {
  Gift, Users, TrendingUp, Settings2, Plus, Edit2, Trash2,
  CheckCircle2, Clock, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Rule { id: number; action: string; label: string; points: number; is_active: number; description: string | null; }
interface Reward { id: number; name: string; description: string | null; type: string; value: string; points_cost: number; is_active: number; stock: number; }
interface Member { id: number; name: string; email: string; balance: number; lifetime_earned: number; lifetime_redeemed: number; referral_code: string | null; referral_count: number; }
interface Redemption { id: number; user_name: string; user_email: string; reward_name: string; reward_type: string; points_spent: number; status: string; code: string | null; notes: string | null; created_at: string; }
interface ReferralRow { code: string; owner_name: string; owner_email: string; signup_count: number; purchase_count: number; points_awarded: number; }

const REWARD_TYPES = ['discount', 'free_month', 'account_credit', 'membership_upgrade', 'other'];
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  fulfilled: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
};

export default function AdminPointsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Rule edit
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  // Reward create/edit
  const [rewardDialog, setRewardDialog] = useState<Partial<Reward> | null>(null);
  const [savingReward, setSavingReward] = useState(false);

  // Manual adjust
  const [adjustDialog, setAdjustDialog] = useState<Member | null>(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // Redemption fulfil
  const [fulfilDialog, setFulfilDialog] = useState<Redemption | null>(null);
  const [fulfilStatus, setFulfilStatus] = useState('fulfilled');
  const [fulfilCode, setFulfilCode] = useState('');
  const [fulfilNotes, setFulfilNotes] = useState('');
  const [fulfilling, setFulfilling] = useState(false);

  const load = async () => {
    setLoading(true);
    const [rulesRes, rewardsRes, membersRes, redemptionsRes, referralsRes] = await Promise.all([
      fetch('/api/admin/points/rules', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/points/rewards', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/points/members', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/points/redemptions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/points/referrals', { credentials: 'include' }).then(r => r.json()),
    ]);
    if (rulesRes.success) setRules(rulesRes.data);
    if (rewardsRes.success) setRewards(rewardsRes.data);
    if (membersRes.success) setMembers(membersRes.data);
    if (redemptionsRes.success) setRedemptions(redemptionsRes.data);
    if (referralsRes.success) setReferrals(referralsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveRule = async () => {
    if (!editRule) return;
    setSavingRule(true);
    await fetch(`/api/admin/points/rules/${editRule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ points: editRule.points, is_active: editRule.is_active, description: editRule.description }),
    });
    setSavingRule(false);
    setEditRule(null);
    load();
  };

  const saveReward = async () => {
    if (!rewardDialog) return;
    setSavingReward(true);
    const isEdit = !!rewardDialog.id;
    await fetch(isEdit ? `/api/admin/points/rewards/${rewardDialog.id}` : '/api/admin/points/rewards', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(rewardDialog),
    });
    setSavingReward(false);
    setRewardDialog(null);
    load();
  };

  const deleteReward = async (id: number) => {
    if (!confirm('Delete this reward?')) return;
    await fetch(`/api/admin/points/rewards/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const submitAdjust = async () => {
    if (!adjustDialog) return;
    const delta = parseInt(adjustDelta);
    if (isNaN(delta) || delta === 0) { setAdjustError('Enter a non-zero number'); return; }
    setAdjusting(true);
    setAdjustError('');
    const res = await fetch('/api/admin/points/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: adjustDialog.id, delta, description: adjustDesc }),
    });
    const data = await res.json();
    setAdjusting(false);
    if (data.success) { setAdjustDialog(null); setAdjustDelta(''); setAdjustDesc(''); load(); }
    else setAdjustError(data.error || 'Failed');
  };

  const submitFulfil = async () => {
    if (!fulfilDialog) return;
    setFulfilling(true);
    await fetch(`/api/admin/points/redemptions/${fulfilDialog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: fulfilStatus, code: fulfilCode, notes: fulfilNotes }),
    });
    setFulfilling(false);
    setFulfilDialog(null);
    load();
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Points & Rewards</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configure earning rules, manage rewards, and review member activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="border-border gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary row */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: members.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Pending Redemptions', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Active Rewards', value: rewards.filter(r => r.is_active).length, icon: Gift, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Referrals', value: referrals.reduce((s, r) => s + r.signup_count, 0), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="rules">
        <TabsList className="bg-muted/50 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="rules">Earning Rules</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Catalogue</TabsTrigger>
          <TabsTrigger value="members">Member Balances</TabsTrigger>
          <TabsTrigger value="redemptions" className="relative">
            Redemptions
            {pendingCount > 0 && (
              <span className="ml-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="referrals">Referral Activity</TabsTrigger>
        </TabsList>

        {/* Earning Rules */}
        <TabsContent value="rules">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" /> Points Earning Rules
              </CardTitle>
              <CardDescription>Configure how many points are awarded for each qualifying action</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : (
                <div className="divide-y divide-border">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{rule.label}</p>
                        {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={`border-0 text-xs ${rule.is_active ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm font-bold text-foreground w-16 text-right">{rule.points} pts</span>
                        <Button size="sm" variant="outline" className="border-border h-8 w-8 p-0"
                          onClick={() => setEditRule({ ...rule })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Catalogue */}
        <TabsContent value="rewards">
          <div className="flex justify-end mb-3">
            <Button onClick={() => setRewardDialog({ name: '', type: 'discount', value: '', points_cost: 100, is_active: 1, stock: -1 })}
              className="bg-primary gap-1.5">
              <Plus className="w-4 h-4" /> Add Reward
            </Button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : rewards.length === 0 ? (
                <div className="py-12 text-center">
                  <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No rewards yet. Add one above.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {rewards.map(r => (
                    <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="border-0 bg-muted text-muted-foreground text-xs">{r.type}</Badge>
                          {r.stock !== -1 && <span className="text-xs text-muted-foreground">Stock: {r.stock}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`border-0 text-xs ${r.is_active ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {r.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm font-bold text-foreground">{r.points_cost.toLocaleString()} pts</span>
                        <Button size="sm" variant="outline" className="border-border h-8 w-8 p-0"
                          onClick={() => setRewardDialog({ ...r })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          onClick={() => deleteReward(r.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Balances */}
        <TabsContent value="members">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Member Balances
              </CardTitle>
              <CardDescription>View and manually adjust points for any member</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0 mr-2">
                        <p className="text-sm font-bold text-foreground">{m.balance.toLocaleString()} pts</p>
                        <p className="text-xs text-muted-foreground">+{m.lifetime_earned.toLocaleString()} / -{m.lifetime_redeemed.toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-border gap-1 text-xs h-8 flex-shrink-0"
                        onClick={() => { setAdjustDialog(m); setAdjustDelta(''); setAdjustDesc(''); setAdjustError(''); }}>
                        <Edit2 className="w-3 h-3" /> Adjust
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemptions */}
        <TabsContent value="redemptions">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" /> Redemption Requests
              </CardTitle>
              <CardDescription>Review and fulfil reward redemptions from members</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : redemptions.length === 0 ? (
                <div className="py-12 text-center">
                  <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No redemptions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {redemptions.map(r => (
                    <div key={r.id} className="flex items-start gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.reward_name}</p>
                        <p className="text-xs text-muted-foreground">{r.user_name} · {r.user_email}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.created_at)} · {r.points_spent.toLocaleString()} pts</p>
                        {r.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{r.notes}</p>}
                        {r.code && <p className="text-xs font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block">Code: {r.code}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`border-0 text-xs ${STATUS_BADGE[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                        {r.status === 'pending' && (
                          <Button size="sm" variant="outline" className="border-border gap-1 text-xs h-8"
                            onClick={() => { setFulfilDialog(r); setFulfilStatus('fulfilled'); setFulfilCode(''); setFulfilNotes(''); }}>
                            <CheckCircle2 className="w-3 h-3" /> Fulfil
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Activity */}
        <TabsContent value="referrals">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Referral Activity
              </CardTitle>
              <CardDescription>Overview of referral codes and their performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : referrals.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No referral activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {referrals.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{r.owner_email}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{r.code}</p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <p className="text-sm font-bold text-foreground">{r.signup_count} sign-ups</p>
                        <p className="text-xs text-muted-foreground">{r.purchase_count} upgrades</p>
                        <p className="text-xs text-primary">{r.points_awarded.toLocaleString()} pts awarded</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      <Dialog open={!!editRule} onOpenChange={open => !open && setEditRule(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Rule: {editRule?.label}</DialogTitle>
          </DialogHeader>
          {editRule && (
            <div className="space-y-4">
              <div>
                <Label className="text-foreground text-sm">Points Awarded</Label>
                <Input type="number" value={editRule.points}
                  onChange={e => setEditRule({ ...editRule, points: parseInt(e.target.value) || 0 })}
                  className="bg-background border-border mt-1" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Description</Label>
                <Textarea value={editRule.description ?? ''} rows={2}
                  onChange={e => setEditRule({ ...editRule, description: e.target.value })}
                  className="bg-background border-border mt-1 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!editRule.is_active}
                  onCheckedChange={v => setEditRule({ ...editRule, is_active: v ? 1 : 0 })} />
                <Label className="text-sm text-foreground">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRule(null)} className="border-border">Cancel</Button>
            <Button onClick={saveRule} disabled={savingRule} className="bg-primary">
              {savingRule ? 'Saving…' : 'Save Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Create/Edit Dialog */}
      <Dialog open={!!rewardDialog} onOpenChange={open => !open && setRewardDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{rewardDialog?.id ? 'Edit Reward' : 'Add Reward'}</DialogTitle>
          </DialogHeader>
          {rewardDialog && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-foreground">Name</Label>
                <Input value={rewardDialog.name ?? ''} onChange={e => setRewardDialog({ ...rewardDialog, name: e.target.value })}
                  className="bg-background border-border mt-1" placeholder="e.g. 1 Month Free — Starter" />
              </div>
              <div>
                <Label className="text-sm text-foreground">Description</Label>
                <Textarea value={rewardDialog.description ?? ''} rows={2} onChange={e => setRewardDialog({ ...rewardDialog, description: e.target.value })}
                  className="bg-background border-border mt-1 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-foreground">Type</Label>
                  <Select value={rewardDialog.type ?? 'discount'} onValueChange={v => setRewardDialog({ ...rewardDialog, type: v })}>
                    <SelectTrigger className="bg-background border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {REWARD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-foreground">Value</Label>
                  <Input value={rewardDialog.value ?? ''} onChange={e => setRewardDialog({ ...rewardDialog, value: e.target.value })}
                    className="bg-background border-border mt-1" placeholder="e.g. 10 or starter" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-foreground">Points Cost</Label>
                  <Input type="number" value={rewardDialog.points_cost ?? 0}
                    onChange={e => setRewardDialog({ ...rewardDialog, points_cost: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Stock (-1 = unlimited)</Label>
                  <Input type="number" value={rewardDialog.stock ?? -1}
                    onChange={e => setRewardDialog({ ...rewardDialog, stock: parseInt(e.target.value) })}
                    className="bg-background border-border mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={rewardDialog.is_active !== 0}
                  onCheckedChange={v => setRewardDialog({ ...rewardDialog, is_active: v ? 1 : 0 })} />
                <Label className="text-sm text-foreground">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialog(null)} className="border-border">Cancel</Button>
            <Button onClick={saveReward} disabled={savingReward} className="bg-primary">
              {savingReward ? 'Saving…' : rewardDialog?.id ? 'Save Changes' : 'Add Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Adjust Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={open => !open && setAdjustDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Adjust Points — {adjustDialog?.name}</DialogTitle>
            <DialogDescription>Current balance: <strong>{adjustDialog?.balance.toLocaleString()} pts</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-foreground">Delta (positive to add, negative to deduct)</Label>
              <Input type="number" value={adjustDelta} onChange={e => setAdjustDelta(e.target.value)}
                className="bg-background border-border mt-1" placeholder="e.g. 100 or -50" />
            </div>
            <div>
              <Label className="text-sm text-foreground">Reason / Description</Label>
              <Input value={adjustDesc} onChange={e => setAdjustDesc(e.target.value)}
                className="bg-background border-border mt-1" placeholder="e.g. Promotional bonus" />
            </div>
            {adjustError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />{adjustError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)} className="border-border">Cancel</Button>
            <Button onClick={submitAdjust} disabled={adjusting} className="bg-primary">
              {adjusting ? 'Adjusting…' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fulfil Redemption Dialog */}
      <Dialog open={!!fulfilDialog} onOpenChange={open => !open && setFulfilDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Fulfil Redemption</DialogTitle>
            <DialogDescription>{fulfilDialog?.reward_name} — {fulfilDialog?.user_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-foreground">Status</Label>
              <Select value={fulfilStatus} onValueChange={setFulfilStatus}>
                <SelectTrigger className="bg-background border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Keep Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-foreground">Redemption Code (optional)</Label>
              <Input value={fulfilCode} onChange={e => setFulfilCode(e.target.value)}
                className="bg-background border-border mt-1" placeholder="e.g. DISC10-ABCD" />
            </div>
            <div>
              <Label className="text-sm text-foreground">Notes (optional)</Label>
              <Textarea value={fulfilNotes} rows={2} onChange={e => setFulfilNotes(e.target.value)}
                className="bg-background border-border mt-1 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfilDialog(null)} className="border-border">Cancel</Button>
            <Button onClick={submitFulfil} disabled={fulfilling} className="bg-primary">
              {fulfilling ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
