import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, ArrowLeft, CheckCircle2, CreditCard,
  Download, FileText, Fingerprint, KeyRound, Mail, RefreshCw, Scale, ShieldCheck, StickyNote,
  UserRound, Wrench,
} from 'lucide-react';

type Row = Record<string, unknown>;
type Verification = { verified?: boolean; method?: string; expires_at?: string; locked?: boolean };
type CrmResponse = { customer?: Row; verification?: Verification; error?: string };

const asText = (value: unknown, fallback = 'Not recorded') => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};
const asRows = (value: unknown): Row[] => Array.isArray(value) ? value.filter((item): item is Row => !!item && typeof item === 'object') : [];
const date = (value: unknown) => {
  if (!value) return 'Not recorded';
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

function Detail({ label, value }: { label: string; value: unknown }) {
  return <div className="min-w-0 rounded-xl border border-border bg-card p-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold text-foreground">{asText(value)}</p></div>;
}

function Empty({ children }: { children: string }) {
  return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function Records({ rows, title, fields }: { rows: Row[]; title: string; fields: Array<[string, string]> }) {
  if (!rows.length) return <Empty>{`No ${title.toLowerCase()} recorded.`}</Empty>;
  return <div className="space-y-3">{rows.map((row, index) => (
    <Card key={asText(row.id || row.reference || `${title}-${index}`)}>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map(([key, label]) => <Detail key={key} label={label} value={key.includes('at') || key.includes('date') ? date(row[key]) : row[key]} />)}
      </CardContent>
    </Card>
  ))}</div>;
}

export default function AdminCustomerCrm() {
  const { email: encodedEmail = '' } = useParams();
  const email = useMemo(() => decodeURIComponent(encodedEmail), [encodedEmail]);
  const [data, setData] = useState<CrmResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/admin/api?section=customer&email=${encodeURIComponent(email)}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({})) as CrmResponse;
      if (!response.ok || !payload.customer) throw new Error(payload.error || 'The customer record could not be loaded.');
      setData(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The customer record could not be loaded.');
    } finally { setLoading(false); }
  }, [email]);

  useEffect(() => { void load(); }, [load]);

  async function verifyIdentity() {
    if (!/^\d{6}$/.test(pin)) { setMessage('Enter the customer’s six-digit Support PIN.'); return; }
    setVerifying(true); setMessage('');
    try {
      const response = await fetch('/admin/api?section=customer', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', email, pin, method: 'Support PIN' }),
      });
      const payload = await response.json().catch(() => ({})) as { saved?: boolean; error?: string };
      if (!response.ok || !payload.saved) throw new Error(payload.error || 'Identity could not be verified.');
      setPin(''); setMessage('Identity verified. The one-time PIN has been used and reset.'); await load();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Identity could not be verified.'); }
    finally { setVerifying(false); }
  }

  async function downloadCustomerData() {
    setMessage('Preparing the customer data export…');
    try {
      const response = await fetch('/admin/api?section=customer', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_customer_data', customer_email: email, format: 'json' }),
      });
      const payload = await response.json().catch(() => ({})) as { export?: { filename?: string; content?: string }; error?: string };
      if (!response.ok || !payload.export?.content) throw new Error(payload.error || 'The export could not be prepared.');
      const blob = new Blob([payload.export.content], { type: 'application/json;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = href; anchor.download = payload.export.filename || `${email}-customer-data.json`; anchor.click();
      URL.revokeObjectURL(href); setMessage('Customer data export downloaded and recorded in the audit log.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'The export could not be prepared.'); }
  }

  const customer = data.customer || {};
  const name = asText(customer.verified_name || customer.display_name, email);
  const billing = (customer.billing && typeof customer.billing === 'object' ? customer.billing : {}) as Row;
  const subscription = (billing.subscription && typeof billing.subscription === 'object' ? billing.subscription : {}) as Row;
  const flags = asRows(customer.flags);
  const timeline = asRows(customer.timeline);
  const cases = asRows(customer.supportCases);
  const enquiries = asRows(customer.customerEnquiries);
  const notes = asRows(customer.notes);
  const outputs = asRows(customer.builderOutputs);
  const ledger = asRows(customer.tokenLedger);
  const saved = asRows(customer.savedItems);
  const notifications = asRows(customer.notifications);
  const requests = asRows(customer.dataRequests);
  const audit = asRows(customer.customerAudit);

  return <>
    <Helmet><title>{name} — Customer CRM — JA Plan Studio Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <AdminLayout title="Customer CRM" subtitle="Account, membership, support and activity in one record">
      <div className="space-y-5">
        <Button asChild variant="outline" size="sm"><Link to="/admin/users"><ArrowLeft className="mr-2 h-4 w-4" />All customers</Link></Button>
        {loading ? <div className="flex min-h-72 items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-muted-foreground" /></div> : error ?
          <Alert variant="destructive"><AlertDescription>{error} <Button variant="outline" size="sm" className="ml-3" onClick={() => void load()}>Retry</Button></AlertDescription></Alert> : <>
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><h1 className="break-words text-2xl font-bold text-foreground">{name}</h1><p className="break-all text-sm text-muted-foreground">{email}</p><div className="mt-2 flex flex-wrap gap-2"><Badge>{asText(customer.admin_customer_status, 'Standard')}</Badge>{customer.admin_lifetime ? <Badge className="bg-amber-100 text-amber-800">Lifetime membership</Badge> : null}{data.verification?.verified ? <Badge className="bg-green-100 text-green-800">Identity verified</Badge> : <Badge variant="outline">Verification required</Badge>}</div></div></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Detail label="Joined" value={date(customer.created_at)} /><Detail label="Last updated" value={date(customer.updated_at)} /><Detail label="Plan" value={subscription.plan || customer.admin_lifetime_plan_id} /><Detail label="Membership" value={subscription.status || customer.admin_customer_status} /></div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto pb-1"><TabsList className="h-auto min-w-max flex-wrap justify-start gap-1 p-1">
              <TabsTrigger value="overview"><UserRound className="mr-2 h-4 w-4" />Overview</TabsTrigger><TabsTrigger value="membership"><CreditCard className="mr-2 h-4 w-4" />Membership</TabsTrigger><TabsTrigger value="support"><Mail className="mr-2 h-4 w-4" />Support</TabsTrigger><TabsTrigger value="activity"><Activity className="mr-2 h-4 w-4" />Activity</TabsTrigger><TabsTrigger value="builders"><Wrench className="mr-2 h-4 w-4" />Builders</TabsTrigger><TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4" />Security</TabsTrigger><TabsTrigger value="notes"><StickyNote className="mr-2 h-4 w-4" />Notes</TabsTrigger><TabsTrigger value="compliance"><Scale className="mr-2 h-4 w-4" />Compliance</TabsTrigger><TabsTrigger value="data"><FileText className="mr-2 h-4 w-4" />Data & audit</TabsTrigger>
            </TabsList></div>

            <TabsContent value="overview" className="mt-4 space-y-4"><Card><CardHeader><CardTitle className="text-base">Contact and account information</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Detail label="Verified name" value={customer.verified_name} /><Detail label="Display name" value={customer.display_name} /><Detail label="Account email" value={customer.email} /><Detail label="Contact email" value={customer.contact_email} /><Detail label="Telephone" value={customer.phone} /><Detail label="Contact preference" value={customer.communication_preference} /><Detail label="Customer status" value={customer.admin_customer_status} /><Detail label="Account created" value={date(customer.created_at)} /></CardContent></Card><Records rows={flags} title="Account flags" fields={[["flag","Flag"],["note","Details"],["source","Source"],["created_at","Added"]]} /></TabsContent>

            <TabsContent value="membership" className="mt-4 space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" />Membership and billing</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Detail label="Plan" value={subscription.plan || customer.admin_lifetime_plan_id} /><Detail label="Subscription status" value={subscription.status || customer.admin_customer_status} /><Detail label="Lifetime access" value={customer.admin_lifetime} /><Detail label="Stripe customer" value={billing.stripeCustomerId} /><Detail label="Current period ends" value={date(subscription.currentPeriodEnd || subscription.current_period_end)} /><Detail label="Trial ends" value={date(subscription.trialEnd || subscription.trial_end)} /><Detail label="Cancellation scheduled" value={subscription.cancelAtPeriodEnd || subscription.cancel_at_period_end} /><Detail label="Billing portal available" value={billing.portalAvailable} /></CardContent></Card><Records rows={ledger} title="Token transactions" fields={[["amount","Amount"],["balance_after","Balance after"],["source","Source"],["created_at","Date"]]} /></TabsContent>

            <TabsContent value="support" className="mt-4 space-y-5"><section><h2 className="mb-3 font-semibold">Support cases</h2><Records rows={cases} title="Support cases" fields={[["reference","Reference"],["subject","Subject"],["status","Status"],["priority","Priority"],["updated_at","Updated"]]} /></section><section><h2 className="mb-3 font-semibold">Contact enquiries</h2><Records rows={enquiries} title="Contact enquiries" fields={[["reference","Reference"],["subject","Subject"],["status","Status"],["created_at","Submitted"]]} /></section></TabsContent>
            <TabsContent value="activity" className="mt-4"><Records rows={timeline} title="Timeline events" fields={[["title","Event"],["detail","Details"],["actor_email","Actor"],["created_at","Date"]]} /></TabsContent>
            <TabsContent value="builders" className="mt-4 space-y-5"><section><h2 className="mb-3 font-semibold">Builder outputs</h2><Records rows={outputs} title="Builder outputs" fields={[["builder_name","Builder"],["title","Title"],["status","Status"],["created_at","Created"]]} /></section><section><h2 className="mb-3 font-semibold">Saved items</h2><Records rows={saved} title="Saved items" fields={[["title","Item"],["item_type","Type"],["status","Status"],["updated_at","Updated"]]} /></section></TabsContent>
            <TabsContent value="security" className="mt-4 space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Fingerprint className="h-4 w-4" />Verify customer identity</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Before discussing protected account information with a customer, enter their visible single-use Support PIN. It expires after ten minutes and resets after successful use.</p>{data.verification?.verified ? <Alert><CheckCircle2 className="h-4 w-4" /><AlertDescription>Verified using {data.verification.method || 'Support PIN'}. CRM access expires {date(data.verification.expires_at)}.</AlertDescription></Alert> : <div className="flex max-w-md gap-2"><Input aria-label="Customer Support PIN" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Six-digit PIN" className="font-mono tracking-[0.25em]" /><Button onClick={() => void verifyIdentity()} disabled={verifying || pin.length !== 6}><KeyRound className="mr-2 h-4 w-4" />{verifying ? 'Verifying…' : 'Verify'}</Button></div>}{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}</CardContent></Card><Records rows={asRows(customer.pins)} title="Support PIN history" fields={[["pin_last4","Last four"],["status","Status"],["expires_at","Expires"],["used_at","Used"]]} /></TabsContent>
            <TabsContent value="notes" className="mt-4 space-y-5"><Card><CardHeader><CardTitle className="text-base">Customer and Admin notes</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Detail label="Customer support notes" value={customer.support_notes} /><Detail label="Admin notes" value={customer.admin_notes} /></CardContent></Card><Records rows={notes} title="Internal notes" fields={[["note","Note"],["author_email","Author"],["pinned","Pinned"],["updated_at","Updated"]]} /></TabsContent>
            <TabsContent value="compliance" className="mt-4 space-y-4">
              <Alert><ShieldCheck className="h-4 w-4" /><AlertDescription>This record is restricted to authorised Admin roles. Protected details remain masked until identity verification, and CRM access and exports are written to the audit log.</AlertDescription></Alert>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">Processing and communications</CardTitle></CardHeader><CardContent className="space-y-3"><Detail label="Core account processing" value="Contract and service administration" /><Detail label="Support processing" value="Customer request and legitimate operational interests" /><Detail label="Marketing consent" value={customer.marketing_consent || 'No marketing consent recorded — do not send marketing'} /><Detail label="Communication preference" value={customer.communication_preference} /><p className="text-xs leading-relaxed text-muted-foreground">Service messages and marketing must remain separate. No recorded consent must be treated as no permission for consent-based electronic marketing.</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Individual rights</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Use the governed workflows for access, correction, restriction, objection, portability, erasure and account closure. Do not delete records informally from this page.</p><div className="flex flex-wrap gap-2"><Button onClick={() => void downloadCustomerData()}><Download className="mr-2 h-4 w-4" />Export customer data</Button><Button asChild variant="outline"><Link to="/admin/gdpr">Data protection requests</Link></Button><Button asChild variant="outline"><Link to="/admin/closure-requests">Closure and erasure</Link></Button></div>{message && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{message}</p>}</CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle className="text-base">Data minimisation and retention review</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Detail label="Profile last updated" value={date(customer.updated_at)} /><Detail label="Open data requests" value={requests.filter(row => !['completed','closed'].includes(asText(row.status, '').toLowerCase())).length} /><Detail label="Stored support cases" value={cases.length} /><Detail label="Stored notifications" value={notifications.length} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="data" className="mt-4 space-y-5"><section><h2 className="mb-3 font-semibold">Data protection requests</h2><Records rows={requests} title="Data protection requests" fields={[["reference","Reference"],["request_type","Request"],["status","Status"],["due_at","Due"]]} /></section><section><h2 className="mb-3 font-semibold">Notifications</h2><Records rows={notifications} title="Notifications" fields={[["title","Notification"],["category","Category"],["status","Status"],["created_at","Created"]]} /></section><section><h2 className="mb-3 font-semibold">Admin audit history</h2><Records rows={audit} title="Audit records" fields={[["action","Action"],["summary","Summary"],["actor_email","Admin"],["created_at","Date"]]} /></section></TabsContent>
          </Tabs>
        </>}
      </div>
    </AdminLayout>
  </>;
}
