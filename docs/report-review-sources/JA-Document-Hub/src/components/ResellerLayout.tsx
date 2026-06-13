import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useResellerAuth } from '@/lib/reseller-auth-context';
import { useSiteSettings } from '@/lib/site-settings-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, Link2, PoundSterling, BookOpen,
  LifeBuoy, Settings, LogOut, Menu, X, Building2, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/reseller', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/reseller/customers', label: 'Customers', icon: Users },
  { to: '/reseller/referrals', label: 'Referral Links', icon: Link2 },
  { to: '/reseller/commissions', label: 'Commissions', icon: PoundSterling },
  { to: '/reseller/resources', label: 'Resources', icon: BookOpen },
  { to: '/reseller/support', label: 'Support', icon: LifeBuoy },
  { to: '/reseller/settings', label: 'Settings', icon: Settings },
];

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const { reseller, logout } = useResellerAuth();
  const { siteName } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/reseller/login');
  }

  function isActive(to: string, exact?: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link to="/reseller" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground leading-tight">{siteName}</div>
            <div className="text-xs text-muted-foreground">Reseller Portal</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(to, exact)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2 mb-2">
          <div className="text-sm font-medium text-foreground truncate">{reseller?.fullName}</div>
          <div className="text-xs text-muted-foreground truncate">{reseller?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">Reseller Portal</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
