/**
 * Dashboard — Account page
 * Shows the customer's account details, plan/subscription status,
 * and a support request form.
 */
import { useState } from 'react';
import { User, Mail, Shield, CreditCard, ExternalLink, Send, Check, Calendar, Zap, HelpCircle, ChevronDown, ChevronUp, Edit2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';

const SUBJECTS = [
  'General enquiry',
  'Billing question',
  'Technical issue',
  'Account access problem',
  'Feature request',
  'Other',
];

function statusBadge(status: string | null, lifetime: number) {
  if (lifetime) return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Lifetime</Badge>;
  if (!status)  return <Badge className="bg-muted text-muted-foreground border-0">Free</Badge>;
  const map: Record<string, string> = {
    active:    'bg-green-500/10 text-green-400 border-green-500/20',
    past_due:  'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-muted text-muted-foreground border-0',
    trialing:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return <Badge className={map[status] ?? 'bg-muted text-muted-foreground border-0'}>{status}</Badge>;
}

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const branding = useBranding();

  // Support form
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit name/email
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const planLabel = user.lifetime_access
    ? `${user.plan_name ?? 'Pro'} (Lifetime)`
    : user.plan_name ?? 'Free';

  const periodEnd = user.current_period_end
    ? new Date(user.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const submitRequest = async () => {
    setFormError('');
    if (!subject) { setFormError('Please select a subject.'); return; }
    if (!message.trim()) { setFormError('Please describe your issue.'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id, name: user.name, email: user.email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => { setSent(false); setShowForm(false); }, 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const startEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setSaveError('');
    setSaveSuccess(false);
    setEditMode(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) { setSaveError('Name is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) { setSaveError('Enter a valid email address'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/account/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      // Refresh auth context
      await refreshUser();
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
        <p className="text-muted-foreground mt-1">Your account details and membership information</p>
      </div>

      {/* Profile summary */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{user.name}</h2>
              <p className="text-muted-foreground text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs capitalize">{user.role}</Badge>
                {statusBadge(user.subscription_status, user.lifetime_access)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account details */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Account Details
              </CardTitle>
              <CardDescription>Update your name and email address</CardDescription>
            </div>
            {!editMode && (
              <Button size="sm" variant="outline" className="border-border gap-1.5" onClick={startEdit}>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-foreground">First / Full Name</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)}
                  className="bg-background border-border mt-1" placeholder="Your name" />
              </div>
              <div>
                <Label className="text-sm text-foreground">Email Address</Label>
                <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="bg-background border-border mt-1" placeholder="your@email.com" />
              </div>
              {saveError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />{saveError}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={saveProfile} disabled={saving} className="bg-primary gap-1.5">
                  {saving ? 'Saving…' : <><Check className="w-4 h-4" /> Save Changes</>}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)} className="border-border">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm pb-3">
                  <Check className="w-4 h-4" /> Account details updated successfully
                </div>
              )}
              {[
                { icon: User,     label: 'Full Name',     value: user.name },
                { icon: Mail,     label: 'Email Address', value: user.email },
                { icon: Shield,   label: 'Account Type',  value: 'Secure Account' },
                { icon: Calendar, label: 'Member Since',  value: memberSince ?? '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan & subscription */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Plan & Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-foreground font-semibold">{planLabel}</p>
                {user.lifetime_access ? <Zap className="w-4 h-4 text-amber-400" /> : null}
              </div>
              {user.billing_interval && !user.lifetime_access && (
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">Billed {user.billing_interval}ly</p>
              )}
              {periodEnd && !user.lifetime_access && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.subscription_status === 'cancelled' ? 'Access until' : 'Renews'}: {periodEnd}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {statusBadge(user.subscription_status, user.lifetime_access)}
              <Link to="/dashboard/billing">
                <Button variant="outline" size="sm" className="border-border gap-1.5 text-xs">
                  View Plans <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support request */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Support
              </CardTitle>
              <CardDescription className="mt-1">Get help from the {branding.platform_name ?? 'JA Smart Profile'} team</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border gap-1.5"
              onClick={() => { setShowForm(f => !f); setSent(false); setFormError(''); }}
            >
              {showForm ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</> : <><ChevronDown className="w-3.5 h-3.5" /> New Request</>}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="space-y-4 pt-0">
            {sent ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Request sent! We'll get back to you at <strong>{user.email}</strong>.</p>
              </div>
            ) : (
              <>
                {formError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{formError}</div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Your Name</Label>
                    <Input value={user.name} disabled className="bg-muted/50 border-border text-muted-foreground" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    <Input value={user.email} disabled className="bg-muted/50 border-border text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select a subject…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Message</Label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in as much detail as possible…"
                    className="bg-background border-border min-h-[120px] resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={submitRequest} disabled={sending} className="bg-primary gap-2">
                    {sending ? 'Sending…' : <><Send className="w-3.5 h-3.5" /> Send Request</>}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}

        {!showForm && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              For account queries, billing questions, or technical support — we typically respond within 1 business day.
            </p>
            <a href={`mailto:${branding.support_email || 'jasmartprofile@jagroupservices.co.uk'}`}>
              <Button variant="outline" size="sm" className="border-border gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {branding.support_email || 'jasmartprofile@jagroupservices.co.uk'}
              </Button>
            </a>
          </CardContent>
        )}
      </Card>

      {/* Settings shortcut */}
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Update your display name</p>
            <p className="text-xs text-muted-foreground mt-0.5">Change how your name appears across your profiles</p>
          </div>
          <Link to="/dashboard/settings">
            <Button variant="outline" size="sm" className="border-border gap-1.5">
              Settings <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
