import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Search, Calendar, PoundSterling, Gift, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { demoBusiness, type MockCustomer } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

const avatarColors = ['bg-indigo-600', 'bg-emerald-600', 'bg-pink-600', 'bg-amber-600'];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MockCustomer | null>(null);

  const filtered = demoBusiness.customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Helmet>
        <title>Customers — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{demoBusiness.customers.length} customers in your database</p>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((customer, i) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelected(customer)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                    <div className="text-center">
                      <p className="font-semibold text-[#0F172A]">{customer.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#0F172A]">£{customer.totalSpent}</p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-indigo-600">{customer.loyaltyPoints}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customer Profile</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                    {selected.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A]">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                    <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Bookings', value: selected.totalBookings, icon: Calendar },
                    { label: 'Total Spent', value: `£${selected.totalSpent}`, icon: PoundSterling },
                    { label: 'Loyalty Pts', value: selected.loyaltyPoints, icon: Gift },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl text-center">
                        <Icon size={16} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="font-bold text-[#0F172A] text-lg">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Last Visit</p>
                  <p className="text-sm font-medium text-[#0F172A]">{selected.lastVisit}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
