import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, List, Users, User, CreditCard,
  Star, BarChart3, Image, Gift, Award, Settings, Menu,
  ChevronDown, LogOut, Bell, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuthUser {
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/services', label: 'Services', icon: List },
  { href: '/dashboard/staff', label: 'Staff', icon: Users },
  { href: '/dashboard/customers', label: 'Customers', icon: User },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/gallery', label: 'Gallery', icon: Image },
  { href: '/dashboard/memberships', label: 'Memberships', icon: Award },
  { href: '/dashboard/loyalty', label: 'Loyalty Points', icon: Gift },
];

const settingsItems = [
  { href: '/dashboard/settings/profile', label: 'Business Profile' },
  { href: '/dashboard/settings/availability', label: 'Availability & Hours' },
  { href: '/dashboard/settings/domain', label: 'Custom Domain' },
  { href: '/dashboard/settings/billing', label: 'Billing & Plan' },
];

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/dashboard/settings')
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.authenticated) setUser(data.user); })
      .catch(() => {});
  }, []);

  const displayName = user?.name ?? user?.given_name ?? 'My Business';
  const initials = user?.given_name && user?.family_name
    ? `${user.given_name[0]}${user.family_name[0]}`.toUpperCase()
    : (user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?');

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href, item.exact);
    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          active
            ? 'bg-primary text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <Icon size={18} className="shrink-0" />
        {item.label}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#0F172A] text-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/airo-assets/images/logo/horizontal"
            alt="JABooking"
            className="h-8 w-auto object-contain brightness-0 invert"
          />
        </Link>
      </div>

      {/* Business info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? 'Business Owner'}</p>
          </div>
        </div>
        <Link
          to="/b/my-business"
          target="_blank"
          className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink size={12} />
          View booking page
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Settings accordion */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname.startsWith('/dashboard/settings')
                ? 'bg-primary/20 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings size={18} className="shrink-0" />
            Settings
            <ChevronDown
              size={14}
              className={`ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {settingsOpen && (
            <div className="ml-9 mt-1 space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    location.pathname === item.href
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user?.name ?? 'Loading...'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <Link to="/logout">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <LogOut size={18} className="shrink-0" />
            Sign Out
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-muted rounded-md"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
              Professional Plan
            </Badge>
            <button className="relative p-2 hover:bg-muted rounded-md" aria-label="Notifications">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
