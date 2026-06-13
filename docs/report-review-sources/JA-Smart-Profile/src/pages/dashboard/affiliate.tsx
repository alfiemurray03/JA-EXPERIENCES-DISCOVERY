/**
 * Dashboard — Affiliate Programme page
 * Earn real cash commissions by referring paying customers.
 * Completely separate from Refer & Earn (points system).
 */
import { useState, useEffect } from 'react';
import {
  DollarSign, Copy, Check, Globe, Star, ArrowRight, Bell, Mail,
  Clock, CheckCircle2, XCircle, BarChart3, Banknote, Percent, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';

const APP_URL = 'https://jasmartprofile.jagroupservices.co.uk';

interface AffiliateData {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  commission_rate: number;
  affiliate_code: string | null;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  commissions: Commission[];
  totalEarned: number;
  pendingPayout: number;
}

interface Commission {
  id: number;
  plan_name: string;
  amount_gbp: number;
  commission_gbp: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at: string | null;
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const branding = useBranding();

  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    website: '',
    audience: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/affiliate/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setAffiliateData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const affiliateLink = affiliateData?.affiliate_code
    ? `${APP_URL}/?aff=${affiliateData.affiliate_code}`
    : null;

  const copyLink = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      if (data.existing) {
        setAlreadyApplied(true);
      } else {
        setSubmitted(true);
        // Refresh status
        const me = await fetch('/api/affiliate/me', { credentials: 'include' }).then(r => r.json());
        if (me.success && me.data) setAffiliateData(me.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1"><CheckCircle2 className="w-3 h-3" />Approved</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 gap-1"><XCircle className="w-3 h-3" />Not Approved</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1"><Clock className="w-3 h-3" />Under Review</Badge>;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Affiliate Programme</h1>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
            <DollarSign className="w-3 h-3 mr-1" /> Cash Commissions
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Earn real money by referring paying customers to {branding.platform_name ?? 'JA Smart Profile'}.
          Different from Refer &amp; Earn — this pays cash, not points.
        </p>
      </div>

      {/* ── APPROVED STATE ── */}
      {affiliateData?.status === 'approved' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Commission Rate', value: `${affiliateData.commission_rate}%`, icon: Percent, color: 'text-primary' },
              { label: 'Total Earned', value: `£${affiliateData.totalEarned.toFixed(2)}`, icon: Banknote, color: 'text-green-400' },
              { label: 'Pending Payout', value: `£${affiliateData.pendingPayout.toFixed(2)}`, icon: Clock, color: 'text-amber-400' },
            ].map(stat => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Affiliate link */}
          <Card className="bg-primary/5 border-primary/20 mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Your Affiliate Link
              </CardTitle>
              <CardDescription>
                Share this link. When someone subscribes via your link, you earn {affiliateData.commission_rate}% commission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={affiliateLink ?? ''}
                  className="bg-background border-border text-sm font-mono flex-1"
                  onFocus={e => e.target.select()}
                />
                <Button onClick={copyLink} variant="outline" className="border-border gap-1.5 flex-shrink-0">
                  {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Affiliate code: <span className="font-mono text-foreground">{affiliateData.affiliate_code}</span>
              </p>
            </CardContent>
          </Card>

          {/* Commission history */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Commission History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {affiliateData.commissions.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No commissions yet. Share your link to start earning.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Plan</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Sale</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Commission</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                        <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliateData.commissions.map(c => (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm text-foreground">{c.plan_name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">£{c.amount_gbp.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-400">£{c.commission_gbp.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            {c.status === 'paid'
                              ? <Badge className="bg-green-500/10 text-green-400 border-0 text-xs">Paid</Badge>
                              : <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">Pending</Badge>}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout info */}
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Payout schedule</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Commissions are paid monthly via bank transfer or PayPal. Contact{' '}
                  <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`} className="text-primary hover:underline">
                    {branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}
                  </a>{' '}
                  to update your payment details.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── PENDING STATE ── */}
      {affiliateData?.status === 'pending' && (
        <Card className="bg-amber-500/5 border-amber-500/20 mb-6">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Application under review</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your affiliate application was submitted on {new Date(affiliateData.created_at).toLocaleDateString('en-GB')}.
                JA Group Services will review it and get back to you within 3–5 business days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── REJECTED STATE ── */}
      {affiliateData?.status === 'rejected' && (
        <Card className="bg-red-500/5 border-red-500/20 mb-6">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Application not approved</p>
              {affiliateData.rejection_reason && (
                <p className="text-sm text-muted-foreground mt-1">{affiliateData.rejection_reason}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Questions? Contact{' '}
                <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`} className="text-primary hover:underline">
                  {branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── NO APPLICATION YET ── */}
      {!affiliateData && (
        <>
          {/* How it works */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Globe,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   step: '1', title: 'Apply',           desc: 'Fill in the short application below. We review all applications within 3–5 business days.' },
                  { icon: DollarSign,  color: 'text-green-400',  bg: 'bg-green-500/10',  step: '2', title: 'Share & earn',    desc: 'Get your unique link. Every paying customer you refer earns you a cash commission.' },
                  { icon: Banknote,    color: 'text-amber-400',  bg: 'bg-amber-500/10',  step: '3', title: 'Get paid',        desc: 'Commissions are paid monthly via bank transfer or PayPal.' },
                ].map(item => (
                  <div key={item.step} className="text-center">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">Step {item.step}</p>
                    <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  'Competitive commission rates on all paid plans',
                  'Monthly payouts via bank transfer or PayPal',
                  'Unique affiliate tracking link provided on approval',
                  'Dedicated affiliate support from JA Group Services',
                  'No minimum traffic requirements to apply',
                  'Lifetime commissions on referred customers',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Apply to join
              </CardTitle>
              <CardDescription>
                Tell us a bit about yourself and how you plan to promote {branding.platform_name ?? 'JA Smart Profile'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted || alreadyApplied ? (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {alreadyApplied ? 'Application already submitted' : 'Application received!'}
                    </p>
                    <p className="text-xs mt-0.5">We'll review your application and email you within 3–5 business days.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Your Name *</Label>
                      <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="bg-background border-border" placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Email Address *</Label>
                      <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="bg-background border-border" placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Website / Social Profile</Label>
                    <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="bg-background border-border" placeholder="https://yourwebsite.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Your Audience</Label>
                    <Input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                      className="bg-background border-border" placeholder="e.g. Small business owners, freelancers, 5k LinkedIn followers" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">How will you promote us?</Label>
                    <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="bg-background border-border resize-none" rows={3}
                      placeholder="Tell us about your promotional channels and strategy…" />
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <p className="text-xs text-muted-foreground">
                      We'll only contact you about the Affiliate Programme.
                    </p>
                    <Button type="submit" disabled={submitting} className="bg-primary gap-2 flex-shrink-0">
                      {submitting ? 'Submitting…' : <><Star className="w-3.5 h-3.5" /> Apply now</>}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Have a question?</p>
                <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> Contact us <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Status badge for pending/rejected */}
      {affiliateData && affiliateData.status !== 'approved' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          Application status: {statusBadge(affiliateData.status)}
        </div>
      )}
    </div>
  );
}
