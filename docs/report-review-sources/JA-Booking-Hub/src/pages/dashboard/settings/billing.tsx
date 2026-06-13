import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/DashboardLayout';

const plans = [
  {
    name: 'Free',
    price: '£0',
    features: ['20 appointments/month', 'Basic booking page', 'Subdomain'],
    current: false,
  },
  {
    name: 'Starter',
    price: '£9.99/mo',
    features: ['100 appointments/month', 'Email reminders', 'Stripe payments'],
    current: false,
  },
  {
    name: 'Professional',
    price: '£19.99/mo',
    features: ['Unlimited appointments', 'Custom domain', 'Remove branding', 'Multiple staff'],
    current: true,
  },
  {
    name: 'Business',
    price: '£39.99/mo',
    features: ['Multiple locations', 'Memberships', 'Loyalty programme', 'Priority support'],
    current: false,
  },
];

export default function BillingSettingsPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Billing & Plan — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Billing & Plan</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your subscription and payment details</p>
        </div>

        {/* Current plan */}
        <Card className="border-primary bg-primary/5 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary text-white text-xs">Current Plan</Badge>
                </div>
                <h2 className="text-xl font-bold text-[#0F172A]">Professional</h2>
                <p className="text-muted-foreground text-sm">£19.99/month · Next billing: 6 July 2026</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">£19.99</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 p-4 ${
                plan.current ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <p className={`font-bold text-sm mb-0.5 ${plan.current ? 'text-primary' : 'text-[#0F172A]'}`}>
                {plan.name}
              </p>
              <p className="text-xs text-muted-foreground mb-3">{plan.price}</p>
              <ul className="space-y-1.5">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <Button
                  size="sm"
                  variant={i > 2 ? 'default' : 'outline'}
                  className={`w-full mt-3 text-xs h-7 ${i > 2 ? 'bg-primary text-white' : ''}`}
                >
                  {i < 2 ? 'Downgrade' : 'Upgrade'}
                </Button>
              )}
              {plan.current && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-primary font-semibold">✓ Active</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment method */}
        <Card className="border-border mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-border">
              <CreditCard size={18} className="text-muted-foreground" />
              <span className="text-sm text-[#0F172A]">•••• •••• •••• 4242</span>
              <Badge className="ml-auto text-xs bg-emerald-100 text-emerald-700">Active</Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-3 text-xs">Update Payment Method</Button>
          </CardContent>
        </Card>

        {/* Invoice history */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { date: '6 Jun 2026', amount: '£19.99', status: 'Paid' },
                { date: '6 May 2026', amount: '£19.99', status: 'Paid' },
                { date: '6 Apr 2026', amount: '£19.99', status: 'Paid' },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">Professional Plan</p>
                    <p className="text-xs text-muted-foreground">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#0F172A]">{inv.amount}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">{inv.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-primary">Download</Button>
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
