/**
 * Admin — Audit Logs
 * Full audit log with filters: action type, admin role, date range, search.
 * Fetches real data from: login attempts API + admin action log API.
 * No mock/seed data — all entries are from the live database.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, RefreshCw, LogIn, Edit2,
  ShieldAlert, User, Settings, FileText, Eye,
  ChevronLeft, ChevronRight, Download,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type AuditSeverity = 'info' | 'warning' | 'success' | 'error';
type AuditCategory = 'auth' | 'user' | 'template' | 'content' | 'system' | 'security' | 'support' | 'customer';

interface AuditEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  detail: string;
  ip?: string;
  success: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

/** Derive category from action string */
function actionToCategory(action: string): AuditCategory {
  if (action.startsWith('auth.') || action.includes('login') || action.includes('logout')) return 'auth';
  if (action.startsWith('customer.')) return 'customer';
  if (action.startsWith('support.')) return 'support';
  if (action.startsWith('template.') || action.startsWith('admin.template')) return 'template';
  if (action.startsWith('system') || action.startsWith('toggle') || action.startsWith('config')) return 'system';
  if (action.startsWith('password_reset')) return 'security';
  if (action.startsWith('content.') || action.startsWith('page.') || action.startsWith('site.')) return 'content';
  if (action.startsWith('user.')) return 'user';
  return 'system';
}

function actionToSeverity(action: string, success: boolean): AuditSeverity {
  if (!success) return 'error';
  if (action.includes('delete') || action.includes('revoke') || action.includes('suspend')) return 'warning';
  if (action.includes('login') && success) return 'success';
  if (action.includes('maintenance') || action.includes('toggle')) return 'warning';
  return 'info';
}

const SEVERITY_CONFIG: Record<AuditSeverity, { classes: string; dot: string }> = {
  success: { classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  info:    { classes: 'bg-blue-100 text-blue-700 border-blue-200',           dot: 'bg-blue-500' },
  warning: { classes: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500' },
  error:   { classes: 'bg-red-100 text-red-700 border-red-200',              dot: 'bg-red-500' },
};

const CATEGORY_ICONS: Record<AuditCategory, React.ComponentType<{ className?: string }>> = {
  auth:     LogIn,
  user:     User,
  customer: User,
  template: FileText,
  content:  Edit2,
  system:   Settings,
  security: ShieldAlert,
  support:  Eye,
};

const PAGE_SIZE = 25;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminAudit() {

  const [entries, setEntries]           = useState<AuditEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState<AuditCategory | 'all'>('all');
  const [sevFilter, setSevFilter]       = useState<AuditSeverity | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [page, setPage]                 = useState(1);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [loginRes, actionRes] = await Promise.all([
        fetch('/api/admin/audit/login-attempts', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/action-log', { credentials: 'include' }).then(r => r.json()),
      ]);

      const loginEntries: AuditEntry[] = (loginRes.attempts ?? []).map((a: { email: string; success: boolean; ip: string; createdAt?: string; timestamp?: string }, i: number) => ({
        id: `login-${i}`,
        timestamp: a.createdAt ?? a.timestamp ?? new Date().toISOString(),
        adminEmail: a.email,
        adminRole: 'admin',
        action: a.success ? 'Admin login' : 'Failed login attempt',
        category: 'auth' as AuditCategory,
        severity: (a.success ? 'success' : 'warning') as AuditSeverity,
        detail: a.success ? 'Successful admin login' : 'Invalid credentials',
        ip: a.ip,
        success: a.success,
      }));

      const actionEntries: AuditEntry[] = (actionRes.entries ?? []).map((e: { id: number; admin_email: string; action: string; detail: string; ip: string; created_at: string }) => {
        const cat = actionToCategory(e.action);
        const sev = actionToSeverity(e.action, true);
        return {
          id: `action-${e.id}`,
          timestamp: e.created_at,
          adminEmail: e.admin_email,
          adminRole: 'admin',
          action: e.action.replace(/\./g, ' › ').replace(/_/g, ' '),
          category: cat,
          severity: sev,
          detail: e.detail ?? '',
          ip: e.ip,
          success: true,
        };
      });

      const merged = [...loginEntries, ...actionEntries]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEntries(merged);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = useMemo(() => {
    let list = entries;
    if (catFilter !== 'all')    list = list.filter(e => e.category === catFilter);
    if (sevFilter !== 'all')    list = list.filter(e => e.severity === sevFilter);
    if (resultFilter === 'success') list = list.filter(e => e.success);
    if (resultFilter === 'failed')  list = list.filter(e => !e.success);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.adminEmail.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        (e.ip ?? '').includes(q)
      );
    }
    return list;
  }, [entries, catFilter, sevFilter, resultFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCsv() {
    const rows = [
      ['Timestamp', 'Admin', 'Action', 'Category', 'Severity', 'Detail', 'IP', 'Result'],
      ...filtered.map(e => [e.timestamp, e.adminEmail, e.action, e.category, e.severity, e.detail, e.ip ?? '', e.success ? 'Success' : 'Failed']),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const base = 'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white';
  const muted = 'text-gray-500 dark:text-slate-400';
  const inputCls = 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500';
  const rowHover = 'hover:bg-gray-50 dark:hover:bg-slate-800/50';
  const divider = 'border-gray-200 dark:border-slate-800';

  const statValues = [
    { label: 'Total Events',    value: entries.length,                                  color: 'text-gray-900 dark:text-white' },
    { label: 'Successful',      value: entries.filter(e => e.success).length,           color: 'text-emerald-500' },
    { label: 'Failed / Errors', value: entries.filter(e => !e.success).length,          color: 'text-red-500' },
    { label: 'Security Events', value: entries.filter(e => e.category === 'security' || e.category === 'auth').length, color: 'text-amber-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Audit Logs — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Audit Logs" subtitle="Full audit trail of admin actions, login attempts, and security events">
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statValues.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 ${base}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{loading ? '…' : s.value}</p>
                <p className={`text-xs mt-0.5 ${muted}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className={`rounded-xl border p-4 ${base}`}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
                <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by email, action, IP…"
                  className={`pl-9 h-9 ${inputCls}`} />
              </div>
              <Select value={catFilter} onValueChange={v => { setCatFilter(v as typeof catFilter); setPage(1); }}>
                <SelectTrigger className={`w-36 h-9 ${inputCls}`}><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className={'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'}>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sevFilter} onValueChange={v => { setSevFilter(v as typeof sevFilter); setPage(1); }}>
                <SelectTrigger className={`w-32 h-9 ${inputCls}`}><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent className={'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'}>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resultFilter} onValueChange={v => { setResultFilter(v as typeof resultFilter); setPage(1); }}>
                <SelectTrigger className={`w-32 h-9 ${inputCls}`}><SelectValue placeholder="Result" /></SelectTrigger>
                <SelectContent className={'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'}>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}
                  className={`gap-1.5 h-9 ${'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}
                  className={`gap-1.5 h-9 ${'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-xl border overflow-hidden ${base}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-medium ${muted} ${divider} ${'bg-gray-50 dark:bg-slate-900/80'}`}>
                    <th className="text-left px-4 py-3">Timestamp</th>
                    <th className="text-left px-4 py-3">Admin</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3">Severity</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Detail</th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className={`px-4 py-12 text-center text-sm ${muted}`}>
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading audit log…
                    </td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={7} className={`px-4 py-12 text-center text-sm ${muted}`}>
                      {entries.length === 0
                        ? 'No audit entries recorded yet. Admin actions will appear here as they occur.'
                        : 'No entries match the current filters.'}
                    </td></tr>
                  ) : paginated.map(entry => {
                    const CatIcon = CATEGORY_ICONS[entry.category] ?? Eye;
                    const sevCfg = SEVERITY_CONFIG[entry.severity];
                    return (
                      <tr key={entry.id} className={`border-b transition-colors ${divider} ${rowHover}`}>
                        <td className={`px-4 py-3 text-xs whitespace-nowrap ${muted}`}>{formatTs(entry.timestamp)}</td>
                        <td className="px-4 py-3">
                          <p className={`text-xs font-medium truncate max-w-[160px] ${'text-gray-900 dark:text-white'}`}>{entry.adminEmail}</p>
                        </td>
                        <td className={`px-4 py-3 text-xs font-medium capitalize ${'text-gray-900 dark:text-white'}`}>{entry.action}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className={`flex items-center gap-1.5 text-xs ${muted}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            <span className="capitalize">{entry.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sevCfg.dot}`} />
                            <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border font-medium ${sevCfg.classes}`}>
                              {entry.severity}
                            </span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-xs hidden lg:table-cell max-w-xs truncate ${muted}`}>{entry.detail}</td>
                        <td className={`px-4 py-3 text-xs hidden xl:table-cell font-mono ${muted}`}>{entry.ip ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between px-4 py-3 border-t ${divider}`}>
                <p className={`text-xs ${muted}`}>
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`h-8 w-8 p-0 ${'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}`}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <Button key={p} variant="ghost" size="sm" onClick={() => setPage(p)}
                        className={`h-8 w-8 p-0 text-xs ${p === page
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                        }`}>
                        {p}
                      </Button>
                    );
                  })}
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`h-8 w-8 p-0 ${'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}`}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
