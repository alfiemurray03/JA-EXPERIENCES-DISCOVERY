import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { getDocuments } from '@/lib/document-store';
import { CATEGORY_LABELS } from '@/lib/document-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Plus, CheckCircle2, FileEdit, BookTemplate,
  ArrowRight, Zap, Clock, TrendingUp, FolderOpen,
  MessageSquare, Shield, Star,
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';
import { LETTER_TEMPLATES } from '@/lib/builders/letter-templates';
import { EMAIL_BUILDER_TEMPLATES } from '@/lib/builders/email-builder-templates';
import { INVOICE_TEMPLATES } from '@/lib/builders/invoice-templates';
import { CONTRACT_TEMPLATES } from '@/lib/builders/contract-templates';
import { POLICY_TEMPLATES } from '@/lib/builders/policy-templates';

// Quick-start builder shortcuts shown on the dashboard
// Template counts are approximate — actual counts come from the DB
const QUICK_BUILDERS = [
  { label: 'Letter Builder',    href: '/letter-builder',    count: LETTER_TEMPLATES.length },
  { label: 'Email Builder',     href: '/email-builder',     count: EMAIL_BUILDER_TEMPLATES.length },
  { label: 'Invoice Builder',   href: '/invoice-builder',   count: INVOICE_TEMPLATES.length },
  { label: 'Contract Builder',  href: '/contract-builder',  count: CONTRACT_TEMPLATES.length },
  { label: 'Policy Builder',    href: '/policy-builder',    count: POLICY_TEMPLATES.length },
];
import type { SavedDocument } from '@/lib/document-types';
import { useSiteSettings } from '@/lib/site-settings-context';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  complete: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

// Plan draft limits (matches plan-config.ts)
const PLAN_LIMITS: Record<string, number> = {
  free:             0,
  personal:         3,
  standard:         5,
  professional:     10,
  org_starter:      10,
  org_growth:       10,
  org_professional: 10,
  organisation:     10,  // legacy
  business:         10,  // legacy
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { siteName } = useSiteSettings();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutBanner, setCheckoutBanner] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle return from Stripe checkout
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const checkoutPlan   = searchParams.get('plan');

    if (checkoutStatus === 'success' || checkoutStatus === 'pending') {
      // Remove query params from URL immediately
      setSearchParams({}, { replace: true });

      // Show banner
      const planLabel = checkoutPlan
        ? checkoutPlan.charAt(0).toUpperCase() + checkoutPlan.slice(1)
        : 'your new';
      setCheckoutBanner(`Welcome to the ${planLabel} plan! Your account is being activated…`);

      // Poll /api/auth/me until the plan updates (webhook may take a few seconds)
      let attempts = 0;
      pollRef.current = setInterval(() => {
        attempts++;
        refreshUser();
        if (attempts >= 10) {
          // Stop after 10 attempts (~20s)
          if (pollRef.current) clearInterval(pollRef.current);
          setCheckoutBanner(prev =>
            prev ? `Your ${planLabel} plan is now active. Welcome aboard!` : null
          );
        }
      }, 2000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void Promise.all([
      getDocuments(),
      fetch('/api/favourites', { credentials: 'include' }).then(r => r.json() as Promise<{ favourites?: string[] }>),
    ]).then(([docs, favData]) => {
      setDocuments(docs);
      setFavourites(favData.favourites ?? []);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => ({
    total: documents.length,
    drafts: documents.filter((d) => d.status === 'draft').length,
    completed: documents.filter((d) => d.status === 'complete' || d.status === 'completed').length,
  }), [documents]);

  const recentDocs = useMemo(() =>
    [...documents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [documents]
  );

  const limit = PLAN_LIMITS[user?.plan ?? 'personal'] ?? 5;
  const usagePct = Math.min(100, limit > 0 ? Math.round((stats.drafts / limit) * 100) : 0);
  const nearLimit = usagePct >= 80;

  // (favourites/recently-used template tracking removed — builders hub replaces template library)

  // Stop polling once the plan has updated in the auth context
  useEffect(() => {
    if (checkoutBanner && user?.plan && user.plan !== 'free') {
      if (pollRef.current) clearInterval(pollRef.current);
      setCheckoutBanner(`Your ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} plan is now active. Welcome aboard!`);
    }
  }, [user?.plan, checkoutBanner]);

  return (
    <>
      <Helmet>
        <title>Dashboard — {siteName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Checkout success banner */}
          {checkoutBanner && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm font-semibold text-green-800 flex-1">{checkoutBanner}</p>
              <button
                onClick={() => setCheckoutBanner(null)}
                className="text-green-600 hover:text-green-800 text-lg leading-none"
                aria-label="Dismiss"
              >×</button>
            </div>
          )}

          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.firstName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <p className="text-muted-foreground text-sm">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {/* Plan badge */}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {user?.plan === 'org_starter' ? 'Org Starter'
                    : user?.plan === 'org_growth' ? 'Org Growth'
                    : user?.plan === 'org_professional' ? 'Org Pro'
                    : (user?.plan ?? 'free').charAt(0).toUpperCase() + (user?.plan ?? 'free').slice(1)}
                </span>
                {user?.planIsLifetime && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                    ★ Lifetime
                  </span>
                )}
                {user?.planExpiresAt && !user.planIsLifetime && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    Expires {new Date(user.planExpiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {/* Usage type badge */}
                {user?.usageType && user.usageType !== 'both' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border capitalize">
                    {user.usageType === 'personal' ? '👤 Personal' : '🏢 Business'}
                  </span>
                )}
              </div>
            </div>
            <Button asChild className="gap-2 shrink-0">
              <Link to="/builders">
                <Plus className="w-4 h-4" />
                Create Document
              </Link>
            </Button>
          </div>

          {/* Usage-type contextual tip */}
          {user?.usageType === 'personal' && user.plan !== 'free' && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Personal document templates</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  Your plan includes personal-use templates — tenancy agreements, personal letters, and more.{' '}
                  <Link to="/builders" className="font-semibold underline">Browse builders</Link>.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saved Drafts</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {loading ? '—' : stats.drafts}
                      {!loading && user && (() => {
                        const limits: Record<string, number> = { personal: 3, standard: 5, professional: 10, org_starter: 10, org_growth: 10, org_professional: 10 };
                        const limit = limits[user.plan ?? 'personal'] ?? 0;
                        return limit > 0 ? <span className="text-base font-normal text-muted-foreground">/{limit}</span> : null;
                      })()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <FileEdit className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{loading ? '—' : stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Favourites</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{loading ? '—' : favourites.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Draft usage meter / retention notice */}
          {limit > 0 && (
            <Card className={nearLimit ? 'border-amber-300 bg-amber-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${nearLimit ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium text-foreground">Draft Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stats.drafts} / {limit} drafts
                  </span>
                </div>
                <Progress value={usagePct} className={`h-2 ${nearLimit ? '[&>div]:bg-amber-500' : ''}`} />
                {nearLimit && (
                  <p className="text-xs text-amber-700 mt-2">
                    You're approaching your plan limit.{' '}
                    <Link to="/pricing" className="font-semibold underline">Upgrade your plan</Link> to create more documents.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Recent Documents
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/documents" className="gap-1 text-xs">
                        View all <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}
                    </div>
                  ) : recentDocs.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No documents yet</p>
                      <Button asChild size="sm" className="mt-3 gap-2">
                        <Link to="/builders">
                          <Plus className="w-4 h-4" />
                          Create your first document
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentDocs.map((doc) => (
                        <Link
                          key={doc.id}
                          to={`/documents/${doc.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {doc.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {CATEGORY_LABELS[doc.category]} · {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_COLORS[doc.status]}`}>
                            {doc.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick Start Builders */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BookTemplate className="w-4 h-4 text-muted-foreground" /> Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {QUICK_BUILDERS.map((b) => (
                    <Link
                      key={b.href}
                      to={b.href}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate flex-1">{b.label}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{b.count} templates</span>
                    </Link>
                  ))}
                  <Button variant="outline" size="sm" asChild className="w-full mt-2 gap-2">
                    <Link to="/builders">
                      <BookTemplate className="w-4 h-4" />
                      All builders
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Documents shortcut */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    My Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xl font-bold text-foreground">{stats.drafts}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Drafts</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xl font-bold text-foreground">{stats.completed}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full gap-2">
                    <Link to="/documents">
                      <FolderOpen className="w-4 h-4" />
                      View all documents
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plan upgrade prompt for users on personal plan */}
              {user?.plan === 'personal' && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Upgrade to Professional</p>
                        <p className="text-xs text-muted-foreground mt-1">Unlock all templates, unlimited documents, and more.</p>
                        <Button size="sm" className="mt-3 w-full" asChild>
                          <Link to="/pricing">View Plans</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick links */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/support">
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      Support Centre
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/privacy-settings">
                      <Shield className="w-4 h-4" aria-hidden="true" />
                      Privacy & Data
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/settings">
                      <Star className="w-4 h-4" aria-hidden="true" />
                      Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800">
              <strong>Important:</strong> Documents generated by {siteName} are template-based and intended as a starting point only. They do not constitute legal advice. Users are responsible for ensuring all documents are suitable for their specific circumstances before use. Always seek professional legal advice where required.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
