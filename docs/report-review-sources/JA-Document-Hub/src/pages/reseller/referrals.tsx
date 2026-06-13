import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link2, Copy, CheckCircle2, MousePointerClick, UserPlus, TrendingUp } from 'lucide-react';

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  stats: { clicks: number; signups: number };
  recentClicks: Array<{ landingPage: string | null; createdAt: string }>;
}

export default function ResellerReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  useEffect(() => {
    fetch('/api/reseller/referrals', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  function copy(text: string, type: 'link' | 'code') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>Referral Links — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Referral Links & Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Share your unique link to track signups and earn commissions.</p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Total Clicks</span>
                <MousePointerClick className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">{loading ? '—' : data?.stats.clicks ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Total Signups</span>
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">{loading ? '—' : data?.stats.signups ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral link */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Your Referral Link</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">REFERRAL LINK</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2.5 rounded-lg truncate text-foreground border border-border">
                  {data?.referralLink ?? '—'}
                </code>
                <Button size="sm" variant="outline" onClick={() => data?.referralLink && copy(data.referralLink, 'link')} disabled={!data?.referralLink}>
                  {copied === 'link' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">REFERRAL CODE</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold text-primary bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                  {data?.referralCode ?? '—'}
                </code>
                <Button size="sm" variant="outline" onClick={() => data?.referralCode && copy(data.referralCode, 'code')} disabled={!data?.referralCode}>
                  {copied === 'code' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent clicks */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Recent Clicks</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !data?.recentClicks.length ? (
              <p className="text-sm text-muted-foreground">No clicks recorded yet. Share your referral link to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Landing Page</th>
                      <th className="text-left py-2 font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.recentClicks.map((c, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="py-2 pr-4 text-muted-foreground truncate max-w-xs">{c.landingPage ?? '/'}</td>
                        <td className="py-2 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResellerLayout>
    </ComingSoonOverlay>
  );
}
