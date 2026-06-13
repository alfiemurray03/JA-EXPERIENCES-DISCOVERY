import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, User, Link2, QrCode, Mail, BarChart3,
  Palette, CreditCard, Settings, LogOut, Menu, X, Zap, UserCircle, Gift, MessageCircle, PauseCircle, Phone
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { path: '/dashboard/overview',  label: 'Overview',           icon: LayoutDashboard },
  { path: '/dashboard/account',   label: 'My Account',         icon: UserCircle },
  { path: '/dashboard/profile',   label: 'My Profile',         icon: User },
  { path: '/dashboard/links',     label: 'Links Manager',      icon: Link2 },
  { path: '/dashboard/qr-code',   label: 'QR Code',            icon: QrCode },
  { path: '/dashboard/enquiries', label: 'Contact Enquiries',  icon: Mail, badge: true },
  { path: '/dashboard/analytics', label: 'Analytics',          icon: BarChart3 },
  { path: '/dashboard/themes',    label: 'Themes',             icon: Palette },
  { path: '/dashboard/billing',   label: 'Plans & Billing',    icon: CreditCard },
  { path: '/dashboard/referral',  label: 'Refer & Earn',       icon: Gift },
  { path: '/dashboard/messages',  label: 'Messages',           icon: MessageCircle },
  { path: '/dashboard/settings',  label: 'Settings',           icon: Settings },
];

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const branding = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    fetch('/api/enquiries', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnreadCount(d.data.filter((e: { is_read: number }) => !e.is_read).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // ── Paused account gate ────────────────────────────────────────────────────
  if (user.is_paused) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
            <PauseCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Account Paused</h1>
          <p className="text-muted-foreground mb-4">
            {user.pause_reason
              ? user.pause_reason
              : 'Your account has been temporarily paused. Please contact us to reactivate.'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            If you believe this is an error, please get in touch with our team and we'll get you back up and running.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`}>
              <Button className="bg-primary gap-2 w-full sm:w-auto">
                <Phone className="w-4 h-4" /> Contact Us
              </Button>
            </a>
            <Button variant="outline" className="border-border gap-2 w-full sm:w-auto" onClick={() => window.location.href = '/auth/logout'}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">{branding.platform_name} · JA Group Services</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">{branding.platform_name}</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="border-t border-border my-2" />

        <div className="flex items-center gap-2 px-3 py-1">
          <NotificationBell />
          <span className="text-xs text-muted-foreground">Notifications</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Log Out
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-card border-r border-border flex flex-col z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">{branding.platform_name}</span>
          </div>
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
                {item.badge && unreadCount > 0 && (
                  <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
