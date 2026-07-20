import { useState, useEffect, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/lib/admin-context';
import { hasPermission } from '@/lib/admin-types';
import {
  LayoutDashboard, Users, CreditCard, Settings,
  ClipboardList, HeadphonesIcon, ShieldCheck, BarChart2, LogOut,
  Menu, ChevronRight, Shield, Bell, Send,
  Globe, Wrench, FileEdit, Palette, Activity, FileText, HeartPulse,
  X, UserCog, Clock, Mail, AlertTriangle, CircleDollarSign, PackagePlus, MoreHorizontal, Lock,
  Bot, Moon, Sun,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/admin-theme-context';

// ── Nav structure ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  section: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Dashboard',       href: '/admin/dashboard',   icon: LayoutDashboard, section: 'dashboard' },
      { label: 'Production Health', href: '/admin/health',     icon: HeartPulse,      section: 'health' },
      { label: 'Operations',      href: '/admin/operations',  icon: Activity,        section: 'operations' },
      { label: 'Analytics',       href: '/admin/analytics',   icon: BarChart2,       section: 'analytics' },
      { label: 'Reports',         href: '/admin/reports',     icon: FileText,        section: 'reports' },
      { label: 'Status Centre',   href: '/admin/status',      icon: HeartPulse,      section: 'status' },
      { label: 'Audit Log',       href: '/admin/audit',       icon: ClipboardList,   section: 'audit' },
    ],
  },
  {
    label: 'Customer Operations',
    items: [
      { label: 'Customer CRM',    href: '/admin/users',       icon: Users,           section: 'customers' },
      { label: 'Security',        href: '/admin/security',    icon: ShieldCheck,     section: 'security' },
      { label: 'Notifications',   href: '/admin/notifications', icon: Mail,          section: 'notifications' },
      { label: 'Data Protection Requests', href: '/admin/gdpr', icon: Shield,        section: 'datarequests' },
      { label: 'System Reports',  href: '/admin/system-reports', icon: AlertTriangle, section: 'systemreports' },
      { label: 'Closure Requests', href: '/admin/closure-requests', icon: Shield,     section: 'closures' },
      { label: 'Contact Enquiries', href: '/admin/enquiries', icon: Mail,            section: 'enquiries' },
      { label: 'Support',         href: '/admin/support',     icon: HeadphonesIcon,  section: 'support' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Admin Users',     href: '/admin/admin-users', icon: UserCog,         section: 'admins' },
      { label: 'Roles',           href: '/admin/roles',       icon: Users,           section: 'roles' },
      { label: 'Sessions',        href: '/admin/sessions',    icon: Clock,           section: 'sessions' },
      { label: 'Experience Builders', href: '/admin/builders', icon: Wrench,         section: 'builders' },
      { label: 'Subscription Plans', href: '/admin/plans',        icon: CreditCard, section: 'plans' },
      { label: 'Builder Usage Tokens', href: '/admin/credits', icon: CircleDollarSign, section: 'credits' },
      { label: 'Customer Usage',  href: '/admin/usage',       icon: BarChart2,       section: 'usage' },
      { label: 'Paid Add-Ons',    href: '/admin/addons',      icon: PackagePlus,     section: 'addons' },
      { label: 'System',          href: '/admin/system',      icon: AlertTriangle,   section: 'system' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Branding',        href: '/admin/branding',      icon: Palette,       section: 'branding' },
      { label: 'Website CMS',     href: '/admin/content',     icon: FileEdit,        section: 'cms' },
      { label: 'Affiliate Content', href: '/admin/affiliate-content', icon: Globe,   section: 'affiliate' },
    ],
  },
  {
    label: 'Site Status & Settings',
    items: [
      { label: 'AI Chatbot Control', href: '/admin/ai-chatbot', icon: Bot, section: 'systemsettings' },
      { label: 'Site Status & Settings', href: '/admin/site-settings', icon: Settings, section: 'systemsettings' },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const { admin, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useAdminTheme();

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => admin && hasPermission(admin, item.section)),
  })).filter(group => group.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">

      {/* Logo + close */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">
              Admin Portal
            </p>
            <p className="text-xs text-slate-400">JA Plan Studio</p>
          </div>
        </div>
      </div>

      {/* Admin info */}
      {admin && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">{admin.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin.email}</p>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold shrink-0 border border-primary/20 uppercase tracking-wide">
              Admin
            </span>
          </div>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                        ${isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
      </nav>

      {/* Sidebar utilities */}
      <div className="px-2 py-3 border-t border-slate-200 space-y-0.5">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          aria-label={resolvedTheme === 'dark' ? 'Switch Admin Portal to light mode' : 'Switch Admin Portal to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <Link to="/dashboard" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
          <Users className="w-4 h-4 text-slate-400" />
          Customer Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Layout wrapper (inner — has access to theme context) ──────────────────────

interface AdminLayoutInnerProps {
  children: ReactNode;
  title?: string;
}

function AdminLayoutInner({ children, title }: AdminLayoutInnerProps) {
  const { admin, isLoading, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useAdminTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinState, setPinState] = useState<{ loading: boolean; configured: boolean; unlocked: boolean; expiresAt?: string | null; lockedUntil?: string | null; error?: string }>({ loading: true, configured: false, unlocked: false });
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);

  const visibleItems = NAV_GROUPS.flatMap(group => group.items)
    .filter(item => admin && hasPermission(admin, item.section));
  const currentItem = visibleItems.find(item =>
    location.pathname === item.href ||
    (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href))
  );
  const currentGroup = NAV_GROUPS.find(group =>
    group.items.some(item => item.href === currentItem?.href)
  );

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  // JA Plan Studio's administration portal is intentionally light-only.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Redirect to admin login if session is gone (expired or never set)
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = '/admin';
    }
  }, [isLoading, admin]);

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    fetch('/admin/api?section=adminpin', { credentials: 'include', cache: 'no-store' })
      .then(async response => ({ response, payload: await response.json().catch(() => ({})) as { configured?: boolean; unlocked?: boolean; expiresAt?: string; lockedUntil?: string; error?: string } }))
      .then(({ response, payload }) => {
        if (cancelled) return;
        setPinState({ loading: false, configured: Boolean(payload.configured), unlocked: Boolean(payload.unlocked), expiresAt: payload.expiresAt, lockedUntil: payload.lockedUntil, error: response.ok ? '' : (payload.error || 'Administrator PIN verification is unavailable.') });
      })
      .catch(() => !cancelled && setPinState({ loading: false, configured: false, unlocked: false, error: 'Administrator PIN verification is unavailable.' }));
    return () => { cancelled = true; };
  }, [admin]);

  useEffect(() => {
    if (!pinState.unlocked || !pinState.expiresAt) return;
    const remaining = Date.parse(pinState.expiresAt) - Date.now();
    if (remaining <= 0) { setPinState(current => ({ ...current, unlocked: false, error: 'Your administrator PIN session expired. Enter your PIN again.' })); return; }
    const timer = window.setTimeout(() => setPinState(current => ({ ...current, unlocked: false, error: 'Your administrator PIN session expired. Enter your PIN again.' })), remaining);
    return () => window.clearTimeout(timer);
  }, [pinState.unlocked, pinState.expiresAt]);

  async function submitAdminPin() {
    if (!pinState.configured && pin !== pinConfirm) {
      setPinState(current => ({ ...current, error: 'The PIN confirmation does not match.' }));
      return;
    }
    setPinSubmitting(true);
    try {
      const response = await fetch('/admin/api?section=adminpin', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: pinState.configured ? 'verify' : 'setup', pin }) });
      const payload = await response.json().catch(() => ({})) as { configured?: boolean; unlocked?: boolean; expiresAt?: string; lockedUntil?: string; error?: string };
      if (!response.ok || !payload.unlocked) throw new Error(payload.error || 'The administrator PIN could not be verified.');
      setPin(''); setPinConfirm(''); setPinState({ loading: false, configured: true, unlocked: true, expiresAt: payload.expiresAt });
    } catch (reason) {
      setPinState(current => ({ ...current, error: reason instanceof Error ? reason.message : 'The administrator PIN could not be verified.' }));
    } finally { setPinSubmitting(false); }
  }

  // Show a neutral loading shell while the session is being resolved.
  // This prevents child pages from firing API calls (and showing 401 banners)
  // before we know whether the admin is authenticated.
  if (isLoading || !admin || pinState.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading admin portal…</span>
        </div>
      </div>
    );
  }

  if (!pinState.unlocked) {
    const locked = Boolean(pinState.lockedUntil && Date.parse(pinState.lockedUntil) > Date.now());
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
          <h1 className="text-xl font-semibold text-slate-950">Administrator security PIN</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{pinState.configured ? 'Enter your personal four-digit PIN to continue after Microsoft sign-in.' : 'Create your personal four-digit PIN. It will protect privileged Admin Portal and customer CRM access.'}</p>
          <label htmlFor="admin-security-pin" className="mt-5 block text-xs font-semibold text-slate-800">Four-digit PIN</label>
          <input id="admin-security-pin" type="password" inputMode="numeric" autoComplete={pinState.configured ? 'current-password' : 'new-password'} maxLength={4} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} disabled={locked} className="mt-1 h-12 w-full rounded-lg border border-slate-300 px-3 text-center font-mono text-xl tracking-[0.5em] text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100" />
          {!pinState.configured && <><label htmlFor="admin-security-pin-confirm" className="mt-3 block text-xs font-semibold text-slate-800">Confirm PIN</label><input id="admin-security-pin-confirm" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={pinConfirm} onChange={event => setPinConfirm(event.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 h-12 w-full rounded-lg border border-slate-300 px-3 text-center font-mono text-xl tracking-[0.5em] text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></>}
          {pinState.error && <p role="alert" className="mt-3 text-xs text-red-700">{pinState.error}</p>}
          {locked && <p role="alert" className="mt-3 text-xs text-amber-700">PIN access is locked until {new Date(pinState.lockedUntil!).toLocaleString('en-GB')}.</p>}
          <button type="button" onClick={() => void submitAdminPin()} disabled={locked || pinSubmitting || pin.length !== 4 || (!pinState.configured && pinConfirm.length !== 4)} className="mt-5 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{pinSubmitting ? 'Checking…' : pinState.configured ? 'Unlock Admin Portal' : 'Create PIN and continue'}</button>
          <button type="button" onClick={() => void handleLogout()} className="mt-3 w-full text-xs font-medium text-slate-500 underline">Sign out of Microsoft</button>
          <p className="mt-5 text-[11px] leading-relaxed text-slate-500">Your PIN is personal to you, cannot be displayed by administrators, and does not replace your Microsoft account security.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal min-h-screen bg-slate-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 xl:w-64 flex-col border-r border-slate-200 bg-white shrink-0 fixed inset-y-0 left-0 z-30 shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white flex flex-col z-50 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-0 flex items-center gap-4 shadow-sm h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 hidden sm:block shrink-0">Admin</span>
            {currentGroup && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block shrink-0" />
                <span className="text-xs text-slate-400 hidden sm:block shrink-0">{currentGroup.label}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-sm font-semibold text-slate-800 truncate">{currentItem?.label || title || 'Admin Portal'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              to="/admin/ai-chatbot"
              className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open AI Chatbot Control Centre"
              title="AI Chatbot Control Centre"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden xl:inline">Chatbot</span>
            </Link>
            <button
              type="button"
              className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label={resolvedTheme === 'dark' ? 'Switch Admin Portal to light mode' : 'Switch Admin Portal to dark mode'}
              title={resolvedTheme === 'dark' ? 'Switch Admin Portal to light mode' : 'Switch Admin Portal to dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden xl:inline">{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <Link to="/admin/support" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200">
              <Send className="w-3.5 h-3.5" /> Support
            </Link>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">
                {admin?.name?.charAt(0) ?? 'A'}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-700">{admin?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      <AdminMobileBottomNav
        visibleItems={visibleItems}
        pathname={location.pathname}
        onLogout={handleLogout}
      />
    </div>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────────

const MOBILE_PRIMARY_PATHS = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/builders',
  '/admin/site-settings',
];

function AdminMobileBottomNav({
  visibleItems,
  pathname,
  onLogout,
}: {
  visibleItems: NavItem[];
  pathname: string;
  onLogout: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = MOBILE_PRIMARY_PATHS
    .map(path => visibleItems.find(item => item.href === path))
    .filter((item): item is NavItem => Boolean(item));
  const more = visibleItems.filter(item => !MOBILE_PRIMARY_PATHS.includes(item.href));
  const isActive = (item: NavItem) => pathname === item.href ||
    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
  const isMoreActive = more.some(isActive);

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/98 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch">
          {primary.map(item => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors ${
                  active ? 'text-primary' : 'text-slate-400'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(open => !open)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors ${
              isMoreActive || moreOpen ? 'text-primary' : 'text-slate-400'
            }`}
            aria-label="More admin options"
            aria-expanded={moreOpen}
          >
            {moreOpen ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div
            className="relative bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl max-h-[78vh] flex flex-col"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>
            <div className="px-5 pb-2 shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">All Sections</h2>
              <button onClick={() => setMoreOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Close all sections">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {more.map(item => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="flex-1 leading-tight text-xs">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => { setMoreOpen(false); onLogout(); }}
                className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <AdminLayoutInner title={title}>
      {children}
    </AdminLayoutInner>
  );
}
