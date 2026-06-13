import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useFeatureConfig } from '@/lib/feature-config-context';
import { adminCls as c } from '@/lib/admin-theme-classes';
import { Users, FileText, CreditCard, Download, BarChart2, TrendingUp, UserCheck, PieChart, EyeOff } from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalDocuments: number;
  paidUsers: number;
  recentDocuments: number;
  recentUsers: number;
  planBreakdown: Array<{ plan: string; count: number }>;
  usageBreakdown: Array<{ usageType: string; count: number }>;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-500',
  personal: 'bg-sky-500',
  standard: 'bg-blue-500',
  professional: 'bg-primary',
  org_starter: 'bg-purple-500',
  org_growth: 'bg-violet-500',
  org_professional: 'bg-amber-500',
};

const USAGE_COLORS: Record<string, string> = {
  personal: 'bg-cyan-500',
  business: 'bg-purple-500',
  both: 'bg-emerald-500',
};

function BarRow({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs capitalize w-28 shrink-0 ${c.muted}`}>{label}</span>
      <div className={`flex-1 rounded-full h-2 ${c.pulse}`}>
        <div className={`h-2 rounded-full transition-all ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs w-20 text-right ${c.muted}`}>{value} ({pct}%)</span>
    </div>
  );
}

export default function AdminAnalytics() {
  const { config } = useFeatureConfig();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; stats?: PlatformStats; error?: string }) => {
        if (d.success && d.stats) setStats(d.stats);
        else if (!d.success) setError(d.error ?? 'Failed to load analytics.');
      })
      .catch(() => setError('Unable to connect to analytics service.'))
      .finally(() => setLoading(false));
  }, []);

  const freeUsers = stats ? stats.totalUsers - stats.paidUsers : 0;
  const conversionRate = stats && stats.totalUsers > 0
    ? Math.round((stats.paidUsers / stats.totalUsers) * 100)
    : 0;
  const docsPerUser = stats && stats.totalUsers > 0
    ? (stats.totalDocuments / stats.totalUsers).toFixed(1)
    : '0';

  const kpis = [
    { label: 'Total Customers',   value: loading ? '…' : String(stats?.totalUsers ?? 0),     icon: Users,    color: 'text-blue-500' },
    { label: 'Documents Created', value: loading ? '…' : String(stats?.totalDocuments ?? 0), icon: FileText, color: 'text-purple-500' },
    { label: 'Paid Subscribers',  value: loading ? '…' : String(stats?.paidUsers ?? 0),      icon: CreditCard, color: 'text-emerald-500' },
    { label: 'Docs / User',       value: loading ? '…' : docsPerUser,                        icon: Download, color: 'text-cyan-500' },
  ];

  if (!config.usage_analytics) {
    return (
      <>
        <Helmet>
          <title>Analytics — Admin Portal</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AdminLayout title="Analytics" subtitle="Platform usage, growth, and revenue reporting">
          <Card className={c.card}>
            <CardContent className="py-20 flex flex-col items-center justify-center text-center">
              <EyeOff className={`w-12 h-12 mb-4 ${c.muted}`} />
              <p className={`font-semibold text-lg ${c.text}`}>Usage Analytics Disabled</p>
              <p className={`text-sm mt-2 max-w-md ${c.muted}`}>
                Analytics collection is currently disabled via the System Config feature toggles.
                Enable "Usage Analytics" to start collecting platform data.
              </p>
            </CardContent>
          </Card>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Analytics" subtitle="Platform usage, growth, and revenue reporting">
        <div className="space-y-5">

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={c.card}>
                  <CardContent className="p-4">
                    <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                    <p className={`text-2xl font-bold ${c.text}`}>{s.value}</p>
                    <p className={`text-xs mt-0.5 ${c.muted}`}>{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Conversion + activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className={c.card}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-500">{conversionRate}%</p>
                <p className={`text-xs mt-1 ${c.muted}`}>Paid Conversion Rate</p>
                <p className={`text-[10px] mt-0.5 ${c.subtle}`}>Free → Paid</p>
              </CardContent>
            </Card>
            <Card className={c.card}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">{loading ? '…' : stats?.recentUsers ?? 0}</p>
                <p className={`text-xs mt-1 ${c.muted}`}>New Users (30 days)</p>
                <p className={`text-[10px] mt-0.5 ${c.subtle}`}>Registrations this month</p>
              </CardContent>
            </Card>
            <Card className={c.card}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-cyan-500">{loading ? '…' : stats?.recentDocuments ?? 0}</p>
                <p className={`text-xs mt-1 ${c.muted}`}>New Documents (30 days)</p>
                <p className={`text-[10px] mt-0.5 ${c.subtle}`}>Created this month</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className={c.card}>
                  <CardContent className="p-4">
                    <div className={`h-32 rounded animate-pulse ${c.pulse}`} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats && stats.totalUsers === 0 ? (
            <Card className={c.card}>
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <BarChart2 className={`w-12 h-12 mb-4 ${c.muted}`} />
                <p className={`font-semibold text-lg ${c.text}`}>No customer data yet</p>
                <p className={`text-sm mt-2 max-w-md ${c.muted}`}>
                  Analytics charts will populate here as customers register, create documents, and use the platform.
                  All metrics start at zero — no data has been fabricated.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Plan breakdown */}
              <Card className={c.card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${c.divider}`}>
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className={`text-sm font-semibold ${c.text}`}>Subscription Plan Breakdown</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3 space-y-3">
                  {stats?.planBreakdown.map(row => (
                    <BarRow
                      key={row.plan}
                      label={row.plan.replace(/_/g, ' ')}
                      value={Number(row.count)}
                      max={stats.totalUsers}
                      colorClass={PLAN_COLORS[row.plan] ?? 'bg-slate-400'}
                    />
                  ))}
                  <div className={`pt-2 border-t ${c.divider} flex justify-between text-xs ${c.muted}`}>
                    <span>Total users</span>
                    <span className={`font-semibold ${c.text}`}>{stats?.totalUsers ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Usage type */}
              <Card className={c.card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${c.divider}`}>
                  <UserCheck className="w-4 h-4 text-cyan-500" />
                  <h3 className={`text-sm font-semibold ${c.text}`}>Usage Type Distribution</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3 space-y-3">
                  {stats?.usageBreakdown.map(row => (
                    <BarRow
                      key={row.usageType ?? 'unknown'}
                      label={row.usageType ?? 'Unknown'}
                      value={Number(row.count)}
                      max={stats.totalUsers}
                      colorClass={USAGE_COLORS[row.usageType ?? ''] ?? 'bg-slate-400'}
                    />
                  ))}
                  <div className={`pt-2 border-t ${c.divider} flex justify-between text-xs ${c.muted}`}>
                    <span>Total users</span>
                    <span className={`font-semibold ${c.text}`}>{stats?.totalUsers ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Free vs Paid */}
              <Card className={c.card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${c.divider}`}>
                  <PieChart className="w-4 h-4 text-amber-500" />
                  <h3 className={`text-sm font-semibold ${c.text}`}>Free vs Paid</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3 space-y-3">
                  <BarRow label="Free" value={freeUsers} max={stats?.totalUsers ?? 1} colorClass="bg-slate-500" />
                  <BarRow label="Paid" value={stats?.paidUsers ?? 0} max={stats?.totalUsers ?? 1} colorClass="bg-emerald-500" />
                  <div className={`pt-2 border-t ${c.divider} flex justify-between text-xs ${c.muted}`}>
                    <span>Conversion rate</span>
                    <span className="font-semibold text-emerald-500">{conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Document activity */}
              <Card className={c.card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${c.divider}`}>
                  <FileText className="w-4 h-4 text-purple-500" />
                  <h3 className={`text-sm font-semibold ${c.text}`}>Document Activity</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Documents', value: stats?.totalDocuments ?? 0, color: 'text-purple-500' },
                      { label: 'Last 30 Days',    value: stats?.recentDocuments ?? 0, color: 'text-cyan-500' },
                      { label: 'Avg per User',    value: docsPerUser,                color: 'text-blue-500' },
                      { label: 'Total Users',     value: stats?.totalUsers ?? 0,     color: 'text-amber-500' },
                    ].map(s => (
                      <div key={s.label} className={`${c.statBg} rounded-lg p-3 text-center`}>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className={`text-[10px] mt-0.5 ${c.muted}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className={c.card}>
            <CardContent className="p-4">
              <p className={`text-xs text-center ${c.subtle}`}>
                Revenue analytics and time-series charts will be available once Stripe billing is connected.
                All current data is sourced directly from the live database.
              </p>
            </CardContent>
          </Card>

        </div>
      </AdminLayout>
    </>
  );
}
