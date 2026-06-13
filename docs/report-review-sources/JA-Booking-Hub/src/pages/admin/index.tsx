import { Helmet } from '@dr.pogodin/react-helmet';
import { Building2, CreditCard, Calendar, AlertCircle, Users, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/AdminLayout';
import { mockBusinesses } from '@/data/mockData';

const planColors: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  starter: 'bg-blue-100 text-blue-700',
  professional: 'bg-indigo-100 text-indigo-700',
  business: 'bg-amber-100 text-amber-700',
};

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Registered Businesses',
      value: '547',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-600',
      change: '+12 this week',
      trend: 'up',
    },
    {
      label: 'Active Users',
      value: '1,284',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
      change: '+38 this week',
      trend: 'up',
    },
    {
      label: 'Paid Subscriptions',
      value: '312',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600',
      change: '57% conversion',
      trend: 'up',
    },
    {
      label: 'Bookings This Month',
      value: '14,832',
      icon: Calendar,
      color: 'bg-pink-50 text-pink-600',
      change: '+284 today',
      trend: 'up',
    },
  ];

  const revenueBreakdown = [
    { plan: 'Starter', price: '£9.99/mo', count: 148, color: 'bg-blue-500' },
    { plan: 'Professional', price: '£19.99/mo', count: 112, color: 'bg-indigo-500' },
    { plan: 'Business', price: '£39.99/mo', count: 52, color: 'bg-amber-500' },
  ];

  const totalMRR = (148 * 9.99 + 112 * 19.99 + 52 * 39.99).toFixed(0);

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard — JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Platform Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">JABooking · JA Group Services · Internal Use Only</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-border">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <ArrowUpRight size={11} />
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* MRR breakdown */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Monthly Recurring Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-bold text-[#0F172A] mb-1">£{Number(totalMRR).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mb-4">Across {312} paid subscriptions</p>
              <div className="space-y-3">
                {revenueBreakdown.map((tier) => (
                  <div key={tier.plan} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${tier.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0F172A]">{tier.plan}</span>
                        <span className="text-xs text-muted-foreground">{tier.count} businesses</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent signups */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Recent Business Signups</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {mockBusinesses.slice(0, 5).map((biz) => (
                  <div key={biz.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {biz.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{biz.type} · {biz.city}</p>
                    </div>
                    <Badge className={`text-xs capitalize shrink-0 ${planColors[biz.plan]}`}>{biz.plan}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform alerts */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Platform Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 grid sm:grid-cols-3 gap-3">
            {[
              { msg: '3 businesses pending domain verification', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { msg: '2 failed payment retries in the last 24 hours', color: 'bg-amber-50 border-amber-200 text-amber-800' },
              { msg: 'All systems operational — no incidents', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
            ].map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${alert.color}`}>
                <AlertCircle size={15} className="shrink-0" />
                <p className="text-xs font-medium">{alert.msg}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
