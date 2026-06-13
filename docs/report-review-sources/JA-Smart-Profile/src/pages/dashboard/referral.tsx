/**
 * Dashboard — Refer & Earn (merged with Points & Rewards)
 * Shows referral code/link, points balance, rewards, history, and redemptions.
 */
import { useState, useEffect } from 'react';
import {
  Users, Copy, CheckCheck, Share2, TrendingUp, Star, Gift,
  History, RefreshCw, ChevronRight, CheckCircle2, Clock,
  XCircle, AlertCircle, Coins,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface Referral {
  name: string;
  email: string;
  created_at: string;
  purchased: number;
}

interface Summary {
  balance: number;
  earned: number;
  redeemed: number;
  referralCount: number;
  referral_code: string;
}

interface ReferralData {
  code: string;
  referrals: Referral[];
  summary: Summary;
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

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    free_month: 'Free Month',
    discount: 'Discount',
    account_credit: 'Account Credit',
    membership_upgrade: 'Plan Upgrade',
  };
  return map[type] ?? type;
};

export default function ReferralPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    const [refRes, histRes, rewRes, redRes] = await Promise.all([
      fetch('/api/points/referral', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/history', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/rewards', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/points/redemptions', { credentials: 'include' }).then(r => r.json()),
    ]);
    if (refRes.success) setReferralData(refRes.data);
    if (histRes.success) setHistory(histRes.data);
    if (rewRes.success) setRewards(rewRes.data);
    if (redRes.success) setRedemptions(redRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const referralLink = referralData ? `${window.location.origin}/register?ref=${referralData.code}` : '';
  const summary = referralData?.summary ?? null;

  const copyCode = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join me on JA Smart Profile',
        text: 'Create your digital business card — use my referral link to get started!',
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

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
    new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refer &amp; Earn</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Share your referral link, earn points, and redeem rewards
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="border-border gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Points Balance', value: summary.balance.toLocaleString(), icon: Coins, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Lifetime Earned', value: summary.earned.toLocaleString(), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Points Redeemed', value: summary.redeemed.toLocaleString(), icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Total Referrals', value: (referralData?.referrals.length ?? 0).toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Referral code + link */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" /> Your Referral Details
          </CardTitle>
          <CardDescription>Share your code or link — earn points for every sign-up and upgrade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : referralData && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Referral Code</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl bg-muted border border-border font-mono text-lg font-bold text-foreground tracking-widest">
                    {referralData.code}
                  </div>
                  <Button onClick={copyCode} variant="outline" className="border-border gap-1.5 px-4">
                    {copiedCode ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Referral Link</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-muted border-border text-xs font-mono text-muted-foreground"
                  />
                  <Button onClick={copyLink} variant="outline" className="border-border gap-1.5 px-4 flex-shrink-0">
                    {copiedLink ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button onClick={share} className="bg-primary gap-1.5 flex-shrink-0">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Send your unique referral link or code to friends and colleagues' },
              { step: '2', title: 'They sign up', desc: 'When they register using your link, you earn points automatically' },
              { step: '3', title: 'Redeem rewards', desc: 'Use your points to redeem exclusive rewards and discounts' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-4 rounded-xl bg-muted/30 border border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                  {step}
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Rewards / Referral History / Points History / Redemptions */}
      <Tabs defaultValue="rewards">
        <TabsList className="bg-muted/50 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="referrals">Referral History</TabsTrigger>
          <TabsTrigger value="points">Points History</TabsTrigger>
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

        {/* Referral History */}
        <TabsContent value="referrals">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Referral History
              </CardTitle>
              <CardDescription>People who signed up using your referral link</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : !referralData || referralData.referrals.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No referrals yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Share your link to start earning points</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {referralData.referrals.map((ref, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                        {ref.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ref.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(ref.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ref.purchased ? (
                          <Badge className="border-0 bg-green-500/10 text-green-400 text-xs">Upgraded</Badge>
                        ) : (
                          <Badge className="border-0 bg-muted text-muted-foreground text-xs">Free plan</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points History */}
        <TabsContent value="points">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Points History
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
                        <p className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</p>
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
