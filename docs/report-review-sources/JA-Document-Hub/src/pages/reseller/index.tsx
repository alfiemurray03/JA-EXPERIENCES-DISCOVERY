import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { useResellerAuth } from '@/lib/reseller-auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, Link2, PoundSterling, TrendingUp, MousePointerClick,
  ArrowRight, Megaphone, AlertTriangle,
} from 'lucide-react';

function pence(p: number) { return `£${(p / 100).toFixed(2)}`; }

interface DashboardData {
  stats: {
    totalCustomers: number; totalClicks: number;
    commissionPending: number; commissionApproved: number; commissionPaid: number;
  };
  reseller: {
    fullName: string; referralCode: string | null; referralLink: string | null;
    commissionRate: number; commissionType: string;
  };
  announcements: Array<{ uuid: string; title: string; body: string; priority: string; createdAt: string }>;
}

export default function ResellerDashboardPage() {
  const { reseller } = useResellerAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/reseller/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  const priorityColor = (p: string) =>
    p === 'urgent' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
    p === 'high' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <ComingSoonOverlay message="The Reseller Portal is under development and will be available shortly. Your application has been received.">
    <ResellerLayout>
      <Helmet><title>Reseller Dashboard</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {reseller?.fullName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's an overview of your reseller account.</p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: loading ? '—' : String(data?.stats.totalCustomers ?? 0), icon: Users, color: 'text-blue-600' },
            { label: 'Link Clicks', value: loading ? '—' : String(data?.stats.totalClicks ?? 0), icon: MousePointerClick, color: 'text-purple-600' },
            { label: 'Pending Commission', value: loading ? '—' : pence(data?.stats.commissionPending ?? 0), icon: PoundSterling, color: 'text-amber-600' },
            { label: 'Total Paid', value: loading ? '—' : pence(data?.stats.commissionPaid ?? 0), icon: TrendingUp, color: 'text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral link */}
        {data?.reseller.referralLink && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" /> Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate text-foreground">
                  {data.reseller.referralLink}
                </code>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(data.reseller.referralLink!)}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Code: <strong>{data.reseller.referralCode}</strong> · Commission: {data.reseller.commissionRate}{data.reseller.commissionType === 'percentage' ? '%' : 'p'} per conversion
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Commission summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><PoundSterling className="w-4 h-4 text-primary" /> Commissions</span>
                <Button asChild size="sm" variant="ghost" className="text-xs h-7">
                  <Link to="/reseller/commissions">View all <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Pending', value: pence(data?.stats.commissionPending ?? 0), color: 'text-amber-600' },
                { label: 'Approved', value: pence(data?.stats.commissionApproved ?? 0), color: 'text-blue-600' },
                { label: 'Paid', value: pence(data?.stats.commissionPaid ?? 0), color: 'text-green-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>{loading ? '—' : value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !data?.announcements.length ? (
                <p className="text-sm text-muted-foreground">No announcements at this time.</p>
              ) : (
                <div className="space-y-3">
                  {data.announcements.map(a => (
                    <div key={a.uuid} className={`rounded-lg border p-3 text-sm ${priorityColor(a.priority)}`}>
                      <div className="font-semibold mb-0.5">{a.title}</div>
                      <div className="text-xs opacity-80 line-clamp-2">{a.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/reseller/customers', label: 'View Customers', icon: Users },
            { to: '/reseller/referrals', label: 'Referral Stats', icon: Link2 },
            { to: '/reseller/resources', label: 'Resources', icon: TrendingUp },
            { to: '/reseller/support', label: 'Get Support', icon: AlertTriangle },
          ].map(({ to, label, icon: Icon }) => (
            <Button key={to} asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to={to}>
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </ResellerLayout>
    </ComingSoonOverlay>
  );
}
