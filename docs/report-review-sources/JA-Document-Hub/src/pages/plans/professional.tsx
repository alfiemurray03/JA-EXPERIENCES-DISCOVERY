import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, Star, Lock, ArrowLeft, AlertTriangle, Download } from 'lucide-react';
import { useState } from 'react';

const INCLUDED = [
  'Browse the full template catalogue (100+ templates)',
  'Free templates — full access',
  'Standard templates — full access',
  'Professional templates — full access',
  'Save up to 10 draft documents',
  'Drafts automatically deleted after 30 days',
  'PDF export with premium layouts',
  'Multiple branding profiles',
  'Advanced editing tools',
  'Custom branding on documents',
  'Logo uploads',
];

const NOT_INCLUDED = [
  'Organisation templates',
  'Multi-user accounts',
  'Shared workspace',
  'Audit history',
  'Advanced permissions',
];

export default function ProfessionalPlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) { navigate('/register?plan=professional'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: 'professional' }),
      });
      const data = await res.json() as { success: boolean; url?: string; error?: string };
      if (data.success && data.url) window.location.href = data.url;
      else alert(data.error ?? 'Unable to start checkout.');
    } catch { alert('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Helmet>
        <title>Professional Plan — JA Document Hub</title>
        <meta name="description" content="Professional plan: all templates, save up to 10 drafts for 30 days, multiple branding profiles, advanced editing. £14.99/month." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pricing
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-foreground">Professional Plan</h1>
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              <Badge variant="secondary">£14.99/month</Badge>
            </div>
            <p className="text-muted-foreground">For businesses and professionals needing premium templates and advanced branding.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">30-day draft retention</p>
            <p>Saved drafts are automatically and permanently deleted after 30 days. There is no recovery. Always export your documents before the retention period ends.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-foreground">10</p>
            <p className="text-sm text-muted-foreground">Saved drafts</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-foreground">30</p>
            <p className="text-sm text-muted-foreground">Days retention</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-foreground mb-4">What's included</h2>
          <ul className="space-y-3">
            {INCLUDED.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-foreground mb-4">Not included</h2>
          <ul className="space-y-3">
            {NOT_INCLUDED.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" /> Template Access
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" /> Free templates
            </div>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" /> Standard templates
            </div>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" /> Professional templates
            </div>
            <div className="flex items-center gap-2 text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <Lock className="w-4 h-4" /> Organisation templates
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Export before your retention period ends</p>
            <p>Drafts are deleted after 30 days with no recovery. Export your PDF as soon as your document is ready.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleCheckout} disabled={loading} className="flex-1">
            {loading ? 'Starting checkout…' : 'Start Free Trial — £14.99/month'}
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/plans/org-starter">See Organisation Plans →</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">14-day free trial. Cancel anytime.</p>
      </div>
    </>
  );
}
