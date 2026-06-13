/**
 * AdminLayout — theme-aware (light/dark/system), clean professional design.
 * Light mode is the default. Grouped navigation with role-based filtering.
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/lib/admin-context';
import { useAdminTheme, type AdminTheme } from '@/lib/admin-theme-context';
import { getAdminRoleLabel, getAdminRoleColor, hasPermission } from '@/lib/admin-types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard, Users, CreditCard, Settings,
  ClipboardList, HeadphonesIcon, ShieldCheck, BarChart2, LogOut,
  Menu, ChevronRight, Shield, Bell, Zap, Sun, Moon,
  Monitor, Globe, Wrench, FileEdit, Palette,
  ChevronDown, X, TestTube2, UserCheck, PenLine, Building2, Scale,
} from 'lucide-react';

// ── Nav structure ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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

// ── Theme toggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme();
  const options: { value: AdminTheme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  const current = options.find(o => o.value === theme) ?? options[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-colors
          border border-transparent
          text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-200
          dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 dark:hover:border-slate-600">
          <CurrentIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36
        bg-white border-gray-200 shadow-lg
        dark:bg-slate-800 dark:border-slate-700">
        {options.map(opt => {
          const Icon = opt.icon;
          return (
            <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)}
              className={`text-xs gap-2 cursor-pointer
                ${theme === opt.value
                  ? 'text-primary font-medium bg-primary/5 dark:bg-primary/10'
                  : 'text-gray-700 dark:text-slate-300'
                }
                hover:bg-gray-50 dark:hover:bg-slate-700`}>
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              {theme === opt.value && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    <div className="flex flex-col h-full border-r transition-colors
      bg-white border-gray-200
      dark:bg-slate-900 dark:border-slate-800">

      {/* Logo + close */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
            bg-primary/10 border border-primary/20
            dark:bg-primary/20 dark:border-primary/30">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate text-gray-900 dark:text-white">
              Admin Portal
            </p>
            <p className="text-[10px] truncate text-gray-400 dark:text-slate-500">JA Document Hub</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded
            text-gray-400 hover:text-gray-700
            dark:text-slate-400 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Admin info */}
      {admin && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
              bg-primary/10 text-primary dark:bg-primary/20">
              {admin.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-gray-900 dark:text-white">{admin.name}</p>
              <p className="text-[10px] truncate text-gray-400 dark:text-slate-500">{admin.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-medium
              ${getAdminRoleColor(admin)}`}>
              {getAdminRoleLabel(admin)}
            </span>
          </div>
        </div>
      )}

      {/* Nav groups */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1
                text-gray-400 dark:text-slate-600">
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
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group
                        ${isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate text-sm">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3 h-3 shrink-0 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t space-y-1 border-gray-200 dark:border-slate-800">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors
            text-gray-400 hover:text-gray-600 hover:bg-gray-100
            dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800">
          <Globe className="w-3.5 h-3.5" />
          View Live Site
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sm
            text-gray-500 hover:text-red-600 hover:bg-red-50
            dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-400/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

// ── Layout wrapper (inner — has access to theme context) ──────────────────────

interface AdminLayoutInnerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

function AdminLayoutInner({ children, title, subtitle }: AdminLayoutInnerProps) {
  const { admin, isLoading } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading admin portal…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors bg-gray-50 dark:bg-slate-950"
    >

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b shrink-0 transition-colors
          bg-white border-gray-200 shadow-sm
          dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg transition-colors
                text-gray-500 hover:text-gray-900 hover:bg-gray-100
                dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            {title && (
              <div>
                <h1 className="font-semibold text-sm leading-tight text-gray-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="relative p-1.5 rounded-lg transition-colors
                text-gray-500 hover:text-gray-900 hover:bg-gray-100
                dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-700">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                bg-primary/10 text-primary dark:bg-primary/20">
                {admin?.name?.charAt(0) ?? 'A'}
              </div>
              <span className="text-xs text-gray-700 dark:text-slate-300">{admin?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
          <div className="p-5 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <AdminLayoutInner title={title} subtitle={subtitle}>
      {children}
    </AdminLayoutInner>
  );
}
