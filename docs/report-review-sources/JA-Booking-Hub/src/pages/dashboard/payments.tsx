import { Helmet } from '@dr.pogodin/react-helmet';
import { CreditCard, TrendingUp, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-slate-100 text-slate-600',
};

export default function PaymentsPage() {
  const payments = demoBusiness.payments;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Payments — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Payments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your revenue and transactions</p>
        </div>

        {/* Stripe connect banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-indigo-900 text-sm">Connect Stripe to accept payments</p>
            <p className="text-xs text-indigo-700">Link your Stripe account to take deposits and full payments online.</p>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
            Connect Stripe
            <ExternalLink size={14} className="ml-1.5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: `£${totalRevenue}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending', value: `£${pending}`, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
            { label: 'Refunded', value: `£${refunded}`, icon: RefreshCw, color: 'bg-slate-50 text-slate-600' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-border">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Transactions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{payment.customerName}</p>
                    <p className="text-xs text-muted-foreground">{payment.service} · {payment.date}</p>
                    <p className="text-xs text-muted-foreground font-mono">{payment.reference}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className="text-xs capitalize bg-slate-100 text-slate-600">{payment.type}</Badge>
                    <span className="text-sm font-bold text-[#0F172A]">£{payment.amount}</span>
                    <Badge className={`text-xs capitalize ${statusColors[payment.status]}`}>{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
