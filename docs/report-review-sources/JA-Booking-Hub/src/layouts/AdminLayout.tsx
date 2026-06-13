import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, Users, CreditCard, Tag,
  Calendar, Menu, LogOut, Shield,
} from 'lucide-react';

interface AdminUser {
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/billing', label: 'Plans & Billing', icon: CreditCard },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.authenticated) setAdminUser(data.user); })
      .catch(() => {});
  }, []);

  const displayName = adminUser?.name ?? adminUser?.given_name ?? 'Admin';
  const initials = adminUser?.given_name && adminUser?.family_name
    ? `${adminUser.given_name[0]}${adminUser.family_name[0]}`.toUpperCase()
    : (adminUser?.name ? adminUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD');
  const roleLabel = adminUser?.roles?.[0]?.replace(/([A-Z])/g, ' $1').trim() ?? 'Admin';

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#0F172A] text-white">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">JABooking</p>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div>
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>
        <Link to="/admin/logout">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-md">
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <Shield size={16} className="text-red-600" />
            <span className="text-sm font-semibold text-[#0F172A]">Platform Administration</span>
          </div>
          <div className="text-xs text-muted-foreground">
            JA Group Services · Internal Use Only
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
