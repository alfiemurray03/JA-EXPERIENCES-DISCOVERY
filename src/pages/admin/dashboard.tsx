/**
 * JA Plan Studio admin dashboard with live Plan Studio data.
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/lib/admin-context';
import {
  Users, CreditCard, Activity, Server, ShieldCheck,
  MessageSquare, ArrowRight, RefreshCw, HeartPulse,
  Settings, ClipboardList, AlertTriangle, UserCheck, Bot,
} from 'lucide-react';

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

interface OperationalOverview {
  customers: number;
  lifetimeUsers: number;
  activePlans: number;
  supportTickets: number;
  dataProtectionRequests: number;
  systemReports: number;
  openIssues: number;
  admins: number;
  launchGatewayStatus: string;
  maintenanceStatus: string;
}

export default function AdminDashboard() {
  const { admin } = useAdmin();

  const [stats, setStats]               = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [ticketStats, setTicketStats]   = useState<TicketStats>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0, total: 0 });
  const [overview, setOverview]         = useState<OperationalOverview | null>(null);

  const loadDashboard = useCallback((refresh = false) => {
    if (refresh) setRefreshing(true);

    const statsRequest = fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; stats?: PlatformStats }) => { if (d.success && d.stats) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    const ticketsRequest = fetch('/api/admin/support/tickets', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; stats?: TicketStats }) => {
        if (d.success) {
          if (d.stats) setTicketStats(d.stats);
        }
      })
      .catch(() => {});

    const overviewRequest = fetch('/api/admin/section/overview', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success?: boolean; data?: OperationalOverview }) => { if (d.success && d.data) setOverview(d.data); })
      .catch(() => {});

    Promise.allSettled([statsRequest, ticketsRequest, overviewRequest])
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadDashboard(false);
    const interval = window.setInterval(() => loadDashboard(true), 30_000);
    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const websiteStatus = overview?.maintenanceStatus === 'On'
    ? 'Maintenance'
    : overview?.launchGatewayStatus === 'On' ? 'Coming Soon' : 'Live';

  const statCards = [
    { label: 'Total Customers', value: overview?.customers ?? stats?.totalUsers ?? 0, note: 'All customer profiles', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Lifetime Members', value: overview?.lifetimeUsers ?? 0, note: 'Lifetime access enabled', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Active Plans', value: overview?.activePlans ?? 0, note: 'Configured subscription plans', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Revenue', value: 'Not connected', note: 'No revenue API is connected', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Pending Data Requests', value: overview?.dataProtectionRequests ?? 0, note: 'Requests needing attention', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Support Tickets', value: overview?.supportTickets ?? ticketStats.total, note: 'Customer support records', icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-100' },
    { label: 'Website Status', value: websiteStatus, note: 'Saved public website mode', icon: HeartPulse, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Worker Status', value: 'Online', note: 'Admin API responded successfully', icon: Settings, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const quickLinks = [
    { to: '/admin/ai-chatbot', label: 'AI Chatbot Settings', desc: 'Self-help, anonymous access, knowledge and enquiry escalation', icon: Bot },
    { to: '/admin/health', label: 'Production Health', desc: 'Verified platform, database and integration signals', icon: HeartPulse },
    { to: '/admin/status', label: 'Status Centre', desc: 'Live services, incidents and operational notices', icon: Activity },
    { to: '/admin/site-settings', label: 'Live Website Status', desc: `Current public mode: ${websiteStatus}`, icon: Settings },
    { to: '/admin/users', label: 'Customer Operations', desc: 'Customer records, access and subscriptions', icon: Users },
    { to: '/admin/system-reports', label: 'System Reports', desc: 'Reported platform issues and resolution status', icon: AlertTriangle },
    { to: '/admin/audit', label: 'Audit Log', desc: 'Full record of administration actions', icon: ClipboardList },
    { to: '/admin/subscriptions', label: 'Membership', desc: 'Plans, lifetime access and entitlements', icon: UserCheck },
    { to: '/admin/builders', label: 'Experience Builders', desc: 'Builder templates, usage and configuration', icon: Server },
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
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{greeting}, {(admin?.name || 'Admin').split(' ')[0]}</h1>
                  <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening on your platform today</p>
                </div>
              </div>
              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing || loadingStats}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted border border-border"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card border-border">
                  <CardContent className="p-5">
                    {loadingStats ? <div className="h-16 rounded animate-pulse bg-slate-100" /> : (
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{typeof stat.value === 'number' ? stat.value.toLocaleString('en-GB') : stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.note}</p>
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

          <div className="mb-8">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Access</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-600 transition-colors flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
