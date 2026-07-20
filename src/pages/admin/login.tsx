import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle, ArrowRight, BarChart3, Bot, Compass, CreditCard,
  LockKeyhole, MapPinned, RefreshCw, ShieldCheck, Users,
} from 'lucide-react';

const OIDC_ERRORS: Record<string, { title: string; body: string }> = {
  oidc_unavailable: { title: 'Sign-in temporarily unavailable', body: 'We could not complete your sign-in. Please wait a moment and try again.' },
  oidc_state_missing: { title: 'Session expired', body: 'Your sign-in session timed out. Please start again.' },
  oidc_state_invalid: { title: 'Sign-in could not be verified', body: 'Something went wrong verifying your sign-in. Please try again.' },
  oidc_wrong_tenant: { title: 'Access denied', body: 'This portal is restricted to JA Group Services Ltd accounts only.' },
  oidc_no_email: { title: 'Email address not available', body: 'We could not retrieve your email address from your account. Please try again.' },
  oidc_not_authorised: { title: 'Not authorised', body: 'Your account is not authorised for this portal. Contact your administrator.' },
  oidc_account_suspended: { title: 'Account suspended', body: 'Your account has been suspended. Contact your administrator.' },
  oidc_callback_failed: { title: 'Sign-in did not complete', body: 'Authentication did not complete successfully. Please try again.' },
};

const CONTROL_AREAS = [
  { icon: Compass, title: 'Experience builders', text: 'Manage the planning catalogue, availability and customer experience.' },
  { icon: Users, title: 'Customer CRM', text: 'Support customers, memberships, enquiries and account records.' },
  { icon: CreditCard, title: 'Plans and billing', text: 'Control subscriptions, payment settings and plan access.' },
  { icon: Bot, title: 'AI support assistant', text: 'Monitor conversations, knowledge and support escalation.' },
];

export default function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const errorCode = searchParams.get('error') ?? '';
  const errorInfo = OIDC_ERRORS[errorCode] ?? (errorCode ? { title: 'Sign-in failed', body: 'An unexpected error occurred. Please try again.' } : null);

  function handleSignIn() {
    setIsRedirecting(true);
    window.location.href = '/admin/login?return_to=%2Fadmin%2Fdashboard%2F';
  }

  return (
    <>
      <Helmet>
        <title>Admin Centre — JA Plan Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen bg-[#f4f7fc] text-slate-950">
        <header className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2463eb] text-white shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold leading-tight">JA Plan Studio</p>
                <p className="text-xs text-slate-500">Admin Centre</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              JA Group Services staff system
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
              <MapPinned className="h-3.5 w-3.5" />
              Planning platform operations
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              The control centre for <span className="text-[#2463eb]">JA Plan Studio.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Manage planning experiences, customers, memberships, support and platform operations from one secure workspace.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {CONTROL_AREAS.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.04)]">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#2463eb]"><Icon className="h-4 w-4" /></div>
                    <div>
                      <h2 className="text-sm font-semibold">{title}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-blue-600" />Live operational visibility</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-blue-600" />Microsoft sign-in and Admin PIN</span>
            </div>
          </div>

          <section aria-labelledby="admin-sign-in-title" className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,.12)] sm:p-8">
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2463eb]">Secure staff access</p>
            <h2 id="admin-sign-in-title" className="mt-2 text-2xl font-bold tracking-tight">Sign in to the Admin Centre</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use your authorised JA Group Services Microsoft account. Your personal four-digit Admin PIN is requested next.</p>

            {errorInfo && (
              <Alert variant="destructive" className="mt-5 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <span className="block font-semibold">{errorInfo.title}</span>
                  <span className="text-sm">{errorInfo.body}</span>
                </AlertDescription>
              </Alert>
            )}

            <Button type="button" size="lg" className="mt-6 h-12 w-full gap-2 font-semibold" onClick={handleSignIn} disabled={isRedirecting}>
              {isRedirecting ? <><RefreshCw className="h-4 w-4 animate-spin" />Connecting to Microsoft…</> : <>Continue with Microsoft<ArrowRight className="h-4 w-4" /></>}
            </Button>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs leading-5 text-blue-800"><LockKeyhole className="mr-1.5 inline h-3.5 w-3.5" />Authorised administrators only. Sign-ins and privileged actions are securely audited.</p>
            </div>

            <div className="my-6 h-px bg-slate-200" />
            <Button type="button" variant="outline" className="h-11 w-full" onClick={() => { window.location.href = '/login'; }}>Go to customer sign-in</Button>
          </section>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 text-xs text-slate-500 sm:px-8">
            <p>JA Plan Studio is operated by JA Group Services Ltd.</p>
            <p>Copyright 2025–{new Date().getFullYear()} JA Group Services Ltd and/or its Licensors – All Rights Reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
