import { useState, useEffect, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/lib/admin-context';
import { hasPermission } from '@/lib/admin-types';
import {
  LayoutDashboard, Users, CreditCard, Settings,
  ClipboardList, HeadphonesIcon, ShieldCheck, BarChart2, LogOut,
  Menu, ChevronRight, Shield, Bell, Zap, Send,
  Globe, Wrench, FileEdit, Palette,
  X, TestTube2, UserCheck, PenLine, Building2, Scale, MoreHorizontal,
} from 'lucide-react';

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
    label: 'Overview',
    items: [
      { label: 'Dashboard',       href: '/admin/dashboard',   icon: LayoutDashboard, section: 'dashboard' },
      { label: 'Analytics',       href: '/admin/analytics',   icon: BarChart2,       section: 'analytics' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Users',           href: '/admin/users',       icon: Users,           section: 'users' },
      { label: 'Subscriptions',   href: '/admin/subscriptions', icon: CreditCard,    section: 'subscriptions' },
      { label: 'Affiliate Programme', href: '/admin/affiliate', icon: UserCheck,     section: 'affiliate' },
      { label: 'Reseller Programme',  href: '/admin/resellers', icon: Building2,      section: 'resellers' },
      { label: 'Document Signing',    href: '/admin/signing',   icon: PenLine,        section: 'signing' },
      { label: 'Support Centre',  href: '/admin/support',     icon: HeadphonesIcon,  section: 'support' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Website Pages',   href: '/admin/pages',       icon: Globe,           section: 'pages' },
      { label: 'Content Manager', href: '/admin/content',     icon: FileEdit,        section: 'content' },
      { label: 'Legal Pages',     href: '/admin/legal',       icon: Scale,           section: 'legal' },
      { label: 'Builder Manager', href: '/admin/builders',    icon: Wrench,          section: 'builders' },
      { label: 'Portal Navigation', href: '/admin/portal-nav', icon: LayoutDashboard, section: 'portal-nav' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Site Settings',   href: '/admin/site-settings', icon: Palette,       section: 'site-settings' },
      { label: 'System Config',   href: '/admin/system',      icon: Settings,        section: 'system' },
      { label: 'Stripe Management', href: '/admin/stripe-diagnostics', icon: Zap,   section: 'stripe-diagnostics' },
    ],
  },
  {
    label: 'Security & Logs',
    items: [
      { label: 'Audit Logs',      href: '/admin/audit',       icon: ClipboardList,   section: 'audit' },
      { label: 'Security',        href: '/admin/security',    icon: ShieldCheck,     section: 'security' },
      { label: 'GDPR / SAR',      href: '/admin/gdpr',        icon: Shield,          section: 'gdpr' },
    ],
  },
  {
    label: 'Developer',
    items: [
      { label: 'Test Tools',      href: '/admin/test-tools',  icon: TestTube2,       section: 'test-tools' },
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
        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        )}
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

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-200 space-y-0.5">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Profile Studio's administration portal is intentionally light-only.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Redirect to admin login if session is gone (expired or never set)
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = '/admin';
    }
  }, [isLoading, admin]);

  // Show a neutral loading shell while the session is being resolved.
  // This prevents child pages from firing API calls (and showing 401 banners)
  // before we know whether the admin is authenticated.
  if (isLoading || !admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading admin portal…</span>
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
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-0 flex items-center gap-4 shadow-sm h-14">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
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

          <div className="flex items-center gap-1.5 shrink-0">
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
          <div key={location.pathname}>
            {children}
          </div>
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
