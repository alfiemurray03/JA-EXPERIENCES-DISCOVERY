import { useState, useEffect } from 'react';
import {
  Save, Globe, Mail, Shield, Bell, CreditCard, Loader2, CheckCircle2,
  AlertCircle, Eye, EyeOff, Zap, RefreshCw, Package, ExternalLink, Palette, Sun, Moon,
  Send, FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { applyThemeSettings } from '@/lib/site-theme';

interface Settings {
  site_name: string; site_url: string; support_email: string; contact_email: string;
  max_free_profiles: string; max_free_links: string; allow_registration: string;
  require_email_verification: string; maintenance_mode: string; maintenance_message: string;
  smtp_host: string; smtp_port: string; smtp_user: string; smtp_from_name: string;
  analytics_enabled: string; cookie_banner_enabled: string; gdpr_enabled: string;
  terms_version: string; privacy_version: string;
}

interface StripeConfig {
  stripe_publishable_key: string; stripe_secret_key_masked?: string;
  stripe_webhook_secret: string; stripe_mode: string;
  // for editing only
  stripe_secret_key?: string;
}

const defaultSettings: Settings = {
  site_name: 'JA Smart Profile', site_url: 'https://jasmartprofile.jagroupservices.co.uk',
  support_email: 'jasmartprofile@jagroupservices.co.uk', contact_email: 'jasmartprofile@jagroupservices.co.uk',
  max_free_profiles: '1', max_free_links: '5', allow_registration: '1',
  require_email_verification: '0', maintenance_mode: '0',
  maintenance_message: 'We are performing scheduled maintenance. We will be back shortly.',
  smtp_host: '', smtp_port: '587', smtp_user: '', smtp_from_name: 'JA Smart Profile',
  analytics_enabled: '1', cookie_banner_enabled: '1', gdpr_enabled: '1',
  terms_version: '1.0', privacy_version: '1.0',
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ThemeConfig {
  site_color_mode: string;
  site_primary_color: string;
  site_secondary_color: string;
  site_accent_color: string;
}

const defaultTheme: ThemeConfig = {
  site_color_mode: 'dark',
  site_primary_color: '#3B82F6',
  site_secondary_color: '#513bf6',
  site_accent_color: '#3B82F6',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Stripe
  const [stripe, setStripe] = useState<StripeConfig>({
    stripe_publishable_key: '', stripe_secret_key: '', stripe_webhook_secret: '', stripe_mode: 'test',
  });
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeSaveStatus, setStripeSaveStatus] = useState<SaveStatus>('idle');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Stripe Products
  interface StripeProductRow { id: string; name: string; description: string; active: number; synced_at: string; prices: { id: string; currency: string; unit_amount: number; recurring_interval: string | null }[]; }
  const [products, setProducts] = useState<StripeProductRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ products: number; prices: number } | null>(null);
  const [syncError, setSyncError] = useState('');

  // Theme / Appearance
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [themeSaveStatus, setThemeSaveStatus] = useState<SaveStatus>('idle');

  // Notification test
  type TestNotifType = 'signup' | 'message' | 'support' | 'plan_change';
  const [testNotifType, setTestNotifType] = useState<TestNotifType>('signup');
  const [testNotifStatus, setTestNotifStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testNotifMsg, setTestNotifMsg] = useState('');

  const sendTestNotification = async () => {
    setTestNotifStatus('sending');
    setTestNotifMsg('');
    try {
      const res = await fetch('/api/admin/test-notification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: testNotifType }),
      });
      const data = await res.json();
      if (data.success) {
        setTestNotifStatus('sent');
        setTestNotifMsg(data.message);
      } else {
        setTestNotifStatus('error');
        setTestNotifMsg(data.error || 'Failed to send test notification.');
      }
    } catch {
      setTestNotifStatus('error');
      setTestNotifMsg('Network error. Check the server logs.');
    }
    setTimeout(() => setTestNotifStatus('idle'), 8000);
  };

  const loadProducts = () => {
    setProductsLoading(true);
    fetch('/api/admin/stripe/products', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); })
      .finally(() => setProductsLoading(false));
  };

  const syncProducts = async () => {
    setSyncing(true);
    setSyncError('');
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/stripe/sync-products', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.synced);
        loadProducts();
      } else {
        setSyncError(data.error || 'Sync failed');
      }
    } catch {
      setSyncError('Network error during sync');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/stripe/config', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/theme', { credentials: 'include' }).then(r => r.json()),
    ]).then(([settingsData, stripeData, themeData]) => {
      if (settingsData.success) setSettings({ ...defaultSettings, ...settingsData.data });
      if (stripeData.success) setStripe(s => ({ ...s, ...stripeData.data }));
      if (themeData.success) setTheme(t => ({ ...t, ...themeData.data }));
      setLoading(false);
      setStripeLoading(false);
    });
  }, []);

  const set = (key: keyof Settings, value: string) => setSettings(s => ({ ...s, [key]: value }));
  const toggle = (key: keyof Settings) => setSettings(s => ({ ...s, [key]: s[key] === '1' ? '0' : '1' }));
  const setS = (key: keyof StripeConfig, value: string) => setStripe(s => ({ ...s, [key]: value }));
  const setT = (key: keyof ThemeConfig, value: string) => setTheme(t => ({ ...t, [key]: value }));

  const save = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSaveStatus(data.success ? 'saved' : 'error');
      if (data.success) setTimeout(() => setSaveStatus('idle'), 3000);
    } catch { setSaveStatus('error'); }
  };

  const saveStripe = async () => {
    setStripeSaveStatus('saving');
    try {
      const payload: Record<string, string> = {
        stripe_publishable_key: stripe.stripe_publishable_key,
        stripe_webhook_secret: stripe.stripe_webhook_secret,
        stripe_mode: stripe.stripe_mode,
      };
      if (stripe.stripe_secret_key) payload.stripe_secret_key = stripe.stripe_secret_key;
      const res = await fetch('/api/admin/stripe/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStripeSaveStatus(data.success ? 'saved' : 'error');
      if (data.success) {
        setTimeout(() => setStripeSaveStatus('idle'), 3000);
        // Re-fetch to get masked key
        const fresh = await fetch('/api/admin/stripe/config', { credentials: 'include' }).then(r => r.json());
        if (fresh.success) setStripe(s => ({ ...s, ...fresh.data, stripe_secret_key: '' }));
      }
    } catch { setStripeSaveStatus('error'); }
  };

  const saveTheme = async () => {
    setThemeSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(theme),
      });
      const data = await res.json();
      setThemeSaveStatus(data.success ? 'saved' : 'error');
      if (data.success) {
        applyThemeSettings(theme);
        setTimeout(() => setThemeSaveStatus('idle'), 3000);
      }
    } catch { setThemeSaveStatus('error'); }
  };

  const SaveBtn = ({ status, onClick }: { status: SaveStatus; onClick: () => void }) => (
    <Button onClick={onClick} disabled={status === 'saving'} className="bg-primary hover:bg-primary/90 gap-2">
      {status === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        : status === 'saved' ? <><CheckCircle2 className="w-4 h-4" /> Saved</>
        : status === 'error' ? <><AlertCircle className="w-4 h-4" /> Error</>
        : <><Save className="w-4 h-4" /> Save Changes</>}
    </Button>
  );

  if (loading || stripeLoading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-muted/30 animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform-wide settings and behaviour</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/50 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stripe">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Stripe
              {stripe.stripe_publishable_key ? (
                <Badge className={`text-xs border-0 ml-1 ${stripe.stripe_mode === 'live' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {stripe.stripe_mode === 'live' ? 'Live' : 'Test'}
                </Badge>
              ) : (
                <Badge className="text-xs border-0 ml-1 bg-muted text-muted-foreground">Not set</Badge>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="products" onClick={loadProducts}>
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Products
            </span>
          </TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="appearance">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Appearance
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-end"><SaveBtn status={saveStatus} onClick={save} /></div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> General
              </CardTitle>
              <CardDescription>Basic platform identity and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Platform Name</Label>
                  <Input value={settings.site_name} onChange={e => set('site_name', e.target.value)} className="bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Platform URL</Label>
                  <Input value={settings.site_url} onChange={e => set('site_url', e.target.value)} className="bg-background border-border" placeholder="https://…" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Support Email</Label>
                  <Input value={settings.support_email} onChange={e => set('support_email', e.target.value)} className="bg-background border-border" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Contact Email</Label>
                  <Input value={settings.contact_email} onChange={e => set('contact_email', e.target.value)} className="bg-background border-border" type="email" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Registration & Limits
              </CardTitle>
              <CardDescription>Control who can register and default free-tier limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Allow New Registrations</p>
                  <p className="text-xs text-muted-foreground mt-0.5">New users can sign up via the customer portal</p>
                </div>
                <Switch checked={settings.allow_registration === '1'} onCheckedChange={() => toggle('allow_registration')} />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Require Email Verification</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Users must verify their email before accessing the dashboard</p>
                </div>
                <Switch checked={settings.require_email_verification === '1'} onCheckedChange={() => toggle('require_email_verification')} />
              </div>
              <Separator className="bg-border" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Free Plan — Max Profiles</Label>
                  <Input value={settings.max_free_profiles} onChange={e => set('max_free_profiles', e.target.value)} type="number" min="1" className="bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Free Plan — Max Links per Profile</Label>
                  <Input value={settings.max_free_links} onChange={e => set('max_free_links', e.target.value)} type="number" min="1" className="bg-background border-border" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Maintenance Mode
              </CardTitle>
              <CardDescription>Take the platform offline for maintenance with a custom message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All users except admins will see the maintenance message</p>
                </div>
                <Switch checked={settings.maintenance_mode === '1'} onCheckedChange={() => toggle('maintenance_mode')} />
              </div>
              {settings.maintenance_mode === '1' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Maintenance Message</Label>
                  <Textarea value={settings.maintenance_message} onChange={e => set('maintenance_message', e.target.value)}
                    className="bg-background border-border resize-none" rows={3} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stripe ── */}
        <TabsContent value="stripe" className="space-y-6">
          <div className="flex justify-end"><SaveBtn status={stripeSaveStatus} onClick={saveStripe} /></div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Stripe API Keys
              </CardTitle>
              <CardDescription>
                Keys are stored securely in the database. Find them in your{' '}
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2">Stripe Dashboard → API Keys</a>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Mode toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Live Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stripe.stripe_mode === 'live'
                      ? 'Real payments are being processed'
                      : 'Test mode — no real charges'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`border-0 ${stripe.stripe_mode === 'live' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {stripe.stripe_mode === 'live' ? 'Live' : 'Test'}
                  </Badge>
                  <Switch
                    checked={stripe.stripe_mode === 'live'}
                    onCheckedChange={v => setS('stripe_mode', v ? 'live' : 'test')}
                  />
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Publishable key */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Publishable Key <span className="text-muted-foreground/60">(pk_test_… or pk_live_…)</span>
                </Label>
                <Input
                  value={stripe.stripe_publishable_key}
                  onChange={e => setS('stripe_publishable_key', e.target.value)}
                  placeholder="pk_test_…"
                  className="bg-background border-border font-mono text-sm"
                />
              </div>

              {/* Secret key */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Secret Key <span className="text-muted-foreground/60">(sk_test_… or sk_live_…)</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showSecretKey ? 'text' : 'password'}
                    value={stripe.stripe_secret_key || stripe.stripe_secret_key_masked || ''}
                    onChange={e => setS('stripe_secret_key', e.target.value)}
                    placeholder={stripe.stripe_secret_key_masked ? stripe.stripe_secret_key_masked : 'sk_test_…'}
                    className="bg-background border-border font-mono text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowSecretKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {stripe.stripe_secret_key_masked && (
                  <p className="text-xs text-muted-foreground">Current key: {stripe.stripe_secret_key_masked} — leave blank to keep existing</p>
                )}
              </div>

              {/* Webhook secret */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Webhook Signing Secret <span className="text-muted-foreground/60">(whsec_…)</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={stripe.stripe_webhook_secret}
                    onChange={e => setS('stripe_webhook_secret', e.target.value)}
                    placeholder="whsec_…"
                    className="bg-background border-border font-mono text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowWebhookSecret(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set your webhook endpoint to <code className="bg-muted px-1 py-0.5 rounded text-xs">/api/stripe/webhook</code> in the Stripe Dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Connection status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Publishable Key', ok: !!stripe.stripe_publishable_key },
                { label: 'Secret Key', ok: !!(stripe.stripe_secret_key || stripe.stripe_secret_key_masked) },
                { label: 'Webhook Secret', ok: !!stripe.stripe_webhook_secret },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <Badge className={`border-0 text-xs ${item.ok ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {item.ok ? '✓ Configured' : 'Not set'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stripe Products ── */}
        <TabsContent value="products" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> Stripe Products & Prices
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Sync products and prices from your Stripe account. Use these IDs when configuring plan Stripe price IDs.
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={loadProducts} disabled={productsLoading}>
                    <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5" onClick={syncProducts} disabled={syncing || !stripe.stripe_publishable_key}>
                    <Zap className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing…' : 'Sync from Stripe'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!stripe.stripe_publishable_key && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
                  Configure your Stripe keys in the <strong>Stripe</strong> tab first, then sync products.
                </div>
              )}
              {syncError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">{syncError}</div>
              )}
              {syncResult && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
                  Synced {syncResult.products} product{syncResult.products !== 1 ? 's' : ''} and {syncResult.prices} price{syncResult.prices !== 1 ? 's' : ''} from Stripe.
                </div>
              )}

              {productsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No products synced yet.</p>
                  <p className="text-muted-foreground text-xs mt-1">Click "Sync from Stripe" to import your products.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{p.name}</span>
                            <Badge className={`text-xs border-0 ${p.active ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                              {p.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                          <code className="text-xs text-muted-foreground font-mono mt-1 block">{p.id}</code>
                        </div>
                        <a
                          href={`https://dashboard.stripe.com/products/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      {p.prices.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Prices</p>
                          {p.prices.map(pr => (
                            <div key={pr.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-muted-foreground">{pr.id}</code>
                                <Badge className="text-xs border-0 bg-muted text-muted-foreground">
                                  {pr.recurring_interval ? `${pr.recurring_interval}ly` : 'one-time'}
                                </Badge>
                              </div>
                              <span className="text-foreground font-medium">
                                {pr.unit_amount != null
                                  ? `${(pr.unit_amount / 100).toFixed(2)} ${pr.currency?.toUpperCase()}`
                                  : 'Custom'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Last synced: {new Date(p.synced_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Email ── */}
        <TabsContent value="email" className="space-y-6">
          <div className="flex justify-end"><SaveBtn status={saveStatus} onClick={save} /></div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email (SMTP)
              </CardTitle>
              <CardDescription>Configure outbound email delivery for notifications and confirmations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">SMTP Host</Label>
                  <Input value={settings.smtp_host} onChange={e => set('smtp_host', e.target.value)} className="bg-background border-border" placeholder="smtp.example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">SMTP Port</Label>
                  <Input value={settings.smtp_port} onChange={e => set('smtp_port', e.target.value)} className="bg-background border-border" type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">SMTP Username</Label>
                  <Input value={settings.smtp_user} onChange={e => set('smtp_user', e.target.value)} className="bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">From Name</Label>
                  <Input value={settings.smtp_from_name} onChange={e => set('smtp_from_name', e.target.value)} className="bg-background border-border" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Notification Test ── */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" /> Test Notifications
              </CardTitle>
              <CardDescription>
                Fire a real test email to <strong>ADMIN_NOTIFICATION_EMAIL</strong> to verify the notification pipeline end-to-end.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Notification Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { value: 'signup',      label: 'New Signup' },
                    { value: 'message',     label: 'New Message' },
                    { value: 'support',     label: 'Support Request' },
                    { value: 'plan_change', label: 'Plan Change' },
                  ] as { value: TestNotifType; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTestNotifType(opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        testNotifType === opt.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={sendTestNotification}
                  disabled={testNotifStatus === 'sending'}
                  className="gap-2"
                  size="sm"
                >
                  {testNotifStatus === 'sending' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Test Email</>
                  )}
                </Button>
              </div>

              {testNotifMsg && (
                <div className={`flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm ${
                  testNotifStatus === 'sent' || testNotifStatus === 'idle'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {testNotifStatus === 'error'
                    ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  }
                  <span>{testNotifMsg}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Compliance ── */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-end"><SaveBtn status={saveStatus} onClick={save} /></div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Privacy & Compliance
              </CardTitle>
              <CardDescription>GDPR, cookie consent, and policy version tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">GDPR Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enforce GDPR-compliant data handling across the platform</p>
                </div>
                <Switch checked={settings.gdpr_enabled === '1'} onCheckedChange={() => toggle('gdpr_enabled')} />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Cookie Consent Banner</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Show cookie consent banner to new visitors</p>
                </div>
                <Switch checked={settings.cookie_banner_enabled === '1'} onCheckedChange={() => toggle('cookie_banner_enabled')} />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Analytics Tracking</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable platform-wide analytics collection</p>
                </div>
                <Switch checked={settings.analytics_enabled === '1'} onCheckedChange={() => toggle('analytics_enabled')} />
              </div>
              <Separator className="bg-border" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Terms of Service Version</Label>
                  <Input value={settings.terms_version} onChange={e => set('terms_version', e.target.value)} className="bg-background border-border" placeholder="e.g. 1.0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Privacy Policy Version</Label>
                  <Input value={settings.privacy_version} onChange={e => set('privacy_version', e.target.value)} className="bg-background border-border" placeholder="e.g. 1.0" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance ── */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="flex justify-end">
            <SaveBtn status={themeSaveStatus} onClick={saveTheme} />
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" /> Colour Mode
              </CardTitle>
              <CardDescription>Choose whether the platform displays in light or dark mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {(['light', 'dark'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setT('site_color_mode', mode)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      theme.site_color_mode === mode
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/80 bg-muted/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}>
                      {mode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground capitalize">{mode}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mode === 'dark' ? 'Dark background, light text' : 'Light background, dark text'}
                      </p>
                    </div>
                    {theme.site_color_mode === mode && (
                      <Badge className="bg-primary text-white border-0 text-xs">Active</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Brand Colours
              </CardTitle>
              <CardDescription>Set the primary, secondary, and accent colours used across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {([
                { key: 'site_primary_color' as const, label: 'Primary Colour', desc: 'Buttons, active states, highlights' },
                { key: 'site_secondary_color' as const, label: 'Secondary Colour', desc: 'Secondary buttons and backgrounds' },
                { key: 'site_accent_color' as const, label: 'Accent Colour', desc: 'Hover states and decorative accents' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer shadow-sm"
                      style={{ backgroundColor: theme[key] }}
                    />
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={e => setT(key, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title={`Pick ${label}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Input
                    value={theme[key]}
                    onChange={e => setT(key, e.target.value)}
                    className="bg-background border-border w-32 font-mono text-xs"
                    placeholder="#3B82F6"
                    maxLength={7}
                  />
                </div>
              ))}

              <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Preview:</strong> Changes are applied immediately when you click Save Changes. The page will update without a reload.
                </p>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 px-3 rounded-lg flex items-center text-xs font-medium text-white" style={{ backgroundColor: theme.site_primary_color }}>
                    Primary
                  </div>
                  <div className="h-8 px-3 rounded-lg flex items-center text-xs font-medium text-white" style={{ backgroundColor: theme.site_secondary_color }}>
                    Secondary
                  </div>
                  <div className="h-8 px-3 rounded-lg flex items-center text-xs font-medium text-white" style={{ backgroundColor: theme.site_accent_color }}>
                    Accent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
