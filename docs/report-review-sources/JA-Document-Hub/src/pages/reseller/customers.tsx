import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Search } from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', personal: 'Personal', standard: 'Standard',
  professional: 'Professional', org_starter: 'Org Starter',
  org_growth: 'Org Growth', org_professional: 'Org Professional',
};

interface Customer {
  firstName: string; lastName: string; plan: string;
  accountStatus: string; createdAt: string; assignedAt: string; assignedBy: string;
}

export default function ResellerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/reseller/customers', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setCustomers(d.customers); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.plan.includes(search.toLowerCase()),
  );

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>My Customers — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">Customers assigned to your reseller account.</p>
          </div>
          <Badge variant="secondary">{customers.length} total</Badge>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or plan…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading customers…</div>
            ) : !filtered.length ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{search ? 'No customers match your search.' : 'No customers assigned yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Customer Since</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Assigned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((c, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium text-foreground">{c.firstName} {c.lastName}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">{PLAN_LABELS[c.plan] ?? c.plan}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={c.accountStatus === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                            {c.accountStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(c.assignedAt).toLocaleDateString('en-GB')}</td>
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
