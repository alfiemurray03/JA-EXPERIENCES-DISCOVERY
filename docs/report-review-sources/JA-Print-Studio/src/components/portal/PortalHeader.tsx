import { Link, useLocation } from 'react-router-dom';
import { LogoutButton, useSession } from '@/lib/auth/auth-client';
import { Plus, Settings, LayoutDashboard, Building2, User } from 'lucide-react';

export default function PortalHeader() {
  const { user } = useSession();
  const location = useLocation();

  if (!user) return null;

  const extUser = user as typeof user & { accountType?: string; b2bApproved?: boolean };
  const isB2B = extUser?.accountType === 'b2b';

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tabs = [
    { to: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/settings', label: 'Account Settings', icon: Settings },
  ];

  const isActive = (to: string) =>
    to === '/portal' ? location.pathname === '/portal' : location.pathname.startsWith(to);

  return (
    <header className="bg-foreground border-b border-background/10">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Top bar */}
        <div className="flex items-center justify-between py-5">

          {/* Left: logo + portal label */}
          <div className="flex items-center gap-6">
            <Link to="/" className="shrink-0">
              <img src="/airo-assets/images/logo/horizontal" alt="JA Print Studio" className="h-7 brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            </Link>
            <div className="hidden sm:block w-px h-6 bg-background/10" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-px w-4 bg-primary" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-primary">Customer Portal</span>
            </div>
          </div>

          {/* Right: user info + actions */}
          <div className="flex items-center gap-3">
            {/* User pill */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-background/5 border border-background/10 rounded-sm">
              <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary-foreground font-heading">{initials}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-background leading-none truncate max-w-[120px]">{user.name}</span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border ${
                    isB2B
                      ? 'bg-accent/20 border-accent/30 text-accent'
                      : 'bg-primary/20 border-primary/30 text-primary'
                  }`}>
                    {isB2B ? <Building2 size={8} /> : <User size={8} />}
                    {isB2B ? 'B2B' : 'Personal'}
                  </span>
                </div>
                <p className="text-[10px] text-background/40 mt-0.5 truncate max-w-[140px]">{user.email}</p>
              </div>
            </div>

            <Link
              to="/quote"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={12} /> New Request
            </Link>

            <LogoutButton className="px-3 py-2 text-xs text-background/50 hover:text-background border border-background/20 hover:border-background/40 rounded-sm transition-colors font-semibold">
              Sign Out
            </LogoutButton>
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex gap-0 -mb-px">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                isActive(to)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-background/35 hover:text-background/60 hover:border-background/20'
              }`}
            >
              <Icon size={12} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
