/**
 * Admin — Website Pages Manager
 * View and manage all public-facing website pages.
 * Shows live status, path, type, and provides quick-edit for SEO metadata.
 */
import { useState, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/lib/admin-context';
import { hasWritePermission } from '@/lib/admin-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2, Edit2, ExternalLink, Search,
  Globe, Scale, HelpCircle, ShoppingCart, User, Lock,
  Save, Info,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type PageStatus = 'live' | 'draft' | 'redirect' | 'auth-required';
type PageCategory = 'marketing' | 'legal' | 'help' | 'app' | 'auth' | 'admin';

interface SitePage {
  id: string;
  title: string;
  path: string;
  category: PageCategory;
  status: PageStatus;
  seoTitle: string;
  seoDescription: string;
  lastUpdated: string;
  noindex: boolean;
  notes?: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_PAGES: SitePage[] = [
  { id: 'p-001', title: 'Homepage',            path: '/',                    category: 'marketing', status: 'live',          seoTitle: 'JA Document Hub — Professional Document Builder', seoDescription: 'Create professional documents in minutes with 1,000+ templates. Export to PDF or Word. Trusted by businesses worldwide.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-002', title: 'Pricing',             path: '/pricing',             category: 'marketing', status: 'live',          seoTitle: 'Pricing — JA Document Hub', seoDescription: 'Choose the plan that works for you. Start free and upgrade when you need more.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-003', title: 'Contact',             path: '/contact',             category: 'marketing', status: 'live',          seoTitle: 'Contact Us — JA Document Hub', seoDescription: 'Get in touch with the JA Document Hub team.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-004', title: 'Privacy Policy',      path: '/privacy',             category: 'legal',     status: 'live',          seoTitle: 'Privacy Policy — JA Document Hub', seoDescription: 'How JA Document Hub collects, uses, and protects your personal data.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-005', title: 'Terms & Conditions',  path: '/terms',               category: 'legal',     status: 'live',          seoTitle: 'Terms & Conditions — JA Document Hub', seoDescription: 'Terms governing your use of JA Document Hub.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-006', title: 'Cookie Policy',       path: '/cookies',             category: 'legal',     status: 'live',          seoTitle: 'Cookie Policy — JA Document Hub', seoDescription: 'How JA Document Hub uses cookies and tracking technologies.', lastUpdated: '2026-06-02', noindex: false },
  { id: 'p-007', title: 'Login',               path: '/login',               category: 'auth',      status: 'live',          seoTitle: 'Sign In — JA Document Hub', seoDescription: 'Sign in to your JA Document Hub account.', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-008', title: 'Register',            path: '/register',            category: 'auth',      status: 'live',          seoTitle: 'Create Account — JA Document Hub', seoDescription: 'Create your free JA Document Hub account.', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-009', title: 'Forgot Password',     path: '/forgot-password',     category: 'auth',      status: 'live',          seoTitle: 'Reset Password — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-010', title: 'Dashboard',           path: '/dashboard',           category: 'app',       status: 'auth-required', seoTitle: 'Dashboard — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-011', title: 'Documents',           path: '/documents',           category: 'app',       status: 'auth-required', seoTitle: 'My Documents — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-012', title: 'Builders Hub',          path: '/builders',            category: 'app',       status: 'auth-required', seoTitle: 'Document Builders — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-05', noindex: true },
  { id: 'p-013', title: 'Letter Builder',      path: '/letter-builder',      category: 'app',       status: 'auth-required', seoTitle: 'Letter Builder — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-014', title: 'Email Builder',       path: '/email-builder',       category: 'app',       status: 'auth-required', seoTitle: 'Email Builder — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-03', noindex: true },
  { id: 'p-015', title: 'Settings',            path: '/settings',            category: 'app',       status: 'auth-required', seoTitle: 'Settings — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-016', title: 'Organisation Members', path: '/org/members',        category: 'app',       status: 'auth-required', seoTitle: 'Team Members — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
  { id: 'p-017', title: 'Admin Portal',        path: '/admin',               category: 'admin',     status: 'auth-required', seoTitle: 'Admin Portal — JA Document Hub', seoDescription: '', lastUpdated: '2026-06-02', noindex: true },
];

const STORAGE_KEY = 'ja_admin_pages_v1';

function loadPages(): SitePage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SitePage[];
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PAGES));
  return SEED_PAGES;
}

function savePages(pages: SitePage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<PageCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  marketing:  { label: 'Marketing',  icon: Globe,        color: 'text-blue-600 dark:text-blue-400' },
  legal:      { label: 'Legal',      icon: Scale,        color: 'text-red-600 dark:text-red-400' },
  help:       { label: 'Help',       icon: HelpCircle,   color: 'text-emerald-600 dark:text-emerald-400' },
  app:        { label: 'App',        icon: User,         color: 'text-purple-600 dark:text-purple-400' },
  auth:       { label: 'Auth',       icon: Lock,         color: 'text-amber-600 dark:text-amber-400' },
  admin:      { label: 'Admin',      icon: ShoppingCart, color: 'text-slate-500 dark:text-slate-400' },
};

const STATUS_CONFIG: Record<PageStatus, { label: string; classes: string }> = {
  live:          { label: 'Live',          classes: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40' },
  draft:         { label: 'Draft',         classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40' },
  redirect:      { label: 'Redirect',      classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40' },
  'auth-required': { label: 'Auth Required', classes: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPages() {
  const { admin } = useAdmin();
  const canWrite = admin ? hasWritePermission(admin, 'pages') : false;

  const [pages, setPages]             = useState<SitePage[]>(() => loadPages());
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState<PageCategory | 'all'>('all');
  const [editing, setEditing]         = useState<SitePage | null>(null);
  const [savedMsg, setSavedMsg]       = useState('');

  const persist = (next: SitePage[]) => { setPages(next); savePages(next); };

  const filtered = useMemo(() => {
    let list = pages;
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
    }
    return list;
  }, [pages, catFilter, search]);

  function handleSave() {
    if (!editing) return;
    const updated = { ...editing, lastUpdated: new Date().toISOString().slice(0, 10) };
    persist(pages.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
    setSavedMsg('Page metadata saved.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  const base = 'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white';
  const muted = 'text-gray-500 dark:text-slate-400';
  const inputCls = 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500';
  const rowHover = 'hover:bg-gray-50 dark:hover:bg-slate-800/50';
  const divider = 'border-gray-200 dark:border-slate-800';

  const stats = [
    { label: 'Total Pages',    value: pages.length,                                    color: 'text-gray-900 dark:text-white' },
    { label: 'Live',           value: pages.filter(p => p.status === 'live').length,   color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Auth Required',  value: pages.filter(p => p.status === 'auth-required').length, color: 'text-gray-400 dark:text-slate-400' },
    { label: 'No-Index',       value: pages.filter(p => p.noindex).length,             color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <>
      <Helmet>
        <title>Website Pages — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Website Pages" subtitle="Manage all public-facing pages, SEO metadata, and page status">
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 ${base}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className={`text-xs mt-0.5 ${muted}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm
            ${'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-700/30 dark:text-blue-300'}`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Page routes are managed in code. Use this panel to update SEO metadata, noindex flags, and page notes. Status reflects the current route configuration.</p>
          </div>

          {savedMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 border
              ${'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-700/40'}`}>
              <CheckCircle2 className="w-4 h-4" /> {savedMsg}
            </div>
          )}

          {/* Toolbar */}
          <div className={`rounded-xl border p-4 ${base}`}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search pages…"
                  className={`pl-9 h-9 ${inputCls}`} />
              </div>
              <Select value={catFilter} onValueChange={v => setCatFilter(v as typeof catFilter)}>
                <SelectTrigger className={`w-36 h-9 ${inputCls}`}><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent className={'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'}>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-xl border overflow-hidden ${base}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-medium ${muted} ${divider} ${'bg-gray-50 dark:bg-slate-900/80'}`}>
                    <th className="text-left px-4 py-3">Page</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">No-Index</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">SEO Title</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(page => {
                    const CatIcon = CATEGORY_CONFIG[page.category]?.icon ?? Globe;
                    const catColor = CATEGORY_CONFIG[page.category]?.color ?? muted;
                    const statusCfg = STATUS_CONFIG[page.status];
                    return (
                      <tr key={page.id} className={`border-b transition-colors ${divider} ${rowHover}`}>
                        <td className="px-4 py-3">
                          <p className={`font-medium text-sm ${'text-gray-900 dark:text-white'}`}>{page.title}</p>
                          <p className={`text-[11px] font-mono mt-0.5 ${muted}`}>{page.path}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1.5 text-xs ${catColor}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            {CATEGORY_CONFIG[page.category]?.label}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusCfg.classes}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs ${page.noindex ? 'text-amber-600 dark:text-amber-400' : muted}`}>
                            {page.noindex ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-xs hidden lg:table-cell max-w-xs truncate ${muted}`}>
                          {page.seoTitle || <span className="italic opacity-50">Not set</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs hidden lg:table-cell ${muted}`}>{page.lastUpdated}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <a href={page.path} target="_blank" rel="noopener noreferrer"
                              title="Open page"
                              className={`p-1.5 rounded-lg transition-colors ${'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'}`}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {canWrite && (
                              <button onClick={() => setEditing({ ...page })} title="Edit SEO metadata"
                                className={`p-1.5 rounded-lg transition-colors ${'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'}`}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Edit SEO dialog ── */}
        <Dialog open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }}>
          <DialogContent className={`max-w-xl ${'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white'}`}>
            <DialogHeader>
              <DialogTitle className={'text-gray-900 dark:text-white'}>
                Edit Page — {editing?.title}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4 py-2">
                <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border
                  ${'bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                  <Globe className="w-3.5 h-3.5" />
                  <span className="font-mono">{editing.path}</span>
                </div>
                <div>
                  <Label className={`text-xs mb-1 block ${muted}`}>SEO Title <span className={`${muted} font-normal`}>(60 chars max)</span></Label>
                  <Input value={editing.seoTitle}
                    onChange={e => setEditing(ed => ed ? { ...ed, seoTitle: e.target.value } : ed)}
                    maxLength={70}
                    className={`h-9 ${inputCls}`} />
                  <p className={`text-[11px] mt-1 ${muted}`}>{editing.seoTitle.length}/70 characters</p>
                </div>
                <div>
                  <Label className={`text-xs mb-1 block ${muted}`}>Meta Description <span className={`${muted} font-normal`}>(160 chars max)</span></Label>
                  <Textarea value={editing.seoDescription}
                    onChange={e => setEditing(ed => ed ? { ...ed, seoDescription: e.target.value } : ed)}
                    rows={3}
                    maxLength={180}
                    className={`resize-none text-sm ${inputCls}`} />
                  <p className={`text-[11px] mt-1 ${muted}`}>{editing.seoDescription.length}/180 characters</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="noindex" checked={editing.noindex}
                    onChange={e => setEditing(ed => ed ? { ...ed, noindex: e.target.checked } : ed)}
                    className="w-4 h-4 rounded accent-primary" />
                  <Label htmlFor="noindex" className={`text-sm cursor-pointer ${'text-gray-700 dark:text-slate-300'}`}>
                    No-index (exclude from search engines)
                  </Label>
                </div>
                <div>
                  <Label className={`text-xs mb-1 block ${muted}`}>Internal Notes</Label>
                  <Textarea value={editing.notes ?? ''}
                    onChange={e => setEditing(ed => ed ? { ...ed, notes: e.target.value } : ed)}
                    rows={2}
                    placeholder="Internal notes about this page…"
                    className={`resize-none text-sm ${inputCls}`} />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}
                className={'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
