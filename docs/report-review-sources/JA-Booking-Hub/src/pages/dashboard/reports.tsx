import { Helmet } from '@dr.pogodin/react-helmet';
import { TrendingUp, Calendar, Users, PoundSterling } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

const monthlyRevenue = [
  { month: 'Jan', revenue: 420, bookings: 18 },
  { month: 'Feb', revenue: 380, bookings: 15 },
  { month: 'Mar', revenue: 510, bookings: 22 },
  { month: 'Apr', revenue: 490, bookings: 20 },
  { month: 'May', revenue: 620, bookings: 26 },
  { month: 'Jun', revenue: 580, bookings: 24 },
];

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

export default function ReportsPage() {
  const totalRevenue = demoBusiness.payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalBookings = demoBusiness.appointments.length;
  const totalCustomers = demoBusiness.customers.length;
  const avgBookingValue = totalRevenue / totalBookings || 0;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Reports — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your business performance</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `£${totalRevenue}`, icon: PoundSterling, color: 'bg-emerald-50 text-emerald-600', change: '+12%' },
            { label: 'Total Bookings', value: totalBookings, icon: Calendar, color: 'bg-indigo-50 text-indigo-600', change: '+8%' },
            { label: 'Customers', value: totalCustomers, icon: Users, color: 'bg-pink-50 text-pink-600', change: '+3' },
            { label: 'Avg. Booking Value', value: `£${avgBookingValue.toFixed(0)}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', change: '+5%' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-border">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change} this month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue chart */}
        <Card className="border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="flex items-end gap-3 h-40">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-[#0F172A]">£{m.revenue}</span>
                  <div
                    className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors"
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top services */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Top Services by Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {demoBusiness.services.map((svc, i) => {
                  const bookings = demoBusiness.appointments.filter(a => a.service === svc.name).length;
                  const maxBookings = 5;
                  return (
                    <div key={svc.id} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">{svc.name}</p>
                        <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(bookings / maxBookings) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A] shrink-0">{bookings || i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Busiest Days</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {[
                  { day: 'Saturday', pct: 95, bookings: 8 },
                  { day: 'Friday', pct: 85, bookings: 7 },
                  { day: 'Thursday', pct: 70, bookings: 6 },
                  { day: 'Wednesday', pct: 55, bookings: 5 },
                  { day: 'Monday', pct: 45, bookings: 4 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{item.day}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-[#0F172A] w-12 text-right">{item.bookings} avg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
