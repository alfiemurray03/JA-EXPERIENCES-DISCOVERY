import { useState, useEffect } from 'react';
import { Check, Zap, AlertTriangle, X, Calendar, CreditCard, ArrowRight, Loader2, ExternalLink, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';

const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/eVq6oH3k35B89IS9UJfEk00';

interface Plan {
  id: number; name: string; slug: string; price_monthly: number;
  max_profiles: number; max_links: number; has_qr_download: number; has_contact_form: number;
  has_advanced_analytics: number; has_vcard_download: number; has_custom_themes: number;
  remove_branding: number; has_custom_domain: number; has_lifetime: number;
  stripe_price_monthly: string | null;
}

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const branding = useBranding();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelDone, setCancelDone] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId: number) => {
    setCheckoutError('');
    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckoutError(data.error || 'Failed to start checkout. Please try again.');
        return;
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setCheckoutError('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPlanFeatures = (plan: Plan) => [
    `${plan.max_profiles === 999 ? 'Unlimited' : plan.max_profiles} profile${plan.max_profiles !== 1 ? 's' : ''}`,
    `${plan.max_links >= 999 ? 'Unlimited' : plan.max_links} links`,
    plan.has_qr_download ? 'QR code download' : null,
    plan.has_contact_form ? 'Contact form' : null,
    plan.has_advanced_analytics ? 'Advanced analytics' : null,
    plan.has_vcard_download ? 'vCard download' : null,
    plan.has_custom_themes ? 'Custom themes' : null,
    plan.remove_branding ? 'Remove branding' : null,
    plan.has_custom_domain ? 'Custom domain' : null,
  ].filter(Boolean) as string[];

  const hasActiveSub = user?.subscription_status && user.subscription_status !== 'cancelled' && !user.lifetime_access;
  const isOnFreePlan = !user?.lifetime_access && (!user?.subscription_status || user.subscription_status === 'cancelled');
  const periodEnd = user?.current_period_end
    ? new Date(user.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const confirmCancel = async () => {
    setCancelError('');
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      setCancelDone(true);
      await refreshUser();
      setTimeout(() => { setShowCancelDialog(false); setCancelDone(false); }, 3000);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <Skeleton className="h-8 w-48 mb-8" />
      <Skeleton className="h-32 w-full rounded-2xl mb-6" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  const currentPlan = plans.find(p => p.id === user?.plan_id) ?? plans[0];

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Plans & Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and plan</p>
      </div>

      {/* Current plan summary */}
      {currentPlan && (
        <Card className="bg-primary/5 border-primary/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">
                    {currentPlan.name}{user?.lifetime_access ? ' (Lifetime)' : ''}
                  </h2>
                  {user?.subscription_status && (
                    <Badge className={
                      user.subscription_status === 'active'    ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      user.subscription_status === 'past_due'  ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      user.subscription_status === 'cancelled' ? 'bg-muted text-muted-foreground border-0' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }>
                      {user.subscription_status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {user?.lifetime_access
                    ? 'Lifetime access — no renewal needed'
                    : currentPlan.price_monthly === 0
                      ? 'Free forever'
                      : `£${currentPlan.price_monthly}/month`}
                </p>
                {user?.billing_interval && !user.lifetime_access && (
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    Billed {user.billing_interval}ly
                  </p>
                )}
                {periodEnd && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {user?.subscription_status === 'cancelled'
                      ? `Access until ${periodEnd}`
                      : `Renews ${periodEnd}`}
                  </div>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                {user?.lifetime_access ? <Zap className="w-6 h-6 text-amber-400" /> : <CreditCard className="w-6 h-6 text-primary" />}
              </div>
            </div>

            {/* Cancel button — only shown for active/trialing subscriptions */}
            {hasActiveSub && (
              <div className="mt-5 pt-5 border-t border-border/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Cancel subscription</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You'll keep access until {periodEnd ?? 'the end of your billing period'}, then move to the Free plan.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 flex-shrink-0 gap-1.5"
                    onClick={() => { setCancelError(''); setShowCancelDialog(true); }}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel Plan
                  </Button>
                </div>
              </div>
            )}

            {user?.subscription_status === 'cancelled' && periodEnd && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">
                  Your subscription has been cancelled. You'll retain access to your current plan until <strong>{periodEnd}</strong>, after which your account will move to the Free plan.
                </p>
              </div>
            )}

            {/* Stripe customer portal — shown whenever user has/had a paid subscription */}
            {(hasActiveSub || user?.subscription_status === 'cancelled') && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <a href={STRIPE_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="border-border gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Manage Subscription
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Update payment method, download invoices, or manage your billing details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available plans */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
      {checkoutError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {checkoutError}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {plans.map(plan => {
          const isCurrent = plan.id === user?.plan_id;
          const features = getPlanFeatures(plan);
          const isPaidPlan = plan.price_monthly > 0 && plan.stripe_price_monthly;
          // Only free-plan users can start a new checkout; paid users manage via portal
          const canCheckout = !isCurrent && isPaidPlan && isOnFreePlan;
          const isLoadingThis = checkoutLoading === plan.id;
          return (
            <Card key={plan.id} className={`border-2 transition-all ${isCurrent ? 'border-primary' : 'border-border'} bg-card`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex gap-1.5">
                    {isCurrent && <Badge className="bg-primary text-white border-0 text-xs">Current</Badge>}
                    {plan.has_lifetime ? (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Lifetime</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  {plan.has_lifetime ? (
                    <span className="text-lg font-bold text-amber-400">Lifetime</span>
                  ) : plan.price_monthly === 0 ? (
                    <span className="text-2xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-foreground">£{plan.price_monthly}</span>
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  canCheckout ? (
                    // Free plan user → direct Stripe Checkout
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 gap-2"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoadingThis}
                    >
                      {isLoadingThis
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                        : <>Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>
                      }
                    </Button>
                  ) : isPaidPlan && !isOnFreePlan ? (
                    // Paid user → manage via Stripe portal
                    <a href={STRIPE_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full border-border gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Change Plan via Portal
                      </Button>
                    </a>
                  ) : plan.price_monthly === 0 && !isOnFreePlan ? (
                    // Paid user wanting to downgrade → portal
                    <a href={STRIPE_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full border-border gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5" /> Downgrade via Portal
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" className="w-full border-border" disabled>
                      Not available
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade interest — only shown when no paid plans have Stripe configured */}
      {plans.every(p => p.price_monthly === 0 || !p.stripe_price_monthly) && (
        <Card className="bg-muted/30 border-border mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-foreground font-medium mb-2">Need help with your plan?</p>
            <p className="text-muted-foreground text-sm mb-4">
              Contact JA Group Services to upgrade or change your plan manually.
            </p>
            <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`}>
              <Button className="bg-primary">Contact JA Group Services</Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Refer & Earn CTA */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Refer &amp; Earn
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share your referral link and earn points when friends join {branding.platform_name ?? 'JA Smart Profile'}.
            </p>
          </div>
          <Link to="/dashboard/referral">
            <Button variant="outline" size="sm" className="border-border gap-1.5 flex-shrink-0">
              View rewards <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>

          {cancelDone ? (
            <div className="py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-foreground font-medium">Subscription cancelled</p>
              <p className="text-muted-foreground text-sm mt-1">
                You'll retain access until {periodEnd ?? 'the end of your billing period'}.
              </p>
            </div>
          ) : (
            <>
              <div className="py-2 space-y-3">
                {cancelError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{cancelError}</div>
                )}
                <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
                  {[
                    periodEnd ? `You'll keep full access until ${periodEnd}` : 'You keep access until the end of your billing period',
                    'After that, your account moves to the Free plan',
                    'Your profiles and links will be preserved',
                    'This action cannot be undone',
                  ].map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === 3 ? 'bg-red-400' : 'bg-muted-foreground'}`} />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="border-border">
                  Keep my plan
                </Button>
                <Button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel subscription'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
