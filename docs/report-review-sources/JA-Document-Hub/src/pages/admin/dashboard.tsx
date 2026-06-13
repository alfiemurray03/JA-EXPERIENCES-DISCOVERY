/**
 * Admin Dashboard — theme-aware, live data only (no mocks).
 * Shows: KPI stats, plan distribution, recent support tickets, admin accounts, system status.
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/lib/admin-context';
import {
  Users, FileText, CreditCard, Activity,
  CheckCircle2, Server, ShieldCheck,
  TrendingUp, UserCheck, FileCheck, MessageSquare,
  AlertTriangle, ChevronRight,
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

interface Ticket {
  id: number;
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
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

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-500/20 text-slate-400',
  normal: 'bg-blue-500/20 text-blue-400',
  high:   'bg-amber-500/20 text-amber-400',
  urgent: 'bg-red-500/20 text-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  resolved:    'bg-green-500/20 text-green-400 border-green-500/30',
  closed:      'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function roleLabel(role: string) {
  // Map Microsoft Entra app role values to human-readable labels
  const MAP: Record<string, string> = {
    PlatformOwner:       'Platform Owner',
    SystemAdministrator: 'System Administrator',
    Admin:               'Administrator',
    SupportAdmin:        'Support Administrator',
  };
  return MAP[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function rolesLabel(roles: string[]): string {
  if (!roles || roles.length === 0) return 'Administrator';
  return roles.map(r => roleLabel(r)).join(', ');
}

export default function AdminDashboard() {
  const { admin } = useAdmin();

  const [adminUsers, setAdminUsers]     = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats]               = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [tickets, setTickets]           = useState<Ticket[]>([]);
  const [ticketStats, setTicketStats]   = useState<TicketStats>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0, total: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Theme tokens — use dark: Tailwind variants
  const card    = 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700';
  const text    = 'text-gray-900 dark:text-white';
  const muted   = 'text-gray-500 dark:text-slate-400';
  const subtle  = 'text-gray-400 dark:text-slate-600';
  const rowBg   = 'bg-gray-50 dark:bg-slate-700/40';
  const divider = 'border-gray-200 dark:border-slate-700';
  const gradBg  = 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 dark:from-primary/20 dark:to-primary/5';
  const pulse   = 'bg-gray-100 dark:bg-slate-700/50';
  const rowText = 'text-gray-600 dark:text-slate-300';
  const barBg   = 'bg-gray-200 dark:bg-slate-700';

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
      .then((d: { success: boolean; tickets?: Ticket[]; stats?: TicketStats }) => {
        if (d.success) {
          setTickets((d.tickets ?? []).filter(t => t.status === 'open' || t.status === 'in_progress').slice(0, 6));
          if (d.stats) setTicketStats(d.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const freeUsers = stats ? (stats.totalUsers - stats.paidUsers) : 0;
  const conversionRate = stats && stats.totalUsers > 0
    ? `${Math.round((stats.paidUsers / stats.totalUsers) * 100)}% paid`
    : undefined;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — JA Document Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Dashboard" subtitle="Platform overview">
        <div className="space-y-5">

          {/* Welcome */}
          <div className={`${gradBg} border rounded-xl px-5 py-4`}>
            <p className={`text-sm ${muted}`}>{greeting},</p>
            <h2 className={`font-semibold text-lg ${text}`}>{admin?.name ?? 'Administrator'}</h2>
            <p className={`text-xs mt-0.5 ${muted}`}>
              {rolesLabel(admin?.roles ?? [])} · JA Document Hub Administration Portal
            </p>
          </div>

          {/* KPI Stats */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className={card}>
                  <CardContent className="p-4">
                    <div className={`h-16 rounded animate-pulse ${pulse}`} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Customers', value: stats?.totalUsers ?? 0, note: stats?.recentUsers ? `+${stats.recentUsers} this month` : 'No customers yet', icon: Users, color: 'text-blue-500' },
                { label: 'Documents Created', value: stats?.totalDocuments ?? 0, note: stats?.recentDocuments ? `+${stats.recentDocuments} this month` : 'No documents yet', icon: FileText, color: 'text-cyan-500' },
                { label: 'Paid Subscribers', value: stats?.paidUsers ?? 0, note: conversionRate ?? 'No paid users yet', icon: CreditCard, color: 'text-amber-500' },
                { label: 'Free Users', value: freeUsers, note: stats && stats.totalUsers > 0 ? `${Math.round((freeUsers / stats.totalUsers) * 100)}% of total` : 'No users yet', icon: Activity, color: 'text-emerald-500' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <Card key={s.label} className={card}>
                    <CardContent className="p-4">
                      <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                      <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
                      <p className={`text-xs mt-0.5 ${muted}`}>{s.label}</p>
                      <p className={`text-[10px] mt-0.5 ${subtle}`}>{s.note}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Support tickets + Admin accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Recent support tickets */}
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b ${divider}`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <h3 className={`text-sm font-semibold ${text}`}>Support Tickets</h3>
                </div>
                <div className="flex items-center gap-2">
                  {ticketStats.urgent > 0 && (
                    <Badge className="text-[9px] bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/20">
                      {ticketStats.urgent} urgent
                    </Badge>
                  )}
                  <Link to="/admin/support" className={`text-[10px] flex items-center gap-0.5 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white`}>
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Open', value: ticketStats.open, color: 'text-blue-500' },
                    { label: 'In Progress', value: ticketStats.in_progress, color: 'text-amber-500' },
                    { label: 'Total', value: ticketStats.total, color: text },
                  ].map(s => (
                    <div key={s.label} className={`${rowBg} rounded-lg p-2 text-center`}>
                      <p className={`text-lg font-bold ${s.color}`}>{loadingTickets ? '—' : s.value}</p>
                      <p className={`text-[10px] ${muted}`}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {loadingTickets ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-10 rounded animate-pulse ${pulse}`} />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <p className={`text-xs py-4 text-center ${subtle}`}>
                    {ticketStats.total === 0 ? 'No support tickets yet.' : 'No open or in-progress tickets.'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {tickets.map(t => (
                      <Link
                        key={t.id}
                        to="/admin/support"
                        className={`flex items-center gap-2 ${rowBg} rounded-lg px-3 py-2 hover:opacity-80 transition-opacity`}
                      >
                        {t.priority === 'urgent' && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${text}`}>{t.subject}</p>
                          <p className={`text-[10px] ${muted}`}>{t.name} · {t.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[t.priority]}`}>
                            {t.priority}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[t.status]}`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin accounts */}
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b ${divider}`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className={`text-sm font-semibold ${text}`}>Admin Accounts</h3>
                </div>
                <span className={`text-xs ${muted}`}>{adminUsers.length} total</span>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                {loadingUsers ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className={`h-10 rounded animate-pulse ${pulse}`} />
                    ))}
                  </div>
                ) : adminUsers.length === 0 ? (
                  <p className={`text-xs py-4 text-center ${subtle}`}>No admin accounts found.</p>
                ) : (
                  <div className="space-y-1.5">
                    {adminUsers.map(u => (
                      <div key={u.id} className={`flex items-center gap-3 ${rowBg} rounded-lg px-3 py-2`}>
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-bold">{(u.name ?? '?').charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${text}`}>{u.name}</p>
                          <p className={`text-[10px] truncate ${muted}`}>{u.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[10px] ${rowText}`}>{roleLabel(u.role)}</p>
                          {u.isPlatformOwner && <span className="text-[9px] text-amber-500">Owner</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan distribution + Usage type */}
          {stats && stats.totalUsers > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className={card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className={`text-sm font-semibold ${text}`}>Plan Distribution</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3 space-y-2">
                  {stats.planBreakdown.map(row => {
                    const pct = stats.totalUsers > 0 ? Math.round((Number(row.count) / stats.totalUsers) * 100) : 0;
                    return (
                      <div key={row.plan} className="flex items-center gap-3">
                        <span className={`text-xs capitalize w-24 shrink-0 ${rowText}`}>{row.plan.replace(/_/g, ' ')}</span>
                        <div className={`flex-1 rounded-full h-1.5 ${barBg}`}>
                          <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs w-16 text-right ${muted}`}>{Number(row.count)} ({pct}%)</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className={card}>
                <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                  <UserCheck className="w-4 h-4 text-cyan-500" />
                  <h3 className={`text-sm font-semibold ${text}`}>Usage Type</h3>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-3 space-y-2">
                  {stats.usageBreakdown.map(row => {
                    const pct = stats.totalUsers > 0 ? Math.round((Number(row.count) / stats.totalUsers) * 100) : 0;
                    return (
                      <div key={row.usageType ?? 'unknown'} className="flex items-center gap-3">
                        <span className={`text-xs capitalize w-24 shrink-0 ${rowText}`}>{row.usageType ?? 'Unknown'}</span>
                        <div className={`flex-1 rounded-full h-1.5 ${barBg}`}>
                          <div className="h-1.5 rounded-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs w-16 text-right ${muted}`}>{Number(row.count)} ({pct}%)</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity summary */}
          {stats && stats.totalDocuments > 0 && (
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                <FileCheck className="w-4 h-4 text-slate-400" />
                <h3 className={`text-sm font-semibold ${text}`}>Activity Summary (Last 30 Days)</h3>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'New Users',     value: stats.recentUsers,     color: 'text-blue-500' },
                    { label: 'New Documents', value: stats.recentDocuments, color: 'text-cyan-500' },
                    { label: 'Paid Users',    value: stats.paidUsers,       color: 'text-amber-500' },
                    { label: 'Free Users',    value: freeUsers,             color: 'text-gray-600 dark:text-slate-300' },
                  ].map(s => (
                    <div key={s.label} className={`${rowBg} rounded-lg px-3 py-2 text-center`}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System status */}
          <Card className={card}>
            <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
              <Server className={`w-4 h-4 ${muted}`} />
              <h3 className={`text-sm font-semibold ${text}`}>System Status</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {systemServices.map(s => (
                  <div key={s.service} className={`flex items-center gap-2 ${rowBg} rounded-lg px-3 py-2`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <div>
                      <p className={`text-xs leading-tight ${rowText}`}>{s.service}</p>
                      <p className="text-[10px] text-green-500">Operational</p>
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
