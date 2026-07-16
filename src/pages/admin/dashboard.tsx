/**
 * JA Plan Studio admin dashboard — Profile Studio layout with live Plan Studio data.
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAdmin } from '@/lib/admin-context';
import {
  Users, FileText, CreditCard, Activity,
  CheckCircle2, Server, ShieldCheck,
  FileCheck, MessageSquare, ChevronRight,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isPlatformOwner: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface PlatformStats {
  totalUsers: number;
  totalDocuments: number;
  paidUsers: number;
  recentDocuments: number;
  recentUsers: number;
  planBreakdown: Array<{ plan: string; count: number }>;
  usageBreakdown: Array<{ usageType: string; count: number }>;
}

interface TicketStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
  total: number;
}

const systemServices = [
  { service: 'Web Application',    status: 'operational' },
  { service: 'Document Generation', status: 'operational' },
  { service: 'PDF Export',          status: 'operational' },
  { service: 'Authentication',      status: 'operational' },
  { service: 'Storage',             status: 'operational' },
];

export default function AdminDashboard() {
  const { admin } = useAdmin();

  const [adminUsers, setAdminUsers]     = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats]               = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ticketStats, setTicketStats]   = useState<TicketStats>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0, total: 0 });

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; users: AdminUser[] }) => { if (d.success) setAdminUsers(d.users); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));

    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; stats?: PlatformStats }) => { if (d.success && d.stats) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    fetch('/api/admin/support/tickets', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; stats?: TicketStats }) => {
        if (d.success) {
          if (d.stats) setTicketStats(d.stats);
        }
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const freeUsers = stats ? (stats.totalUsers - stats.paidUsers) : 0;

  const statCards = [
    { label: 'Total Customers', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Generated Plans', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Paid Subscribers', value: stats?.paidUsers ?? 0, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Free Customers', value: freeUsers, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Support Tickets', value: ticketStats.total, icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-100' },
    { label: 'Admin Accounts', value: adminUsers.length, icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const quickLinks = [
    { to: '/admin/users', label: 'Manage Customers', desc: 'Customer records, access and subscriptions', icon: Users },
    { to: '/admin/builders', label: 'Builder Manager', desc: 'Configure planning builders and templates', icon: FileText },
    { to: '/admin/subscriptions', label: 'Plans & Pricing', desc: 'Configure subscriptions and entitlements', icon: CreditCard },
    { to: '/admin/site-settings', label: 'System Settings', desc: 'Platform configuration and site controls', icon: ShieldCheck },
    { to: '/admin/audit', label: 'Audit Log', desc: 'Full record of administration actions', icon: Activity },
    { to: '/admin/legal', label: 'Legal Policies', desc: 'Terms, privacy and cookie policies', icon: FileCheck },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — JA Plan Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Dashboard" subtitle="JA Plan Studio Administration">
        <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{greeting}, {(admin?.name || 'Admin').split(' ')[0]}</h1>
                <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening on your platform today</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card border-border">
                  <CardContent className="p-5">
                    {loadingStats ? <div className="h-16 rounded animate-pulse bg-slate-100" /> : (
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{Number(stat.value).toLocaleString()}</p>
                        </div>
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Access</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {quickLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.to} to={link.to}>
                      <Card className="bg-card border-border hover:border-red-300 hover:bg-red-50/50 transition-all cursor-pointer group">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                            <Icon className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{link.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-600 transition-colors flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Admin Accounts</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  {loadingUsers ? <div className="h-32 rounded animate-pulse bg-slate-100" /> : (
                    <div className="space-y-3">
                      {adminUsers.slice(0, 6).map(user => (
                        <div key={user.id} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 text-xs font-bold">{(user.name || user.email || '?').charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      ))}
                      {!adminUsers.length && <p className="text-xs text-muted-foreground text-center py-4">No admin accounts found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-red-500" />
                <h2 className="text-base font-semibold">Platform Services</h2>
              </div>
              <Link to="/admin/system" className="text-xs text-muted-foreground hover:text-foreground">View system</Link>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {systemServices.map(service => (
                  <div key={service.service} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{service.service}</p>
                      <p className="text-xs text-muted-foreground">Operational</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
