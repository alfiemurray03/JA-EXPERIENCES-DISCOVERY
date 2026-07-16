import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, Database, RefreshCw, Settings } from 'lucide-react';

interface SectionDefinition {
  section: string;
  title: string;
  subtitle: string;
}

const DEFINITIONS: Record<string, SectionDefinition> = {
  '/admin/health': { section: 'health', title: 'Production Health', subtitle: 'Verified platform, database and integration signals.' },
  '/admin/operations': { section: 'operations', title: 'Operations', subtitle: 'Live customer and platform operations.' },
  '/admin/reports': { section: 'reports', title: 'Reports', subtitle: 'Operational, customer and administration reporting.' },
  '/admin/status': { section: 'status', title: 'Status Centre', subtitle: 'Current public website and service availability.' },
  '/admin/notifications': { section: 'notifications', title: 'Notifications', subtitle: 'Customer and administration communications.' },
  '/admin/system-reports': { section: 'systemreports', title: 'System Reports', subtitle: 'Reported platform issues and their resolution status.' },
  '/admin/closure-requests': { section: 'closures', title: 'Closure Requests', subtitle: 'Customer account closure requests and progress.' },
  '/admin/enquiries': { section: 'enquiries', title: 'Contact Enquiries', subtitle: 'Messages and enquiries received from customers.' },
  '/admin/admin-users': { section: 'admins', title: 'Admin Users', subtitle: 'Administrator accounts and access status.' },
  '/admin/roles': { section: 'roles', title: 'Roles', subtitle: 'Administration roles and assigned permissions.' },
  '/admin/sessions': { section: 'sessions', title: 'Sessions', subtitle: 'Active and recent administrator sessions.' },
  '/admin/credits': { section: 'credits', title: 'Builder Usage Tokens', subtitle: 'Builder token balances, grants and usage.' },
  '/admin/usage': { section: 'usage', title: 'Customer Usage', subtitle: 'Builder activity and customer usage information.' },
  '/admin/addons': { section: 'addons', title: 'Paid Add-Ons', subtitle: 'Optional paid features and customer entitlements.' },
  '/admin/plans': { section: 'plans', title: 'Subscription Plans', subtitle: 'Configured customer plans, pricing and availability.' },
  '/admin/branding': { section: 'branding', title: 'Branding', subtitle: 'JA Plan Studio identity, company details and public presentation.' },
  '/admin/affiliate-content': { section: 'affiliate', title: 'Affiliate Content', subtitle: 'Approved affiliate disclosures and website content.' },
};

function titleCase(value: string) {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('en-GB');
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString('en-GB');
    return value;
  }
  return JSON.stringify(value);
}

function scalarEntries(value: Record<string, unknown>) {
  return Object.entries(value).filter(([, item]) => item === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof item));
}

function objectEntries(value: Record<string, unknown>) {
  return Object.entries(value).filter(([, item]) => item && !Array.isArray(item) && typeof item === 'object');
}

function arrayEntries(value: Record<string, unknown>) {
  return Object.entries(value).filter(([, item]) => Array.isArray(item)) as Array<[string, unknown[]]>;
}

function DataTable({ title, rows }: { title: string; rows: unknown[] }) {
  const objects = rows.filter(row => row && typeof row === 'object') as Array<Record<string, unknown>>;
  const columns = Array.from(new Set(objects.flatMap(row => Object.keys(row)))).slice(0, 6);
  return (
    <Card className="border-slate-200 bg-white overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">{titleCase(title)}</h2>
          <span className="text-xs font-medium text-slate-500">{rows.length.toLocaleString('en-GB')} records</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {!rows.length ? (
          <div className="py-12 text-center text-sm text-slate-500">No records currently need attention.</div>
        ) : objects.length ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>{columns.map(column => <th key={column} className="px-4 py-3 font-semibold">{titleCase(column)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {objects.slice(0, 100).map((row, index) => (
                <tr key={String(row.id || row.reference || row.email || index)} className="hover:bg-slate-50/70">
                  {columns.map(column => <td key={column} className="px-4 py-3 text-slate-700 max-w-[260px] truncate">{displayValue(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-5 text-sm text-slate-700">{rows.map(displayValue).join(', ')}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOperationalSection() {
  const location = useLocation();
  const definition = DEFINITIONS[location.pathname] || DEFINITIONS['/admin/operations'];
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/section/${definition.section}`, { credentials: 'include' });
      const result = await response.json() as { success?: boolean; data?: unknown; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || 'This administration section could not be loaded.');
      const payload = result.data;
      setData(payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as Record<string, unknown> : { records: Array.isArray(payload) ? payload : [] });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This administration section could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [definition.section]);

  useEffect(() => { void load(); }, [load]);

  const scalars = useMemo(() => scalarEntries(data), [data]);
  const objects = useMemo(() => objectEntries(data), [data]);
  const arrays = useMemo(() => arrayEntries(data), [data]);

  return (
    <AdminLayout title={definition.title} subtitle={definition.subtitle}>
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"><Activity className="w-5 h-5 text-blue-600" /></div>
            <div><h1 className="text-2xl font-bold text-slate-950">{definition.title}</h1><p className="text-sm text-slate-500">{definition.subtitle}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {definition.section === 'status' && <Button asChild variant="outline" size="sm"><Link to="/admin/site-settings"><Settings className="w-4 h-4 mr-2" />Manage status</Link></Button>}
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          </div>
        </div>

        {error && <Alert variant="destructive"><AlertTriangle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(item => <div key={item} className="h-28 rounded-xl bg-slate-100 animate-pulse" />)}</div> : (
          <>
            {scalars.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{scalars.map(([key, value]) => (
              <Card key={key} className="border-slate-200 bg-white"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-500 mb-1">{titleCase(key)}</p><p className="text-xl font-bold text-slate-950 break-words">{displayValue(value)}</p></div><Database className="w-5 h-5 text-blue-500 shrink-0" /></div></CardContent></Card>
            ))}</div>}

            {objects.map(([key, value]) => {
              const entries = scalarEntries(value as Record<string, unknown>);
              if (!entries.length) return null;
              return <Card key={key} className="border-slate-200 bg-white"><CardHeader className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-900">{titleCase(key)}</h2></CardHeader><CardContent className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{entries.map(([itemKey, itemValue]) => <div key={itemKey} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500 mb-1">{titleCase(itemKey)}</p><p className="font-semibold text-slate-900 break-words">{displayValue(itemValue)}</p></div>)}</CardContent></Card>;
            })}

            {arrays.map(([key, rows]) => <DataTable key={key} title={key} rows={rows} />)}
            {!scalars.length && !objects.length && !arrays.length && !error && <Card className="border-slate-200"><CardContent className="py-16 text-center"><Database className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-800">No administration data is available</p><p className="text-sm text-slate-500">There are currently no records in this section.</p></CardContent></Card>}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
