import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Globe, Mail, Eye, MousePointer, TrendingUp,
  ArrowRight, Shield, ScrollText, FileText, Settings, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';

interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  totalEnquiries: number;
  totalViews: number;
  totalClicks: number;
  recentUsers: { id: number; email: string; name: string; role: string; created_at: string }[];
  topProfiles: { username: string; display_name: string; views: number }[];
  viewsByDay: { date: string; count: number }[];
}

const quickLinks = [
  { to: '/admin/users', label: 'Manage Users', icon: Users, desc: 'View, edit and manage all platform users' },
  { to: '/admin/profiles', label: 'Manage Profiles', icon: Globe, desc: 'Review and moderate public profiles' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Mail, desc: 'View all contact form submissions' },
  { to: '/admin/plans', label: 'Plans & Pricing', icon: CreditCard, desc: 'Configure subscription plans' },
  { to: '/admin/settings', label: 'System Settings', icon: Settings, desc: 'Platform configuration and toggles' },
  { to: '/admin/audit', label: 'Audit Log', icon: ScrollText, desc: 'Full record of admin actions' },
  { to: '/admin/legal', label: 'Legal Policies', icon: FileText, desc: 'Terms, privacy and cookie policies' },
  { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp, desc: 'Platform-wide usage statistics' },
];

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Profiles', value: stats?.totalProfiles ?? 0, icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Enquiries', value: stats?.totalEnquiries ?? 0, icon: Mail, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Page Views', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Link Clicks', value: stats?.totalClicks ?? 0, icon: MousePointer, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    {
      label: 'Click-Through Rate',
      value: stats ? (stats.totalViews > 0 ? `${((stats.totalClicks / stats.totalViews) * 100).toFixed(1)}%` : '0%') : '—',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}, {adminUser?.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground text-sm">Here's what's happening on your platform today</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick links */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Access</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <Link key={link.to} to={link.to}>
                <Card className="bg-card border-border hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <link.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{link.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Users</h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2">View all</Button>
            </Link>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  {stats?.recentUsers.slice(0, 6).map(u => (
                    <div key={u.id} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">{u.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      {u.role === 'admin' && (
                        <Badge className="bg-red-500/10 text-red-400 border-0 text-xs flex-shrink-0">Admin</Badge>
                      )}
                    </div>
                  ))}
                  {!stats?.recentUsers.length && (
                    <p className="text-xs text-muted-foreground text-center py-4">No users yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top profiles */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Top Profiles by Views
          </CardTitle>
          <Link to="/admin/profiles">
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">View all profiles</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats?.topProfiles.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground font-mono w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.display_name || p.username}</p>
                    <p className="text-xs text-muted-foreground">/{p.username}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{p.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!stats?.topProfiles.length && (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-4">No profile data yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
