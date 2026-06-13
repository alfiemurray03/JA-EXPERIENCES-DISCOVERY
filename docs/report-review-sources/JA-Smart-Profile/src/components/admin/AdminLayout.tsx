import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Globe, Mail, CreditCard,
  BarChart3, Settings, LogOut, Menu, X, Shield, ScrollText,
  FileText, ChevronDown, Bell, Handshake, HelpCircle, Gift, DollarSign, Star, AlertTriangle
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { useBranding } from '@/lib/branding';

interface NavGroup {
  label: string;
  items: { path: string; label: string; icon: React.ElementType; exact?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/admin/audit', label: 'Audit Log', icon: ScrollText },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/profiles', label: 'Profiles', icon: Globe },
      { path: '/admin/enquiries', label: 'Enquiries', icon: Mail },
      { path: '/admin/support-requests', label: 'Support Requests', icon: HelpCircle },
      { path: '/admin/issue-reports', label: 'Issue Reports', icon: AlertTriangle },
      { path: '/admin/partner-enquiries', label: 'Partner Interest', icon: Handshake },
      { path: '/admin/referrals', label: 'Referrals', icon: Gift },
      { path: '/admin/affiliates', label: 'Affiliates', icon: DollarSign },
      { path: '/admin/points', label: 'Points & Rewards', icon: Star },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { path: '/admin/plans', label: 'Plans & Pricing', icon: CreditCard },
      { path: '/admin/settings', label: 'System Settings', icon: Settings },
    ],
  },
  {
    label: 'Legal & Compliance',
    items: [
      { path: '/admin/legal', label: 'Legal Policies', icon: FileText },
    ],
  },
];

export default function AdminLayout() {
  const { adminUser } = useAdminAuth();
  const user = adminUser!; // AdminGuard guarantees non-null
  const branding = useBranding();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { window.location.href = '/admin/logout'; };

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">Admin Portal</p>
            <p className="text-xs text-muted-foreground">{branding.platform_name}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-3.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <span className="text-xs bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          to="/dashboard/overview"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  const currentNav = navGroups.flatMap(g => g.items).find(i => isActive(i.path, i.exact));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-card border-r border-border flex flex-col z-50 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="font-semibold text-foreground text-sm">{currentNav?.label ?? 'Admin Portal'}</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">{branding.platform_name} Administration</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
