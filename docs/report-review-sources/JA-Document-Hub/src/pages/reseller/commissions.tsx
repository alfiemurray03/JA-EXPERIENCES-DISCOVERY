import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PoundSterling } from 'lucide-react';

function pence(p: number) { return `£${(p / 100).toFixed(2)}`; }

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  on_hold: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface Commission {
  uuid: string; type: string; plan: string | null;
  amountGbp: number; commissionGbp: number; status: string;
  paymentRef: string | null; paidAt: string | null; createdAt: string;
}

interface CommissionsData {
  commissions: Commission[];
  totals: { pending: number; approved: number; paid: number; rejected: number; on_hold: number };
}

export default function ResellerCommissionsPage() {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/reseller/commissions', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>Commissions — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commissions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your earnings and payout status.</p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending', key: 'pending', color: 'text-amber-600' },
            { label: 'Approved', key: 'approved', color: 'text-blue-600' },
            { label: 'Paid', key: 'paid', color: 'text-green-600' },
            { label: 'On Hold', key: 'on_hold', color: 'text-slate-600' },
          ].map(({ label, key, color }) => (
            <Card key={key}>
              <CardContent className="pt-4 pb-3">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className={`text-xl font-bold ${color}`}>
                  {loading ? '—' : pence(data?.totals[key as keyof typeof data.totals] ?? 0)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* History */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><PoundSterling className="w-4 h-4 text-primary" /> Commission History</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : !data?.commissions.length ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No commissions yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Plan</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Sale Value</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Commission</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Payment Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.commissions.map(c => (
                      <tr key={c.uuid} className="hover:bg-muted/20">
                        <td className="py-3 px-4 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="py-3 px-4 text-foreground capitalize">{c.type}</td>
                        <td className="py-3 px-4 text-muted-foreground">{c.plan ?? '—'}</td>
                        <td className="py-3 px-4 text-right text-foreground">{pence(c.amountGbp)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">{pence(c.commissionGbp)}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs ${STATUS_STYLES[c.status] ?? ''}`}>{c.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{c.paymentRef ?? '—'}</td>
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
