import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/lib/site-settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Building2, ArrowLeft, Loader2 } from 'lucide-react';

export default function ResellerApplyPage() {
  const { siteName } = useSiteSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', company: '', website: '',
    vatNumber: '', businessType: '', expectedVolume: '', howHeard: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.agreedToTerms) { setError('You must agree to the Reseller Terms.'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/reseller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) setSuccess(true);
      else setError(d.error ?? 'Failed to submit application.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Helmet><title>Application Submitted — {siteName}</title></Helmet>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Application Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to become a {siteName} reseller. Our team will review your application
              and get back to you within 3–5 business days.
            </p>
            <Button asChild variant="outline">
              <Link to="/partners"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Partners</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reseller Application — {siteName}</title>
        <meta name="description" content={`Apply to become an authorised ${siteName} reseller.`} />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/partners" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Partners
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reseller Application</h1>
          </div>
          <p className="text-muted-foreground">
            Complete the form below to apply to become an authorised {siteName} reseller.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} required placeholder="Jane Smith" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="jane@company.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 000000" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Ltd" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input id="vatNumber" value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} placeholder="GB123456789" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" value={form.businessType} onChange={e => set('businessType', e.target.value)} placeholder="e.g. IT Reseller, Accountant, Business Consultant" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expectedVolume">Expected Monthly Volume</Label>
                <Input id="expectedVolume" value={form.expectedVolume} onChange={e => set('expectedVolume', e.target.value)} placeholder="e.g. 10–50 customers/month" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="howHeard">How did you hear about us?</Label>
                <Input id="howHeard" value={form.howHeard} onChange={e => set('howHeard', e.target.value)} placeholder="e.g. Google, referral, LinkedIn" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={e => set('agreedToTerms', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline" target="_blank">Reseller Terms and Conditions</Link>
                  {' '}and confirm that the information provided is accurate.
                  <span className="text-destructive"> *</span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : 'Submit Application'}
          </Button>
        </form>
      </div>
    </>
  );
}
