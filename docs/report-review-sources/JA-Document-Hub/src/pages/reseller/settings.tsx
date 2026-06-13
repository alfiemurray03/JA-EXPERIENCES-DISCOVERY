import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Settings, Loader2, CheckCircle2 } from 'lucide-react';

interface ResellerSettings {
  fullName: string; email: string; phone: string | null; company: string | null;
  website: string | null; vatNumber: string | null; businessType: string | null;
  payoutMethod: string | null;
  notifyNewSignup: boolean; notifyCommission: boolean; notifyAnnouncements: boolean;
}

export default function ResellerSettingsPage() {
  const [settings, setSettings] = useState<ResellerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/reseller/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.settings); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof ResellerSettings, value: string | boolean) {
    setSettings(s => s ? { ...s, [field]: value } : s);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const r = await fetch('/api/reseller/settings', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const d = await r.json();
      if (d.success) setSuccess(true);
      else setError(d.error ?? 'Failed to save.');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  }

  if (loading) return <ResellerLayout><div className="p-6 text-sm text-muted-foreground">Loading…</div></ResellerLayout>;

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>Settings — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your reseller profile and preferences.</p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20"><AlertDescription className="text-green-700 dark:text-green-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Settings saved successfully.</AlertDescription></Alert>}

        <form onSubmit={save} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={settings?.fullName ?? ''} onChange={e => set('fullName', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={settings?.email ?? ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={settings?.phone ?? ''} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Company</Label>
                  <Input value={settings?.company ?? ''} onChange={e => set('company', e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input type="url" value={settings?.website ?? ''} onChange={e => set('website', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>VAT Number</Label>
                  <Input value={settings?.vatNumber ?? ''} onChange={e => set('vatNumber', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Business Type</Label>
                <Input value={settings?.businessType ?? ''} onChange={e => set('businessType', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payout Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Preferred Payout Method</Label>
                <Input value={settings?.payoutMethod ?? ''} onChange={e => set('payoutMethod', e.target.value)} placeholder="e.g. Bank Transfer, PayPal" />
              </div>
              <p className="text-xs text-muted-foreground">
                To update your bank details or PayPal email, please contact our support team directly for security verification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'notifyNewSignup' as const, label: 'New customer signup', desc: 'Get notified when a new customer signs up via your referral link.' },
                { key: 'notifyCommission' as const, label: 'Commission updates', desc: 'Get notified when commissions are approved or paid.' },
                { key: 'notifyAnnouncements' as const, label: 'Announcements', desc: 'Receive important announcements from the reseller team.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <Switch checked={settings?.[key] ?? false} onCheckedChange={v => set(key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : 'Save Settings'}
          </Button>
        </form>
      </div>
    </ResellerLayout>
    </ComingSoonOverlay>
  );
}
