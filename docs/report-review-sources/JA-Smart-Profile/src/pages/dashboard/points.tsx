/**
 * Dashboard — Points & Rewards
 * Shows balance, history, available rewards, and redemption history.
 */
import { useState, useEffect } from 'react';
import {
  Star, Gift, History, TrendingUp, RefreshCw, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, Coins,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface Summary {
  balance: number;
  earned: number;
  redeemed: number;
  referralCount: number;
  referral_code: string;
}

interface LedgerEntry {
  id: number;
  delta: number;
  balance_after: number;
  action: string;
  description: string | null;
  created_at: string;
}

interface Reward {
  id: number;
  name: string;
  description: string | null;
  type: string;
  value: string;
  points_cost: number;
  stock: number;
}

interface Redemption {
  id: number;
  reward_name: string;
  reward_type: string;
  points_spent: number;
  status: 'pending' | 'fulfilled' | 'rejected';
  code: string | null;
  notes: string | null;
  created_at: string;
  fulfilled_at: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  signup: 'Account Registration',
  profile_complete: 'Profile Completion',
  referral_signup: 'Referral Sign-up',
  referral_purchase: 'Referral Purchase',
  subscription_renew: 'Subscription Renewal',
  promo_bonus: 'Promotional Bonus',
  manual_adjustment: 'Manual Adjustment',
  redemption: 'Reward Redeemed',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fulfilled: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PointsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    const [sumRes, histRes, rewRes, redRes] = await Promise.all([
      fetch('/api/points/summary', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/history', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/rewards', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/redemptions', { credentials: 'include' }).then(r => r.json()),
    ]);
    if (sumRes.success) setSummary(sumRes.data);
    if (histRes.success) setHistory(histRes.data);
    if (rewRes.success) setRewards(rewRes.data);
    if (redRes.success) setRedemptions(redRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async () => {
    if (!redeemTarget) return;
    setRedeeming(true);
    setRedeemError('');
    try {
      const res = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reward_id: redeemTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemSuccess(data.data.message);
        await load();
      } else {
        setRedeemError(data.error || 'Redemption failed');
      }
    } catch {
      setRedeemError('Network error — please try again');
    } finally {
      setRedeeming(false);
    }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      free_month: 'Free Month',
      discount: 'Discount',
      account_credit: 'Account Credit',
      membership_upgrade: 'Plan Upgrade',
    };
    return map[type] ?? type;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Points & Rewards</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Earn points for activity and redeem them for rewards</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="border-border gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Current Balance', value: summary.balance.toLocaleString(), icon: Coins, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Lifetime Earned', value: summary.earned.toLocaleString(), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Lifetime Redeemed', value: summary.redeemed.toLocaleString(), icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Referrals Made', value: summary.referralCount.toLocaleString(), icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: '18px', height: '18px' }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="rewards">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
        </TabsList>

        {/* Available Rewards */}
        <TabsContent value="rewards">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : rewards.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No rewards available right now. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {rewards.map(reward => {
                const canAfford = (summary?.balance ?? 0) >= reward.points_cost;
                return (
                  <Card key={reward.id} className={`bg-card border-border transition-all ${canAfford ? 'hover:border-primary/40' : 'opacity-70'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Gift className="w-5 h-5 text-primary" />
                        </div>
                        <Badge className="border-0 bg-amber-500/10 text-amber-400 text-xs flex-shrink-0">
                          {reward.points_cost.toLocaleString()} pts
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{reward.name}</h3>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{reward.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className="border-0 bg-muted text-muted-foreground text-xs">{typeLabel(reward.type)}</Badge>
                        <Button
                          size="sm"
                          disabled={!canAfford}
                          onClick={() => { setRedeemTarget(reward); setRedeemError(''); setRedeemSuccess(''); }}
                          className="bg-primary text-xs h-8 gap-1"
                        >
                          {canAfford ? 'Redeem' : 'Not enough pts'}
                          {canAfford && <ChevronRight className="w-3 h-3" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Points History */}
        <TabsContent value="history">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Transaction History
              </CardTitle>
              <CardDescription>All points earned and redeemed on your account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No points activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${entry.delta > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {entry.delta > 0
                          ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          : <Gift className="w-3.5 h-3.5 text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${entry.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.delta > 0 ? '+' : ''}{entry.delta.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Bal: {entry.balance_after.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Redemptions */}
        <TabsContent value="redemptions">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" /> Redemption History
              </CardTitle>
              <CardDescription>Rewards you've redeemed and their fulfilment status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : redemptions.length === 0 ? (
                <div className="py-12 text-center">
                  <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">You haven't redeemed any rewards yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {redemptions.map(r => (
                    <div key={r.id} className="flex items-start gap-4 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {r.status === 'fulfilled' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          : r.status === 'rejected' ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                          : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.reward_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                        {r.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{r.notes}</p>}
                        {r.code && (
                          <p className="text-xs font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block text-foreground">
                            Code: {r.code}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className={`text-xs border ${STATUS_BADGE[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{r.points_spent.toLocaleString()} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Redeem dialog */}
      <Dialog open={!!redeemTarget} onOpenChange={open => !open && setRedeemTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Redeem Reward
            </DialogTitle>
            <DialogDescription>
              Confirm you want to redeem <strong>{redeemTarget?.name}</strong> for{' '}
              <strong>{redeemTarget?.points_cost.toLocaleString()} points</strong>.
            </DialogDescription>
          </DialogHeader>
          {redeemSuccess ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{redeemSuccess}</p>
            </div>
          ) : (
            <>
              {redeemError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{redeemError}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Your new balance will be{' '}
                <strong className="text-foreground">
                  {((summary?.balance ?? 0) - (redeemTarget?.points_cost ?? 0)).toLocaleString()} points
                </strong>.
                Our team will process your redemption within 24 hours.
              </p>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemTarget(null)} className="border-border">
              {redeemSuccess ? 'Close' : 'Cancel'}
            </Button>
            {!redeemSuccess && (
              <Button onClick={handleRedeem} disabled={redeeming} className="bg-primary gap-1.5">
                <Gift className="w-4 h-4" />
                {redeeming ? 'Redeeming…' : 'Confirm Redemption'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
