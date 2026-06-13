import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { adminCls, planBadgeCls, subStatusBadgeCls } from '@/lib/admin-theme-classes';
import {
  CreditCard, Users, Search, RefreshCw, Building2,
  UserPlus, Eye, EyeOff, CheckCircle2, XCircle, FileText,
  Calendar, Mail, Briefcase, Crown, ShieldCheck, AlertTriangle,
  Pencil, Save, X, Zap, History, Star, ArrowRightLeft,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  plan: string;
  usageType?: string | null;
  isVerified: boolean;
  planIsLifetime?: boolean;
  planExpiresAt?: string | null;
  createdAt: string;
  lastLogin?: string | null;
}

interface GrantHistoryEntry {
  action: 'grant' | 'revoke' | 'change';
  plan: string;
  grantedBy: string;
  note: string | null;
  createdAt: string;
}

interface LifetimeUser extends CustomerUser {
  grants: GrantHistoryEntry[];
}

interface CustomerProfile {
  customer: CustomerUser;
  subscription: {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    status: string;
    trialStart: string | null;
    trialEnd: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  documents: {
    total: number;
    drafts: number;
    completed: number;
    archived: number;
    recent: Array<{
      uuid: string;
      title: string;
      templateId: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PLANS = ['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional'] as const;
type Plan = typeof PLANS[number];

// Use shared theme-aware badge classes
const PLAN_STYLES = planBadgeCls;

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', personal: 'Personal', standard: 'Standard', professional: 'Professional',
  organisation: 'Organisation', org_starter: 'Org Starter',
  org_growth: 'Org Growth', org_professional: 'Org Pro',
};

const SUB_STATUS_STYLES = subStatusBadgeCls;

const DOC_STATUS_STYLES: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600 dark:bg-slate-600/40 dark:text-slate-300',
  complete: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
};

const GRANT_ACTION_STYLES: Record<string, string> = {
  grant:  'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  revoke: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
  change: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
};

const GRANT_ACTION_LABELS: Record<string, string> = {
  grant: 'Granted', revoke: 'Revoked', change: 'Changed',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Grant History component ───────────────────────────────────────────────────

function GrantHistory({ grants }: { grants: GrantHistoryEntry[] }) {
  if (!grants.length) {
    return (
      <div className={`rounded-lg p-4 text-center ${adminCls.statBg}`}>
        <History className={`w-5 h-5 mx-auto mb-1.5 ${adminCls.subtle}`} />
        <p className={`text-xs ${adminCls.muted}`}>No grant history recorded yet.</p>
        <p className={`text-[10px] mt-0.5 ${adminCls.subtle}`}>History is recorded from this point forward.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {grants.map((g, i) => (
        <div key={i} className={`rounded-lg p-3 flex items-start gap-3 ${adminCls.rowBg}`}>
          <div className="mt-0.5 shrink-0">
            {g.action === 'grant'  && <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
            {g.action === 'revoke' && <X className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />}
            {g.action === 'change' && <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${GRANT_ACTION_STYLES[g.action]}`}>
                {GRANT_ACTION_LABELS[g.action]}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PLAN_STYLES[g.plan] ?? planBadgeCls.free}`}>
                {PLAN_LABELS[g.plan] ?? g.plan}
              </span>
              <span className={`text-[10px] ${adminCls.muted}`}>{formatDateTime(g.createdAt)}</span>
            </div>
            <p className={`text-[10px] mt-1 ${adminCls.muted}`}>By: <span className={adminCls.muted}>{g.grantedBy}</span></p>
            {g.note && (
              <p className={`text-[10px] mt-1 italic ${adminCls.muted}`}>"{g.note}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lifetime Users Tab ────────────────────────────────────────────────────────

function LifetimeUsersTab({
  onViewProfile,
}: {
  onViewProfile: (id: string) => void;
}) {
  const [users, setUsers] = useState<LifetimeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/lifetime')
      .then(r => r.json())
      .then((d: { success: boolean; users: LifetimeUser[] }) => {
        if (d.success) setUsers(d.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !search
      || u.email.toLowerCase().includes(q)
      || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
      || (u.company ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${adminCls.muted}`} />
          <Input
            placeholder="Search lifetime users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`pl-9 h-9 text-sm ${adminCls.input}`}
          />
        </div>
        <Button size="sm" variant="outline" onClick={load} className={`gap-1.5 text-xs shrink-0 ${adminCls.outlineBtn}`}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Lifetime Users', value: users.length, icon: Crown, color: 'text-amber-500 dark:text-amber-400' },
          { label: 'Unique Plans', value: new Set(users.map(u => u.plan)).size, icon: Star, color: 'text-purple-500 dark:text-purple-400' },
          { label: 'With Grant Notes', value: users.filter(u => u.grants.some(g => g.note)).length, icon: FileText, color: 'text-blue-500 dark:text-blue-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={adminCls.card}>
              <CardContent className="p-4">
                <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                <p className={`text-2xl font-bold ${adminCls.text}`}>{loading ? '—' : s.value}</p>
                <p className={`text-xs mt-0.5 ${adminCls.muted}`}>{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className={`${adminCls.card} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className={`w-5 h-5 animate-spin ${adminCls.muted}`} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Crown className={`w-8 h-8 mx-auto mb-2 ${adminCls.subtle}`} />
            <p className={`text-sm ${adminCls.muted}`}>
              {search ? 'No lifetime users match your search.' : 'No lifetime users yet.'}
            </p>
            <p className={`text-xs mt-1 ${adminCls.subtle}`}>Grant lifetime access from the Admin Actions tab in a customer profile.</p>
          </div>
        ) : (
          <div className={`divide-y ${adminCls.divider}`}>
            {filtered.map(u => (
              <div key={u.id}>
                {/* Row */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${adminCls.rowHover}`}
                  onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 dark:text-amber-300 text-xs font-bold">
                      {(u.firstName ?? '?').charAt(0)}{(u.lastName ?? '').charAt(0)}
                    </span>
                  </div>
                  {/* Name / email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-xs font-medium ${adminCls.text}`}>{u.firstName} {u.lastName}</p>
                      <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PLAN_STYLES[u.plan] ?? planBadgeCls.free}`}>
                        {PLAN_LABELS[u.plan] ?? u.plan}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${adminCls.muted}`}>{u.email}</p>
                    {u.company && <p className={`text-[10px] ${adminCls.subtle}`}>{u.company}</p>}
                  </div>
                  {/* Meta */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className={`text-[10px] ${adminCls.muted}`}>Joined {formatDate(u.createdAt)}</p>
                    <p className={`text-[10px] ${adminCls.subtle}`}>{u.grants.length} grant event{u.grants.length !== 1 ? 's' : ''}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 px-2 text-xs gap-1 ${adminCls.iconBtn}`}
                      onClick={e => { e.stopPropagation(); onViewProfile(u.id); }}
                    >
                      <Eye className="w-3 h-3" /> Profile
                    </Button>
                  </div>
                </div>

                {/* Expanded grant history */}
                {expandedId === u.id && (
                  <div className={`px-4 pb-4 ${adminCls.statBg}`}>
                    <p className={`text-[10px] uppercase tracking-wide mb-2 pt-2 flex items-center gap-1.5 ${adminCls.subtle}`}>
                      <History className="w-3 h-3" /> Grant History
                    </p>
                    <GrantHistory grants={u.grants} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {filtered.length > 0 && (
          <div className={`px-4 py-3 border-t ${adminCls.divider}`}>
            <p className={`text-xs ${adminCls.muted}`}>{filtered.length} lifetime user{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSubscriptions() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [mainTab, setMainTab] = useState<'customers' | 'lifetime'>('customers');

  // Profile drawer
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [grantHistory, setGrantHistory] = useState<GrantHistoryEntry[]>([]);

  // Edit mode inside drawer
  const [editing, setEditing] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editUsageType, setEditUsageType] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Plan override
  const [overridePlan, setOverridePlan] = useState<Plan | ''>('');
  const [overrideExpiry, setOverrideExpiry] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState('');

  // Lifetime grant
  const [lifetimePlan, setLifetimePlan] = useState<Plan | ''>('');
  const [lifetimeNote, setLifetimeNote] = useState('');
  const [lifetimeLoading, setLifetimeLoading] = useState(false);
  const [lifetimeSuccess, setLifetimeSuccess] = useState('');

  // Change lifetime plan (already has lifetime)
  const [changePlan, setChangePlan] = useState<Plan | ''>('');
  const [changeNote, setChangeNote] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState('');

  // Revoke confirmation dialog
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeNote, setRevokeNote] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Add customer modal
  const [showAdd, setShowAdd] = useState(false);
  const [addFirst, setAddFirst] = useState('');
  const [addLast, setAddLast] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addCompany, setAddCompany] = useState('');
  const [addPlan, setAddPlan] = useState<Plan>('free');
  const [addUsageType, setAddUsageType] = useState('both');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Load list
  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((d: { success: boolean; users: CustomerUser[] }) => {
        if (d.success) setCustomers(d.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load profile + grant history
  const loadProfile = useCallback((id: string) => {
    setProfileId(id);
    setProfile(null);
    setProfileLoading(true);
    setEditing(false);
    setOverridePlan('');
    setOverrideSuccess('');
    setLifetimePlan('');
    setLifetimeNote('');
    setLifetimeSuccess('');
    setChangePlan('');
    setChangeNote('');
    setChangeSuccess('');
    setGrantHistory([]);

    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d: { success: boolean } & CustomerProfile) => {
        if (d.success) setProfile(d);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));

    // Load grant history from lifetime endpoint (filter by user)
    fetch('/api/admin/lifetime')
      .then(r => r.json())
      .then((d: { success: boolean; users: LifetimeUser[] }) => {
        if (d.success) {
          const match = d.users.find(u => u.id === id);
          if (match) setGrantHistory(match.grants);
        }
      })
      .catch(() => {});
  }, []);

  // Start editing
  function startEdit() {
    if (!profile) return;
    setEditFirst(profile.customer.firstName);
    setEditLast(profile.customer.lastName);
    setEditEmail(profile.customer.email);
    setEditCompany(profile.customer.company ?? '');
    setEditUsageType(profile.customer.usageType ?? 'both');
    setEditError('');
    setEditing(true);
  }

  // Save profile edits
  async function saveEdit() {
    if (!profileId) return;
    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/admin/customers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirst, lastName: editLast,
          email: editEmail, company: editCompany, usageType: editUsageType,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { setEditError(data.error ?? 'Failed to save.'); return; }
      setEditing(false);
      loadProfile(profileId);
      load();
    } catch {
      setEditError('Unable to connect.');
    } finally {
      setEditSaving(false);
    }
  }

  // Override plan
  async function handleOverridePlan() {
    if (!profileId || !overridePlan) return;
    setOverrideLoading(true);
    setOverrideSuccess('');
    try {
      const res = await fetch(`/api/admin/customers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'override_plan',
          plan: overridePlan,
          planExpiresAt: overrideExpiry || null,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setOverrideSuccess(`Plan set to ${PLAN_LABELS[overridePlan]}${overrideExpiry ? ` (expires ${formatDate(overrideExpiry)})` : ''}`);
        loadProfile(profileId);
        load();
      }
    } catch { /* noop */ }
    finally { setOverrideLoading(false); }
  }

  // Grant lifetime
  async function handleGrantLifetime() {
    if (!profileId || !lifetimePlan) return;
    setLifetimeLoading(true);
    setLifetimeSuccess('');
    try {
      const res = await fetch(`/api/admin/customers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_lifetime',
          plan: lifetimePlan,
          note: lifetimeNote.trim() || undefined,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setLifetimeSuccess(`Lifetime ${PLAN_LABELS[lifetimePlan]} granted — never expires`);
        setLifetimeNote('');
        loadProfile(profileId);
        load();
      }
    } catch { /* noop */ }
    finally { setLifetimeLoading(false); }
  }

  // Change lifetime plan tier
  async function handleChangeLifetime() {
    if (!profileId || !changePlan) return;
    setChangeLoading(true);
    setChangeSuccess('');
    try {
      const res = await fetch(`/api/admin/customers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_lifetime',
          plan: changePlan,
          note: changeNote.trim() || undefined,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setChangeSuccess(`Lifetime plan changed to ${PLAN_LABELS[changePlan]}`);
        setChangeNote('');
        loadProfile(profileId);
        load();
      }
    } catch { /* noop */ }
    finally { setChangeLoading(false); }
  }

  // Revoke lifetime (with note)
  async function handleRevokeLifetime() {
    if (!profileId) return;
    setRevokeLoading(true);
    try {
      await fetch(`/api/admin/customers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_lifetime',
          note: revokeNote.trim() || undefined,
        }),
      });
      setShowRevokeDialog(false);
      setRevokeNote('');
      loadProfile(profileId);
      load();
    } catch { /* noop */ }
    finally { setRevokeLoading(false); }
  }

  // Verify customer
  async function handleVerify() {
    if (!profileId) return;
    await fetch(`/api/admin/customers/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify' }),
    });
    loadProfile(profileId);
    load();
  }

  // Add customer
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!addFirst.trim()) { setAddError('First name is required.'); return; }
    if (!addLast.trim())  { setAddError('Last name is required.'); return; }
    if (!addEmail.trim()) { setAddError('Email is required.'); return; }
    if (addPassword.length < 8) { setAddError('Password must be at least 8 characters.'); return; }
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: addFirst, lastName: addLast, email: addEmail,
          password: addPassword, plan: addPlan, company: addCompany, usageType: addUsageType,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { setAddError(data.error ?? 'Failed to create.'); return; }
      setShowAdd(false);
      setAddFirst(''); setAddLast(''); setAddEmail(''); setAddPassword('');
      setAddCompany(''); setAddPlan('free'); setAddUsageType('both');
      load();
    } catch {
      setAddError('Unable to connect.');
    } finally {
      setAddLoading(false);
    }
  }

  // Filtered list
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || c.email.toLowerCase().includes(q)
      || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
      || (c.company ?? '').toLowerCase().includes(q);
    const matchPlan = planFilter === 'all' || c.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const planCounts = customers.reduce<Record<string, number>>((acc, c) => {
    acc[c.plan] = (acc[c.plan] ?? 0) + 1;
    return acc;
  }, {});

  const paidCount = customers.filter((c) => c.plan !== 'free').length;
  const lifetimeCount = customers.filter(c => c.planIsLifetime).length;

  return (
    <>
      <Helmet>
        <title>Customers — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout title="Customers" subtitle="Manage customer accounts, plans, and billing">
        <div className="space-y-5">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Customers', value: customers.length,    icon: Users,      color: 'text-blue-500 dark:text-blue-400'   },
              { label: 'Paid Customers',  value: paidCount,           icon: CreditCard, color: 'text-purple-500 dark:text-purple-400' },
              { label: 'Lifetime Users',  value: lifetimeCount,       icon: Crown,      color: 'text-amber-500 dark:text-amber-400'  },
              { label: 'Verified',        value: customers.filter(c => c.isVerified).length, icon: ShieldCheck, color: 'text-green-500 dark:text-green-400' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={adminCls.card}>
                  <CardContent className="p-4">
                    <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                    <p className={`text-2xl font-bold ${adminCls.text}`}>{loading ? '—' : s.value}</p>
                    <p className={`text-xs mt-0.5 ${adminCls.muted}`}>{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main tabs: Customers / Lifetime */}
          <Tabs value={mainTab} onValueChange={v => setMainTab(v as typeof mainTab)}>
            <div className="flex items-center justify-between gap-3">
              <TabsList className={adminCls.tabsList}>
                <TabsTrigger value="customers" className={`text-xs gap-1.5 ${adminCls.tabsTrigger}`}>
                  <Users className="w-3.5 h-3.5" /> All Customers
                </TabsTrigger>
                <TabsTrigger value="lifetime" className={`text-xs gap-1.5 ${adminCls.tabsTrigger}`}>
                  <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Lifetime Users
                  {lifetimeCount > 0 && (
                    <span className="ml-1 bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded-full">
                      {lifetimeCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── All Customers Tab ── */}
            <TabsContent value="customers" className="mt-4 space-y-4">
              {/* Plan breakdown chips */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {PLANS.map((plan) => (
                  <Card
                    key={plan}
                    className={`cursor-pointer transition-all ${adminCls.card} hover:border-gray-400 dark:hover:border-slate-500 ${planFilter === plan ? 'ring-1 ring-primary' : ''}`}
                    onClick={() => setPlanFilter(planFilter === plan ? 'all' : plan)}
                  >
                    <CardContent className="p-4">
                      <p className={`text-2xl font-bold ${adminCls.text}`}>{loading ? '—' : (planCounts[plan] ?? 0)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block ${PLAN_STYLES[plan]}`}>
                        {PLAN_LABELS[plan]}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${adminCls.muted}`} />
                  <Input
                    placeholder="Search by name, email, or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`pl-9 ${adminCls.input}`}
                  />
                </div>
                <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowAdd(true)}>
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Customer
                </Button>
              </div>

              {/* Customer table */}
              <Card className={`${adminCls.card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b text-xs font-medium ${adminCls.tableHead}`}>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Plan</th>
                        <th className="text-left px-4 py-3">Usage</th>
                        <th className="text-left px-4 py-3">Verified</th>
                        <th className="text-left px-4 py-3">Joined</th>
                        <th className="text-left px-4 py-3">Last Login</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center">
                            <RefreshCw className={`w-5 h-5 animate-spin mx-auto ${adminCls.muted}`} />
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center">
                            <Users className={`w-8 h-8 mx-auto mb-2 ${adminCls.subtle}`} />
                            <p className={`text-sm ${adminCls.muted}`}>
                              {search || planFilter !== 'all' ? 'No customers match your search.' : 'No customers yet.'}
                            </p>
                          </td>
                        </tr>
                      ) : filtered.map((c) => (
                        <tr
                          key={c.id}
                          className={`border-b transition-colors cursor-pointer ${adminCls.divider} ${adminCls.rowHover}`}
                          onClick={() => loadProfile(c.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.planIsLifetime ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-primary/10 dark:bg-primary/20'}`}>
                                <span className={`text-xs font-bold ${c.planIsLifetime ? 'text-amber-700 dark:text-amber-300' : 'text-primary'}`}>
                                  {(c.firstName ?? '?').charAt(0)}{(c.lastName ?? '').charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className={`text-xs font-medium ${adminCls.text}`}>{c.firstName} {c.lastName}</p>
                                  {c.planIsLifetime && (
                                    <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" aria-label="Lifetime plan" />
                                  )}
                                </div>
                                <p className={`text-[10px] ${adminCls.muted}`}>{c.email}</p>
                                {c.company && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Building2 className={`w-2.5 h-2.5 ${adminCls.subtle}`} />
                                    <span className={`text-[10px] ${adminCls.subtle}`}>{c.company}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PLAN_STYLES[c.plan] ?? ''}`}>
                                {PLAN_LABELS[c.plan] ?? c.plan}
                              </span>
                              {c.planIsLifetime && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30">
                                  ★ Lifetime
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-xs capitalize ${adminCls.muted}`}>{c.usageType ?? '—'}</td>
                          <td className="px-4 py-3">
                            {c.isVerified
                              ? <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                              : <XCircle className={`w-4 h-4 ${adminCls.subtle}`} />}
                          </td>
                          <td className={`px-4 py-3 text-xs ${adminCls.muted}`}>{formatDate(c.createdAt)}</td>
                          <td className={`px-4 py-3 text-xs ${adminCls.muted}`}>{c.lastLogin ? formatDate(c.lastLogin) : 'Never'}</td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${adminCls.iconBtn}`}
                              onClick={(e) => { e.stopPropagation(); loadProfile(c.id); }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 0 && (
                  <div className={`px-4 py-3 border-t ${adminCls.divider}`}>
                    <p className={`text-xs ${adminCls.muted}`}>{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ── Lifetime Users Tab ── */}
            <TabsContent value="lifetime" className="mt-4">
              <LifetimeUsersTab onViewProfile={loadProfile} />
            </TabsContent>
          </Tabs>

        </div>
      </AdminLayout>

      {/* ── Customer Profile Drawer ── */}
      <Sheet open={!!profileId} onOpenChange={(o) => { if (!o) { setProfileId(null); setProfile(null); setEditing(false); } }}>
        <SheetContent
          side="right"
          className={`w-full sm:max-w-2xl overflow-y-auto p-0 ${adminCls.sheet}`}
        >
          {profileLoading || !profile ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className={`w-6 h-6 animate-spin ${adminCls.muted}`} />
            </div>
          ) : (
            <div className="flex flex-col h-full">

              {/* Header */}
              <div className={`px-6 py-5 border-b ${adminCls.divider} ${adminCls.statBg}`}>
                <SheetHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${profile.customer.planIsLifetime ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-primary/10 dark:bg-primary/20'}`}>
                        <span className={`text-lg font-bold ${profile.customer.planIsLifetime ? 'text-amber-700 dark:text-amber-300' : 'text-primary'}`}>
                          {(profile.customer.firstName ?? '?').charAt(0)}{(profile.customer.lastName ?? '').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <SheetTitle className={`text-lg font-semibold flex items-center gap-2 ${adminCls.text}`}>
                          {profile.customer.firstName} {profile.customer.lastName}
                          {profile.customer.planIsLifetime && (
                            <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" aria-label="Lifetime plan" />
                          )}
                        </SheetTitle>
                        <p className={`text-sm ${adminCls.muted}`}>{profile.customer.email}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PLAN_STYLES[profile.customer.plan]}`}>
                            {PLAN_LABELS[profile.customer.plan]}
                          </span>
                          {profile.customer.planIsLifetime && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> Lifetime
                            </span>
                          )}
                          {profile.customer.isVerified
                            ? <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                            : <span className={`text-[10px] flex items-center gap-0.5 ${adminCls.subtle}`}><XCircle className="w-3 h-3" /> Unverified</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!editing && (
                        <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${adminCls.outlineBtn}`} onClick={startEdit}>
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className={`w-full rounded-none border-b h-10 px-6 justify-start gap-1 ${adminCls.divider} ${adminCls.statBg}`}>
                    <TabsTrigger value="profile"   className={`text-xs ${adminCls.tabsTrigger}`}>Profile</TabsTrigger>
                    <TabsTrigger value="billing"   className={`text-xs ${adminCls.tabsTrigger}`}>Billing</TabsTrigger>
                    <TabsTrigger value="documents" className={`text-xs ${adminCls.tabsTrigger}`}>Documents</TabsTrigger>
                    <TabsTrigger value="admin"     className={`text-xs ${adminCls.tabsTrigger}`}>Admin Actions</TabsTrigger>
                  </TabsList>

                  {/* ── Profile Tab ── */}
                  <TabsContent value="profile" className="p-6 space-y-5">
                    {editing ? (
                      <div className="space-y-4">
                        <p className={`text-xs font-medium uppercase tracking-wide ${adminCls.muted}`}>Edit Profile</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className={`text-xs ${adminCls.muted}`}>First Name</Label>
                            <Input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} className={`text-sm ${adminCls.input}`} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className={`text-xs ${adminCls.muted}`}>Last Name</Label>
                            <Input value={editLast} onChange={(e) => setEditLast(e.target.value)} className={`text-sm ${adminCls.input}`} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${adminCls.muted}`}>Email Address</Label>
                          <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`text-sm ${adminCls.input}`} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${adminCls.muted}`}>Company</Label>
                          <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} placeholder="Optional" className={`text-sm ${adminCls.input}`} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${adminCls.muted}`}>Usage Type</Label>
                          <Select value={editUsageType} onValueChange={setEditUsageType}>
                            <SelectTrigger className={`text-sm ${adminCls.input}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={adminCls.selectContent}>
                              {['personal', 'business', 'both'].map((v) => (
                                <SelectItem key={v} value={v} className={`capitalize ${adminCls.selectItem}`}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {editError && (
                          <Alert variant="destructive">
                            <AlertDescription className="text-xs">{editError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={saveEdit} disabled={editSaving} className="gap-1.5 text-xs">
                            {editSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {editSaving ? 'Saving…' : 'Save Changes'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(false)} className={`gap-1.5 text-xs ${adminCls.outlineBtn}`}>
                            <X className="w-3 h-3" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className={`text-xs font-medium uppercase tracking-wide ${adminCls.muted}`}>Account Details</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { icon: Mail,      label: 'Email',       value: profile.customer.email },
                            { icon: Briefcase, label: 'Company',     value: profile.customer.company ?? '—' },
                            { icon: Users,     label: 'Usage Type',  value: profile.customer.usageType ?? '—', capitalize: true },
                            { icon: Crown,     label: 'Plan',        value: PLAN_LABELS[profile.customer.plan] },
                            { icon: Calendar,  label: 'Joined',      value: formatDate(profile.customer.createdAt) },
                            { icon: Calendar,  label: 'Last Login',  value: formatDateTime(profile.customer.lastLogin) },
                          ].map(({ icon: Icon, label, value, capitalize }) => (
                            <div key={label} className={`rounded-lg p-3 flex items-start gap-2.5 ${adminCls.rowBg}`}>
                              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${adminCls.subtle}`} />
                              <div>
                                <p className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>{label}</p>
                                <p className={`text-sm mt-0.5 ${adminCls.text} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Billing Tab ── */}
                  <TabsContent value="billing" className="p-6 space-y-5">
                    <p className={`text-xs font-medium uppercase tracking-wide ${adminCls.muted}`}>Subscription</p>
                    {profile.subscription ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Status',         value: profile.subscription.status, badge: true },
                            { label: 'Plan',           value: PLAN_LABELS[profile.customer.plan] ?? '—' },
                            { label: 'Trial Start',    value: formatDate(profile.subscription.trialStart) },
                            { label: 'Trial End',      value: formatDate(profile.subscription.trialEnd) },
                            { label: 'Period Start',   value: formatDate(profile.subscription.currentPeriodStart) },
                            { label: 'Period End',     value: formatDate(profile.subscription.currentPeriodEnd) },
                          ].map(({ label, value, badge }) => (
                            <div key={label} className={`rounded-lg p-3 ${adminCls.rowBg}`}>
                              <p className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>{label}</p>
                              {badge ? (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block ${SUB_STATUS_STYLES[value] ?? subStatusBadgeCls.inactive}`}>
                                  {value}
                                </span>
                              ) : (
                                <p className={`text-sm mt-0.5 ${adminCls.text}`}>{value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {profile.subscription.stripeCustomerId && (
                          <div className={`rounded-lg p-3 space-y-1.5 ${adminCls.rowBg}`}>
                            <p className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>Stripe IDs</p>
                            <p className={`text-[10px] font-mono break-all ${adminCls.muted}`}>Customer: {profile.subscription.stripeCustomerId}</p>
                            {profile.subscription.stripeSubscriptionId && (
                              <p className={`text-[10px] font-mono break-all ${adminCls.muted}`}>Subscription: {profile.subscription.stripeSubscriptionId}</p>
                            )}
                          </div>
                        )}
                        {profile.subscription.cancelAtPeriodEnd && (
                          <Alert className="bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs ml-1">Cancels at end of current period.</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className={`rounded-lg p-6 text-center ${adminCls.rowBg}`}>
                        <CreditCard className={`w-8 h-8 mx-auto mb-2 ${adminCls.subtle}`} />
                        <p className={`text-sm ${adminCls.muted}`}>No active subscription</p>
                        <p className={`text-xs mt-1 ${adminCls.subtle}`}>This customer is on the free plan with no Stripe subscription record.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Documents Tab ── */}
                  <TabsContent value="documents" className="p-6 space-y-5">
                    <p className={`text-xs font-medium uppercase tracking-wide ${adminCls.muted}`}>Document Activity</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Total',     value: profile.documents.total,     color: adminCls.text       },
                        { label: 'Drafts',    value: profile.documents.drafts,    color: adminCls.muted      },
                        { label: 'Completed', value: profile.documents.completed, color: 'text-green-600 dark:text-green-400' },
                        { label: 'Archived',  value: profile.documents.archived,  color: 'text-amber-600 dark:text-amber-400' },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-lg p-3 text-center ${adminCls.rowBg}`}>
                          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                          <p className={`text-[10px] mt-0.5 ${adminCls.subtle}`}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {profile.documents.recent.length > 0 ? (
                      <div className="space-y-2">
                        <p className={`text-xs ${adminCls.muted}`}>Recent Documents</p>
                        {profile.documents.recent.map((doc) => (
                          <div key={doc.uuid} className={`rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 ${adminCls.rowBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className={`w-3.5 h-3.5 shrink-0 ${adminCls.subtle}`} />
                              <div className="min-w-0">
                                <p className={`text-xs truncate ${adminCls.text}`}>{doc.title}</p>
                                <p className={`text-[10px] ${adminCls.subtle}`}>{formatDate(doc.updatedAt)}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${DOC_STATUS_STYLES[doc.status] ?? ''}`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`rounded-lg p-6 text-center ${adminCls.rowBg}`}>
                        <FileText className={`w-8 h-8 mx-auto mb-2 ${adminCls.subtle}`} />
                        <p className={`text-sm ${adminCls.muted}`}>No documents yet</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Admin Actions Tab ── */}
                  <TabsContent value="admin" className="p-6 space-y-6">

                    {/* Current plan status */}
                    <div className={`rounded-lg p-4 flex items-center justify-between gap-3 ${adminCls.rowBg}`}>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide mb-1 ${adminCls.subtle}`}>Current Plan</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PLAN_STYLES[profile.customer.plan]}`}>
                            {PLAN_LABELS[profile.customer.plan]}
                          </span>
                          {profile.customer.planIsLifetime && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> Lifetime — Never Expires
                            </span>
                          )}
                          {profile.customer.planExpiresAt && !profile.customer.planIsLifetime && (
                            <span className={`text-[10px] ${adminCls.muted}`}>
                              Expires {formatDate(profile.customer.planExpiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Lifetime Plan Section ── */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        <p className={`text-sm font-semibold ${adminCls.text}`}>Lifetime Plan</p>
                      </div>

                      {profile.customer.planIsLifetime ? (
                        /* Already has lifetime — show change + revoke */
                        <div className="space-y-4">
                          <div className="bg-amber-50 border border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50 rounded-lg p-3 flex items-start gap-2">
                            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              This customer has a lifetime <strong>{PLAN_LABELS[profile.customer.plan]}</strong> plan.
                              Stripe webhooks will not downgrade them.
                            </p>
                          </div>

                          {/* Change plan tier */}
                          <div className="space-y-2">
                            <p className={`text-xs font-medium flex items-center gap-1.5 ${adminCls.muted}`}>
                              <ArrowRightLeft className="w-3 h-3" /> Change Lifetime Plan Tier
                            </p>
                            <div className="flex gap-2">
                              <Select value={changePlan} onValueChange={(v) => { setChangePlan(v as Plan); setChangeSuccess(''); }}>
                                <SelectTrigger className={`text-sm flex-1 ${adminCls.input}`}>
                                  <SelectValue placeholder="Select new plan tier…" />
                                </SelectTrigger>
                                <SelectContent className={adminCls.selectContent}>
                                  {PLANS.filter(p => p !== 'free' && p !== profile.customer.plan).map((p) => (
                                    <SelectItem key={p} value={p} className={adminCls.selectItem}>
                                      {PLAN_LABELS[p]} — Lifetime
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                disabled={!changePlan || changeLoading}
                                onClick={handleChangeLifetime}
                                className="gap-1.5 text-xs shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-0"
                              >
                                {changeLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
                                Change
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>Note (optional)</Label>
                              <Textarea
                                value={changeNote}
                                onChange={e => setChangeNote(e.target.value)}
                                placeholder="Reason for plan change…"
                                rows={2}
                                className={`text-xs resize-none ${adminCls.input}`}
                              />
                            </div>
                            {changeSuccess && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {changeSuccess}
                              </p>
                            )}
                          </div>

                          {/* Revoke */}
                          <div className="pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRevokeDialog(true)}
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 gap-1.5 text-xs"
                            >
                              <X className="w-3 h-3" /> Revoke Lifetime Plan
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* No lifetime — show grant form */
                        <div className="space-y-3">
                          <p className={`text-xs ${adminCls.muted}`}>
                            Give this customer permanent access — no subscription, no expiry, never downgraded by Stripe webhooks.
                            Use for staff accounts, beta testers, or special arrangements.
                            Lifetime grants are available for all paid plans (Personal, Standard, Professional, and Organisation plans).
                          </p>
                          <div className="flex gap-2">
                            <Select value={lifetimePlan} onValueChange={(v) => { setLifetimePlan(v as Plan); setLifetimeSuccess(''); }}>
                              <SelectTrigger className={`text-sm flex-1 ${adminCls.input}`}>
                                <SelectValue placeholder="Select plan to grant…" />
                              </SelectTrigger>
                              <SelectContent className={adminCls.selectContent}>
                                {PLANS.filter(p => p !== 'free').map((p) => (
                                  <SelectItem key={p} value={p} className={adminCls.selectItem}>
                                    {PLAN_LABELS[p]} — Lifetime
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              disabled={!lifetimePlan || lifetimeLoading}
                              onClick={handleGrantLifetime}
                              className="gap-1.5 text-xs shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0"
                            >
                              {lifetimeLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Crown className="w-3 h-3" />}
                              Grant
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>Note (optional)</Label>
                            <Textarea
                              value={lifetimeNote}
                              onChange={e => setLifetimeNote(e.target.value)}
                              placeholder="Reason for granting lifetime access…"
                              rows={2}
                              className={`text-xs resize-none ${adminCls.input}`}
                            />
                          </div>
                          {lifetimeSuccess && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {lifetimeSuccess}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Grant History */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <History className={`w-4 h-4 ${adminCls.muted}`} />
                        <p className={`text-sm font-semibold ${adminCls.text}`}>Grant History</p>
                      </div>
                      <GrantHistory grants={grantHistory} />
                    </div>

                    <div className={`border-t ${adminCls.divider}`} />

                    {/* ── Plan Override (timed) ── */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <p className={`text-sm font-semibold ${adminCls.text}`}>Override Plan</p>
                      </div>
                      <p className={`text-xs ${adminCls.muted}`}>
                        Manually set a plan with an optional expiry date. On expiry the plan remains set — you must manually revert it or let Stripe handle it via webhook.
                      </p>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select value={overridePlan} onValueChange={(v) => { setOverridePlan(v as Plan); setOverrideSuccess(''); }}>
                            <SelectTrigger className={`text-sm flex-1 ${adminCls.input}`}>
                              <SelectValue placeholder="Select plan…" />
                            </SelectTrigger>
                            <SelectContent className={adminCls.selectContent}>
                              {PLANS.map((p) => (
                                <SelectItem key={p} value={p} className={adminCls.selectItem}>
                                  {PLAN_LABELS[p]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            disabled={!overridePlan || overrideLoading}
                            onClick={handleOverridePlan}
                            className="gap-1.5 text-xs shrink-0"
                          >
                            {overrideLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            Apply
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className={`text-[10px] uppercase tracking-wide ${adminCls.subtle}`}>Expiry Date (optional)</Label>
                          <Input
                            type="date"
                            value={overrideExpiry}
                            onChange={(e) => setOverrideExpiry(e.target.value)}
                            className={`text-sm ${adminCls.input}`}
                          />
                          <p className={`text-[10px] ${adminCls.subtle}`}>Leave blank for no expiry.</p>
                        </div>
                        {overrideSuccess && (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {overrideSuccess}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`border-t ${adminCls.divider}`} />

                    {/* Verify */}
                    {!profile.customer.isVerified && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                            <p className={`text-sm font-semibold ${adminCls.text}`}>Verify Account</p>
                          </div>
                          <p className={`text-xs ${adminCls.muted}`}>Mark this account as verified without requiring email confirmation.</p>
                          <Button size="sm" variant="outline" onClick={handleVerify} className="border-green-400 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 gap-1.5 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> Mark as Verified
                          </Button>
                        </div>
                        <div className={`border-t ${adminCls.divider}`} />
                      </>
                    )}

                    {/* Danger zone */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</p>
                      </div>
                      <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 space-y-3 bg-red-50 dark:bg-red-950/20">
                        <p className={`text-xs ${adminCls.muted}`}>Deleting a customer is permanent and cannot be undone. All their documents will be lost.</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5 text-xs"
                          onClick={async () => {
                            if (!profileId) return;
                            if (!confirm(`Delete account for ${profile.customer.firstName} ${profile.customer.lastName}? This cannot be undone.`)) return;
                            await fetch(`/api/admin/customers/${profileId}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'delete' }),
                            });
                            setProfileId(null);
                            setProfile(null);
                            load();
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" /> Delete Customer Account
                        </Button>
                      </div>
                    </div>

                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Revoke Lifetime Confirmation Dialog ── */}
      <Dialog open={showRevokeDialog} onOpenChange={(o) => { if (!o) { setShowRevokeDialog(false); setRevokeNote(''); } }}>
        <DialogContent className={`max-w-md ${adminCls.dialog}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${adminCls.text}`}>
              <X className="w-4 h-4 text-red-500 dark:text-red-400" />
              Revoke Lifetime Plan
            </DialogTitle>
            <DialogDescription className={`text-sm ${adminCls.muted}`}>
              This will remove the lifetime flag and move{' '}
              <strong className={adminCls.text}>{profile?.customer.firstName} {profile?.customer.lastName}</strong>{' '}
              to the <strong className={adminCls.text}>Free</strong> plan immediately.
              Stripe webhooks will resume normal behaviour.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="bg-amber-50 border border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Current plan: <strong>{PLAN_LABELS[profile?.customer.plan ?? 'free']} — Lifetime</strong>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className={`text-xs ${adminCls.muted}`}>Reason / Note (optional)</Label>
              <Textarea
                value={revokeNote}
                onChange={e => setRevokeNote(e.target.value)}
                placeholder="e.g. Customer requested cancellation, trial ended…"
                rows={3}
                className={`text-sm resize-none ${adminCls.input}`}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => { setShowRevokeDialog(false); setRevokeNote(''); }}
              className={`text-xs ${adminCls.outlineBtn}`}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={revokeLoading}
              onClick={handleRevokeLifetime}
              className="gap-1.5 text-xs"
            >
              {revokeLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              {revokeLoading ? 'Revoking…' : 'Revoke Lifetime Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Customer Modal ── */}
      <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); setAddError(''); }}>
        <DialogContent className={`max-w-md ${adminCls.dialog}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${adminCls.text}`}>
              <UserPlus className="w-4 h-4 text-primary" />
              Add Customer Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-xs ${adminCls.muted}`}>First Name</Label>
                <Input value={addFirst} onChange={(e) => setAddFirst(e.target.value)} placeholder="Jane" required className={`text-sm ${adminCls.input}`} />
              </div>
              <div className="space-y-1.5">
                <Label className={`text-xs ${adminCls.muted}`}>Last Name</Label>
                <Input value={addLast} onChange={(e) => setAddLast(e.target.value)} placeholder="Smith" required className={`text-sm ${adminCls.input}`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={`text-xs ${adminCls.muted}`}>Email Address</Label>
              <Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="jane@example.com" required className={`text-sm ${adminCls.input}`} />
            </div>
            <div className="space-y-1.5">
              <Label className={`text-xs ${adminCls.muted}`}>Password</Label>
              <div className="relative">
                <Input
                  type={showAddPassword ? 'text' : 'password'}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className={`text-sm pr-10 ${adminCls.input}`}
                />
                <button type="button" onClick={() => setShowAddPassword(!showAddPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${adminCls.iconBtn}`}>
                  {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={`text-xs ${adminCls.muted}`}>Company (optional)</Label>
              <Input value={addCompany} onChange={(e) => setAddCompany(e.target.value)} placeholder="Acme Ltd" className={`text-sm ${adminCls.input}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-xs ${adminCls.muted}`}>Plan</Label>
                <Select value={addPlan} onValueChange={(v) => setAddPlan(v as Plan)}>
                  <SelectTrigger className={`text-sm ${adminCls.input}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={adminCls.selectContent}>
                    {PLANS.map((p) => (
                      <SelectItem key={p} value={p} className={adminCls.selectItem}>{PLAN_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={`text-xs ${adminCls.muted}`}>Usage Type</Label>
                <Select value={addUsageType} onValueChange={setAddUsageType}>
                  <SelectTrigger className={`text-sm ${adminCls.input}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={adminCls.selectContent}>
                    {['personal', 'business', 'both'].map((v) => (
                      <SelectItem key={v} value={v} className={`capitalize ${adminCls.selectItem}`}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {addError && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{addError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className={`text-xs ${adminCls.outlineBtn}`}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLoading} className="gap-1.5 text-xs">
                {addLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                {addLoading ? 'Creating…' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
