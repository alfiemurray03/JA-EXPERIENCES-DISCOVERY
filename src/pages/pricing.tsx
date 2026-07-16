import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2, X, FileText, Zap, Star, Building2,
  Users, ArrowRight, ChevronDown, ChevronUp, Info,
  Clock, Shield, AlertTriangle, Loader2,
  PenLine, Gift,
} from 'lucide-react';
import {
  PLAN_LABELS, PLAN_PRICE_DISPLAY, PLAN_DRAFT_LIMIT,
  PLAN_RETENTION_DAYS, ORG_BASE_SEATS, PLAN_HAS_TRIAL,
  type PlanId,
} from '@/lib/plan-config';
import { useAuth } from '@/lib/auth-context';
import { useSiteSettings } from '@/lib/site-settings-context';
import { useFeatureConfig } from '@/lib/feature-config-context';

// ── Plan card definitions ─────────────────────────────────────────────────────
interface PlanDef {
  id: PlanId;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  highlight: boolean;
  badge: string | null;
  description: string;
  features: string[];
  notIncluded: string[];
  cta: string;
  ctaVariant: 'default' | 'outline';
  group: 'individual' | 'organisation';
  comingSoon?: boolean;
  isFree?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    icon: Gift,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    highlight: false,
    badge: null,
    description: 'Try one guided planning builder with no commitment.',
    features: [
      'Try 1 guided planning builder',
      'Preview your personalised plan',
      'Browse all planning builders',
    ],
    notIncluded: [
      'Save plans',
      'Save plans',
      'Full builder access',
      'Organisation workspaces',
    ],
    cta: 'Try for Free',
    ctaVariant: 'outline',
    group: 'individual',
    isFree: true,
  },
  {
    id: 'personal',
    icon: Clock,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    highlight: false,
    badge: null,
    description: 'For individuals who need core builders and a few active plans.',
    features: [
      'Core planning builders',
      'Save up to 3 active plans',
      'Plans kept for 14 days',
      'Download, print and share',
    ],
    notIncluded: [
      'Advanced planning builders',
      'Organisation workspace',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'outline',
    group: 'individual',
  },
  {
    id: 'standard',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    highlight: false,
    badge: null,
    description: 'For people who plan regularly and need more builders and capacity.',
    features: [
      'Expanded planning builder library',
      'Save up to 5 active plans',
      'Plans kept for 14 days',
      'Download, print and share',
    ],
    notIncluded: [
      'Every advanced builder',
      'Organisation workspace',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'outline',
    group: 'individual',
  },
  {
    id: 'professional',
    icon: Star,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    highlight: true,
    badge: 'Most Popular',
    description: 'For people who need every builder and more active plans.',
    features: [
      'Every planning builder',
      'Save up to 10 active plans',
      'Plans kept for 30 days',
      'Advanced planning tools',
      'Download, print and share',
    ],
    notIncluded: [
      'Multi-user accounts',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default',
    group: 'individual',
  },
  {
    id: 'org_starter',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    highlight: false,
    badge: null,
    description: 'For small teams getting started with shared planning.',
    features: [
      'Every planning builder',
      '2 user seats included',
      'Save up to 10 shared plans',
      'Plans kept for 30 days',
      'Shared planning workspace',
    ],
    notIncluded: [
      'Audit history',
      'Advanced permissions',
    ],
    cta: 'Get Started',
    ctaVariant: 'outline',
    group: 'organisation',
  },
  {
    id: 'org_growth',
    icon: Users,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    highlight: true,
    badge: 'Best for Teams',
    description: 'For growing teams who need a shared workspace and audit trail.',
    features: [
      'Everything in Org Starter',
      '5 user seats included',
      'Shared workspace',
      'Audit history',
      'Additional seats purchasable',
      'Team planning controls',
    ],
    notIncluded: [
      'Advanced permissions',
    ],
    cta: 'Get Started',
    ctaVariant: 'default',
    group: 'organisation',
  },
  {
    id: 'org_professional',
    icon: Shield,
    color: 'text-purple-800',
    bgColor: 'bg-purple-200',
    highlight: false,
    badge: null,
    description: 'For larger organisations needing advanced controls and reporting.',
    features: [
      'Everything in Org Growth',
      '10 user seats included',
      'Advanced permissions',
      'Reporting tools',
      'Additional seats purchasable',
      'Advanced organisation controls',
    ],
    notIncluded: [],
    cta: 'Get Started',
    ctaVariant: 'outline',
    group: 'organisation',
  },
];

// ── Comparison table ──────────────────────────────────────────────────────────
type CellVal = string | boolean;
interface CompRow {
  label: string;
  section?: string;
  free: CellVal; personal: CellVal; standard: CellVal; professional: CellVal;
  org_starter: CellVal; org_growth: CellVal; org_professional: CellVal;
}

const COMPARISON: CompRow[] = [
  { section: 'Planning builders', label: '',
    free: false, personal: false, standard: false, professional: false, org_starter: false, org_growth: false, org_professional: false },
  { label: 'Browse full catalogue',    free: true,           personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Guided builder demo',      free: '1 builder',    personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Core planning builders',   free: false,          personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Expanded builder library', free: false,          personal: false,         standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Advanced planning tools',  free: false,          personal: false,         standard: false,         professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { section: 'Saved Plans', label: '',
    free: false, personal: false, standard: false, professional: false, org_starter: false, org_growth: false, org_professional: false },
  { label: 'Save active plans',        free: false,          personal: '3 plans',     standard: '5 plans',     professional: '10 plans',    org_starter: '10 (shared)', org_growth: '10 (shared)', org_professional: '10 (shared)' },
  { label: 'Plan retention',           free: 'None',         personal: '14 days',     standard: '14 days',     professional: '30 days',     org_starter: '30 days',     org_growth: '30 days',     org_professional: '30 days' },
  { label: 'PDF export',               free: true,           personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { section: 'Planning and sharing', label: '',
    free: false, personal: false, standard: false, professional: false, org_starter: false, org_growth: false, org_professional: false },
  { label: 'Download, print and share',free: false,          personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Logo uploads',             free: false,          personal: true,          standard: true,          professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Active plans',             free: false,          personal: '3',           standard: '5',           professional: '10',          org_starter: '10 shared',  org_growth: '10 shared',  org_professional: '10 shared' },
  { label: 'Advanced layouts',         free: false,          personal: false,         standard: false,         professional: true,          org_starter: true,          org_growth: true,          org_professional: true },
  { section: 'Organisation workspace', label: '',
    free: false, personal: false, standard: false, professional: false, org_starter: false, org_growth: false, org_professional: false },
  { label: 'Shared planning',          free: false,          personal: false,         standard: false,         professional: false,         org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Max signers per doc',      free: false,          personal: false,         standard: false,         professional: '5',           org_starter: '10',          org_growth: '20',           org_professional: '50' },
  { label: 'Audit certificate',        free: false,          personal: false,         standard: false,         professional: true,          org_starter: true,          org_growth: true,           org_professional: true },
  { section: 'Team & Organisation', label: '',
    free: false, personal: false, standard: false, professional: false, org_starter: false, org_growth: false, org_professional: false },
  { label: 'User seats',               free: '1',            personal: '1',           standard: '1',           professional: '1',           org_starter: '2',           org_growth: '5',           org_professional: '10' },
  { label: 'Additional seats',         free: false,          personal: false,         standard: false,         professional: false,         org_starter: true,          org_growth: true,          org_professional: true },
  { label: 'Shared workspace',         free: false,          personal: false,         standard: false,         professional: false,         org_starter: false,         org_growth: true,          org_professional: true },
  { label: 'Audit history',            free: false,          personal: false,         standard: false,         professional: false,         org_starter: false,         org_growth: true,          org_professional: true },
  { label: 'Advanced permissions',     free: false,          personal: false,         standard: false,         professional: false,         org_starter: false,         org_growth: false,         org_professional: true },
  { label: 'Reporting tools',          free: false,          personal: false,         standard: false,         professional: false,         org_starter: false,         org_growth: false,         org_professional: true },
];

const FAQS_STATIC = [
  { q: 'Is there a free plan?', a: 'Yes. The Free plan lets you try one guided planning builder. Paid plans let you save plans and unlock more builders.' },
  { q: 'Is there a free trial?', a: 'Personal, Standard, and Professional plans include a 14-day free trial with no credit card required. Organisation plans do not include a trial.' },
  { q: 'What happens to my saved plans when my subscription expires?', a: 'Plans are automatically deleted when they reach their retention period (14 days for Personal and Standard, 30 days for Professional and Organisation plans). Download anything you need to keep.' },
  { q: 'Is there permanent plan storage?', a: 'No. Saved plans are temporary working copies. The maximum retention period is 30 days, so download plans you need to keep.' },
  { q: 'Can I cancel at any time?', a: 'Yes. Cancel from your account settings at any time. You keep access until the end of your billing period.' },
  { q: 'What are additional seats?', a: 'Organisation plans include a base number of user seats. You can purchase additional User, Manager, or Admin seats separately through your account settings.' },
  { q: 'Can I upgrade or downgrade?', a: 'Yes. Change your plan at any time from account settings. Changes take effect at the next billing period.' },
  { q: 'Is my data secure?', a: 'We operate in compliance with UK GDPR. Your plans and personal data are handled in accordance with our Privacy Policy.' },
];

function CellValue({ value }: { value: CellVal }) {
  if (value === true)  return <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-foreground font-medium">{value}</span>;
}

function PlanCard({ plan, onCheckout, checkoutLoading, isLoggedIn, paymentsEnabled }: {
  plan: PlanDef;
  onCheckout: (planId: PlanId) => void;
  checkoutLoading: string | null;
  isLoggedIn: boolean;
  paymentsEnabled: boolean;
}) {
  const retentionDays = PLAN_RETENTION_DAYS[plan.id];
  const draftLimit    = PLAN_DRAFT_LIMIT[plan.id];
  const baseSeats     = ORG_BASE_SEATS[plan.id];
  const hasTrial      = PLAN_HAS_TRIAL[plan.id];
  const Icon          = plan.icon;
  const isLoading     = checkoutLoading === plan.id;
  // Treat as coming soon if payments are off (except free plan)
  const effectiveComingSoon = plan.comingSoon || (!paymentsEnabled && !plan.isFree);

  function handleCta() {
    if (plan.isFree) {
      window.location.href = '/builders';
      return;
    }
    if (!isLoggedIn) {
      window.location.href = '/sign-in';
      return;
    }
    onCheckout(plan.id);
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md ${plan.highlight ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${effectiveComingSoon ? 'opacity-75' : ''}`}>
      {/* Coming Soon ribbon */}
      {effectiveComingSoon && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-amber-500 text-white px-3 py-1 text-xs font-semibold shadow">
            Coming Soon
          </Badge>
        </div>
      )}
      {/* Badge for non-coming-soon plans */}
      {!effectiveComingSoon && plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow">
            {plan.badge}
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${plan.bgColor} mb-3`}>
          <Icon className={`w-5 h-5 ${plan.color}`} />
        </div>
        <h3 className="text-lg font-bold text-foreground">{PLAN_LABELS[plan.id]}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground">{PLAN_PRICE_DISPLAY[plan.id]}</span>
          {plan.id !== 'free' && <span className="text-sm text-muted-foreground">/month</span>}
        </div>
        {hasTrial && !effectiveComingSoon && (
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 14-day free trial included
          </p>
        )}
        {effectiveComingSoon && (
          <p className="text-xs text-amber-600 font-medium mt-1">Launching soon</p>
        )}
      </div>

      {/* Key limits */}
      <div className="flex flex-wrap gap-2 mb-4">
        {plan.id === 'free' ? (
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <FileText className="w-3 h-3" /> 1 builder demo
          </span>
        ) : draftLimit > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <FileText className="w-3 h-3" /> {draftLimit} active plans
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <FileText className="w-3 h-3" /> No saved plans
          </span>
        )}
        {retentionDays && (
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <Clock className="w-3 h-3" /> {retentionDays}-day retention
          </span>
        )}
        {plan.group === 'organisation' && (
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <Users className="w-3 h-3" /> {baseSeats} seats
          </span>
        )}
      </div>

      <ul className="space-y-2 mb-4 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
        {plan.notIncluded.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/60">
            <X className="w-4 h-4 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {effectiveComingSoon ? (
          <Button
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 cursor-default"
            disabled
          >
            Coming Soon
          </Button>
        ) : (
          <Button
            variant={plan.ctaVariant}
            className="w-full gap-2"
            onClick={handleCta}
            disabled={isLoading}
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : <>{plan.cta} <ArrowRight className="w-4 h-4" /></>
            }
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { siteName } = useSiteSettings();
  const { config: featureConfig } = useFeatureConfig();
  const paymentsEnabled = featureConfig.payments;

  const FAQS = [
    ...FAQS_STATIC,
    { q: 'Who owns my plans?', a: `You own the planning content you create. ${siteName} provides the tools — the content is entirely yours.` },
  ];
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const { user } = useAuth();

  const cancelled = searchParams.get('checkout') === 'cancelled';

  const individualPlans = PLANS.filter(p => p.group === 'individual');
  const orgPlans        = PLANS.filter(p => p.group === 'organisation');

  async function handleCheckout(planId: PlanId) {
    setCheckoutError('');
    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json() as { success: boolean; url?: string; error?: string };
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? 'Unable to start checkout. Please try again.');
      }
    } catch {
      setCheckoutError('Network error. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <>
      <Helmet>
        <title>Pricing — {siteName}</title>
        <meta name="description" content="Choose the right JA Plan Studio subscription for your planning needs, with clear builder access, saved-plan limits and organisation options." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 px-4 text-center">
          <Badge variant="outline" className="mb-4 text-xs">Transparent Pricing</Badge>
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Start free with one guided builder. Upgrade to save plans and unlock more planning tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-3 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Sign-ups are now open — 14-day free trial on paid plans
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Max saved-plan retention: 30 days. Download plans you need to keep.
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          {!paymentsEnabled && (
            <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Paid plans coming soon</p>
                <p className="text-sm text-amber-700 mt-0.5">We are finalising our billing system. Paid plans will be available shortly. You can still use the platform with a free account in the meantime.</p>
              </div>
            </div>
          )}
          {cancelled && (
            <Alert className="mb-8 border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Checkout was cancelled. Your plan has not changed.
              </AlertDescription>
            </Alert>
          )}

          {checkoutError && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{checkoutError}</AlertDescription>
            </Alert>
          )}

          {/* Individual plans */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Individual Plans</h2>
            <p className="text-muted-foreground text-center mb-8">For individuals and anyone planning for everyday life</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {individualPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onCheckout={handleCheckout}
                  checkoutLoading={checkoutLoading}
                  isLoggedIn={!!user}
                  paymentsEnabled={paymentsEnabled}
                />
              ))}
            </div>
          </div>

          {/* Organisation plans */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Organisation Plans</h2>
            <p className="text-muted-foreground text-center mb-4">For teams and groups — shared planning with multiple users</p>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm mb-8 mx-auto flex justify-center">
              <Info className="w-4 h-4 shrink-0" />
              Additional User, Manager, and Admin seats can be purchased separately from your account settings.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {orgPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onCheckout={handleCheckout}
                  checkoutLoading={checkoutLoading}
                  isLoggedIn={!!user}
                  paymentsEnabled={paymentsEnabled}
                />
              ))}
            </div>
          </div>

          {/* Planning workspace callout */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <PenLine className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Every planning builder is included from Professional</h3>
              <p className="text-sm text-muted-foreground">
                Use the complete builder library, advanced planning tools and longer saved-plan retention. Organisation subscriptions add shared workspaces and managed seats.
              </p>
            </div>
            {user ? (
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <Link to="/settings?tab=subscription">
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <Link to="/sign-in">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
          </div>

          {/* Plan retention notice */}
          <div className="bg-muted/50 border border-border rounded-2xl p-6 mb-16">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              About Saved Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Saved plans are temporary working copies</p>
                <p>Saved plans let you return to planning in progress. They are not permanent storage, so download anything you need to keep.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Automatic deletion</p>
                <p>Plans are permanently deleted when they reach their retention period. There is no archive or recovery after deletion.</p>
              </div>
            </div>
          </div>

          {/* Comparison table toggle */}
          <div className="mb-16">
            <button
              onClick={() => setShowComparison(v => !v)}
              className="flex items-center gap-2 mx-auto text-sm font-medium text-primary hover:underline mb-6"
            >
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showComparison ? 'Hide' : 'Show'} full feature comparison
            </button>

            {showComparison && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-foreground w-48">Feature</th>
                      {(['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional'] as PlanId[]).map(p => (
                        <th key={p} className={`text-center px-3 py-3 font-semibold text-xs ${p === 'professional' ? 'text-primary' : 'text-foreground'}`}>
                          {PLAN_LABELS[p]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => {
                      if (row.section) {
                        return (
                          <tr key={i} className="bg-muted/30">
                            <td colSpan={8} className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {row.section}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground">{row.label}</td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.free} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.personal} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.standard} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.professional} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.org_starter} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.org_growth} /></td>
                          <td className="px-3 py-3 text-center"><CellValue value={row.org_professional} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
                  >
                    {faq.q}
                    {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
