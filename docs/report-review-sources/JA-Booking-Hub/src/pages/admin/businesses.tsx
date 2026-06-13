import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Search, Eye, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import { mockBusinesses } from '@/data/mockData';

const planColors: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  starter: 'bg-blue-100 text-blue-700',
  professional: 'bg-indigo-100 text-indigo-700',
  business: 'bg-amber-100 text-amber-700',
};

export default function AdminBusinesses() {
  const [search, setSearch] = useState('');

  const filtered = mockBusinesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>Businesses — Admin | JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Business Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all registered businesses on the platform</p>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Business</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Location</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((biz) => (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {biz.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-[#0F172A]">{biz.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{biz.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{biz.type}</td>
                      <td className="px-5 py-4">
                        <Badge className={`text-xs capitalize ${planColors[biz.plan]}`}>{biz.plan}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{biz.city}</td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#0F172A]">⭐ {biz.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({biz.reviewCount})</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            <Eye size={13} className="mr-1" /> View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Ban size={13} className="mr-1" /> Suspend
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
